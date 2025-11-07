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
        // Eşlikçiler array'i yoksa oluştur
        if (!parsed.companions || !Array.isArray(parsed.companions)) {
          parsed.companions = [];
        }
        console.log('LocalStorage data is valid:', parsed.products.length, 'products', parsed.companions.length, 'companions');
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
      // Eşlikçiler array'i yoksa oluştur
      if (!data.companions || !Array.isArray(data.companions)) {
        data.companions = [];
      }
      console.log('products.json data is valid:', data.products.length, 'products', data.companions.length, 'companions');
      saveProducts(data);
      return data;
    } else {
      throw new Error('Invalid data structure in products.json');
    }
  } catch (error) {
    console.error('Error loading products:', error);
    // Hata durumunda boş veri döndür
    return { categories: [], products: [], companions: [] };
  }
}

function saveProducts(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // Güncellenmiş products.json'u indirme butonunu güncelle
  updateDownloadButton(data);
}

// Güncellenmiş products.json'u indirme butonunu güncelle
function updateDownloadButton(data) {
  let btnContainer = document.getElementById('products-json-actions');
  
  if (!btnContainer) {
    // Container yoksa oluştur
    const adminMain = document.querySelector('.admin-main');
    if (adminMain) {
      btnContainer = document.createElement('div');
      btnContainer.id = 'products-json-actions';
      btnContainer.style.cssText = 'margin: 20px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white; box-shadow: 0 4px 15px rgba(0,0,0,0.2);';
      adminMain.insertBefore(btnContainer, adminMain.firstChild);
    }
  }
  
  if (btnContainer) {
    btnContainer.innerHTML = `
      <div style="text-align: center;">
        <h3 style="margin: 0 0 15px 0; color: white; font-size: 18px;">
          🔄 Tüm Cihazlarda Güncelleme
        </h3>
        <p style="margin: 0 0 15px 0; color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6;">
          Değişikliklerin tüm cihazlarda (telefon, tablet, bilgisayar) görünmesi için products.json dosyasını sunucuya yüklemeniz gerekiyor.
        </p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button id="auto-update-github" class="btn-primary" style="font-size: 15px; padding: 12px 24px; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.15); display: none;">
            🚀 Otomatik Güncelle (GitHub)
          </button>
          <button id="download-products-json" class="btn-primary" style="font-size: 15px; padding: 12px 24px; background: white; color: #667eea; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
            📥 Dosyayı İndir
          </button>
          <button id="copy-json-content" class="btn-secondary" style="font-size: 15px; padding: 12px 24px; background: rgba(255,255,255,0.2); color: white; border: 2px solid white; border-radius: 8px; cursor: pointer; font-weight: 600;">
            📋 JSON'u Kopyala
          </button>
          <button id="github-settings-btn" class="btn-secondary" style="font-size: 15px; padding: 12px 24px; background: rgba(255,255,255,0.2); color: white; border: 2px solid white; border-radius: 8px; cursor: pointer; font-weight: 600;">
            ⚙️ GitHub Ayarları
          </button>
        </div>
        <div style="margin-top: 15px; padding: 12px; background: rgba(255,255,255,0.15); border-radius: 8px; text-align: center;">
          <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.9); font-size: 13px;">
            💡 <strong>Otomatik Güncelleme:</strong> GitHub API ile otomatik güncelleme özelliğini aktifleştirmek için <code style="background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 4px;">GITHUB_AUTO_UPDATE_SETUP.md</code> dosyasına bakın.
          </p>
        </div>
        <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; text-align: left;">
          <p style="margin: 0 0 10px 0; font-weight: 600; color: white; font-size: 14px;">📌 Adımlar:</p>
          <ol style="margin: 0; padding-left: 20px; color: rgba(255,255,255,0.9); font-size: 13px; line-height: 1.8;">
            <li>"Dosyayı İndir" butonuna tıklayın</li>
            <li>İndirilen <code style="background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 4px;">products.json</code> dosyasını sunucunuza yükleyin</li>
            <li>GitHub Pages kullanıyorsanız: Dosyayı GitHub repository'nize commit edin</li>
            <li>Diğer hosting servislerinde: FTP veya dosya yönetimi ile yükleyin</li>
            <li>Birkaç dakika içinde tüm cihazlarda değişiklikler görünecektir</li>
          </ol>
        </div>
        <div id="last-update-info" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); font-size: 12px;">
          Son güncelleme: ${new Date().toLocaleString('tr-TR')}
        </div>
      </div>
    `;
    
    // İndirme butonu
    const downloadBtn = document.getElementById('download-products-json');
    if (downloadBtn) {
      downloadBtn.onclick = () => {
        // JSON dosyasını indir
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'products.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Başarı mesajı
        showNotification('✅ products.json dosyası indirildi! Dosyayı sunucunuza yükleyin.', 'success');
      };
    }
    
    // Kopyalama butonu
    const copyBtn = document.getElementById('copy-json-content');
    if (copyBtn) {
      copyBtn.onclick = () => {
        const jsonStr = JSON.stringify(data, null, 2);
        navigator.clipboard.writeText(jsonStr).then(() => {
          showNotification('✅ JSON içeriği panoya kopyalandı!', 'success');
        }).catch(err => {
          // Fallback: textarea kullan
          const textarea = document.createElement('textarea');
          textarea.value = jsonStr;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          showNotification('✅ JSON içeriği panoya kopyalandı!', 'success');
        });
      };
    }
    
    // GitHub otomatik güncelleme butonu
    const autoUpdateBtn = document.getElementById('auto-update-github');
    if (autoUpdateBtn) {
      // GitHubConfig kontrolü
      const checkGitHubConfig = () => {
        if (window.GitHubConfig && window.GitHubConfig.isGitHubConfigComplete()) {
          autoUpdateBtn.style.display = 'inline-block';
          return true;
        }
        return false;
      };
      
      // Buton event listener'ı her zaman ayarla (GitHubConfig kontrolünden bağımsız)
      autoUpdateBtn.onclick = async () => {
        autoUpdateBtn.disabled = true;
        autoUpdateBtn.textContent = '⏳ Güncelleniyor...';
        
        try {
          // Önce GitHubConfig kontrolü
          if (!window.GitHubConfig || !window.GitHubConfig.isGitHubConfigComplete()) {
            throw new Error('GitHub API ayarları eksik! Lütfen "⚙️ GitHub Ayarları" butonuna tıklayarak ayarları yapılandırın.');
          }
          
          const jsonStr = JSON.stringify(data, null, 2);
          
          // GitHubAPI'nin yüklendiğinden emin ol (retry mekanizması ile)
          console.log('GitHubAPI kontrol ediliyor...', 'Mevcut:', typeof window.GitHubAPI !== 'undefined');
          
          let retries = 0;
          const maxRetries = 30; // 3 saniye (100ms * 30)
          
          while (!window.GitHubAPI && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
            if (retries % 5 === 0) {
              console.log(`GitHubAPI bekleniyor... (${retries}/${maxRetries})`);
            }
          }
          
          if (!window.GitHubAPI) {
            // Debug bilgisi
            const githubKeys = Object.keys(window).filter(k => k.toLowerCase().includes('github'));
            console.error('GitHubAPI yüklenemedi. Window objesinde GitHub ile ilgili:', githubKeys);
            console.error('Script dosyaları kontrol ediliyor...');
            
            // Script tag'lerini kontrol et
            const scripts = Array.from(document.querySelectorAll('script[src]'));
            const githubScripts = scripts.filter(s => s.src.includes('github'));
            console.error('GitHub script tag\'leri:', githubScripts.map(s => s.src));
            
            throw new Error('GitHub API modülü yüklenmedi! Lütfen sayfayı yenileyin (F5) veya tarayıcı konsolunu kontrol edin. Script dosyalarının yüklendiğinden emin olun.');
          }
          
          console.log('✅ GitHubAPI bulundu:', Object.keys(window.GitHubAPI));
          
          if (!window.GitHubAPI.updateFile) {
            console.error('GitHubAPI.updateFile bulunamadı. Mevcut fonksiyonlar:', Object.keys(window.GitHubAPI));
            throw new Error('GitHub API updateFile fonksiyonu bulunamadı! Sayfayı yenileyin.');
          }
          
          console.log('🚀 GitHub API ile güncelleme başlatılıyor...');
          const config = window.GitHubConfig.loadGitHubConfig();
          console.log('GitHub Config:', {
            repository: config.repository,
            branch: config.branch,
            filePath: config.filePath,
            hasToken: !!config.token
          });
          console.log('Güncellenecek JSON içeriği (ilk 200 karakter):', jsonStr.substring(0, 200));
          
          const result = await window.GitHubAPI.updateFile(jsonStr);
          console.log('✅ GitHub API güncelleme sonucu:', result);
          
          if (result && result.success) {
            showNotification('✅ Başarıyla güncellendi! Birkaç dakika içinde tüm cihazlarda görünecek.', 'success');
          } else if (result) {
            console.warn('GitHub API yanıtı:', result);
            showNotification('✅ Güncelleme tamamlandı! (Yanıt bekleniyor...)', 'success');
          } else {
            showNotification('⚠️ Güncelleme tamamlandı ancak yanıt alınamadı. Lütfen GitHub repository\'nizi kontrol edin.', 'error');
          }
        } catch (error) {
          console.error('GitHub API error:', error);
          showNotification(`❌ Hata: ${error.message}`, 'error');
        } finally {
          autoUpdateBtn.disabled = false;
          autoUpdateBtn.textContent = '🚀 Otomatik Güncelle (GitHub)';
        }
      };
      
      // GitHubConfig kontrolü ve buton görünürlüğü
      if (checkGitHubConfig()) {
        autoUpdateBtn.style.display = 'inline-block';
      } else {
        // GitHubConfig henüz yüklenmemiş, biraz sonra tekrar dene
        setTimeout(() => {
          if (checkGitHubConfig()) {
            autoUpdateBtn.style.display = 'inline-block';
          }
        }, 500);
      }
    }
    
    // GitHub ayarları butonu
    const settingsBtn = document.getElementById('github-settings-btn');
    if (settingsBtn) {
      settingsBtn.onclick = () => {
        showGitHubSettingsModal();
      };
    }
  }
}

