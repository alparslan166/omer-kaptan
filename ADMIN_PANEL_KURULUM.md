# Admin Panel Kurulum Kılavuzu

## 🚀 Başka Cihazda Admin Panelini Açma

Admin panelini başka bir cihazda açmak için aşağıdaki adımları takip edin.

### 1. GitHub API Ayarları

Admin panelinde "⚙️ GitHub Ayarları" butonuna tıklayın ve aşağıdaki bilgileri girin:

#### Repository
- Format: `owner/repo`
- Örnek: `alparslan166/omer-kaptan`
- ⚠️ Boşluk olmamalı, sadece `/` ile ayrılmalı

#### Personal Access Token
- GitHub'dan token oluşturun: https://github.com/settings/tokens
- Token oluştururken **`repo`** iznini seçin (Full control of private repositories)
- Token formatı: `ghp_xxxxxxxxxxxx` (ghp_ ile başlar)
- ⚠️ Token'ı kimseyle paylaşmayın!

#### Branch
- Genellikle: `main` veya `master`
- Repository'nizdeki branch adını kullanın

#### Dosya Yolu
- Genellikle: `products.json`
- Dosya repository'nin root dizininde ise: `products.json`
- Alt klasörde ise: `klasor/products.json`

### 2. Bağlantıyı Test Etme

1. Ayarları girdikten sonra **"🔍 Bağlantıyı Test Et"** butonuna tıklayın
2. Test sonucu görüntülenecektir:
   - ✅ **Başarılı**: Tüm ayarlar doğru, devam edebilirsiniz
   - ❌ **Başarısız**: Hata mesajını okuyun ve düzeltin

### 3. Sık Karşılaşılan Hatalar ve Çözümleri

#### ❌ "Dosya bulunamadı" Hatası

**Olası Nedenler:**
1. **Repository adı yanlış**
   - ✅ Doğru: `alparslan166/omer-kaptan`
   - ❌ Yanlış: `alparslan166 / omer-kaptan` (boşluk var)
   - ❌ Yanlış: `https://github.com/alparslan166/omer-kaptan` (URL formatı)

2. **Branch adı yanlış**
   - Repository'nizdeki branch adını kontrol edin
   - Genellikle `main` veya `master` olur
   - GitHub repository sayfasında branch adını görebilirsiniz

3. **Dosya yolu yanlış**
   - `products.json` dosyası repository'nin root dizininde olmalı
   - Eğer alt klasörde ise, doğru yolu girin (örn: `data/products.json`)
   - GitHub repository sayfasında dosya konumunu kontrol edin

4. **Token yetersiz yetkilere sahip**
   - Token'ı oluştururken **`repo`** iznini seçtiğinizden emin olun
   - Token'ın süresi dolmuş olabilir, yeni token oluşturun

5. **Repository erişilemiyor**
   - Repository'nin public veya token sahibine erişim izni olmalı
   - Private repository ise, token'ın repository'ye erişim izni olmalı

#### ❌ "GitHub Config modülü yüklenmedi" Hatası

**Çözüm:**
1. Sayfayı yenileyin (F5 veya Cmd+R)
2. Tarayıcı konsolunu açın (F12) ve hataları kontrol edin
3. Script dosyalarının yüklendiğinden emin olun:
   - `github-api-config.js`
   - `github-api.js`
   - `admin.js`

#### ❌ "products.json yüklenemedi" Hatası

**Olası Nedenler:**
1. **CORS hatası** (local dosya sistemi)
   - Admin panelini local dosya sisteminden açmayın
   - Bir web sunucusu üzerinden açın (GitHub Pages, local server, vs.)

2. **Dosya yolu yanlış**
   - `products.json` dosyasının doğru konumda olduğundan emin olun
   - GitHub repository'de dosyanın varlığını kontrol edin

3. **İnternet bağlantısı sorunu**
   - İnternet bağlantınızı kontrol edin
   - GitHub erişilebilir mi kontrol edin

### 4. Adım Adım Kurulum

1. **Admin panelini açın**
   - Tarayıcıda `admin.html` dosyasını açın
   - Veya GitHub Pages üzerinden: `https://alparslan166.github.io/omer-kaptan/admin.html`

