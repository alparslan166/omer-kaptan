// Ürün görünürlüğünü kontrol eden script
// Admin panelinden gizlenen ürünleri kategori sayfalarında gizler

(function() {
  const STORAGE_KEY = 'omer_kaptan_products';
  
  function initProductVisibility() {
    // LocalStorage'dan veriyi yükle
    let productsData = null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        productsData = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading products data:', e);
      return;
    }
    
    if (!productsData || !productsData.products || !Array.isArray(productsData.products)) {
      return; // Veri yoksa işlem yapma
    }
    
    // Gizlenen ürünleri bul
    const hiddenProducts = productsData.products
      .filter(p => p.hidden === true)
      .map(p => ({ name: p.name.trim(), category: p.category.trim() }));
    
    if (hiddenProducts.length === 0) {
      return; // Gizlenen ürün yoksa işlem yapma
    }
    
    // Product detail sayfası mı kontrol et
    const isProductDetailPage = window.location.pathname.includes('product.html') || 
                                 window.location.href.includes('product.html');
    
    if (isProductDetailPage) {
      // Product detail sayfasında URL'den ürün adını al
      const urlParams = new URLSearchParams(window.location.search);
      const productName = urlParams.get('name');
      const productCategory = urlParams.get('category');
      
      if (productName && productCategory) {
        // Bu ürünü bul
        const product = productsData.products.find(p => 
          p.name === productName.trim() && p.category === productCategory.trim()
        );
        
        if (!product) {
          // Ürün bulunamadı
          const main = document.querySelector('main');
          if (main) {
            main.innerHTML = `
              <div style="text-align: center; padding: 40px;">
                <h2>Ürün Bulunamadı</h2>
                <p>Bu ürün şu anda görüntülenemiyor.</p>
                <a href="index.html" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #4da6ff; color: white; text-decoration: none; border-radius: 8px;">Ana Sayfaya Dön</a>
              </div>
            `;
          }
        } else if (product.hidden) {
          // Ürün gizlenmişse
          const main = document.querySelector('main');
          if (main) {
            main.innerHTML = `
              <div style="text-align: center; padding: 40px;">
                <h2>Ürün Bulunamadı</h2>
                <p>Bu ürün şu anda görüntülenemiyor.</p>
                <a href="index.html" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #4da6ff; color: white; text-decoration: none; border-radius: 8px;">Ana Sayfaya Dön</a>
              </div>
            `;
          }
        } else if (product.outOfStock) {
          // Ürün stokta yok - mesajı göster
          const outOfStockMessage = document.getElementById('out-of-stock-message');
          if (outOfStockMessage) {
            outOfStockMessage.style.display = 'block';
          }
        }
      }
    } else {
      // Kategori sayfasında gizlenen ürünleri gizle
      const currentCategory = getCurrentCategory();
      if (!currentCategory) {
        console.log('Kategori bulunamadı');
        return;
      }
      
      // Bu kategoriye ait gizlenen ürünleri bul
      const hiddenInCategory = hiddenProducts.filter(p => p.category === currentCategory.trim());
      
      if (hiddenInCategory.length === 0) {
        return; // Bu kategoride gizlenen ürün yok
      }
      
      console.log(`Kategori "${currentCategory}" için ${hiddenInCategory.length} gizlenen ürün bulundu`);
      
      // Her gizlenen ürün kartını gizle
      hiddenInCategory.forEach(hiddenProduct => {
        hideProductCard(hiddenProduct.name);
      });
    }
  }
  
  function getCurrentCategory() {
    // Kategori sayfasında section-head h3'ten kategoriyi al
    const categoryTitle = document.querySelector('.section-head h3');
    if (categoryTitle) {
      return categoryTitle.textContent.trim();
    }
    
    // Site subtitle'dan kategoriyi al
    const subtitle = document.querySelector('.site-subtitle');
    if (subtitle) {
      const subtitleText = subtitle.textContent.trim();
      // Eğer subtitle "Ömer Kaptan" veya başka bir şeyse, kategori değil
      if (subtitleText && !subtitleText.includes('Ömer')) {
        return subtitleText;
      }
    }
    
    return null;
  }
  
  function hideProductCard(productName) {
    // Tüm ürün kartlarını bul
    const productCards = document.querySelectorAll('.product-card');
    let found = false;
    
    productCards.forEach(card => {
      // Ürün adını bul
      const titleEl = card.querySelector('.product-title');
      if (titleEl) {
        const titleText = titleEl.textContent.trim();
        if (titleText === productName) {
          // Kartı gizle
          card.style.display = 'none';
          found = true;
          console.log(`Ürün gizlendi: ${productName}`);
        }
      }
    });
    
    if (!found) {
      console.log(`Ürün kartı bulunamadı: ${productName}`);
    }
  }
  
  // Sayfa yüklendiğinde çalıştır
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductVisibility);
  } else {
    // DOM zaten yüklenmişse direkt çalıştır
    initProductVisibility();
  }
  
  // Sayfa yüklendikten sonra da bir kez daha kontrol et (gecikmeli yüklenen içerik için)
  window.addEventListener('load', function() {
    setTimeout(initProductVisibility, 100);
  });
})();