// GitHub ayarları modal'ını göster
function showGitHubSettingsModal() {
  let config = {
    repository: '',
    token: '',
    branch: 'main',
    filePath: 'products.json'
  };
  
  if (window.GitHubConfig) {
    try {
      config = window.GitHubConfig.loadGitHubConfig();
    } catch (e) {
      console.error('Error loading GitHub config in modal:', e);
      // Fallback: localStorage'dan direkt yükle
      try {
        const stored = localStorage.getItem('github_api_config');
        if (stored) {
          config = JSON.parse(stored);
        }
      } catch (e2) {
        console.error('Error loading from localStorage:', e2);
      }
    }
  }
  
  const modal = document.createElement('div');
  modal.id = 'github-settings-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 12px; padding: 30px; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
      <h2 style="margin: 0 0 20px 0; color: #333;">⚙️ GitHub API Ayarları</h2>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">Repository (owner/repo)</label>
        <input type="text" id="github-repo" value="${config.repository}" placeholder="alparslan166/omer-kaptan" 
          style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px;">
        <small style="color: #666; font-size: 12px;">Örnek: alparslan166/omer-kaptan</small>
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">Personal Access Token</label>
        <input type="password" id="github-token" value="${config.token}" placeholder="ghp_xxxxxxxxxxxx" 
          style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px;">
        <small style="color: #666; font-size: 12px;">
          <a href="https://github.com/settings/tokens" target="_blank" style="color: #667eea;">Token oluştur</a> 
          (repo izni gerekli)
        </small>
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">Branch</label>
        <input type="text" id="github-branch" value="${config.branch}" placeholder="main" 
          style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px;">
      </div>
      
      <div style="margin-bottom: 25px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">Dosya Yolu</label>
        <input type="text" id="github-filepath" value="${config.filePath}" placeholder="products.json" 
          style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px;">
      </div>
      
      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button id="test-github-connection" class="btn-secondary" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          🔍 Bağlantıyı Test Et
        </button>
        <button id="save-github-settings" class="btn-primary" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          💾 Kaydet
        </button>
        <button id="close-github-settings" class="btn-secondary" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          ✕ Kapat
        </button>
      </div>
      
      <div id="github-test-result" style="margin-top: 20px; padding: 10px; border-radius: 8px; display: none;"></div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Kapat butonu
  document.getElementById('close-github-settings').onclick = () => {
    modal.remove();
  };
  
  // Modal dışına tıklayınca kapat
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  };
  
  // Kaydet butonu
  document.getElementById('save-github-settings').onclick = () => {
    const newConfig = {
      repository: document.getElementById('github-repo').value.trim(),
      token: document.getElementById('github-token').value.trim(),
      branch: document.getElementById('github-branch').value.trim() || 'main',
      filePath: document.getElementById('github-filepath').value.trim() || 'products.json',
      commitMessage: 'Update products.json from admin panel'
    };
    
    if (window.GitHubConfig && window.GitHubConfig.saveGitHubConfig) {
      window.GitHubConfig.saveGitHubConfig(newConfig);
      showNotification('✅ GitHub ayarları kaydedildi!', 'success');
      modal.remove();
      
      // Butonları güncelle
      if (productsData) {
        updateDownloadButton(productsData);
      }
    }
  };
  
  // Test butonu
  document.getElementById('test-github-connection').onclick = async () => {
    const testBtn = document.getElementById('test-github-connection');
    const resultDiv = document.getElementById('github-test-result');
    
    testBtn.disabled = true;
    testBtn.textContent = '⏳ Test ediliyor...';
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<p style="margin: 0; color: #17a2b8;">⏳ Bağlantı test ediliyor...</p>';
    
    try {
      // Geçici config ile test et
      const tempConfig = {
        repository: document.getElementById('github-repo').value.trim(),
        token: document.getElementById('github-token').value.trim(),
        branch: document.getElementById('github-branch').value.trim() || 'main',
        filePath: document.getElementById('github-filepath').value.trim() || 'products.json'
      };
      
      if (!tempConfig.repository || !tempConfig.token) {
        throw new Error('Repository ve Token alanları doldurulmalıdır!');
      }
      
      if (window.GitHubConfig) {
        window.GitHubConfig.saveGitHubConfig(tempConfig);
      } else {
        throw new Error('GitHub Config modülü yüklenmedi! Sayfayı yenileyin.');
      }
      
      // GitHubAPI'nin yüklendiğinden emin ol
      let retries = 0;
      while (!window.GitHubAPI && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }
      
      if (!window.GitHubAPI) {
        throw new Error('GitHub API modülü yüklenmedi! Lütfen sayfayı yenileyin ve script dosyalarının doğru yüklendiğinden emin olun.');
      }
      
      if (!window.GitHubAPI.testConnection) {
        throw new Error('GitHub API testConnection fonksiyonu bulunamadı!');
      }
      
      const isConnected = await window.GitHubAPI.testConnection();
      if (isConnected) {
        resultDiv.innerHTML = '<p style="margin: 0; color: #28a745; font-weight: 600;">✅ Bağlantı başarılı!</p>';
      } else {
        throw new Error('Bağlantı başarısız. Token ve repository bilgilerini kontrol edin.');
      }
    } catch (error) {
      console.error('GitHub connection test error:', error);
      resultDiv.innerHTML = `<p style="margin: 0; color: #dc3545; font-weight: 600;">❌ ${error.message}</p>`;
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = '🔍 Bağlantıyı Test Et';
    }
  };
}

