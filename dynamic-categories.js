// Ana sayfadaki kategorileri products.json'dan dinamik olarak yükler
(function() {
  // Kategori ismini dosya adına çevir
  function normalizeForFileGlobal(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    // Özel durumlar - mevcut klasör yapısına uygun
    const specialCases = {
      'Ara Sıcaklar': 'arasicaklar',
      'Alkolsüz İçecekler': 'alkolsuz-icecekler',
      'Alkollü İçecekler': 'alkollu-icecekler',
      'İçecekler': 'icecekler'
    };
    
    if (specialCases[text]) {
      return specialCases[text];
    }
    
    return text
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Kategori resim dosya adını al
  function getCategoryImageFileName(categoryName) {
    const categoryImageNames = {
      'Ara Sıcaklar': 'ara-sicaklar',
      'Alkolsüz İçecekler': 'alkolsuz-icecekler',
      'Alkollü İçecekler': 'alkollu-icecekler'
    };
    
    return categoryImageNames[categoryName] || normalizeForFileGlobal(categoryName);
  }
  
  // Kategori HTML'i oluştur
  function createCategoryCard(category) {
    const categorySlug = normalizeForFileGlobal(category);
    const imageFileName = getCategoryImageFileName(category);
    const categoryImage = `assets/${categorySlug}/${imageFileName}.jpg`;
    const categoryUrl = `categories/${categorySlug}.html`;
    
    return `
      <a class="cat-card" href="${categoryUrl}">
        <span class="cat-title">${escapeHtml(category)}</span>
        <div class="cat-figure">
          <img src="${categoryImage}" alt="${escapeHtml(category)}" 
               onerror="this.src='assets/omerkaptanlogo.png'; this.style.opacity='0.5';" />
        </div>
        <div class="cat-overlay">
          <span class="cat-btn">
            <span class="icon">
              <img src="assets/icon-ship-wheel.svg" alt="" />
            </span>
            Ürünleri Gör
          </span>
        </div>
      </a>
    `;
  }
  
  // HTML escape
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Kategorileri yükle ve göster
  async function loadCategories() {
    const categoryGrid = document.querySelector('.category-grid');
    if (!categoryGrid) {
      console.log('Category grid bulunamadı');
      return;
    }
    
    try {
      // products.json'dan kategorileri yükle
      const response = await fetch('products.json?' + Date.now()); // Cache-busting
      if (!response.ok) {
        console.warn('products.json yüklenemedi, statik içerik gösteriliyor');
        return; // Statik HTML'i göster
      }
      
      const data = await response.json();
      if (!data.categories || !Array.isArray(data.categories) || data.categories.length === 0) {
        console.warn('Kategoriler bulunamadı, statik içerik gösteriliyor');
        return; // Statik HTML'i göster
      }
      
      // Kategorileri products.json'daki sıraya göre göster
      categoryGrid.innerHTML = '';
      data.categories.forEach(category => {
        const cardHtml = createCategoryCard(category);
        categoryGrid.insertAdjacentHTML('beforeend', cardHtml);
      });
      
      console.log('Kategoriler dinamik olarak yüklendi:', data.categories.length);
    } catch (error) {
      console.error('Kategori yükleme hatası:', error);
      // Hata durumunda statik HTML gösterilmeye devam eder
    }
  }
  
  // Sayfa yüklendiğinde çalıştır
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCategories);
  } else {
    loadCategories();
  }
})();

