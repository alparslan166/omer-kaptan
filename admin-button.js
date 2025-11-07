// Admin Düzenle Butonu Ekleme Scripti
// Bu script tüm kategori sayfalarına ve product.html'e eklenecek

(async function() {
  // LocalStorage'dan veya products.json'dan veriyi yükle
  const STORAGE_KEY = 'omer_kaptan_products';
  
  let productsData = null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      productsData = JSON.parse(stored);
    } else {
      // products.json'dan yükle
      // Path'i belirle: category sayfalarından ../products.json, product.html'den products.json
      const isProductPage = window.location.pathname.includes('product.html');
      const jsonPath = isProductPage ? 'products.json' : '../products.json';
      const response = await fetch(jsonPath);
      productsData = await response.json();
    }
  } catch (error) {
    console.error('Error loading products data:', error);
    return;
  }
  
  if (!productsData || !productsData.products) return;
  
  // URL parametrelerinden name ve category al
  const urlParams = new URLSearchParams(window.location.search);
  const productName = urlParams.get('name');
  const productCategory = urlParams.get('category');
  
  // Product detail sayfasıysa
  if (productName && productCategory && window.location.pathname.includes('product.html')) {
    addEditButtonToProductDetail(productName, productCategory, productsData);
  } else {
    // Kategori sayfasındaysa tüm ürün kartlarına buton ekle
    addEditButtonsToProductCards(productsData);
  }
  
  function addEditButtonToProductDetail(name, category, data) {
    const product = data.products.find(p => 
      p.name === name && p.category === category
    );
    
    if (!product) return;
    
    // Product detail sayfasında düzenle butonu ekle
    const productBody = document.querySelector('.product-body') || 
                       document.querySelector('[data-product-name-title]')?.parentElement;
    
    if (productBody) {
      // Mevcut butonu kontrol et
      if (productBody.querySelector('.admin-edit-btn')) return;
      
      const editBtn = document.createElement('a');
      // product.html root dizinde, direkt admin.html
      editBtn.href = `admin.html?product=${product.id}`;
      editBtn.className = 'admin-edit-btn';
      editBtn.innerHTML = `
        <span class="icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </span>
        Düzenle
      `;
      
      // Butonu product-body içine ekle
      productBody.appendChild(editBtn);
    }
  }
  
  function addEditButtonsToProductCards(data) {
    // Tüm ürün kartlarını bul
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
      // Zaten buton varsa atla
      if (card.querySelector('.admin-edit-btn')) return;
      
      // Ürün adını ve kategorisini bul
      const titleEl = card.querySelector('.product-title');
      const categoryEl = document.querySelector('.section-head h3') || 
                        document.querySelector('.site-subtitle');
      
      if (!titleEl) return;
      
      const productName = titleEl.textContent.trim();
      let category = '';
      
      // Kategoriyi bul
      if (categoryEl) {
        category = categoryEl.textContent.trim();
      } else {
        // URL'den kategoriyi bul
        const path = window.location.pathname;
        const categoryMatch = path.match(/\/([^/]+)\.html$/);
        if (categoryMatch) {
          // Dosya adından kategori adını çıkar
          const fileName = categoryMatch[1];
          category = data.categories.find(c => 
            normalizeForFile(c) === fileName
          ) || '';
        }
      }
      
      if (!category) return;
      
      // Products.json'da ürünü bul
      const product = data.products.find(p => 
        p.name === productName && p.category === category
      );
      
      if (!product) return;
      
      // Düzenle butonunu oluştur
      const editBtn = document.createElement('a');
      // Path'i belirle (product.html'den admin.html'e direkt, category sayfalarından ../admin.html)
      const isProductPage = window.location.pathname.includes('product.html');
      editBtn.href = isProductPage ? `admin.html?product=${product.id}` : `../admin.html?product=${product.id}`;
      editBtn.className = 'admin-edit-btn';
      editBtn.innerHTML = `
        <span class="icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </span>
        Düzenle
      `;
      
      // Butonu kartın sağ alt köşesine ekle
      const productBody = card.querySelector('.product-body');
      if (productBody) {
        // product-body'yi relative yap
        productBody.style.position = 'relative';
        productBody.appendChild(editBtn);
      }
    });
  }
  
  function normalizeForFile(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-');
  }
})();