// Bildirim gösterme fonksiyonu
function showNotification(message, type = 'info') {
  // Mevcut bildirimi kaldır
  const existing = document.querySelector('.admin-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = 'admin-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-size: 14px;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // 3 saniye sonra kaldır
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// CSS animasyonları ekle
if (!document.getElementById('admin-notification-styles')) {
  const style = document.createElement('style');
  style.id = 'admin-notification-styles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
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
    
    // normalizeForFileGlobal fonksiyonunu burada tanımla (henüz tanımlanmamış olabilir)
    const normalizeForMigration = (text) => {
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
    };
    
    // Mevcut eşlikçileri products.json'dan topla ve companions listesine ekle
    if (productsData && productsData.products && Array.isArray(productsData.products)) {
      const existingCompanionNames = new Set();
      
      // Mevcut companions array'inden isimleri topla
      if (productsData.companions && Array.isArray(productsData.companions)) {
        productsData.companions.forEach(c => {
          if (c.name) existingCompanionNames.add(c.name);
        });
      }
      
      // Tüm ürünlerin companions array'lerinden unique eşlikçileri topla
      const allCompanions = new Set();
      productsData.products.forEach(product => {
        if (product.companions && Array.isArray(product.companions)) {
          product.companions.forEach(companionName => {
            if (companionName && typeof companionName === 'string' && companionName.trim()) {
              allCompanions.add(companionName.trim());
            }
          });
        }
      });
      
      // Yeni eşlikçileri ekle
      let companionsUpdated = false;
      if (!productsData.companions) {
        productsData.companions = [];
      }
      
      // Mevcut max id'yi bul
      let maxId = Math.max(...(productsData.companions.map(c => c.id || 0).concat([0])));
      
      allCompanions.forEach(companionName => {
        // Eğer bu eşlikçi zaten companions listesinde yoksa ekle
        if (!existingCompanionNames.has(companionName)) {
          const imagePath = `assets/companions/${normalizeForMigration(companionName)}.jpg`;
          productsData.companions.push({
            id: ++maxId,
            name: companionName,
            image: imagePath
          });
          companionsUpdated = true;
          console.log(`Yeni eşlikçi eklendi: ${companionName} (${imagePath})`);
        }
      });
      
      // Mevcut eşlikçilerin resim yollarını assets/companions/ formatına çevir
      if (productsData.companions && Array.isArray(productsData.companions)) {
        productsData.companions.forEach(companion => {
          if (companion.image) {
            // Eğer assets/companions/ ile başlamıyorsa güncelle
            if (!companion.image.startsWith('assets/companions/')) {
              if (companion.image.startsWith('companions/')) {
                companion.image = `assets/${companion.image}`;
              } else if (!companion.image.startsWith('assets/')) {
                companion.image = `assets/companions/${companion.image}`;
              }
              companionsUpdated = true;
            }
          } else {
            // Resim yolu yoksa oluştur
            companion.image = `assets/companions/${normalizeForMigration(companion.name)}.jpg`;
            companionsUpdated = true;
          }
        });
      }
      
      if (companionsUpdated) {
        console.log('Eşlikçiler güncellendi: Ürünlerden toplanan eşlikçiler companions listesine eklendi ve resim yolları düzeltildi');
        saveProducts(productsData);
      }
    }
    
    if (productsData && typeof productsData === 'object' && productsData.products && Array.isArray(productsData.products)) {
      console.log('Products loaded:', productsData.products.length);
      debugText.textContent = `${productsData.products.length} ürün yüklendi.`;
      
      // İndirme butonunu göster
      updateDownloadButton(productsData);
      
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
      productsData = { categories: [], products: [], companions: [] };
      initializeAdmin();
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
    debugText.textContent = `Hata: ${error.message}`;
    productsData = { categories: [], products: [], companions: [] };
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
  
  // Eşlikçi form event listener'ları
  setupCompanionForms();
  
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
      } else if (targetTab === 'companions') {
        if (productsData) {
          displayCompanions();
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

// Resim yolu otomatik oluşturma fonksiyonu
// HTML escape fonksiyonu
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function generateImagePath(category, productName) {
  // normalizeForFile fonksiyonunu admin.js'de de kullanabilmek için
  function normalizeForFile(text) {
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
  
  const categorySlug = normalizeForFile(category);
  let productSlug = normalizeForFile(productName);
  
  // Mezeler kategorisi için özel işlem: Parantez içindeki kısımları kaldır
  if (category === 'Mezeler') {
    const nameWithoutParentheses = productName.split('(')[0].trim();
    productSlug = normalizeForFile(nameWithoutParentheses);
  }
  
  // "D." ile başlayan ürünler için özel işlem
  if (productName.startsWith('D. ')) {
    const nameWithoutD = productName.replace(/^D\.\s*/, '');
    productSlug = 'deniz-' + normalizeForFile(nameWithoutD);
  }
  
  return `${categorySlug}/${productSlug}.jpg`;
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
    // Resim yolunu güvenli hale getir
    let imagePath = 'omerkaptanlogo.png'; // Varsayılan resim
    if (product.image && product.image.trim() !== '') {
      // Eğer resim yolu zaten "assets/" ile başlıyorsa, kaldır
      const cleanImage = product.image.replace(/^assets\//, '');
      // Eğer resim yolu boş değilse, geçerli bir dosya adı gibi görünüyorsa ve kategori ile eşleşiyorsa kullan
      if (cleanImage && cleanImage !== product.category && !cleanImage.includes(' ')) {
        // Resim yolunun kategori klasörünü içerdiğini kontrol et
        const categorySlug = normalizeForFileGlobal(product.category);
        if (cleanImage.includes(categorySlug) || cleanImage.startsWith(categorySlug + '/')) {
          imagePath = cleanImage;
        } else {
          // Kategori klasörü yoksa, kategori klasörünü ekle
          imagePath = `${categorySlug}/${cleanImage}`;
        }
      }
    }
    
    const card = document.createElement('div');
    card.className = 'product-card-admin';
    
    // Resim div'i oluştur
    const imageDiv = document.createElement('div');
    imageDiv.className = 'product-card-image';
    const img = document.createElement('img');
    img.alt = product.name;
    
    // Resim yükleme stratejisi: Önce gerçek resmi yükle, yüklenemezse varsayılan resmi kullan
    // Bu sayede 404 hataları konsola yazılmaz
    const testImg = new Image();
    testImg.onload = function() {
      // Resim başarıyla yüklendi
      img.src = `assets/${imagePath}`;
    };
    testImg.onerror = function() {
      // Resim yüklenemedi, varsayılan resmi kullan (sessizce)
      img.src = 'assets/omerkaptanlogo.png';
    };
    
    // Önce varsayılan resmi göster, sonra gerçek resmi yükle
    img.src = 'assets/omerkaptanlogo.png';
    img.onerror = function() {
      // Varsayılan resim de yüklenemezse, hiçbir şey yapma (sonsuz döngüyü önle)
      this.onerror = null;
    };
    
    // Gerçek resmi yüklemeyi dene (sessizce)
    testImg.src = `assets/${imagePath}`;
    
    imageDiv.appendChild(img);
    
    // İçerik HTML'i
    const infoDiv = document.createElement('div');
    infoDiv.className = 'product-card-info';
    infoDiv.innerHTML = `
      <h4>${escapeHtml(product.name)}</h4>
      <p class="product-category">${escapeHtml(product.category)}</p>
      <p class="product-price">₺${product.price}</p>
      <p class="product-desc">${escapeHtml(product.shortDesc || product.description || '')}</p>
      <div class="product-actions">
        <button class="btn-edit" onclick="editProduct(${product.id})">Düzenle</button>
        <button class="btn-toggle-hidden" onclick="toggleProductVisibility(${product.id})">
          ${product.hidden ? 'Göster' : 'Gizle'}
        </button>
        <button class="btn-toggle-stock" onclick="toggleProductStock(${product.id})" style="background: ${product.outOfStock ? '#ff9800' : '#28a745'}; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
          ${product.outOfStock ? 'Stokta Yok' : 'Stokta Var'}
        </button>
      </div>
    `;
    
    card.appendChild(imageDiv);
    card.appendChild(infoDiv);
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
    // Resim yolunu güvenli hale getir
    let imagePath = 'omerkaptanlogo.png'; // Varsayılan resim
    if (product.image && product.image.trim() !== '') {
      // Eğer resim yolu zaten "assets/" ile başlıyorsa, kaldır
      const cleanImage = product.image.replace(/^assets\//, '');
      // Eğer resim yolu boş değilse ve geçerli bir dosya adı gibi görünüyorsa kullan
      if (cleanImage && cleanImage !== product.category && !cleanImage.includes(' ')) {
        imagePath = cleanImage;
      }
    }
    
    const card = document.createElement('div');
    card.className = 'product-card-admin';
    
    // Resim div'i oluştur
    const imageDiv = document.createElement('div');
    imageDiv.className = 'product-card-image';
    const img = document.createElement('img');
    img.alt = product.name;
    
    // Resim yükleme stratejisi: Önce gerçek resmi yükle, yüklenemezse varsayılan resmi kullan
    // Bu sayede 404 hataları konsola yazılmaz
    const testImg = new Image();
    testImg.onload = function() {
      // Resim başarıyla yüklendi
      img.src = `assets/${imagePath}`;
    };
    testImg.onerror = function() {
      // Resim yüklenemedi, varsayılan resmi kullan (sessizce)
      img.src = 'assets/omerkaptanlogo.png';
    };
    
    // Önce varsayılan resmi göster, sonra gerçek resmi yükle
    img.src = 'assets/omerkaptanlogo.png';
    img.onerror = function() {
      // Varsayılan resim de yüklenemezse, hiçbir şey yapma (sonsuz döngüyü önle)
      this.onerror = null;
    };
    
    // Gerçek resmi yüklemeyi dene (sessizce)
    testImg.src = `assets/${imagePath}`;
    
    imageDiv.appendChild(img);
    
    // İçerik HTML'i
    const infoDiv = document.createElement('div');
    infoDiv.className = 'product-card-info';
    infoDiv.innerHTML = `
      <h4>${escapeHtml(product.name)}</h4>
      <p class="product-category">${escapeHtml(product.category)}</p>
      <p class="product-price">₺${product.price}</p>
      <p class="product-desc">${escapeHtml(product.shortDesc || product.description || '')}</p>
      <div class="product-actions">
        <button class="btn-edit" onclick="editProduct(${product.id})">Düzenle</button>
        <button class="btn-toggle-hidden" onclick="toggleProductVisibility(${product.id})">Göster</button>
        <button class="btn-toggle-stock" onclick="toggleProductStock(${product.id})" style="background: ${product.outOfStock ? '#ff9800' : '#28a745'}; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
          ${product.outOfStock ? 'Stokta Yok' : 'Stokta Var'}
        </button>
      </div>
    `;
    
    card.appendChild(imageDiv);
    card.appendChild(infoDiv);
    hiddenList.appendChild(card);
  });
}

// Ürün düzenle
function editProduct(id) {
  const product = productsData.products.find(p => p.id === id);
  if (!product) return;
  
  // Edit formunu doldur
  document.getElementById('edit-id').value = product.id;
  
  const editCategory = document.getElementById('edit-category');
  const editSubcategory = document.getElementById('edit-subcategory');
  const editSubcategoryGroup = document.getElementById('edit-subcategory-group');
  
  editCategory.value = product.category;
  
  // Alt kategori varsa göster
  if (editSubcategory && editSubcategoryGroup) {
    if (product.category === 'Alkollü İçecekler' || product.category === 'Mezeler') {
      updateSubcategoryOptions(editCategory, editSubcategory, editSubcategoryGroup);
      if (product.subcategory) {
        editSubcategory.value = product.subcategory;
      }
    } else {
      editSubcategoryGroup.style.display = 'none';
    }
  }
  
  document.getElementById('edit-name').value = product.name;
  document.getElementById('edit-price').value = product.price;
  document.getElementById('edit-short-desc').value = product.shortDesc || '';
  document.getElementById('edit-description').value = product.description;
  document.getElementById('edit-image').value = product.image;
  // Eşlikçi dropdown'unu doldur ve seçili olanları işaretle
  const editCompanionsSelect = document.getElementById('edit-companions');
  if (editCompanionsSelect) {
    populateCompanionSelect(editCompanionsSelect);
    if (product.companions && Array.isArray(product.companions)) {
      product.companions.forEach(companionName => {
        const option = Array.from(editCompanionsSelect.options).find(opt => opt.value === companionName);
        if (option) {
          option.selected = true;
        }
      });
    }
  }
  document.getElementById('edit-hidden').checked = product.hidden || false;
  
  const editOutOfStock = document.getElementById('edit-out-of-stock');
  if (editOutOfStock) {
    editOutOfStock.checked = product.outOfStock || false;
  }
  
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
  
  // Kullanıcıya bilgi ver
  const status = product.hidden ? 'gizlendi' : 'gösterildi';
  alert(`"${product.name}" ürünü ${status}. Değişiklikleri görmek için kategori sayfalarını yenileyin.`);
}

// Ürün stok durumunu değiştir
function toggleProductStock(id) {
  const product = productsData.products.find(p => p.id === id);
  if (!product) return;
  
  product.outOfStock = !product.outOfStock;
  saveProducts(productsData);
  displayProducts();
  displayHiddenProducts();
  
  const status = product.outOfStock ? 'stokta yok olarak işaretlendi' : 'stokta var olarak işaretlendi';
  alert(`"${product.name}" ürünü ${status}.`);
}

// Alt kategori seçeneklerini yönet
function updateSubcategoryOptions(categorySelect, subcategorySelect, subcategoryGroup) {
  const category = categorySelect.value;
  subcategoryGroup.style.display = 'none';
  subcategorySelect.innerHTML = '<option value="">Alt Kategori Seçin</option>';
  subcategorySelect.required = false;
  
  if (category === 'Alkollü İçecekler') {
    subcategoryGroup.style.display = 'block';
    subcategorySelect.required = true;
    subcategorySelect.innerHTML = `
      <option value="">Alt Kategori Seçin</option>
      <option value="Rakılar">Rakılar</option>
      <option value="Diğer Alkoller">Diğer Alkoller</option>
    `;
  } else if (category === 'Mezeler') {
    subcategoryGroup.style.display = 'block';
    subcategorySelect.required = true;
    subcategorySelect.innerHTML = `
      <option value="">Alt Kategori Seçin</option>
      <option value="Zeytinyağlı Mezeler">Zeytinyağlı Mezeler</option>
      <option value="Yoğurtlu Mezeler">Yoğurtlu Mezeler</option>
      <option value="Ezmeler">Ezmeler</option>
      <option value="Salatalar">Salatalar</option>
      <option value="Deniz Mahsullü Mezeler">Deniz Mahsullü Mezeler</option>
      <option value="Diğer Mezeler">Diğer Mezeler</option>
    `;
  }
}

// Resim dosyası seçildiğinde otomatik yol oluştur
function setupImageFileInputs() {
  // Yeni ürün ekleme formu
  const addImageFile = document.getElementById('add-image-file');
  const addImage = document.getElementById('add-image');
  const addCategory = document.getElementById('add-category');
  const addName = document.getElementById('add-name');
  
  // Kategori veya ürün adı değiştiğinde resim yolunu güncelle
  const updateAddImagePath = () => {
    const category = addCategory.value;
    const name = addName.value;
    const file = addImageFile?.files[0];
    
    if (category && name) {
      if (file) {
        // Dosya seçilmişse, dosya uzantısını kullan
        const fileExt = file.name.split('.').pop().toLowerCase();
        const autoPath = generateImagePath(category, name);
        const finalPath = autoPath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, `.${fileExt}`);
        addImage.value = finalPath;
      } else {
        // Dosya seçilmemişse, varsayılan olarak .jpg kullan
        addImage.value = generateImagePath(category, name);
      }
    }
  };
  
  if (addImageFile && addImage && addCategory && addName) {
    addImageFile.addEventListener('change', updateAddImagePath);
    addCategory.addEventListener('change', updateAddImagePath);
    addName.addEventListener('input', updateAddImagePath);
  }
  
  // Ürün düzenleme formu
  const editImageFile = document.getElementById('edit-image-file');
  const editImage = document.getElementById('edit-image');
  const editCategory = document.getElementById('edit-category');
  const editName = document.getElementById('edit-name');
  
  const updateEditImagePath = () => {
    const category = editCategory.value;
    const name = editName.value;
    const file = editImageFile?.files[0];
    
    if (category && name) {
      if (file) {
        // Yeni dosya seçilmişse, yeni dosya uzantısını kullan
        const fileExt = file.name.split('.').pop().toLowerCase();
        const autoPath = generateImagePath(category, name);
        const finalPath = autoPath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, `.${fileExt}`);
        editImage.value = finalPath;
      } else {
        // Dosya değiştirilmemişse, mevcut resim yolunu koru veya otomatik oluştur
        if (!editImage.value || editImage.value.trim() === '') {
          editImage.value = generateImagePath(category, name);
        }
        // Mevcut değeri koru (değiştirme)
      }
    }
  };
  
  if (editImageFile && editImage && editCategory && editName) {
    editImageFile.addEventListener('change', updateEditImagePath);
    editCategory.addEventListener('change', updateEditImagePath);
    editName.addEventListener('input', updateEditImagePath);
  }
}

// Form setup
function setupForms() {
  // Alt kategori yönetimi - Yeni ürün ekleme
  const addCategory = document.getElementById('add-category');
  const addSubcategory = document.getElementById('add-subcategory');
  const addSubcategoryGroup = document.getElementById('add-subcategory-group');
  
  if (addCategory && addSubcategory && addSubcategoryGroup) {
    addCategory.addEventListener('change', () => {
      updateSubcategoryOptions(addCategory, addSubcategory, addSubcategoryGroup);
    });
  }
  
  // Yeni ürün ekleme formu
  const addForm = document.getElementById('add-product-form');
  if (addForm) {
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const category = document.getElementById('add-category').value;
      const name = document.getElementById('add-name').value;
      const imageFile = document.getElementById('add-image-file').files[0];
      
      // Resim dosyası kontrolü
      if (!imageFile) {
        alert('Lütfen bir resim dosyası seçin!');
        return;
      }
      
      // Resim yolu otomatik oluştur
      const fileExt = imageFile.name.split('.').pop().toLowerCase();
      let imagePath = generateImagePath(category, name);
      imagePath = imagePath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, `.${fileExt}`);
      
      console.log('📸 Resim bilgileri:', {
        originalFileName: imageFile.name,
        category: category,
        productName: name,
        generatedPath: imagePath,
        fileExtension: fileExt
      });
      
      // Resmi GitHub'a yükle (eğer GitHub API yapılandırılmışsa)
      const uploadButton = addForm.querySelector('button[type="submit"]');
      const originalButtonText = uploadButton ? uploadButton.textContent : 'Ekle';
      
      // GitHub API kontrolü - önce config'i yükle
      let githubConfigReady = false;
      let config = null;
      if (window.GitHubConfig) {
        config = window.GitHubConfig.loadGitHubConfig();
        githubConfigReady = window.GitHubConfig.isGitHubConfigComplete();
        console.log('🔧 GitHub Config durumu:', {
          hasConfig: !!window.GitHubConfig,
          configReady: githubConfigReady,
          repository: config.repository || '(boş)',
          hasToken: !!config.token,
          tokenLength: config.token ? config.token.length : 0,
          hasAPI: !!window.GitHubAPI,
          hasUploadImage: !!(window.GitHubAPI && window.GitHubAPI.uploadImage)
        });
        
        if (!githubConfigReady) {
          console.warn('⚠️ GitHub API yapılandırılmamış! Repository veya Token eksik.');
          console.warn('💡 Lütfen "⚙️ GitHub Ayarları" butonuna tıklayarak ayarları yapılandırın.');
        }
      } else {
        console.error('❌ GitHubConfig bulunamadı! Script dosyaları yüklenmemiş olabilir.');
      }
      
      try {
        // GitHub API yapılandırılmış mı kontrol et
        if (githubConfigReady && window.GitHubAPI && window.GitHubAPI.uploadImage) {
          if (uploadButton) {
            uploadButton.disabled = true;
            uploadButton.textContent = '⏳ Resim yükleniyor...';
          }
          
          // GitHub'a yüklemek için tam yol (assets/ ile başlamalı)
          const fullImagePath = imagePath.startsWith('assets/') ? imagePath : `assets/${imagePath}`;
          console.log('📤 Resim GitHub\'a yükleniyor:', {
            fullPath: fullImagePath,
            fileSize: `${(imageFile.size / 1024).toFixed(2)} KB`,
            fileType: imageFile.type
          });
          
          const uploadResult = await window.GitHubAPI.uploadImage(imageFile, fullImagePath);
          console.log('✅ Resim başarıyla yüklendi:', uploadResult);
          
          if (uploadResult && uploadResult.url) {
            console.log('🌐 Resim URL:', uploadResult.url);
          }
        } else {
          const reason = !githubConfigReady 
            ? (config && !config.repository ? 'Repository eksik' : config && !config.token ? 'Token eksik' : 'Config eksik')
            : !window.GitHubAPI ? 'GitHubAPI yüklenmemiş' 
            : !window.GitHubAPI.uploadImage ? 'uploadImage fonksiyonu bulunamadı'
            : 'Bilinmeyen neden';
          
          console.warn('⚠️ GitHub API yapılandırılmamış veya eksik!', {
            reason: reason,
            configReady: githubConfigReady,
            hasAPI: !!window.GitHubAPI,
            hasUploadImage: !!(window.GitHubAPI && window.GitHubAPI.uploadImage),
            config: config ? {
              hasRepository: !!config.repository,
              hasToken: !!config.token
            } : 'config null'
          });
          
          const message = `⚠️ GitHub API yapılandırılmamış!\n\n` +
            `Sebep: ${reason}\n\n` +
            `Resim yolu oluşturuldu: ${imagePath}\n\n` +
            `Lütfen "⚙️ GitHub Ayarları" butonuna tıklayarak:\n` +
            `- Repository: alparslan166/omer-kaptan\n` +
            `- Token: GitHub Personal Access Token\n` +
            `ayarlarını yapılandırın.\n\n` +
            `Veya resmi manuel olarak assets klasörüne yükleyin.`;
          
          alert(message);
        }
      } catch (error) {
        console.error('❌ Resim yükleme hatası:', error);
        console.error('Hata detayları:', {
          message: error.message,
          stack: error.stack
        });
        const continueAnyway = confirm(`❌ Resim yükleme hatası!\n\nHata: ${error.message}\n\nYine de ürünü eklemek istiyor musunuz?\n(Resmi daha sonra manuel olarak yükleyebilirsiniz)`);
        if (!continueAnyway) {
          if (uploadButton) {
            uploadButton.disabled = false;
            uploadButton.textContent = originalButtonText;
          }
          return;
        }
      } finally {
        if (uploadButton) {
          uploadButton.disabled = false;
          uploadButton.textContent = originalButtonText;
        }
      }
      
      const newProduct = {
        id: Math.max(...productsData.products.map(p => p.id), 0) + 1,
        name: name,
        category: category,
        price: document.getElementById('add-price').value,
        shortDesc: document.getElementById('add-short-desc').value,
        description: document.getElementById('add-description').value,
        image: imagePath,
        companions: Array.from(document.getElementById('add-companions').selectedOptions)
          .map(option => option.value)
          .filter(Boolean),
        hidden: false,
        outOfStock: false,
        subcategory: addSubcategory ? addSubcategory.value : null
      };
      
      productsData.products.push(newProduct);
      saveProducts(productsData);
      
      // Formu temizle
      addForm.reset();
      if (addSubcategoryGroup) addSubcategoryGroup.style.display = 'none';
      const addImage = document.getElementById('add-image');
      const addImageFile = document.getElementById('add-image-file');
      if (addImage) addImage.value = '';
      if (addImageFile) addImageFile.value = '';
      if (uploadButton) {
        uploadButton.disabled = false;
        uploadButton.textContent = originalButtonText;
      }
      
      // Başarı mesajı
      alert('Ürün başarıyla eklendi!');
      
      // Ürünler listesine geç
      document.querySelector('[data-tab="products"]').click();
    });
  }
  
  // Ürün güncelleme formu
  const editForm = document.getElementById('edit-product-form');
  if (editForm) {
    // Alt kategori yönetimi
    const editCategory = document.getElementById('edit-category');
    const editSubcategory = document.getElementById('edit-subcategory');
    const editSubcategoryGroup = document.getElementById('edit-subcategory-group');
    
    if (editCategory && editSubcategory && editSubcategoryGroup) {
      editCategory.addEventListener('change', () => {
        updateSubcategoryOptions(editCategory, editSubcategory, editSubcategoryGroup);
      });
    }
    
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const id = parseInt(document.getElementById('edit-id').value);
      const product = productsData.products.find(p => p.id === id);
      if (!product) return;
      
      const category = document.getElementById('edit-category').value;
      const name = document.getElementById('edit-name').value;
      const imageFile = document.getElementById('edit-image-file').files[0];
      
      // Resim yolu belirleme - HER ZAMAN otomatik oluştur (kategori ve ürün adına göre)
      let imagePath = generateImagePath(category, name);
      
      // Eğer yeni dosya seçilmişse, yeni dosya uzantısını kullan
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop().toLowerCase();
        imagePath = imagePath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, `.${fileExt}`);
      } else {
        // Dosya seçilmemişse, mevcut resmin uzantısını koru (eğer varsa)
        if (product.image) {
          const currentExt = product.image.split('.').pop();
          imagePath = imagePath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, `.${currentExt}`);
        }
      }
      
      // Hidden input'u güncelle
      document.getElementById('edit-image').value = imagePath;
      
      // Eğer yeni resim dosyası seçilmişse GitHub'a yükle
      if (imageFile) {
        const updateButton = editForm.querySelector('button[type="submit"]');
        const originalButtonText = updateButton ? updateButton.textContent : 'Güncelle';
        
        console.log('📸 Düzenleme - Resim bilgileri:', {
          originalFileName: imageFile.name,
          category: category,
          productName: name,
          generatedPath: imagePath,
          fileExtension: imageFile.name.split('.').pop().toLowerCase()
        });
        
        // GitHub API kontrolü - önce config'i yükle
        let githubConfigReady = false;
        let config = null;
        if (window.GitHubConfig) {
          config = window.GitHubConfig.loadGitHubConfig();
          githubConfigReady = window.GitHubConfig.isGitHubConfigComplete();
          console.log('🔧 GitHub Config durumu:', {
            hasConfig: !!window.GitHubConfig,
            configReady: githubConfigReady,
            repository: config ? config.repository : '(yok)',
            hasToken: !!(config && config.token),
            hasAPI: !!window.GitHubAPI,
            hasUploadImage: !!(window.GitHubAPI && window.GitHubAPI.uploadImage)
          });
        }
        
        try {
          if (githubConfigReady && window.GitHubAPI && window.GitHubAPI.uploadImage) {
            if (updateButton) {
              updateButton.disabled = true;
              updateButton.textContent = '⏳ Resim yükleniyor...';
            }
            
            // GitHub'a yüklemek için tam yol (assets/ ile başlamalı)
            const fullImagePath = imagePath.startsWith('assets/') ? imagePath : `assets/${imagePath}`;
            console.log('📤 Yeni resim GitHub\'a yükleniyor:', {
              fullPath: fullImagePath,
              fileSize: `${(imageFile.size / 1024).toFixed(2)} KB`,
              fileType: imageFile.type,
              oldPath: product.image
            });
            
            const uploadResult = await window.GitHubAPI.uploadImage(imageFile, fullImagePath);
            console.log('✅ Resim başarıyla yüklendi:', uploadResult);
            
            if (uploadResult && uploadResult.url) {
              console.log('🌐 Resim URL:', uploadResult.url);
            }
          } else {
            const reason = !githubConfigReady 
              ? (config && !config.repository ? 'Repository eksik' : config && !config.token ? 'Token eksik' : 'Config eksik')
              : !window.GitHubAPI ? 'GitHubAPI yüklenmemiş' 
              : !window.GitHubAPI.uploadImage ? 'uploadImage fonksiyonu bulunamadı'
              : 'Bilinmeyen neden';
            
            console.warn('⚠️ GitHub API yapılandırılmamış veya eksik!', {
              reason: reason,
              configReady: githubConfigReady,
              hasAPI: !!window.GitHubAPI,
              hasUploadImage: !!(window.GitHubAPI && window.GitHubAPI.uploadImage)
            });
            
            const message = `⚠️ GitHub API yapılandırılmamış!\n\n` +
              `Sebep: ${reason}\n\n` +
              `Resim yolu oluşturuldu: ${imagePath}\n\n` +
              `Lütfen "⚙️ GitHub Ayarları" butonuna tıklayarak ayarları yapılandırın.`;
            
            alert(message);
          }
        } catch (error) {
          console.error('❌ Resim yükleme hatası:', error);
          console.error('Hata detayları:', {
            message: error.message,
            stack: error.stack
          });
          const continueAnyway = confirm(`❌ Resim yükleme hatası!\n\nHata: ${error.message}\n\nYine de ürünü güncellemek istiyor musunuz?`);
          if (!continueAnyway) {
            if (updateButton) {
              updateButton.disabled = false;
              updateButton.textContent = originalButtonText;
            }
            return;
          }
        } finally {
          if (updateButton) {
            updateButton.disabled = false;
            updateButton.textContent = originalButtonText;
          }
        }
      }
      
      product.name = name;
      product.category = category;
      product.price = document.getElementById('edit-price').value;
      product.shortDesc = document.getElementById('edit-short-desc').value;
      product.description = document.getElementById('edit-description').value;
      product.image = imagePath;
      product.companions = Array.from(document.getElementById('edit-companions').selectedOptions)
        .map(option => option.value)
        .filter(Boolean);
      product.hidden = document.getElementById('edit-hidden').checked;
      product.outOfStock = document.getElementById('edit-out-of-stock') ? document.getElementById('edit-out-of-stock').checked : false;
      product.subcategory = editSubcategory ? editSubcategory.value : null;
      
      saveProducts(productsData);
      
      alert('Ürün başarıyla güncellendi!');
      
      // Ürünler listesine dön
      window.location.href = 'admin.html';
    });
  }
  
  // Resim dosyası input'larını ayarla
  setupImageFileInputs();
  
  // Ürün silme
  const deleteBtn = document.getElementById('delete-product-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      const id = parseInt(document.getElementById('edit-id').value);
      const product = productsData.products.find(p => p.id === id);
      
      if (!product) {
        alert('Ürün bulunamadı!');
        return;
      }
      
      // Onay mesajı
      const confirmMessage = `⚠️ DİKKAT!\n\n"${product.name}" adlı ürünü silmek istediğinizden emin misiniz?\n\nKategori: ${product.category}\nFiyat: ₺${product.price}\n\nBu işlem geri alınamaz!\n\nSil?`;
      if (!confirm(confirmMessage)) {
        return; // Kullanıcı iptal etti
      }
      
      // Onay verildi, sil
      productsData.products = productsData.products.filter(p => p.id !== id);
      saveProducts(productsData);
      
      alert(`"${product.name}" ürünü başarıyla silindi!`);
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
  
  // Eşlikçi dropdown'larını doldur
  const addCompanionsSelect = document.getElementById('add-companions');
  if (addCompanionsSelect) {
    populateCompanionSelect(addCompanionsSelect);
  }
  
  const editCompanionsSelect = document.getElementById('edit-companions');
  if (editCompanionsSelect) {
    populateCompanionSelect(editCompanionsSelect);
  }
}

