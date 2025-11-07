# ⚙️ GitHub Ayarları Nasıl Yapılır?

## 📍 Butonun Konumu

1. **Admin paneline gidin** (`admin.html` dosyasını açın)
2. Sayfanın **en üstünde** mor renkli bir kutu görünecek:
   - Başlık: "🔄 Tüm Cihazlarda Güncelleme"
   - Butonlar: "📥 Dosyayı İndir", "📋 JSON'u Kopyala", **"⚙️ GitHub Ayarları"**

3. **"⚙️ GitHub Ayarları"** butonuna tıklayın

## 📝 Ayarlar Modal'ı

Butona tıkladığınızda bir pencere açılacak. Burada şu bilgileri girmeniz gerekiyor:

### 1. Repository (owner/repo)
**Buraya yazılacak:** `alparslan166/omer-kaptan`

- `alparslan166` = GitHub kullanıcı adınız
- `omer-kaptan` = Repository adınız
- Arada **"/" (slash)** işareti olmalı

**Örnekler:**
- `alparslan166/omer-kaptan` ✅
- `kullaniciadi/repository-adi` ✅

### 2. Personal Access Token
**Buraya yazılacak:** GitHub'dan aldığınız token

Token almak için:
1. https://github.com/settings/tokens adresine gidin
2. "Generate new token" → "Generate new token (classic)" butonuna tıklayın
3. İsim: `Ömer Kaptan Admin Panel`
4. Süre: İstediğiniz süre (örn: 90 gün)
5. **İzinler:** `repo` kutusunu işaretleyin
6. "Generate token" butonuna tıklayın
7. Çıkan token'ı kopyalayın (bir daha göremezsiniz!)
8. Admin panelindeki "Personal Access Token" alanına yapıştırın

### 3. Branch
**Buraya yazılacak:** `main` (veya `master`)

- Repository'nizin ana branch'i genellikle `main` veya `master` olur
- Hangisini kullanıyorsanız onu yazın

### 4. Dosya Yolu
**Buraya yazılacak:** `products.json`

- Genellikle değiştirmenize gerek yok
- Eğer `products.json` dosyanız farklı bir klasördeyse (örn: `data/products.json`), o zaman değiştirin

## ✅ Kaydetme

1. Tüm bilgileri doldurduktan sonra **"🔍 Bağlantıyı Test Et"** butonuna tıklayın
2. "✅ Bağlantı başarılı!" mesajını görürseniz:
   - **"💾 Kaydet"** butonuna tıklayın
3. Artık **"🚀 Otomatik Güncelle (GitHub)"** butonu görünecek!

## 🎯 Kullanım

Ayarları kaydettikten sonra:
- Admin panelinde değişiklik yapın
- **"🚀 Otomatik Güncelle (GitHub)"** butonuna tıklayın
- Birkaç dakika içinde tüm cihazlarda değişiklikler görünecek!

## ❓ Sorun mu yaşıyorsunuz?

- Buton görünmüyor mu? → Sayfayı yenileyin (F5)
- Bağlantı testi başarısız mı? → Token ve repository bilgilerini kontrol edin
- Hata mesajı alıyor musunuz? → Token'ın `repo` iznine sahip olduğundan emin olun

