// Admin Panel JavaScript

// LocalStorage'dan veri yükleme ve kaydetme
const STORAGE_KEY = 'omer_kaptan_products';

async function loadProducts() {
  // Önce localStorage'ı kontrol et
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    console.log('Loading from localStorage');
    try {
      const parsed = JSON.parse(stored);
      // Veri yapısını kontrol et
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.products) && Array.isArray(parsed.categories)) {
        console.log('LocalStorage data is valid:', parsed.products.length, 'products');
        return parsed;
      } else {
        console.warn('LocalStorage data structure is invalid, clearing...');
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error parsing localStorage data:', e);
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  
  // İlk yüklemede veya localStorage boşsa products.json'dan yükle
  console.log('Loading from products.json');
  try {
    const response = await fetch('products.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Fetched data from products.json:', data);
    
    // Veri yapısını kontrol et
    if (data && typeof data === 'object' && Array.isArray(data.products) && Array.isArray(data.categories)) {
      console.log('products.json data is valid:', data.products.length, 'products');
      saveProducts(data);
      return data;
    } else {
      throw new Error('Invalid data structure in products.json');
    }
  } catch (error) {
    console.error('Error loading products:', error);
    // Hata durumunda boş veri döndür
    return { categories: [], products: [] };
  }
}

function saveProducts(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Sayfa yüklendiğinde
let productsData = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Debug bilgisi göster
  const debugInfo = document.getElementById('debug-info');
  const debugText = document.getElementById('debug-text');
  
  // Veriyi yükle
  try {
    debugText.textContent = 'Veri yükleniyor...';
    if (debugInfo) debugInfo.style.display = 'block';
    
    productsData = await loadProducts();
    console.log('Loaded productsData:', productsData);
    
    if (productsData && typeof productsData === 'object' && productsData.products && Array.isArray(productsData.products)) {
      console.log('Products loaded:', productsData.products.length);
      debugText.textContent = `${productsData.products.length} ürün yüklendi.`;
      
      initializeAdmin();
      
      // Ürünleri göster (URL'de product id yoksa)
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.get('product')) {
        // Biraz bekleyip ürünleri göster
        setTimeout(() => {
          displayProductsIfReady();
        }, 300);
      }
    } else {
      console.warn('Products data is invalid, using empty data', productsData);
      debugText.textContent = 'Veri yüklenemedi! products.json dosyasını kontrol edin veya localStorage\'ı temizleyin.';
      productsData = { categories: [], products: [] };
      initializeAdmin();
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
    debugText.textContent = `Hata: ${error.message}`;
    productsData = { categories: [], products: [] };
    initializeAdmin();
  }
});

function initializeAdmin() {
  // Tab navigation
  setupTabs();
  
  // Kategorileri doldur
  populateCategories();
  
  // Form event listener'ları
  setupForms();
  
  // URL'den product id kontrolü
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('product');
  
  if (productId) {
    editProduct(parseInt(productId));
  } else {
    // Ürünleri listele - productsData kontrolü ile
    displayProductsIfReady();
  }
}

function displayProductsIfReady() {
  if (productsData && productsData.products && Array.isArray(productsData.products) && productsData.products.length > 0) {
    console.log('Displaying products:', productsData.products.length);
    displayProducts();
  } else {
    console.warn('productsData henüz hazır değil:', productsData);
    const productsList = document.getElementById('products-list');
    if (productsList) {
      productsList.innerHTML = '<p>Ürünler yükleniyor...</p>';
    }
  }
}

// Tab navigation
function setupTabs() {
  const tabs = document.querySelectorAll('.admin-tab');
  const tabContents = document.querySelectorAll('.admin-tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Tüm tabları deaktif et
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Seçili tabı aktif et
      tab.classList.add('active');
      const targetContent = document.getElementById(`${targetTab}-tab`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
      
      // Tab'a göre içeriği yenile
      if (targetTab === 'products') {
        displayProductsIfReady();
      } else if (targetTab === 'hidden') {
        if (productsData && productsData.products && Array.isArray(productsData.products)) {
          displayHiddenProducts();
        }
      } else if (targetTab === 'categories') {
        if (productsData && productsData.categories && Array.isArray(productsData.categories)) {
          displayCategories();
        }
      }
    });
  });
}

// Kategorileri doldur
function populateCategories() {
  if (!productsData || !productsData.categories || !Array.isArray(productsData.categories)) {
    console.warn('categories data is not available');
    return;
  }
  
  const categorySelects = document.querySelectorAll('#category-filter, #add-category, #edit-category');
  
  categorySelects.forEach(select => {
    if (select.id === 'category-filter') {
      select.innerHTML = '<option value="">Tüm Kategoriler</option>';
    } else {
      select.innerHTML = '<option value="">Kategori Seçin</option>';
    }
    
    productsData.categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      select.appendChild(option);
    });
  });
}

