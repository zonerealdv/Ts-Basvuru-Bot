# 📝 Discord Başvuru Botu

**TypeScript ile geliştirilmiş profesyonel Discord başvuru sistemi**

[![Discord.js](https://img.shields.io/badge/discord.js-v14.14.1-blue.svg)](https://discord.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.txt)

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Kurulum](#-kurulum)
- [Yapılandırma](#-yapılandırma)
- [Kullanım](#-kullanım)
- [Komutlar](#-komutlar)
- [Proje Yapısı](#-proje-yapısı)
- [Veritabanı Yapısı](#-veritabanı-yapısı)
- [Özelleştirme](#-özelleştirme)
- [Sorun Giderme](#-sorun-giderme)
- [Katkıda Bulunma](#-katkıda-bulunma)
- [Lisans](#-lisans)

## ✨ Özellikler

### 🎯 Temel Özellikler
- **Modern Discord.js v14** desteği
- **TypeScript** ile tip güvenli geliştirme
- **Slash Commands** ile modern komut sistemi
- **Modal Forms** ile detaylı başvuru oluşturma
- **Button Interactions** ile kolay yönetim
- **JSON Database** ile veri saklama

### 📋 Başvuru Sistemi
- ✅ Otomatik başvuru formu oluşturma
- ✅ Kullanıcı bilgileri toplama (Ad, yaş, deneyim)
- ✅ Başvuru sebebi sistemi
- ✅ Yetkililer için onay/reddetme sistemi
- ✅ Otomatik rol verme
- ✅ DM ile sonuç bildirimi

### 🛠️ Yönetim Özellikleri
- 👤 Rol tabanlı yetkilendirme
- 📊 Başvuru durumu takibi
- 📝 Reddetme sebebi sistemi
- 🔄 Çoklu başvuru kontrolü
- 📱 Mobil uyumlu arayüz

### 📊 İstatistik ve Raporlama
- 📈 Başvuru istatistikleri
- 📄 Detaylı başvuru kayıtları
- 📝 Kapsamlı log sistemi
- 🎨 Özelleştirilebilir renkler ve mesajlar

## 🚀 Kurulum

### Gereksinimler
- **Node.js** 20.0.0 veya üzeri
- **npm** veya **yarn** paket yöneticisi
- **Discord Bot Token**
- **Discord Sunucu** yönetici yetkisi

### Adım 1: Projeyi İndirin
```bash
git clone https://github.com/zonerealdv/ts-basvuru-bot
cd basvuru-bot
```

### Adım 2: Bağımlılıkları Yükleyin
```bash
npm install
# veya
yarn install
```

### Adım 3: Yapılandırma
[`config.json`](config.json) dosyasını düzenleyin:

```json
{
  "token": "BOT_TOKEN_BURAYA",
  "clientId": "BOT_CLIENT_ID",
  "guildId": "SUNUCU_ID",
  "applicationRole": "BAŞVURU_ROLU_ID",
  "logChannel": "LOG_KANAL_ID",
  "customization": {
    "buttons": {
      "apply": "📝 Başvuru Yap",
      "approve": "✅ Onayla",
      "reject": "❌ Reddet"
    },
    "colors": {
      "panel": "#3498db",
      "success": "#00ff00",
      "error": "#ff0000",
      "warning": "#ffa500",
      "info": "#17a2b8"
    }
  }
}
```

### Adım 4: Projeyi Derleyin ve Çalıştırın
```bash
# Geliştirme modu
npm run dev

# Üretim için derleme
npm run build
npm start
```

## ⚙️ Yapılandırma

### Bot Ayarları
| Ayar | Açıklama | Gerekli |
|------|----------|---------|
| `token` | Discord bot token | ✅ |
| `clientId` | Bot client ID | ✅ |
| `guildId` | Sunucu ID | ✅ |

### Başvuru Ayarları
| Ayar | Açıklama | Gerekli |
|------|----------|---------|
| `applicationRole` | Başvuru kabul rolü | ⚙️ |
| `logChannel` | Log kanalı ID | ⚙️ |

> **Not:** `applicationRole` ve `logChannel` ayarları `/setup` komutu ile de yapılandırılabilir.

### Özelleştirme Ayarları
```json
{
  "customization": {
    "buttons": {
      "apply": "📝 Başvuru Yap",
      "approve": "✅ Onayla", 
      "reject": "❌ Reddet"
    },
    "colors": {
      "panel": "#3498db",
      "success": "#00ff00",
      "error": "#ff0000",
      "warning": "#ffa500",
      "info": "#17a2b8"
    }
  }
}
```

## 📖 Kullanım

### 1. İlk Kurulum
```bash
/setup role:@Başvuru_Rolü logkanal:#başvuru-log
```
Sistem ayarlarını yapılandırır ve gerekli rolleri/kanalları tanımlar.

### 2. Panel Kurulumu
```bash
/panel
```
Başvuru panelini mevcut kanala kurar ve kullanıcıların başvuru yapabileceği arayüzü oluşturur.

### 3. Başvuru Süreci

#### Kullanıcı Tarafı:
1. Başvuru panelindeki **"📝 Başvuru Yap"** butonuna tıklar
2. Modal form açılır ve şu bilgileri doldurur:
   - Ad Soyad
   - Yaş
   - Başvuru sebebi
   - Deneyimler
3. Form gönderilir ve onay mesajı alır

#### Yetkili Tarafı:
1. Log kanalında başvuru bildirimi gelir
2. **"✅ Onayla"** veya **"❌ Reddet"** butonlarından birini seçer
3. Reddetme durumunda sebep belirtir
4. Sistem otomatik olarak:
   - Kullanıcıya rol verir (onaylandıysa)
   - DM ile sonucu bildirir
   - Başvuru durumunu günceller

## 🎮 Komutlar

### 👑 Yönetici Komutları
| Komut | Açıklama | Parametreler | Yetki |
|-------|----------|--------------|-------|
| `/setup` | Sistem ayarları | `role` `logkanal` | Administrator |
| `/panel` | Başvuru paneli kurulumu | - | Administrator |

### ⚙️ Komut Detayları

#### `/setup`
Başvuru sisteminin temel ayarlarını yapar.

**Parametreler:**
- `role` (Zorunlu): Başvuru kabul edildiğinde verilecek rol
- `logkanal` (Zorunlu): Başvuruların gönderileceği log kanalı

**Örnek Kullanım:**
```
/setup role:@Üye logkanal:#başvuru-log
```

#### `/panel`
Başvuru panelini mevcut kanala kurar. Panel bir embed mesajı ve başvuru butonu içerir.

**Özellikler:**
- Özelleştirilebilir panel tasarımı
- Sunucu ikonlu görsel
- Başvuru şartları bilgilendirmesi
- Tek tıkla başvuru sistemi

## 🏗️ Proje Yapısı

```
discord-application-bot/
├── 📁 src/
│   ├── 📁 commands/          # Slash komutları
│   │   ├── panel.ts         # Panel kurulum komutu
│   │   └── setup.ts         # Sistem ayarları komutu
│   ├── 📁 handlers/         # Event işleyicileri
│   │   ├── buttonHandler.ts # Buton etkileşimleri
│   │   └── modalHandler.ts  # Modal form işlemleri
│   └── 📁 utils/            # Yardımcı araçlar
│       └── database.ts      # Veritabanı yönetimi
├── 📄 config.json          # Bot yapılandırması
├── 📄 database.json        # JSON veritabanı
├── 📄 index.ts             # Ana giriş dosyası
├── 📄 package.json         # Proje bağımlılıkları
├── 📄 tsconfig.json        # TypeScript yapılandırması
├── 📄 LICENSE.txt          # Lisans dosyası
└── 📄 README.md            # Bu dosya
```

### 🔧 Temel Sınıflar ve Modüller

#### [`Database`](src/utils/database.ts)
- JSON tabanlı veri saklama
- Başvuru ve sunucu ayarları yönetimi
- CRUD işlemleri
- Otomatik dosya senkronizasyonu

#### [`ButtonHandler`](src/handlers/buttonHandler.ts)
- Başvuru butonu işlemleri
- Onay/reddetme buton yönetimi
- Yetki kontrolleri
- Modal açma işlemleri

#### [`ModalHandler`](src/handlers/modalHandler.ts)
- Başvuru formu işleme
- Reddetme sebebi alma
- Veri doğrulama
- Otomatik log gönderimi

## 📊 Veritabanı Yapısı

### Başvuru Modeli (Application)
```typescript
interface Application {
  id: string;                    // Benzersiz başvuru ID
  userId: string;                // Başvuran kullanıcı ID
  guildId: string;               // Sunucu ID
  name: string;                  // Ad Soyad
  age: string;                   // Yaş
  reason: string;                // Başvuru sebebi
  experience: string;            // Deneyimler
  timestamp: number;             // Başvuru zamanı
  status: 'pending' | 'approved' | 'rejected'; // Durum
  reviewedBy?: string;           // İnceleyen yetkili ID
  rejectionReason?: string;      // Reddetme sebebi
}
```

### Sunucu Yapılandırması (GuildConfig)
```typescript
interface GuildConfig {
  applicationRole?: string;      // Başvuru rol ID
  logChannel?: string;           // Log kanal ID
  panelChannel?: string;         // Panel kanal ID
  panelMessageId?: string;       // Panel mesaj ID
}
```

### Veritabanı Yapısı
```json
{
  "guilds": {
    "SUNUCU_ID": {
      "applicationRole": "ROL_ID",
      "logChannel": "KANAL_ID",
      "panelChannel": "KANAL_ID",
      "panelMessageId": "MESAJ_ID"
    }
  },
  "applications": [
    {
      "id": "abc123def",
      "userId": "KULLANICI_ID",
      "guildId": "SUNUCU_ID",
      "name": "Örnek İsim",
      "age": "18",
      "reason": "Başvuru sebebim...",
      "experience": "Deneyimlerim...",
      "timestamp": 1703123456789,
      "status": "pending"
    }
  ]
}
```

## 🎨 Özelleştirme

### Renk Teması
[`config.json`](config.json) dosyasında renkleri özelleştirebilirsiniz:

```json
{
  "customization": {
    "colors": {
      "panel": "#3498db",    // Panel rengi (mavi)
      "success": "#00ff00",  // Başarı rengi (yeşil)
      "error": "#ff0000",    // Hata rengi (kırmızı)
      "warning": "#ffa500",  // Uyarı rengi (turuncu)
      "info": "#17a2b8"     // Bilgi rengi (cyan)
    }
  }
}
```

### Buton Metinleri
Buton metinlerini özelleştirebilirsiniz:

```json
{
  "customization": {
    "buttons": {
      "apply": "🎯 Ekibe Katıl",
      "approve": "🎉 Kabul Et",
      "reject": "💔 Geri Çevir"
    }
  }
}
```

### Panel Tasarımı
Panel embed'ini [`src/commands/panel.ts`](src/commands/panel.ts) dosyasından özelleştirebilirsiniz:

- Başlık ve açıklama metinleri
- Başvuru şartları
- Görsel ve footer bilgileri
- Ek alanlar ve bilgilendirmeler

### Form Alanları
Başvuru formundaki soruları [`src/handlers/buttonHandler.ts`](src/handlers/buttonHandler.ts) dosyasından düzenleyebilirsiniz:

- Soru metinleri
- Placeholder metinleri
- Maksimum karakter sınırları
- Zorunlu/opsiyonel alanlar

## 🔍 Sorun Giderme

### Yaygın Hatalar

#### Bot Yanıt Vermiyor
```bash
# Kontrol edilmesi gerekenler:
✓ Bot token'ının doğru olduğu
✓ Bot'un sunucuda olduğu
✓ Gerekli yetkilerin verildiği
✓ Slash komutlarının kaydedildiği
```

#### Başvuru Paneli Kurulmuyor
```bash
# Kontrol edilmesi gerekenler:
✓ Setup komutunun çalıştırıldığı
✓ Rol ve kanal ID'lerinin doğru olduğu
✓ Bot'un Manage Messages yetkisinin olduğu
✓ Panel kurulacak kanalda yazma yetkisinin olduğu
```

#### Başvuru Log'ları Gönderilmiyor
```bash
# Kontrol edilmesi gerekenler:
✓ Log kanal ID'sinin doğru olduğu
✓ Bot'un log kanalına erişim yetkisinin olduğu
✓ Bot'un Embed Links yetkisinin olduğu
✓ Kanal tipinin text channel olduğu
```

#### Rol Verilmiyor
```bash
# Kontrol edilmesi gerekenler:
✓ Bot'un Manage Roles yetkisinin olduğu
✓ Bot rolünün hedef rolden üstte olduğu
✓ Hedef rolün @everyone'dan farklı olduğu
✓ Rol ID'sinin doğru olduğu
```

### Debug ve Loglama
Bot konsol çıktılarını takip ederek sorunları tespit edebilirsiniz:

```bash
# Geliştirme modunda detaylı loglar
npm run dev

# Hata mesajlarını takip edin:
[INFO] Bot ready!
[ERROR] Error executing command: ...
[WARNING] Missing permissions: ...
```

### Yaygın Discord API Hataları

| Hata Kodu | Açıklama | Çözüm |
|-----------|----------|--------|
| 10003 | Unknown Channel | Kanal ID kontrolü |
| 10011 | Unknown Role | Rol ID kontrolü |
| 50001 | Missing Access | Kanal yetkileri kontrolü |
| 50013 | Missing Permissions | Bot yetkileri kontrolü |

## 📈 Performans İyileştirmeleri

### Önbellek Kullanımı
- Discord.js otomatik önbellek yönetimi
- Veritabanı okuma/yazma optimizasyonu
- Minimum API çağrısı stratejisi

### Bellek Yönetimi
```bash
# Bellek kullanımını izleme
node --inspect dist/index.js

# Performans metrikleri
console.time('database-operation');
// İşlem
console.timeEnd('database-operation');
```

## 🛡️ Güvenlik

### Bot Token Güvenliği
- Token'ı asla herkese açık repository'de paylaşmayın
- `config` dosyası kullanarak token'ı saklayın
- Bot yetkilerini minimum seviyede tutun

### Veri Koruması
- Kullanıcı verilerini güvenli saklayın
- GDPR uyumluluğu için veri silme seçenekleri
- Hassas bilgileri loglamamaya dikkat edin

### Yetkilendirme
- Komutlarda uygun yetki kontrolü
- Sunucu bazlı izin yönetimi
- Rate limiting ile spam koruması

## 🤝 Katkıda Bulunma

### Geliştirme Süreci
1. **Fork** edin
2. **Feature branch** oluşturun (`git checkout -b feature/amazing-feature`)
3. **Commit** edin (`git commit -m 'Add amazing feature'`)
4. **Push** edin (`git push origin feature/amazing-feature`)
5. **Pull Request** açın

### Geliştirme Kuralları
- TypeScript tip güvenliğini koruyun
- Kod yorumlarını Türkçe yazın
- Commit mesajlarını açıklayıcı yazın
- Yeni özellikler için dokümantasyon ekleyin

### Katkı Alanları
- 🐛 Bug fix'leri
- ✨ Yeni özellikler
- 📚 Dokümantasyon iyileştirmeleri
- 🎨 UI/UX geliştirmeleri
- 🌐 Çok dil desteği

## 📝 Changelog

### v1.0.0 (2024)
- ✅ İlk sürüm yayınlandı
- ✅ Temel başvuru sistemi
- ✅ Modal form desteği
- ✅ Onay/reddetme sistemi
- ✅ JSON veritabanı entegrasyonu
- ✅ Özelleştirilebilir arayüz

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE.txt) altında lisanslanmıştır.

```
MIT License

Copyright (c) 2024 ZoneReal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 👨‍💻 Geliştirici

**ZoneReal** tarafından ❤️ ile geliştirilmiştir.

## 📞 Destek

Herhangi bir sorun yaşarsanız:

1. 🔍 [Issues](https://github.com/zonerealdv/ts-basvuru-bot/issues) bölümünde arama yapın
2. 🆕 Yeni bir issue açın ve şunları ekleyin:
   - Detaylı problem açıklaması
   - Hata logları (varsa)
   - Node.js ve Discord.js versiyonları
   - İşletim sistemi bilgisi

---

## 🏆 Özellikler Özeti

| Özellik | Durum | Açıklama |
|---------|-------|----------|
| ✅ Slash Commands | Tamamlandı | Modern Discord komut sistemi |
| ✅ Modal Forms | Tamamlandı | Detaylı başvuru formu |
| ✅ Button Interactions | Tamamlandı | Kolay onay/reddetme |
| ✅ JSON Database | Tamamlandı | Hafif ve hızlı veri saklama |
| ✅ Role Management | Tamamlandı | Otomatik rol verme |
| ✅ DM Notifications | Tamamlandı | Sonuç bildirimleri |
| ✅ Customization | Tamamlandı | Renk ve metin özelleştirme |
---

<div align="center">

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!**

**Teşekkürler! 🙏**

</div>