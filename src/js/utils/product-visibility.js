// Ürün görünürlüğünü kontrol eden script
// Admin panelinden gizlenen ürünleri kategori sayfalarında gizler

(function() {
  const STORAGE_KEY = 'omer_kaptan_products';
  
  async function initProductVisibility() {
    // Önce products.json'dan yükle (kalıcı kaynak)
    let productsData = null;
    try {
      console.log('products.json yükleniyor (product-visibility)...');
      // Sayfa konumuna göre products.json yolunu belirle
      let jsonPath = 'data/products.json';
      if (window.location.pathname.includes('/categories/')) {
        jsonPath = '../../data/products.json';
      }
      
      const response = await fetch(jsonPath + '?' + Date.now()); // Cache-busting
      if (response.ok) {
        const jsonData = await response.json();
        console.log('products.json yüklendi (product-visibility):', jsonData.products?.length, 'ürün');
        productsData = jsonData;
        
        // LocalStorage'a cache olarak kaydet
        if (productsData && productsData.products) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(productsData));
        }
      } else {
        console.log('products.json yüklenemedi, localStorage kullanılıyor');
        // products.json yüklenemezse localStorage'dan yükle
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            productsData = JSON.parse(stored);
            console.log('LocalStorage\'dan veri yüklendi:', productsData.products?.length, 'ürün');
          }
        } catch (e) {
          console.error('Error loading products data from localStorage:', e);
        }
      }
    } catch (e) {
      console.error('Error loading products.json:', e);
      // products.json yüklenemezse localStorage'dan yükle
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          productsData = JSON.parse(stored);
          console.log('LocalStorage\'dan veri yüklendi (fallback):', productsData.products?.length, 'ürün');
        }
      } catch (e2) {
        console.error('Error loading products data from localStorage:', e2);
      }
    }
    
    if (!productsData || !productsData.products || !Array.isArray(productsData.products)) {
      return; // Veri yoksa işlem yapma
    }
    
    // Gizlenen ürünleri bul
    const hiddenProducts = productsData.products
      .filter(p => p.hidden === true)
      .map(p => ({ name: p.name.trim(), category: p.category.trim() }));
    
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
          const productImage = document.querySelector('[data-product-image]');
          
          if (outOfStockMessage) {
            outOfStockMessage.style.display = 'block';
          }
          
          if (productImage) {
            productImage.style.opacity = '0.4';
          }
        } else {
          const outOfStockMessage = document.getElementById('out-of-stock-message');
          const productImage = document.querySelector('[data-product-image]');
          
          if (outOfStockMessage) {
            outOfStockMessage.style.display = 'none';
          }
          
          if (productImage) {
            productImage.style.opacity = '';
          }
        }
        
        return;
      }
    } else {
      // Kategori sayfasında gizlenen ürünleri gizle
      const currentCategory = getCurrentCategory();
      if (!currentCategory) {
        console.log('Kategori bulunamadı');
        return;
      }
      
      // Bu kategoriye ait gizlenen ürünleri bul
      if (hiddenProducts.length === 0) {
        return; // Gizlenen ürün yoksa kategori tarafında işlem yapmaya gerek yok
      }
      
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
    document.addEventListener('DOMContentLoaded', () => {
      initProductVisibility().catch(e => console.error('Error in initProductVisibility:', e));
    });
  } else {
    // DOM zaten yüklenmişse direkt çalıştır
    initProductVisibility().catch(e => console.error('Error in initProductVisibility:', e));
  }
  
  // Sayfa yüklendikten sonra da bir kez daha kontrol et (gecikmeli yüklenen içerik için)
  window.addEventListener('load', function() {
    setTimeout(() => {
      initProductVisibility().catch(e => console.error('Error in initProductVisibility (load):', e));
    }, 100);
  });
})();