// Eşlikçi dropdown'unu doldur
function populateCompanionSelect(selectElement) {
  if (!selectElement || !productsData || !productsData.companions) return;
  
  // Mevcut seçili değerleri sakla
  const selectedValues = Array.from(selectElement.selectedOptions).map(opt => opt.value);
  
  // Tüm seçenekleri temizle (ilk boş seçenek hariç)
  const firstOption = selectElement.querySelector('option[value=""]');
  selectElement.innerHTML = '';
  if (firstOption) {
    selectElement.appendChild(firstOption);
  } else {
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Eşlikçi seçin...';
    selectElement.appendChild(defaultOption);
  }
  
  // Eşlikçileri ekle
  productsData.companions.forEach(companion => {
    const option = document.createElement('option');
    option.value = companion.name;
    option.textContent = companion.name;
    if (selectedValues.includes(companion.name)) {
      option.selected = true;
    }
    selectElement.appendChild(option);
  });
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
  // Kategorideki ürünleri kontrol et
  const categoryProducts = productsData.products.filter(p => p.category === categoryName);
  
  // Onay mesajı oluştur
  let confirmMessage = `⚠️ DİKKAT!\n\n"${categoryName}" kategorisini silmek istediğinizden emin misiniz?\n\n`;
  
  if (categoryProducts.length > 0) {
    confirmMessage += `⚠️ UYARI: Bu kategoride ${categoryProducts.length} ürün bulunuyor!\n\n`;
    confirmMessage += `Kategori silindiğinde bu ${categoryProducts.length} ürünün kategorisi kaldırılacak ve ürünler kategorisiz kalacak.\n\n`;
  } else {
    confirmMessage += `Bu kategoride ürün bulunmuyor.\n\n`;
  }
  
  confirmMessage += `Bu işlem geri alınamaz!\n\nSil?`;
  
  // Onay iste
  if (!confirm(confirmMessage)) {
    return; // Kullanıcı iptal etti
  }
  
  // Onay verildi, sil
  productsData.categories = productsData.categories.filter(c => c !== categoryName);
  saveProducts(productsData);
  
  populateCategories();
  displayCategories();
  displayProducts();
  
  if (categoryProducts.length > 0) {
    alert(`"${categoryName}" kategorisi başarıyla silindi!\n\n${categoryProducts.length} ürünün kategorisi kaldırıldı.`);
  } else {
    alert(`"${categoryName}" kategorisi başarıyla silindi!`);
  }
}