// Ürünleri listele
function displayProducts(filteredProducts = null) {
  const productsList = document.getElementById('products-list');
  if (!productsList) {
    console.error('products-list elementi bulunamadı!');
    return;
  }
  
  if (!productsData) {
    console.error('productsData bulunamadı!');
    productsList.innerHTML = '<p>Veri yüklenemedi. Sayfayı yenileyin.</p>';
    return;
  }
  
  if (!productsData.products || !Array.isArray(productsData.products)) {
    console.error('productsData.products geçersiz!', productsData);
    productsList.innerHTML = '<p>Veri yapısı geçersiz. LocalStorage\'ı temizleyip sayfayı yenileyin.</p>';
    return;
  }
  
  const productsToShow = filteredProducts || productsData.products.filter(p => !p.hidden);
  
  if (productsToShow.length === 0) {
    productsList.innerHTML = '<p>Ürün bulunamadı. Tüm ürünler gizli olabilir.</p>';
    return;
  }
  
  productsList.innerHTML = '';
  
  productsToShow.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card-admin';
    card.innerHTML = `
      <div class="product-card-image">
        <img src="assets/${product.image}" alt="${product.name}" onerror="this.src='assets/omerkaptanlogo.png'" />
      </div>
      <div class="product-card-info">
        <h4>${product.name}</h4>
        <p class="product-category">${product.category}</p>
        <p class="product-price">₺${product.price}</p>
        <p class="product-desc">${product.shortDesc || product.description}</p>
        <div class="product-actions">
          <button class="btn-edit" onclick="editProduct(${product.id})">Düzenle</button>
          <button class="btn-toggle-hidden" onclick="toggleProductVisibility(${product.id})">
            ${product.hidden ? 'Göster' : 'Gizle'}
          </button>
        </div>
      </div>
    `;
    productsList.appendChild(card);
  });
}

// Gizlenen ürünleri listele
function displayHiddenProducts() {
  const hiddenList = document.getElementById('hidden-products-list');
  if (!hiddenList) return;
  
  const hiddenProducts = productsData.products.filter(p => p.hidden);
  
  if (hiddenProducts.length === 0) {
    hiddenList.innerHTML = '<p>Gizlenen ürün bulunamadı.</p>';
    return;
  }
  
  hiddenList.innerHTML = '';
  
  hiddenProducts.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card-admin';
    card.innerHTML = `
      <div class="product-card-image">
        <img src="assets/${product.image}" alt="${product.name}" onerror="this.src='assets/omerkaptanlogo.png'" />
      </div>
      <div class="product-card-info">
        <h4>${product.name}</h4>
        <p class="product-category">${product.category}</p>
        <p class="product-price">₺${product.price}</p>
        <p class="product-desc">${product.shortDesc || product.description}</p>
        <div class="product-actions">
          <button class="btn-edit" onclick="editProduct(${product.id})">Düzenle</button>
          <button class="btn-toggle-hidden" onclick="toggleProductVisibility(${product.id})">Göster</button>
        </div>
      </div>
    `;
    hiddenList.appendChild(card);
  });
}

// Ürün düzenle
function editProduct(id) {
  const product = productsData.products.find(p => p.id === id);
  if (!product) return;
  
  // Edit formunu doldur
  document.getElementById('edit-id').value = product.id;
  document.getElementById('edit-category').value = product.category;
  document.getElementById('edit-name').value = product.name;
  document.getElementById('edit-price').value = product.price;
  document.getElementById('edit-short-desc').value = product.shortDesc || '';
  document.getElementById('edit-description').value = product.description;
  document.getElementById('edit-image').value = product.image;
  document.getElementById('edit-companions').value = product.companions ? product.companions.join(', ') : '';
  document.getElementById('edit-hidden').checked = product.hidden || false;
  
  // Edit tabını göster
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
  
  document.getElementById('edit-product-tab').classList.add('active');
  
  // Scroll to top
  window.scrollTo(0, 0);
}

// Ürün görünürlüğünü değiştir
function toggleProductVisibility(id) {
  const product = productsData.products.find(p => p.id === id);
  if (!product) return;
  
  product.hidden = !product.hidden;
  saveProducts(productsData);
  
  // Listeleri yenile
  displayProducts();
  displayHiddenProducts();
}

