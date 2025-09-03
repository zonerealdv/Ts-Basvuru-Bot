import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as config from '../../config.json';

export interface GuildConfig {
  applicationRole?: string;
  logChannel?: string;
  panelChannel?: string;
  panelMessageId?: string;
}

export interface Application {
  id: string;
  userId: string;
  guildId: string;
  name: string;
  age: string;
  reason: string;
  experience: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface DatabaseData {
  guilds: { [guildId: string]: GuildConfig };
  applications: Application[];
}

class Database {
  private dbPath: string;
  private data: DatabaseData = { guilds: {}, applications: [] };

  constructor() {
    this.dbPath = join(process.cwd(), 'database.json');
    this.loadData();
  }

  private loadData(): void {
    if (existsSync(this.dbPath)) {
      try {
        const fileContent = readFileSync(this.dbPath, 'utf-8');
        this.data = JSON.parse(fileContent);
      } catch (error) {
        console.error('Error loading database:', error);
        this.createDefaultData();
      }
    } else {
      this.createDefaultData();
    }
  }

  private createDefaultData(): void {
    this.data = {
      guilds: {},
      applications: []
    };
    this.saveData();
  }

  private saveData(): void {
    try {
      writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  // Guild Configuration Methods
  getGuildConfig(guildId: string): GuildConfig {
    return this.data.guilds[guildId] || {};
  }

  setGuildConfig(guildId: string, config: Partial<GuildConfig>): void {
    if (!this.data.guilds[guildId]) {
      this.data.guilds[guildId] = {};
    }
    Object.assign(this.data.guilds[guildId], config);
    this.saveData();
  }

  // Application Methods
  createApplication(application: Omit<Application, 'id' | 'timestamp' | 'status'>): Application {
    const newApplication: Application = {
      ...application,
      id: this.generateId(),
      timestamp: Date.now(),
      status: 'pending'
    };
    this.data.applications.push(newApplication);
    this.saveData();
    return newApplication;
  }

  getApplication(id: string): Application | undefined {
    return this.data.applications.find(app => app.id === id);
  }

  updateApplication(id: string, updates: Partial<Application>): boolean {
    const index = this.data.applications.findIndex(app => app.id === id);
    if (index !== -1) {
      Object.assign(this.data.applications[index], updates);
      this.saveData();
      return true;
    }
    return false;
  }

  getApplicationsByGuild(guildId: string): Application[] {
    return this.data.applications.filter(app => app.guildId === guildId);
  }

  getApplicationsByUser(userId: string, guildId: string): Application[] {
    return this.data.applications.filter(app => 
      app.userId === userId && app.guildId === guildId
    );
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Config Helper Functions
export const getButtonText = (buttonType: 'apply' | 'approve' | 'reject'): string => {
  return config.customization?.buttons?.[buttonType] || {
    apply: '📝 Başvuru Yap',
    approve: '✅ Onayla', 
    reject: '❌ Reddet'
  }[buttonType];
};

export const getEmbedColor = (colorType: 'panel' | 'success' | 'error' | 'warning' | 'info'): `#${string}` => {
  return (config.customization?.colors?.[colorType] || {
    panel: '#3498db',
    success: '#00ff00',
    error: '#ff0000',
    warning: '#ffa500',
    info: '#17a2b8'
  }[colorType]) as `#${string}`;
};

// Config file management
export const updateConfigFile = (updates: { applicationRole?: string; logChannel?: string }) => {
  const configPath = join(process.cwd(), 'config.json');
  const currentConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
  
  if (updates.applicationRole !== undefined) {
    currentConfig.applicationRole = updates.applicationRole;
  }
  
  if (updates.logChannel !== undefined) {
    currentConfig.logChannel = updates.logChannel;
  }
  
  writeFileSync(configPath, JSON.stringify(currentConfig, null, 2));
};

export const getConfigRoleAndChannel = () => {
  return {
    applicationRole: config.applicationRole,
    logChannel: config.logChannel
  };
};

export const database = new Database();