// Eşlikçileri listele
function displayCompanions() {
  const companionsList = document.getElementById('companions-list');
  if (!companionsList) return;
  
  if (!productsData.companions || productsData.companions.length === 0) {
    companionsList.innerHTML = '<p>Henüz eşlikçi eklenmemiş.</p>';
    return;
  }
  
  companionsList.innerHTML = '';
  
  productsData.companions.forEach(companion => {
    const card = document.createElement('div');
    card.className = 'product-card-admin';
    // Eşlikçi resim yolu: assets/companions/ veya mevcut yol
    let imagePath = companion.image || `companions/${normalizeForFileGlobal(companion.name)}.jpg`;
    // Eğer assets/ ile başlamıyorsa ekle
    if (!imagePath.startsWith('assets/')) {
      imagePath = imagePath.startsWith('companions/') ? `assets/${imagePath}` : `assets/companions/${normalizeForFileGlobal(companion.name)}.jpg`;
    }
    card.innerHTML = `
      <div class="product-card-image">
        <img src="${imagePath}" alt="${companion.name}" onerror="this.src='assets/omerkaptanlogo.png'; this.onerror=null;" />
      </div>
      <div class="product-card-info">
        <h4>${companion.name}</h4>
        <div class="product-actions">
          <button class="btn-edit" onclick="editCompanion(${companion.id})">Düzenle</button>
          <button class="btn-danger" onclick="deleteCompanion(${companion.id})" style="background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Sil</button>
        </div>
      </div>
    `;
    companionsList.appendChild(card);
  });
}

