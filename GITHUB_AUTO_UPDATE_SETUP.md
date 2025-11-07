# GitHub API ile Otomatik Güncelleme Kurulumu

## Adımlar:

1. **GitHub Personal Access Token Oluştur:**
   - GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - "Generate new token" → "Generate new token (classic)"
   - İsim: "Ömer Kaptan Admin Panel"
   - Süre: İstediğiniz süre (örn: 90 gün)
   - İzinler: `repo` (Full control of private repositories) işaretle
   - "Generate token" butonuna tıkla
   - **ÖNEMLİ:** Token'ı kopyala ve güvenli bir yere kaydet (bir daha göremezsiniz!)

2. **Admin Panelinde Token'ı Ayarla:**
   - Admin panelinde "GitHub Ayarları" bölümüne git
   - Token'ı yapıştır
   - Repository bilgilerini gir (örn: alparslan166/omer-kaptan)
   - "Kaydet" butonuna tıkla

3. **Kullanım:**
   - Artık admin panelinde değişiklik yaptığınızda "Otomatik Güncelle" butonu görünecek
   - Bu butona tıkladığınızda products.json otomatik olarak GitHub'a commit edilir
   - Birkaç dakika içinde tüm cihazlarda görünür

## Güvenlik Notları:

- Token'ı kimseyle paylaşmayın
- Token sadece bu repository için yetki vermelidir
- Token süresi dolduğunda yeniden oluşturmanız gerekir

## Alternatif: GitHub Actions Kullanımı

Eğer token kullanmak istemiyorsanız, GitHub Actions ile de yapılabilir ama bu daha karmaşıktır.

