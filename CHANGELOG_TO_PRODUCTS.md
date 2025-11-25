# Change-Log'daki Değişiklikleri Products.json'a Aktarma

## Sorun
Change-log.json dosyasında değişiklikler kaydedilmiş ancak products.json'a uygulanmamış.

## Çözüm

Change-log.json sadece bir **log kaydı** dosyasıdır. Asıl değişiklikler **LocalStorage**'da veya admin panelinde tutulmaktadır.

### Yöntem 1: Admin Paneli Üzerinden (Önerilen)

1. **Admin paneline gidin:** `https://omerkaptanrestaurant.com/admin.html`
2. **LocalStorage'daki güncel veriyi kontrol edin:**
   - Tarayıcı konsolunu açın (F12)
   - Console sekmesinde şunu yazın:
     ```javascript
     const data = localStorage.getItem('omer_kaptan_products');
     console.log('LocalStorage verisi:', JSON.parse(data));
     ```
3. **Değişiklikleri GitHub'a gönderin:**
   - Ana sayfada **🚀 Otomatik Güncelle (GitHub)** butonuna tıklayın
   - Bu, LocalStorage'daki güncel veriyi products.json'a yazacak

### Yöntem 2: Manuel Push

Eğer admin paneli çalışmıyorsa:

1. **LocalStorage'dan veriyi alın:**
   ```javascript
   const data = localStorage.getItem('omer_kaptan_products');
   const productsData = JSON.parse(data);
   ```

2. **Veriyi kaydedin:**
   - Tarayıcı konsolunda:
     ```javascript
     const blob = new Blob([JSON.stringify(productsData, null, 2)], {type: 'application/json'});
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = 'products.json';
     a.click();
     ```

3. **Dosyayı GitHub'a push edin:**
   ```bash
   cd /path/to/omer-kaptan
   # İndirilen products.json'u data/products.json olarak kaydedin
   git add data/products.json
   git commit -m "Update products.json from admin panel changes"
   git push origin main
   ```

## Önemli Not

Change-log.json'daki format sadece açıklama metnidir ve otomatik olarak products.json'a uygulanamaz. Değişiklikler zaten admin panelinde yapılmış ve LocalStorage'da tutulmaktadır. Sadece GitHub'a push edilmesi gerekiyor.