// Eşlikçi düzenle
function editCompanion(id) {
  const companion = productsData.companions.find(c => c.id === id);
  if (!companion) return;
  
  document.getElementById('edit-companion-id').value = companion.id;
  document.getElementById('edit-companion-name').value = companion.name;
  document.getElementById('edit-companion-image').value = companion.image || '';
  
  // Düzenleme formunu göster
  document.getElementById('edit-companion-section').style.display = 'block';
  document.querySelector('.add-companion-form').style.display = 'none';
  
  // Companions tabını göster
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
  
  document.querySelector('[data-tab="companions"]').classList.add('active');
  document.getElementById('companions-tab').classList.add('active');
  
  window.scrollTo(0, 0);
}

// Eşlikçi sil
function deleteCompanion(id) {
  const companion = productsData.companions.find(c => c.id === id);
  if (!companion) return;
  
  const confirmMessage = `"${companion.name}" eşlikçisini silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz ve bu eşlikçiyi kullanan tüm ürünlerden de kaldırılacaktır.`;
  if (!confirm(confirmMessage)) return;
  
  // Ürünlerden de kaldır
  productsData.products.forEach(product => {
    if (product.companions && Array.isArray(product.companions)) {
      product.companions = product.companions.filter(c => c !== companion.name);
    }
  });
  
  // Eşlikçiyi sil
  productsData.companions = productsData.companions.filter(c => c.id !== id);
  saveProducts(productsData);
  
  displayCompanions();
  // Eşlikçi dropdown'larını güncelle
  populateCompanionSelect(document.getElementById('add-companions'));
  populateCompanionSelect(document.getElementById('edit-companions'));
  alert(`"${companion.name}" eşlikçisi başarıyla silindi.`);
}

