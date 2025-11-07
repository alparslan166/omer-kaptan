// Ürün görünürlüğünü kontrol eden script
// Admin panelinden gizlenen ürünleri kategori sayfalarında gizler

(function() {
  const STORAGE_KEY = 'omer_kaptan_products';
  
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
    .filter(p => p.hidden)
    .map(p => ({ name: p.name, category: p.category }));
  
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
      // Bu ürün gizlenmiş mi kontrol et
      const isHidden = hiddenProducts.some(p => 
        p.name === productName && p.category === productCategory
      );
      
      if (isHidden) {
        // Ürün gizlenmişse, sayfayı ana sayfaya yönlendir veya mesaj göster
        const main = document.querySelector('main');
        if (main) {
          main.innerHTML = `
            <div style="text-align: center; padding: 40px;">
              <h2>Ürün Bulunamadı</h2>
              <p>Bu ürün şu anda görüntülenemiyor.</p>
              <a href="index.html" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: var(--blue-700); color: white; text-decoration: none; border-radius: 8px;">Ana Sayfaya Dön</a>
            </div>
          `;
        }
      }
    }
  } else {
    // Kategori sayfasında gizlenen ürünleri gizle
    const currentCategory = getCurrentCategory();
    if (!currentCategory) return;
    
    // Bu kategoriye ait gizlenen ürünleri bul
    const hiddenInCategory = hiddenProducts.filter(p => p.category === currentCategory);
    
    // Her gizlenen ürün kartını gizle
    hiddenInCategory.forEach(hiddenProduct => {
      hideProductCard(hiddenProduct.name);
    });
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
      return subtitle.textContent.trim();
    }
    
    return null;
  }
  
  function hideProductCard(productName) {
    // Tüm ürün kartlarını bul
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
      // Ürün adını bul
      const titleEl = card.querySelector('.product-title');
      if (titleEl && titleEl.textContent.trim() === productName) {
        // Kartı gizle
        card.style.display = 'none';
      }
    });
  }
})();

