# Cache Sorunu Çözümü

## Sorun
Admin panelinde yapılan değişiklikler GitHub'a push edilmiş ve `data/products.json` güncellenmiş, ancak menü sitesinde görünmüyor.

## Çözümler Yapıldı

### 1. Cache-Busting Eklendi
Tüm `products.json` fetch işlemlerine cache-busting parametresi eklendi:
- ✅ `dynamic-products.js` - Cache-busting eklendi
- ✅ `product-visibility.js` - Cache-busting eklendi
- ✅ `dynamic-categories.js` - Zaten vardı
- ✅ `script.js` - Zaten vardı

### 2. Duplicate Dosya Temizlendi
Root dizinindeki gereksiz `products.json` dosyası silindi. Artık sadece `data/products.json` kullanılıyor.

### 3. Dosya Yolları Kontrol Edildi
Tüm dosya yolları doğru:
- Index.html (root): `data/products.json` ✅
- Product.html (root): `data/products.json` ✅
- Categories sayfaları: `../../data/products.json` ✅

## Kullanıcılar İçin Öneriler

### Tarayıcı Cache'ini Temizleme
1. **Chrome/Edge:** Ctrl+Shift+Delete (veya Cmd+Shift+Delete Mac'te)
2. **Firefox:** Ctrl+Shift+Delete
3. **Safari:** Cmd+Option+E

### Hard Refresh Yapma
- **Windows/Linux:** Ctrl+F5 veya Ctrl+Shift+R
- **Mac:** Cmd+Shift+R

### GitHub Pages Cache
GitHub Pages cache'i genellikle 2-3 dakika içinde güncellenir. Eğer hala eski içerik görünüyorsa:
1. Birkaç dakika bekleyin
2. Sayfayı hard refresh yapın
3. Gizli modda açıp test edin

## Test Etme
1. Tarayıcı konsolunu açın (F12)
2. Network sekmesine gidin
3. `products.json` dosyasını bulun
4. Request URL'inin `?` ile bir timestamp içerdiğini kontrol edin
5. Response'da güncel veriyi kontrol edin

## Sorun Devam Ederse
1. Tarayıcı console'unu kontrol edin (hata var mı?)
2. Network sekmesinde `products.json` isteğini kontrol edin
3. LocalStorage'ı temizleyin:
   ```javascript
   localStorage.removeItem('omer_kaptan_products');
   ```
4. Sayfayı yenileyin (Ctrl+F5)

