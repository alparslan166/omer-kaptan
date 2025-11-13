// Ana sayfadaki kategorileri products.json'dan dinamik olarak yükler
(function() {
  // Kategori ismini dosya adına çevir
  function normalizeForFileGlobal(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    // Özel durumlar - mevcut klasör yapısına uygun
    // Not: HTML dosya adları için (categories/ klasöründe)
    const specialCases = {
      'Ara Sıcaklar': 'ara-sicaklar', // HTML dosyası: ara-sicaklar.html
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
    if (!categoryName || typeof categoryName !== 'string') {
      return 'omerkaptanlogo';
    }
    
    // Özel durumlar - mevcut klasör yapısına uygun
    const categoryImageNames = {
      'Ara Sıcaklar': 'ara-sicaklar',
      'Alkolsüz İçecekler': 'alkolsuz-icecekler',
      'Alkollü İçecekler': 'alkollu-icecekler'
    };
    
    // Özel durum varsa kullan, yoksa normalize et (yeni kategoriler için de çalışır)
    if (categoryImageNames[categoryName]) {
      return categoryImageNames[categoryName];
    }
    
    // Yeni kategoriler için otomatik normalizasyon
    const normalized = normalizeForFileGlobal(categoryName);
    return normalized || 'omerkaptanlogo';
  }
  
  // Kategori HTML'i oluştur
  function createCategoryCard(category) {
    // Geçersiz kategori kontrolü
    if (!category || typeof category !== 'string' || category.trim() === '') {
      console.warn('Geçersiz kategori:', category);
      return '';
    }
    
    const categorySlug = normalizeForFileGlobal(category);
    const imageFileName = getCategoryImageFileName(category);
    
    // Slug veya dosya adı boşsa fallback kullan
    if (!categorySlug || !imageFileName) {
      console.warn('Kategori slug veya dosya adı oluşturulamadı:', category);
      return '';
    }
    
    // Resim yolu için assets klasör adını kullan (arasicaklar)
    // HTML dosyası için normalize edilmiş slug kullan (ara-sicaklar)
    const imageCategorySlug = category === 'Ara Sıcaklar' ? 'arasicaklar' : categorySlug;
    const categoryImage = `assets/${imageCategorySlug}/${imageFileName}.jpg`;
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
        // Geçersiz kategori kontrolü
        if (!category || typeof category !== 'string' || category.trim() === '') {
          console.warn('Geçersiz kategori atlandı:', category);
          return;
        }
        
        const cardHtml = createCategoryCard(category);
        if (cardHtml) {
          categoryGrid.insertAdjacentHTML('beforeend', cardHtml);
        } else {
          console.warn('Kategori kartı oluşturulamadı:', category);
        }
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

