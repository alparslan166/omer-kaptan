// Kategori sayfalarını dinamik hale getiren script
// localStorage'dan ürünleri okuyup sayfaya ekler

(function() {
  const STORAGE_KEY = 'omer_kaptan_products';
  
  // Sayfa yüklendiğinde çalıştır
  function initDynamicProducts() {
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
      console.log('LocalStorage\'da veri yok, statik içerik gösteriliyor');
      return; // Veri yoksa statik HTML'i göster
    }
    
    // Mevcut sayfanın kategorisini bul
    const currentCategory = getCurrentCategory();
    if (!currentCategory) {
      console.log('Kategori bulunamadı');
      return;
    }
    
    // Bu kategoriye ait gizlenmemiş ürünleri bul
    const categoryProducts = productsData.products.filter(p => 
      p.category === currentCategory && !p.hidden
    );
    
    if (categoryProducts.length === 0) {
      console.log(`"${currentCategory}" kategorisinde ürün bulunamadı`);
      return;
    }
    
    // Alkollü İçecekler ve Mezeler için özel işlem (kategori başlıkları ile)
    if (currentCategory === 'Alkollü İçecekler' || currentCategory === 'Mezeler') {
      // Mevcut içeriği bul (section-head'den sonraki tüm içeriği temizle)
      const main = document.querySelector('main .container');
      if (!main) {
        console.log('main container bulunamadı');
        return;
      }
      
      const sectionHead = main.querySelector('.section-head');
      if (!sectionHead) {
        console.log('section-head bulunamadı');
        return;
      }
      
      // section-head'den sonraki tüm içeriği temizle
      let nextSibling = sectionHead.nextElementSibling;
      while (nextSibling) {
        const toRemove = nextSibling;
        nextSibling = nextSibling.nextElementSibling;
        toRemove.remove();
      }
      
      // Yeni container oluştur
      const newContainer = document.createElement('div');
      main.appendChild(newContainer);
      
      // Ürünleri render et
      renderProducts(categoryProducts, newContainer, currentCategory);
    } else {
      // Diğer kategoriler için normal işlem
      const productGrid = document.querySelector('.product-grid');
      if (!productGrid) {
        console.log('product-grid bulunamadı');
        return;
      }
      
      // Ürünleri render et
      renderProducts(categoryProducts, productGrid, currentCategory);
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
      if (subtitleText && !subtitleText.includes('Ömer')) {
        return subtitleText;
      }
    }
    
    return null;
  }
  
  function renderProducts(products, container, category) {
    // Alkollü İçecekler için özel işlem
    if (category === 'Alkollü İçecekler') {
      renderAlkolluIcecekler(products, container);
      return;
    }
    
    // Mezeler için özel işlem
    if (category === 'Mezeler') {
      renderMezeler(products, container);
      return;
    }
    
    // Mevcut içeriği temizle
    container.innerHTML = '';
    
    // Her ürün için kart oluştur
    products.forEach(product => {
      const card = createProductCard(product);
      container.appendChild(card);
    });
    
    console.log(`${products.length} ürün render edildi`);
  }
  
  function renderMezeler(products, container) {
    // Mezeleri kategorilere ayır (öncelik sırasına göre)
    
    // 1. Deniz Mahsullü Mezeler (en özel kategori)
    const denizMahsulleri = products.filter(p => 
      p.name.includes('Karides') ||
      p.name.includes('Ahtapot') ||
      p.name.includes('Kalamar') ||
      p.name.includes('Midye') ||
      p.name.includes('Lakerda') ||
      p.name.includes('Marine') ||
      p.name.includes('Marin') ||
      (p.name.includes('Tarama') && !p.name.includes('Ezme')) ||
      p.name.includes('Balık Köftesi') ||
      p.name.includes('Deniz Börülcesi') ||
      p.name === 'Deniz Mahsullü'
    );
    
    // 2. Zeytinyağlı Mezeler
    const zeytinyagli = products.filter(p => 
      (p.name.includes('Zeytinyağlı') || p.name.includes('zeytinyağlı')) &&
      !denizMahsulleri.includes(p)
    );
    
    // 3. Yoğurtlu Mezeler
    const yogurtlu = products.filter(p => 
      (p.name.includes('Yoğurtlu') || p.name.includes('yoğurtlu') || p.name === 'Atom') &&
      !p.name.includes('Zeytinyağlı') &&
      !denizMahsulleri.includes(p) &&
      !p.name.includes('Salata')
    );
    
    // 4. Ezmeler (deniz ürünü olmayan)
    const ezmeler = products.filter(p => 
      (p.name.includes('Ezme') || p.name.includes('ezme')) &&
      !denizMahsulleri.includes(p) &&
      !zeytinyagli.includes(p) &&
      !p.name.includes('Salata')
    ).concat(
      products.filter(p => 
        (p.name === 'Muhammara' ||
         p.name === 'Fava' ||
         p.name === 'Babagannuş' ||
         p.name === 'Girit Ezmesi' ||
         p.name === 'Tahinli Patlıcan' ||
         p.name === 'Zeytin Ezmesi') &&
        !denizMahsulleri.includes(p)
      )
    );
    
    // 5. Salatalar (diğer kategorilere dahil olmayan)
    const salatalar = products.filter(p => 
      (p.name.includes('Salata') || 
       p.name.includes('salata') ||
       p.name.includes('Salatası') ||
       p.name.includes('Piyazı') ||
       p.name.includes('Kısır') ||
       p.name.includes('Gavurdağı') ||
       p.name.includes('Mercimek Köftesi') ||
       p.name.includes('Havuç Tarator')) &&
      !denizMahsulleri.includes(p) &&
      !zeytinyagli.includes(p) &&
      !yogurtlu.includes(p) &&
      !ezmeler.includes(p)
    );
    
    // 6. Diğer Mezeler
    const digerMezeler = products.filter(p => 
      !zeytinyagli.includes(p) &&
      !yogurtlu.includes(p) &&
      !ezmeler.includes(p) &&
      !denizMahsulleri.includes(p) &&
      !salatalar.includes(p)
    );
    
    // Mevcut içeriği temizle
    container.innerHTML = '';
    
    // Zeytinyağlı Mezeler
    if (zeytinyagli.length > 0) {
      const section = document.createElement('div');
      section.innerHTML = `<h4 class="category-title">Zeytinyağlı Mezeler</h4>`;
      container.appendChild(section);
      
      const grid = document.createElement('section');
      grid.className = 'product-grid';
      grid.setAttribute('aria-label', 'Zeytinyağlı Mezeler');
      
      zeytinyagli.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
      });
      
      container.appendChild(grid);
    }
    
    // Yoğurtlu Mezeler
    if (yogurtlu.length > 0) {
      const section = document.createElement('div');
      section.innerHTML = `<h4 class="category-title">Yoğurtlu Mezeler</h4>`;
      container.appendChild(section);
      
      const grid = document.createElement('section');
      grid.className = 'product-grid';
      grid.setAttribute('aria-label', 'Yoğurtlu Mezeler');
      
      yogurtlu.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
      });
      
      container.appendChild(grid);
    }
    
    // Ezmeler
    if (ezmeler.length > 0) {
      const section = document.createElement('div');
      section.innerHTML = `<h4 class="category-title">Ezmeler</h4>`;
      container.appendChild(section);
      
      const grid = document.createElement('section');
      grid.className = 'product-grid';
      grid.setAttribute('aria-label', 'Ezmeler');
      
      ezmeler.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
      });
      
      container.appendChild(grid);
    }
    
    // Salatalar
    if (salatalar.length > 0) {
      const section = document.createElement('div');
      section.innerHTML = `<h4 class="category-title">Salatalar</h4>`;
      container.appendChild(section);
      
      const grid = document.createElement('section');
      grid.className = 'product-grid';
      grid.setAttribute('aria-label', 'Salatalar');
      
      salatalar.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
      });
      
      container.appendChild(grid);
    }
    
    // Deniz Mahsullü Mezeler
    if (denizMahsulleri.length > 0) {
      const section = document.createElement('div');
      section.innerHTML = `<h4 class="category-title">Deniz Mahsullü Mezeler</h4>`;
      container.appendChild(section);
      
      const grid = document.createElement('section');
      grid.className = 'product-grid';
      grid.setAttribute('aria-label', 'Deniz Mahsullü Mezeler');
      
      denizMahsulleri.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
      });
      
      container.appendChild(grid);
    }
    
    // Diğer Mezeler
    if (digerMezeler.length > 0) {
      const section = document.createElement('div');
      section.innerHTML = `<h4 class="category-title">Diğer Mezeler</h4>`;
      container.appendChild(section);
      
      const grid = document.createElement('section');
      grid.className = 'product-grid';
      grid.setAttribute('aria-label', 'Diğer Mezeler');
      
      digerMezeler.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
      });
      
      container.appendChild(grid);
    }
    
    console.log(`Mezeler render edildi - Zeytinyağlı: ${zeytinyagli.length}, Yoğurtlu: ${yogurtlu.length}, Ezme: ${ezmeler.length}, Salata: ${salatalar.length}, Deniz: ${denizMahsulleri.length}, Diğer: ${digerMezeler.length}`);
  }
  
  function renderAlkolluIcecekler(products, container) {
    // Rakılar ve Diğer Alkoller olarak ayır
    const rakiProducts = products.filter(p => 
      p.name.includes('Rakı') || p.name.includes('Raki') || p.name.includes('rakı') || p.name.includes('raki')
    );
    const digerAlkoller = products.filter(p => 
      !p.name.includes('Rakı') && !p.name.includes('Raki') && !p.name.includes('rakı') && !p.name.includes('raki')
    );
    
    // Mevcut içeriği temizle
    container.innerHTML = '';
    
    // Rakılar bölümü
    if (rakiProducts.length > 0) {
      const rakiSection = document.createElement('div');
      rakiSection.innerHTML = `<h4 class="category-title">Rakılar</h4>`;
      container.appendChild(rakiSection);
      
      const rakiGrid = document.createElement('section');
      rakiGrid.className = 'product-grid';
      rakiGrid.setAttribute('aria-label', 'Rakılar');
      
      rakiProducts.forEach(product => {
        const card = createProductCard(product);
        rakiGrid.appendChild(card);
      });
      
      container.appendChild(rakiGrid);
    }
    
    // Diğer Alkoller bölümü
    if (digerAlkoller.length > 0) {
      const digerSection = document.createElement('div');
      digerSection.innerHTML = `<h4 class="category-title">Diğer Alkoller</h4>`;
      container.appendChild(digerSection);
      
      const digerGrid = document.createElement('section');
      digerGrid.className = 'product-grid';
      digerGrid.setAttribute('aria-label', 'Diğer Alkoller');
      
      digerAlkoller.forEach(product => {
        const card = createProductCard(product);
        digerGrid.appendChild(card);
      });
      
      container.appendChild(digerGrid);
    }
    
    console.log(`Alkollü İçecekler render edildi - Rakılar: ${rakiProducts.length}, Diğer: ${digerAlkoller.length}`);
  }
  
  function createProductCard(product) {
    const companionsStr = product.companions && product.companions.length > 0
      ? product.companions.map(c => encodeURIComponent(c)).join('%2C%20')
      : '';
    
    const productUrl = `../product.html?name=${encodeURIComponent(product.name)}&category=${encodeURIComponent(product.category)}&desc=${encodeURIComponent(product.description)}&companions=${companionsStr}`;
    
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="media-figure">
        <img src="../assets/${product.image}" alt="${escapeHtml(product.name)}" onerror="this.src='../assets/omerkaptanlogo.png'" />
      </div>
      <div class="product-body">
        <h4 class="product-title">${escapeHtml(product.name)}</h4>
        <p class="product-price">₺${product.price}</p>
        <p class="product-desc">${escapeHtml(product.shortDesc || '')}</p>
        <a
          class="link"
          href="${productUrl}"
          ><span class="icon"
            ><img src="../assets/baliksimgesi.png" alt=""
          /></span>
          Detay</a
        >
      </div>
    `;
    
    return card;
  }
  
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Sayfa yüklendiğinde çalıştır
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDynamicProducts);
  } else {
    initDynamicProducts();
  }
  
  // Sayfa yüklendikten sonra da bir kez daha kontrol et
  window.addEventListener('load', function() {
    setTimeout(initDynamicProducts, 100);
  });
})();