2. **GitHub Ayarları butonuna tıklayın**
   - Sağ üst köşede "⚙️ GitHub Ayarları" butonunu bulun

3. **Bilgileri girin**
   - Repository: `alparslan166/omer-kaptan`
   - Token: GitHub'dan oluşturduğunuz token
   - Branch: `main`
   - Dosya Yolu: `products.json`

4. **Bağlantıyı test edin**
   - "🔍 Bağlantıyı Test Et" butonuna tıklayın
   - ✅ Başarılı mesajı görüyorsanız devam edin
   - ❌ Hata varsa hata mesajını okuyun ve düzeltin

5. **Ayarları kaydedin**
   - "💾 Kaydet" butonuna tıklayın
   - Ayarlar localStorage'a kaydedilecek

6. **Ürünleri yönetin**
   - Artık admin panelinden ürün ekleyebilir, düzenleyebilir ve silebilirsiniz
   - Değişiklikleri GitHub'a göndermek için "GitHub'da Güncelle" butonuna tıklayın

### 5. Token Oluşturma

1. GitHub'a giriş yapın
2. Sağ üst köşedeki profil resminize tıklayın
3. **Settings** seçeneğine tıklayın
4. Sol menüden **Developer settings** seçeneğine tıklayın
5. **Personal access tokens** > **Tokens (classic)** seçeneğine tıklayın
6. **Generate new token** > **Generate new token (classic)** butonuna tıklayın
7. Token'a bir isim verin (örn: "Ömer Kaptan Admin Panel")
8. **Expiration** seçeneğinden süre belirleyin (önerilen: 90 days veya No expiration)
9. **Scopes** bölümünden **`repo`** seçeneğini işaretleyin
10. **Generate token** butonuna tıklayın
11. Oluşturulan token'ı kopyalayın (bir daha gösterilmeyecek!)
12. Token'ı admin panelindeki "Personal Access Token" alanına yapıştırın

### 6. Sorun Giderme

#### Script dosyaları yüklenmiyor
- Tarayıcı konsolunu açın (F12)
- Console sekmesinde hataları kontrol edin
- Network sekmesinde script dosyalarının yüklendiğini kontrol edin
- Script dosyalarının doğru konumda olduğundan emin olun

#### Token çalışmıyor
- Token'ın süresi dolmuş olabilir, yeni token oluşturun
- Token'ın `repo` iznine sahip olduğundan emin olun
- Token'ı doğru kopyaladığınızdan emin olun (boşluk olmamalı)

#### Repository bulunamıyor
- Repository adını doğru yazdığınızdan emin olun
- Repository'nin public veya token sahibine erişim izni olduğundan emin olun
- Repository adında büyük/küçük harf duyarlılığına dikkat edin

#### products.json bulunamıyor
- Dosyanın repository'de olduğundan emin olun
- Dosya yolunu doğru girdiğinizden emin olun
- Branch adını doğru girdiğinizden emin olun

### 7. İletişim

Sorun yaşıyorsanız:
- Tarayıcı konsolundaki hata mesajlarını kontrol edin
- "🔍 Bağlantıyı Test Et" butonundaki detaylı hata mesajlarını okuyun
- GitHub repository'deki dosya yapısını kontrol edin

### 8. Güvenlik Notları

- ⚠️ Token'ı kimseyle paylaşmayın
- ⚠️ Token'ı public repository'lere commit etmeyin
- ⚠️ Token'ın süresini düzenli olarak kontrol edin
- ⚠️ Kullanılmayan token'ları iptal edin

### 9. Başarılı Kurulum Kontrol Listesi

- [ ] GitHub API ayarları yapılandırıldı
- [ ] Repository adı doğru girildi
- [ ] Token oluşturuldu ve girildi
- [ ] Branch adı doğru girildi
- [ ] Dosya yolu doğru girildi
- [ ] Bağlantı testi başarılı
- [ ] Ayarlar kaydedildi
- [ ] Ürünler görüntüleniyor
- [ ] Ürün ekleme/düzenleme çalışıyor
- [ ] GitHub'a güncelleme çalışıyor