// normalizeForFile global fonksiyonu
function normalizeForFileGlobal(text) {
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

// Eşlikçi formlarını ayarla
function setupCompanionForms() {
  // Eşlikçi ekleme formu
  const addCompanionForm = document.getElementById('add-companion-form');
  if (addCompanionForm) {
    addCompanionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('add-companion-name').value.trim();
      const imageFile = document.getElementById('add-companion-image-file').files[0];
      
      if (!name || !imageFile) {
        alert('Lütfen eşlikçi adı ve resim dosyası seçin!');
        return;
      }
      
      // Resim yolu oluştur (assets/companions/ klasörüne)
      const fileExt = imageFile.name.split('.').pop().toLowerCase();
      const imagePath = `assets/companions/${normalizeForFileGlobal(name)}.${fileExt}`;
      
      // Resmi GitHub'a yükle (eğer GitHub API yapılandırılmışsa)
      const uploadButton = addCompanionForm.querySelector('button[type="submit"]');
      const originalButtonText = uploadButton ? uploadButton.textContent : 'Eşlikçi Ekle';
      
      try {
        if (window.GitHubConfig && window.GitHubConfig.isGitHubConfigComplete() && window.GitHubAPI && window.GitHubAPI.uploadImage) {
          if (uploadButton) {
            uploadButton.disabled = true;
            uploadButton.textContent = '⏳ Resim yükleniyor...';
          }
          
          console.log('Eşlikçi resmi GitHub\'a yükleniyor:', imagePath);
          await window.GitHubAPI.uploadImage(imageFile, imagePath);
          console.log('✅ Eşlikçi resmi başarıyla yüklendi:', imagePath);
        } else {
          console.warn('⚠️ GitHub API yapılandırılmamış, resim yüklenmedi.');
        }
      } catch (error) {
        console.error('❌ Eşlikçi resmi yükleme hatası:', error);
        const continueAnyway = confirm(`Resim yükleme hatası: ${error.message}\n\nYine de eşlikçiyi eklemek istiyor musunuz?`);
        if (!continueAnyway) {
          if (uploadButton) {
            uploadButton.disabled = false;
            uploadButton.textContent = originalButtonText;
          }
          return;
        }
      } finally {
        if (uploadButton) {
          uploadButton.disabled = false;
          uploadButton.textContent = originalButtonText;
        }
      }
      
      const newCompanion = {
        id: Math.max(...(productsData.companions || []).map(c => c.id || 0), 0) + 1,
        name: name,
        image: imagePath
      };
      
      if (!productsData.companions) {
        productsData.companions = [];
      }
      productsData.companions.push(newCompanion);
      saveProducts(productsData);
      
      addCompanionForm.reset();
      displayCompanions();
      // Eşlikçi dropdown'larını güncelle
      populateCompanionSelect(document.getElementById('add-companions'));
      populateCompanionSelect(document.getElementById('edit-companions'));
      alert('Eşlikçi başarıyla eklendi!');
    });
  }
  
  // Eşlikçi düzenleme formu
  const editCompanionForm = document.getElementById('edit-companion-form');
  if (editCompanionForm) {
    editCompanionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const id = parseInt(document.getElementById('edit-companion-id').value);
      const companion = productsData.companions.find(c => c.id === id);
      if (!companion) return;
      
      const name = document.getElementById('edit-companion-name').value.trim();
      const imageFile = document.getElementById('edit-companion-image-file').files[0];
      
      let imagePath = companion.image;
      
      // Yeni resim seçilmişse
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop().toLowerCase();
        imagePath = `assets/companions/${normalizeForFileGlobal(name)}.${fileExt}`;
        
        // Resmi GitHub'a yükle
        const updateButton = editCompanionForm.querySelector('button[type="submit"]');
        const originalButtonText = updateButton ? updateButton.textContent : 'Güncelle';
        
        try {
          if (window.GitHubConfig && window.GitHubConfig.isGitHubConfigComplete() && window.GitHubAPI && window.GitHubAPI.uploadImage) {
            if (updateButton) {
              updateButton.disabled = true;
              updateButton.textContent = '⏳ Resim yükleniyor...';
            }
            
            console.log('Yeni eşlikçi resmi GitHub\'a yükleniyor:', imagePath);
            await window.GitHubAPI.uploadImage(imageFile, imagePath);
            console.log('✅ Eşlikçi resmi başarıyla yüklendi:', imagePath);
          }
        } catch (error) {
          console.error('❌ Eşlikçi resmi yükleme hatası:', error);
          const continueAnyway = confirm(`Resim yükleme hatası: ${error.message}\n\nYine de eşlikçiyi güncellemek istiyor musunuz?`);
          if (!continueAnyway) {
            if (updateButton) {
              updateButton.disabled = false;
              updateButton.textContent = originalButtonText;
            }
            return;
          }
        } finally {
          if (updateButton) {
            updateButton.disabled = false;
            updateButton.textContent = originalButtonText;
          }
        }
      } else if (name !== companion.name) {
        // İsim değişmişse resim yolunu güncelle
        const currentExt = companion.image ? companion.image.split('.').pop() : 'jpg';
        imagePath = `assets/companions/${normalizeForFileGlobal(name)}.${currentExt}`;
      } else {
        // İsim ve resim değişmemişse, mevcut yolu kullan ama assets/companions/ formatına çevir
        if (companion.image) {
          if (companion.image.startsWith('assets/companions/')) {
            imagePath = companion.image;
          } else if (companion.image.startsWith('companions/')) {
            imagePath = `assets/${companion.image}`;
          } else {
            imagePath = `assets/companions/${companion.image}`;
          }
        } else {
          imagePath = `assets/companions/${normalizeForFileGlobal(name)}.jpg`;
        }
      }
      
      const oldName = companion.name;
      companion.name = name;
      companion.image = imagePath;
      
      // Ürünlerdeki eşlikçi adını güncelle
      productsData.products.forEach(product => {
        if (product.companions && Array.isArray(product.companions)) {
          const index = product.companions.indexOf(oldName);
          if (index !== -1) {
            product.companions[index] = name;
          }
        }
      });
      
      saveProducts(productsData);
      
      document.getElementById('edit-companion-section').style.display = 'none';
      document.querySelector('.add-companion-form').style.display = 'block';
      editCompanionForm.reset();
      displayCompanions();
      // Eşlikçi dropdown'larını güncelle
      populateCompanionSelect(document.getElementById('add-companions'));
      populateCompanionSelect(document.getElementById('edit-companions'));
      alert('Eşlikçi başarıyla güncellendi!');
    });
  }
  
  // Eşlikçi silme butonu
  const deleteCompanionBtn = document.getElementById('delete-companion-btn');
  if (deleteCompanionBtn) {
    deleteCompanionBtn.addEventListener('click', () => {
      const id = parseInt(document.getElementById('edit-companion-id').value);
      if (id) {
        deleteCompanion(id);
        document.getElementById('edit-companion-section').style.display = 'none';
        document.querySelector('.add-companion-form').style.display = 'block';
      }
    });
  }
  
  // Eşlikçi düzenleme iptal butonu
  const cancelEditCompanionBtn = document.getElementById('cancel-edit-companion-btn');
  if (cancelEditCompanionBtn) {
    cancelEditCompanionBtn.addEventListener('click', () => {
      document.getElementById('edit-companion-section').style.display = 'none';
      document.querySelector('.add-companion-form').style.display = 'block';
      document.getElementById('edit-companion-form').reset();
    });
  }
}

// Global fonksiyonlar (inline onclick için)
window.editProduct = editProduct;
window.toggleProductVisibility = toggleProductVisibility;
window.deleteCategory = deleteCategory;
window.editCompanion = editCompanion;
window.deleteCompanion = deleteCompanion;

