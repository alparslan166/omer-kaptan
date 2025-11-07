# GitHub API Otomatik Güncelleme Kılavuzu

## 🚀 Hızlı Başlangıç

Admin panelinde yaptığınız değişikliklerin tüm cihazlarda otomatik olarak görünmesi için GitHub API entegrasyonu kullanabilirsiniz.

## 📋 Adım Adım Kurulum

### 1. GitHub Personal Access Token Oluşturma

1. GitHub.com'a giriş yapın
2. Sağ üst köşedeki profil fotoğrafınıza tıklayın
3. **Settings** (Ayarlar) seçeneğine tıklayın
4. Sol menüden **Developer settings** seçeneğine tıklayın
5. **Personal access tokens** → **Tokens (classic)** seçeneğine tıklayın
6. **Generate new token** → **Generate new token (classic)** butonuna tıklayın
7. Formu doldurun:
   - **Note**: `Ömer Kaptan Admin Panel` (istediğiniz bir isim)
   - **Expiration**: İstediğiniz süre (örn: 90 gün, 1 yıl)
   - **Scopes**: `repo` kutusunu işaretleyin (Full control of private repositories)
8. **Generate token** butonuna tıklayın
9. **ÖNEMLİ**: Token'ı kopyalayın ve güvenli bir yere kaydedin (bir daha göremezsiniz!)

### 2. Admin Panelinde Ayarları Yapılandırma

1. Admin paneline gidin (`admin.html`)
2. **"Tüm Cihazlarda Güncelleme"** bölümünde **"⚙️ GitHub Ayarları"** butonuna tıklayın
3. Açılan modal'da:
   - **Repository**: `alparslan166/omer-kaptan` (GitHub kullanıcı adınız/repository adınız)
   - **Personal Access Token**: Az önce oluşturduğunuz token'ı yapıştırın
   - **Branch**: `main` (veya `master` - repository'nizin ana branch'i)
   - **Dosya Yolu**: `products.json` (varsayılan)
4. **"🔍 Bağlantıyı Test Et"** butonuna tıklayarak bağlantıyı test edin
5. Başarılı olursa **"💾 Kaydet"** butonuna tıklayın

### 3. Otomatik Güncelleme Kullanımı

Artık admin panelinde değişiklik yaptığınızda:
1. Üst kısımda **"🚀 Otomatik Güncelle (GitHub)"** butonu görünecek
2. Bu butona tıkladığınızda:
   - Değişiklikler GitHub'a otomatik olarak commit edilir
   - Birkaç dakika içinde GitHub Pages güncellenir
   - Tüm cihazlarda (telefon, tablet, bilgisayar) değişiklikler görünür

## 🔒 Güvenlik Notları

- ✅ Token'ı kimseyle paylaşmayın
- ✅ Token sadece bu repository için yetki vermelidir
- ✅ Token süresi dolduğunda yeniden oluşturmanız gerekir
- ✅ Token localStorage'da saklanır (sadece bu tarayıcıda)

## 🛠️ Sorun Giderme

### "Bağlantı başarısız" Hatası

- Repository adının doğru formatta olduğundan emin olun: `owner/repo`
- Token'ın `repo` iznine sahip olduğundan emin olun
- Branch adının doğru olduğundan emin olun (`main` veya `master`)

### "Dosya bulunamadı" Hatası

- Dosya yolunun doğru olduğundan emin olun (`products.json`)
- Repository'de bu dosyanın var olduğundan emin olun

### "Yetki hatası" Hatası

- Token'ın `repo` iznine sahip olduğundan emin olun
- Token'ın süresinin dolmadığından emin olun

## 📝 Alternatif: Manuel Güncelleme

GitHub API kullanmak istemiyorsanız:
1. **"📥 Dosyayı İndir"** butonuna tıklayın
2. İndirilen `products.json` dosyasını GitHub repository'nize yükleyin
3. Commit edin ve push edin

## 🔄 Domain ile Yayınlama

Site domain ile yayınlandığında da aynı şekilde çalışır:
- GitHub Pages kullanıyorsanız: Otomatik güncelleme çalışır
- Diğer hosting servisleri: GitHub API ile güncelleme yapabilir, ardından hosting servisinize deploy edebilirsiniz

## 📚 Daha Fazla Bilgi

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