// Form setup
function setupForms() {
  // Yeni ürün ekleme formu
  const addForm = document.getElementById('add-product-form');
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newProduct = {
        id: Math.max(...productsData.products.map(p => p.id), 0) + 1,
        name: document.getElementById('add-name').value,
        category: document.getElementById('add-category').value,
        price: document.getElementById('add-price').value,
        shortDesc: document.getElementById('add-short-desc').value,
        description: document.getElementById('add-description').value,
        image: document.getElementById('add-image').value,
        companions: document.getElementById('add-companions').value
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        hidden: false
      };
      
      productsData.products.push(newProduct);
      saveProducts(productsData);
      
      // Formu temizle
      addForm.reset();
      
      // Başarı mesajı
      alert('Ürün başarıyla eklendi!');
      
      // Ürünler listesine geç
      document.querySelector('[data-tab="products"]').click();
    });
  }
  
  // Ürün güncelleme formu
  const editForm = document.getElementById('edit-product-form');
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const id = parseInt(document.getElementById('edit-id').value);
      const product = productsData.products.find(p => p.id === id);
      if (!product) return;
      
      product.name = document.getElementById('edit-name').value;
      product.category = document.getElementById('edit-category').value;
      product.price = document.getElementById('edit-price').value;
      product.shortDesc = document.getElementById('edit-short-desc').value;
      product.description = document.getElementById('edit-description').value;
      product.image = document.getElementById('edit-image').value;
      product.companions = document.getElementById('edit-companions').value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      product.hidden = document.getElementById('edit-hidden').checked;
      
      saveProducts(productsData);
      
      alert('Ürün başarıyla güncellendi!');
      
      // Ürünler listesine dön
      window.location.href = 'admin.html';
    });
  }
  
  // Ürün silme
  const deleteBtn = document.getElementById('delete-product-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      const id = parseInt(document.getElementById('edit-id').value);
      if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;
      
      productsData.products = productsData.products.filter(p => p.id !== id);
      saveProducts(productsData);
      
      alert('Ürün başarıyla silindi!');
      window.location.href = 'admin.html';
    });
  }
  
  // İptal butonu
  const cancelBtn = document.getElementById('cancel-edit-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      window.location.href = 'admin.html';
    });
  }
  
  // Kategori ekleme
  const addCategoryForm = document.getElementById('add-category-form');
  if (addCategoryForm) {
    addCategoryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const categoryName = document.getElementById('new-category-name').value.trim();
      if (!categoryName) return;
      
      if (productsData.categories.includes(categoryName)) {
        alert('Bu kategori zaten mevcut!');
        return;
      }
      
      productsData.categories.push(categoryName);
      saveProducts(productsData);
      
      document.getElementById('new-category-name').value = '';
      populateCategories();
      displayCategories();
      
      alert('Kategori başarıyla eklendi!');
    });
  }
  
  // Kategori filtreleme
  const categoryFilter = document.getElementById('category-filter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      filterProducts();
    });
  }
  
  // Arama
  const searchInput = document.getElementById('search-products');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterProducts();
    });
  }
}

// Ürünleri filtrele
function filterProducts() {
  const category = document.getElementById('category-filter').value;
  const search = document.getElementById('search-products').value.toLowerCase();
  
  let filtered = productsData.products.filter(p => !p.hidden);
  
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  
  if (search) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search)
    );
  }
  
  displayProducts(filtered);
}

// Kategorileri listele
function displayCategories() {
  const categoriesList = document.getElementById('categories-list');
  if (!categoriesList) return;
  
  categoriesList.innerHTML = '';
  
  productsData.categories.forEach(category => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${category}</span>
      <button class="btn-danger btn-small" onclick="deleteCategory('${category}')">Sil</button>
    `;
    categoriesList.appendChild(li);
  });
}

// Kategori sil
function deleteCategory(categoryName) {
  if (!confirm(`"${categoryName}" kategorisini silmek istediğinizden emin misiniz?`)) return;
  
  // Kategorideki ürünleri kontrol et
  const categoryProducts = productsData.products.filter(p => p.category === categoryName);
  if (categoryProducts.length > 0) {
    if (!confirm(`Bu kategoride ${categoryProducts.length} ürün var. Kategori silinecek ve ürünler kategorisiz kalacak. Devam etmek istiyor musunuz?`)) {
      return;
    }
  }
  
  productsData.categories = productsData.categories.filter(c => c !== categoryName);
  saveProducts(productsData);
  
  populateCategories();
  displayCategories();
  displayProducts();
  
  alert('Kategori başarıyla silindi!');
}

// Global fonksiyonlar (inline onclick için)
window.editProduct = editProduct;
window.toggleProductVisibility = toggleProductVisibility;
window.deleteCategory = deleteCategory;

