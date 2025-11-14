// Admin Panel JavaScript

// LocalStorage'dan veri yükleme ve kaydetme
const STORAGE_KEY = 'omer_kaptan_products';

async function loadProducts(forceRefresh = false) {
  // Eğer forceRefresh true ise, önce products.json'dan yükle (GitHub güncellemesi sonrası)
  if (forceRefresh) {
    console.log('Force refresh: Loading from products.json (GitHub güncellemesi sonrası)');
    try {
      const response = await fetch('products.json?' + Date.now()); // Cache bypass
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched data from products.json (force refresh):', data);
      
      // Veri yapısını kontrol et
      if (data && typeof data === 'object' && Array.isArray(data.products) && Array.isArray(data.categories)) {
        // Eşlikçiler array'i yoksa oluştur
        if (!data.companions || !Array.isArray(data.companions)) {
          data.companions = [];
        }
        console.log('products.json data is valid (force refresh):', data.products.length, 'products', data.companions.length, 'companions');
        
        // LocalStorage'ı temizle ve yeni veriyi kaydet
        localStorage.removeItem(STORAGE_KEY);
        saveProducts(data);
        return data;
      } else {
        throw new Error('Invalid data structure in products.json');
      }
    } catch (error) {
      console.error('Error loading products (force refresh):', error);
      // Hata durumunda localStorage'dan yüklemeyi dene
    }
  }
  
  // Önce products.json'dan yükle (kalıcı kaynak)
  console.log('Loading from products.json');
  try {
    const response = await fetch('products.json?' + Date.now()); // Cache bypass
    if (response.ok) {
      const data = await response.json();
      console.log('Fetched data from products.json:', data);
      
      // Veri yapısını kontrol et
      if (data && typeof data === 'object' && Array.isArray(data.products) && Array.isArray(data.categories)) {
        // Eşlikçiler array'i yoksa oluştur
        if (!data.companions || !Array.isArray(data.companions)) {
          data.companions = [];
        }
        console.log('products.json data is valid:', data.products.length, 'products', data.companions.length, 'companions');
        
        // LocalStorage'a cache olarak kaydet
        saveProducts(data);
        return data;
      }
    }
  } catch (error) {
    console.error('Error loading products.json:', error);
  }
  
  // products.json yüklenemezse localStorage'dan yükle (fallback)
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    console.log('Loading from localStorage (fallback)');
    try {
      const parsed = JSON.parse(stored);
      // Veri yapısını kontrol et
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.products) && Array.isArray(parsed.categories)) {
        // Eşlikçiler array'i yoksa oluştur
        if (!parsed.companions || !Array.isArray(parsed.companions)) {
          parsed.companions = [];
        }
        console.log('LocalStorage data is valid (fallback):', parsed.products.length, 'products', parsed.companions.length, 'companions');
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
  
  // Hiçbir kaynak yüklenemezse boş veri döndür
  console.warn('No data source available, returning empty data');
  return { categories: [], products: [], companions: [] };
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
        // Güncel productsData'yı kullan (butona basıldığında)
        const currentData = productsData || data;
        const jsonStr = JSON.stringify(currentData, null, 2);
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
        // Güncel productsData'yı kullan (butona basıldığında)
        const currentData = productsData || data;
        const jsonStr = JSON.stringify(currentData, null, 2);
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
          
          // Güncel productsData'yı kullan (butona basıldığında)
          if (!productsData || !productsData.products) {
            throw new Error('Ürün verisi bulunamadı! Lütfen sayfayı yenileyin.');
          }
          
          const jsonStr = JSON.stringify(productsData, null, 2);
          console.log('📤 GitHub\'a gönderilecek veri:', {
            products: productsData.products.length,
            categories: productsData.categories.length,
            companions: productsData.companions ? productsData.companions.length : 0,
            jsonSize: `${(jsonStr.length / 1024).toFixed(2)} KB`
          });
          
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
            // GitHub güncellemesi başarılı, LocalStorage'ı temizle ve products.json'dan yeniden yükle
            console.log('🔄 GitHub güncellemesi başarılı, cache temizleniyor ve veri yeniden yükleniyor...');
            localStorage.removeItem(STORAGE_KEY);
            
            // Birkaç saniye bekle (GitHub Pages'in güncellemesi için)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // products.json'dan yeniden yükle (force refresh)
            try {
              productsData = await loadProducts(true);
              console.log('✅ Veri yeniden yüklendi:', productsData.products?.length, 'ürün');
              
              // Admin panelini yeniden başlat
              initializeAdmin();
              displayProductsIfReady();
              displayCompanions();
              
              showNotification('✅ Başarıyla güncellendi! Tüm cihazlarda görünecek. (Sayfa yenilendi)', 'success');
            } catch (error) {
              console.error('Error reloading data:', error);
              showNotification('✅ GitHub\'a güncellendi, ancak veri yeniden yüklenirken hata oluştu. Sayfayı yenileyin.', 'error');
            }
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
      // Script dosyalarının yüklendiğini kontrol et
      console.log('🔍 Script dosyaları kontrol ediliyor...');
      console.log('GitHubConfig:', typeof window.GitHubConfig !== 'undefined' ? '✅ Yüklendi' : '❌ Yüklenmedi');
      console.log('GitHubAPI:', typeof window.GitHubAPI !== 'undefined' ? '✅ Yüklendi' : '❌ Yüklenmedi');
      
      if (typeof window.GitHubConfig === 'undefined') {
        throw new Error('GitHubConfig modülü yüklenmedi! github-api-config.js dosyası yüklenememiş olabilir. Sayfayı yenileyin (F5).');
      }
      
      // Geçici config ile test et
      const tempConfig = {
        repository: document.getElementById('github-repo').value.trim(),
        token: document.getElementById('github-token').value.trim(),
        branch: document.getElementById('github-branch').value.trim() || 'main',
        filePath: document.getElementById('github-filepath').value.trim() || 'products.json'
      };
      
      console.log('📋 Test edilecek ayarlar:', {
        repository: tempConfig.repository ? '✅' : '❌',
        token: tempConfig.token ? '✅ (uzunluk: ' + tempConfig.token.length + ')' : '❌',
        branch: tempConfig.branch,
        filePath: tempConfig.filePath
      });
      
      if (!tempConfig.repository || !tempConfig.token) {
        const missing = [];
        if (!tempConfig.repository) missing.push('Repository');
        if (!tempConfig.token) missing.push('Token');
        throw new Error(`${missing.join(' ve ')} alanları doldurulmalıdır!`);
      }
      
      // Repository formatını kontrol et
      if (!tempConfig.repository.includes('/')) {
        throw new Error('Repository formatı hatalı! Format: owner/repo (örn: alparslan166/omer-kaptan)');
      }
      
      if (tempConfig.repository.split('/').length !== 2) {
        throw new Error('Repository formatı hatalı! Format: owner/repo (örn: alparslan166/omer-kaptan)');
      }
      
      // Token formatını kontrol et ve temizle
      tempConfig.token = tempConfig.token.trim(); // Başında ve sonundaki boşlukları temizle
      
      if (!tempConfig.token) {
        throw new Error('Token alanı boş olamaz!');
      }
      
      if (tempConfig.token.length < 40) {
        throw new Error('Token çok kısa görünüyor! Token\'ı doğru kopyaladığınızdan emin olun.');
      }
      
      if (!tempConfig.token.startsWith('ghp_') && !tempConfig.token.startsWith('github_pat_')) {
        console.warn('⚠️ Token formatı beklenmeyen bir formatta. Genellikle "ghp_" veya "github_pat_" ile başlar.');
        console.warn('⚠️ Token\'ın başında ve sonunda boşluk olmamalıdır!');
      }
      
      // Token'da gizli karakterler var mı kontrol et
      if (tempConfig.token.includes(' ') || tempConfig.token.includes('\n') || tempConfig.token.includes('\t')) {
        console.warn('⚠️ Token\'da boşluk veya gizli karakterler tespit edildi! Token\'ı tekrar kopyalayın.');
        tempConfig.token = tempConfig.token.replace(/\s+/g, ''); // Tüm boşlukları kaldır
      }
      
      if (window.GitHubConfig) {
        window.GitHubConfig.saveGitHubConfig(tempConfig);
        console.log('✅ Geçici config kaydedildi');
      } else {
        throw new Error('GitHub Config modülü yüklenmedi! Sayfayı yenileyin.');
      }
      
      // GitHubAPI'nin yüklendiğinden emin ol
      console.log('⏳ GitHubAPI modülü bekleniyor...');
      let retries = 0;
      while (!window.GitHubAPI && retries < 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
        if (retries % 5 === 0) {
          console.log(`⏳ GitHubAPI bekleniyor... (${retries}/20)`);
        }
      }
      
      if (!window.GitHubAPI) {
        // Debug bilgisi
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        console.error('❌ GitHubAPI yüklenemedi. Yüklenen script dosyaları:');
        scripts.forEach(s => console.error('  -', s.src));
        throw new Error('GitHub API modülü yüklenmedi! Lütfen sayfayı yenileyin ve script dosyalarının doğru yüklendiğinden emin olun. (github-api.js)');
      }
      
      console.log('✅ GitHubAPI modülü bulundu:', Object.keys(window.GitHubAPI));
      
      if (!window.GitHubAPI.testConnection) {
        console.error('❌ testConnection fonksiyonu bulunamadı. Mevcut fonksiyonlar:', Object.keys(window.GitHubAPI));
        throw new Error('GitHub API testConnection fonksiyonu bulunamadı! github-api.js dosyası eksik veya hatalı olabilir.');
      }
      
      console.log('✅ Tüm script dosyaları yüklendi, bağlantı testi başlatılıyor...');
      
      const testResult = await window.GitHubAPI.testConnection();
      console.log('GitHub connection test result:', testResult);
      
      if (testResult && testResult.success) {
        resultDiv.innerHTML = `
          <div style="padding: 15px; background: #d4edda; border: 2px solid #28a745; border-radius: 8px; margin-top: 10px;">
            <p style="margin: 0 0 10px 0; color: #155724; font-weight: 600; font-size: 16px;">✅ Bağlantı başarılı!</p>
            <div style="font-size: 13px; color: #155724; line-height: 1.6;">
              <p style="margin: 5px 0;"><strong>Repository:</strong> ${testResult.details.repoName || testResult.details.repository}</p>
              <p style="margin: 5px 0;"><strong>Branch:</strong> ${testResult.details.branch}</p>
              <p style="margin: 5px 0;"><strong>Dosya Yolu:</strong> ${testResult.details.filePath}</p>
              <p style="margin: 5px 0;"><strong>Dosya Boyutu:</strong> ${(testResult.details.fileSize / 1024).toFixed(2)} KB</p>
            </div>
          </div>
        `;
      } else {
        // Detaylı hata mesajı göster
        const errorMessage = testResult?.error || 'Bilinmeyen hata';
        const details = testResult?.details || {};
        
        let errorDetailsHtml = '<div style="margin-top: 10px; font-size: 13px; color: #721c24;">';
        errorDetailsHtml += `<p style="margin: 5px 0;"><strong>Hata:</strong> ${errorMessage}</p>`;
        
        if (details.repository) {
          errorDetailsHtml += `<p style="margin: 5px 0;"><strong>Repository:</strong> ${details.repository}</p>`;
        }
        if (details.branch) {
          errorDetailsHtml += `<p style="margin: 5px 0;"><strong>Branch:</strong> ${details.branch}</p>`;
        }
        if (details.filePath) {
          errorDetailsHtml += `<p style="margin: 5px 0;"><strong>Dosya Yolu:</strong> ${details.filePath}</p>`;
        }
        if (details.status) {
          errorDetailsHtml += `<p style="margin: 5px 0;"><strong>HTTP Status:</strong> ${details.status} ${details.statusText || ''}</p>`;
        }
        
        // 401 Token hatası için özel mesaj
        if (details.status === 401) {
          errorDetailsHtml += `<div style="margin: 10px 0 0 0; padding: 15px; background: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px;">`;
          errorDetailsHtml += `<p style="margin: 0 0 10px 0; color: #721c24; font-weight: 600;">🔐 Token Hatası (401 Unauthorized)</p>`;
          errorDetailsHtml += `<p style="margin: 0 0 10px 0; color: #721c24; font-size: 13px;">Token geçersiz veya yanlış girilmiş. Aşağıdaki adımları takip edin:</p>`;
          errorDetailsHtml += `<ul style="margin: 5px 0; padding-left: 20px; color: #721c24; font-size: 13px;">`;
          if (details.suggestions && Array.isArray(details.suggestions)) {
            details.suggestions.forEach(suggestion => {
              errorDetailsHtml += `<li style="margin: 5px 0;">${suggestion}</li>`;
            });
          } else {
            errorDetailsHtml += `<li style="margin: 5px 0;">Token'ı doğru kopyaladığınızdan emin olun (başında ve sonunda boşluk olmamalı)</li>`;
            errorDetailsHtml += `<li style="margin: 5px 0;">Token'ın süresi dolmuş olabilir, yeni bir token oluşturun</li>`;
            errorDetailsHtml += `<li style="margin: 5px 0;">Token'ın "repo" iznine sahip olduğundan emin olun</li>`;
            errorDetailsHtml += `<li style="margin: 5px 0;">Token'ı GitHub'dan yeniden oluşturup deneyin: <a href="https://github.com/settings/tokens" target="_blank" style="color: #0056b3; text-decoration: underline;">https://github.com/settings/tokens</a></li>`;
          }
          errorDetailsHtml += `</ul>`;
          errorDetailsHtml += `</div>`;
        }
        
        if (details.suggestion && details.status !== 401) {
          errorDetailsHtml += `<p style="margin: 10px 0 0 0; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;"><strong>💡 Öneri:</strong> ${details.suggestion}</p>`;
        }
        if (details.hasRepository === false) {
          errorDetailsHtml += `<p style="margin: 10px 0 0 0; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;"><strong>⚠️ Uyarı:</strong> Repository adı girilmedi. Örnek: alparslan166/omer-kaptan</p>`;
        }
        if (details.hasToken === false) {
          errorDetailsHtml += `<p style="margin: 10px 0 0 0; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;"><strong>⚠️ Uyarı:</strong> Token girilmedi. GitHub'dan Personal Access Token oluşturun.</p>`;
        }
        if (details.filePath && details.filePath !== 'products.json') {
          errorDetailsHtml += `<p style="margin: 10px 0 0 0; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;"><strong>💡 Not:</strong> Dosya yolu "${details.filePath}" olarak ayarlanmış. Eğer dosya bulunamıyorsa, dosya yolunu "products.json" olarak değiştirmeyi deneyin.</p>`;
        }
        if (details.networkError) {
          errorDetailsHtml += `<p style="margin: 10px 0 0 0; padding: 10px; background: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px;"><strong>🌐 Ağ Hatası:</strong> İnternet bağlantınızı kontrol edin.</p>`;
        }
        
        errorDetailsHtml += '</div>';
        
        resultDiv.innerHTML = `
          <div style="padding: 15px; background: #f8d7da; border: 2px solid #dc3545; border-radius: 8px; margin-top: 10px;">
            <p style="margin: 0 0 10px 0; color: #721c24; font-weight: 600; font-size: 16px;">❌ Bağlantı başarısız!</p>
            ${errorDetailsHtml}
          </div>
        `;
      }
    } catch (error) {
      console.error('GitHub connection test error:', error);
      resultDiv.innerHTML = `
        <div style="padding: 15px; background: #f8d7da; border: 2px solid #dc3545; border-radius: 8px; margin-top: 10px;">
          <p style="margin: 0 0 10px 0; color: #721c24; font-weight: 600; font-size: 16px;">❌ Hata!</p>
          <p style="margin: 0; color: #721c24; font-size: 14px;">${error.message}</p>
          <p style="margin: 10px 0 0 0; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; font-size: 13px;">
            <strong>💡 Çözüm:</strong> Lütfen script dosyalarının yüklendiğinden emin olun (github-api-config.js, github-api.js). Tarayıcı konsolunu (F12) kontrol edin.
          </p>
        </div>
      `;
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
      // Null/undefined kontrolü
      if (!text || typeof text !== 'string') {
        console.warn('normalizeForMigration: geçersiz text parametresi:', text);
        return '';
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
    };
    
    // Mevcut eşlikçileri products.json'dan topla ve companions listesine ekle
    if (productsData && productsData.products && Array.isArray(productsData.products)) {
      const existingCompanionNames = new Set();
      
      // Mevcut companions array'inden isimleri topla
      // Companions hem string array hem de obje array olabilir
      if (productsData.companions && Array.isArray(productsData.companions)) {
        productsData.companions.forEach(c => {
          if (typeof c === 'string') {
            // String formatı
            existingCompanionNames.add(c);
          } else if (c && typeof c === 'object' && c.name) {
            // Obje formatı
            existingCompanionNames.add(c.name);
          }
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
      
      // Mevcut eşlikçileri obje formatına çevir (eğer string array ise)
      if (productsData.companions && Array.isArray(productsData.companions)) {
        // Eğer ilk eleman string ise, tüm array'i obje formatına çevir
        if (productsData.companions.length > 0 && typeof productsData.companions[0] === 'string') {
          console.log('Companions array string formatında, obje formatına çevriliyor...');
          const companionObjects = [];
          let maxId = 0;
          
          productsData.companions.forEach((companionName, index) => {
            if (typeof companionName === 'string' && companionName.trim()) {
              const normalizedName = normalizeForMigration(companionName.trim());
              companionObjects.push({
                id: index + 1,
                name: companionName.trim(),
                image: `assets/companions/${normalizedName}.jpg`
              });
              maxId = Math.max(maxId, index + 1);
            }
          });
          
          productsData.companions = companionObjects;
          companionsUpdated = true;
          console.log(`${companionObjects.length} eşlikçi obje formatına çevrildi`);
        } else {
          // Zaten obje formatında, sadece resim yollarını kontrol et
          productsData.companions.forEach(companion => {
            // Companion objesi ve name property'si kontrolü
            if (!companion || typeof companion !== 'object') {
              return; // Geçersiz companion objesi, atla
            }
            
            if (!companion.name || typeof companion.name !== 'string') {
              console.warn('Geçersiz eşlikçi objesi (name yok):', companion);
              return; // Name yoksa atla
            }
            
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
              const normalizedName = normalizeForMigration(companion.name);
              if (normalizedName) {
                companion.image = `assets/companions/${normalizedName}.jpg`;
                companionsUpdated = true;
              } else {
                console.warn('Eşlikçi için resim yolu oluşturulamadı:', companion.name);
              }
            }
          });
        }
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
    if (!text) return '';
    
    let normalizedText = text.toLowerCase();
    
    // Unicode normalizasyonu (İ -> i) sırasında oluşan birleşik karakterleri temizle
    if (typeof normalizedText.normalize === 'function') {
      normalizedText = normalizedText
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    }
    
    return normalizedText
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
      let cleanImage = product.image.replace(/^assets\//, '');
      // Eğer resim yolu boş değilse, geçerli bir dosya adı gibi görünüyorsa ve kategori ile eşleşiyorsa kullan
      if (cleanImage && cleanImage !== product.category && !cleanImage.includes(' ')) {
        // Resim yolunun zaten kategori klasörünü içerip içermediğini kontrol et
        // Önce normalize edilmiş kategori slug'ını al
        const categorySlug = normalizeForFileGlobal(product.category);
        
        // Eğer resim yolu zaten "/" içeriyorsa (yani kategori klasörü + dosya adı formatında)
        if (cleanImage.includes('/')) {
          // Resim yolu zaten tam formatta, direkt kullan
          imagePath = cleanImage;
        } else {
          // Sadece dosya adı var, kategori klasörünü ekle
          imagePath = `${categorySlug}/${cleanImage}`;
        }
      }
    }
    
    const card = document.createElement('div');
    card.className = 'product-card-admin';
    card.dataset.productId = product.id;
    
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
      let cleanImage = product.image.replace(/^assets\//, '');
      // Eğer resim yolu boş değilse, geçerli bir dosya adı gibi görünüyorsa ve kategori ile eşleşiyorsa kullan
      if (cleanImage && cleanImage !== product.category && !cleanImage.includes(' ')) {
        // Eğer resim yolu zaten "/" içeriyorsa (yani kategori klasörü + dosya adı formatında)
        if (cleanImage.includes('/')) {
          // Resim yolu zaten tam formatta, direkt kullan
          imagePath = cleanImage;
        } else {
          // Sadece dosya adı var, kategori klasörünü ekle
          const categorySlug = normalizeForFileGlobal(product.category);
          imagePath = `${categorySlug}/${cleanImage}`;
        }
      }
    }
    
    const card = document.createElement('div');
    card.className = 'product-card-admin';
    card.dataset.productId = product.id;
    
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
  const editImageInput = document.getElementById('edit-image');
  if (editImageInput) {
    editImageInput.value = product.image || '';
    editImageInput.dataset.originalImage = product.image || '';
  }
  
  // Mevcut resmi göster
  const previewImg = document.getElementById('edit-product-image-preview');
  if (previewImg && product.image) {
    // Resim yolu assets/ ile başlamıyorsa ekle
    let imagePath = product.image;
    if (!imagePath.startsWith('assets/') && !imagePath.startsWith('http://') && !imagePath.startsWith('https://') && !imagePath.startsWith('/')) {
      imagePath = `assets/${imagePath}`;
    }
    
    previewImg.src = imagePath;
    previewImg.alt = product.name;
    previewImg.style.display = 'block';
    previewImg.onerror = function() {
      this.src = 'assets/omerkaptanlogo.png';
      this.style.opacity = '0.5';
    };
  }
  
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
  
  const editTab = document.getElementById('edit-product-tab');
  editTab.classList.add('active');
  
  // Düzenleme formuna yumuşak scroll
  setTimeout(() => {
    editTab.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Eğer header sabitse, header yüksekliği kadar offset ekle
    const header = document.querySelector('.admin-header');
    if (header) {
      const headerHeight = header.offsetHeight;
      window.scrollBy(0, -headerHeight - 20); // 20px ekstra boşluk
    }
  }, 100);
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
    if (!editImage) return;
    
    const category = editCategory.value;
    const name = editName.value;
    const file = editImageFile?.files[0];
    const originalImage = editImage.dataset.originalImage || '';
    
    if (file && category && name) {
      // Yeni dosya seçilmişse, yeni dosya uzantısını kullan
      const fileExt = file.name.split('.').pop().toLowerCase();
      const autoPath = generateImagePath(category, name);
      const finalPath = autoPath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, `.${fileExt}`);
      editImage.value = finalPath;
    } else {
      // Dosya değiştirilmemişse, mevcut resim yolunu aynen koru
      if (originalImage && originalImage.trim() !== '') {
        editImage.value = originalImage;
      } else if (category && name) {
        // Hiç resim yoksa ve ürünün resmi oluşturulmamışsa, otomatik oluşturulmuş bir yol öner
        editImage.value = generateImagePath(category, name);
      } else {
        editImage.value = '';
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
      
      // Yeni eklenen ürüne scroll yap
      setTimeout(() => {
        const newProductCard = document.querySelector(`[data-product-id="${newProduct.id}"]`);
        if (newProductCard) {
          newProductCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // Ürünler listesine scroll yap
          const productsList = document.getElementById('products-list');
          if (productsList) {
            productsList.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 100);
      
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
    
    // Resim önizleme
    const editImageFile = document.getElementById('edit-image-file');
    if (editImageFile) {
      editImageFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const previewImg = document.getElementById('edit-product-image-preview');
            if (previewImg) {
              previewImg.src = event.target.result;
              previewImg.style.display = 'block';
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
    
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const id = parseInt(document.getElementById('edit-id').value);
      const product = productsData.products.find(p => p.id === id);
      if (!product) {
        alert('Ürün bulunamadı!');
        return;
      }
      
      const category = document.getElementById('edit-category').value.trim();
      const name = document.getElementById('edit-name').value.trim();
      
      // Ürün adı boş olamaz
      if (!name) {
        alert('Ürün adı boş olamaz!');
        return;
      }
      
      console.log('🔄 Ürün güncelleniyor:', {
        id: id,
        eskiAd: product.name,
        yeniAd: name,
        eskiKategori: product.category,
        yeniKategori: category
      });
      
  const imageFile = document.getElementById('edit-image-file').files[0];
  const editImageHidden = document.getElementById('edit-image');
  const originalImagePath = editImageHidden?.dataset.originalImage || product.image || '';
  
  let imagePath = originalImagePath;
  
  if (imageFile) {
    const fileExt = imageFile.name.split('.').pop().toLowerCase();
    const autoPath = generateImagePath(category, name);
    imagePath = autoPath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, `.${fileExt}`);
  } else if (!imagePath || imagePath.trim() === '') {
    imagePath = generateImagePath(category, name);
  }
  
  if (editImageHidden) {
    editImageHidden.value = imagePath;
  }
      
      // Eğer yeni resim dosyası seçilmişse GitHub'a yükle
      if (imageFile) {
        const updateButton = editForm.querySelector('button[type="submit"]');
        const originalButtonText = updateButton ? updateButton.textContent : 'Güncelle';
        
        console.log('📸 Düzenleme - Resim bilgileri:', {
          originalFileName: imageFile.name,
          category: category,
          productName: name,
          generatedPath: imagePath,
          fileExtension: imageFile.name.split('.').pop().toLowerCase(),
          oldImagePath: product.image
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
            hasUploadImage: !!(window.GitHubAPI && window.GitHubAPI.uploadImage),
            hasDeleteFile: !!(window.GitHubAPI && window.GitHubAPI.deleteFile)
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
            
            // Eski resim yolu ile yeni resim yolu farklıysa, eski resmi sil
            const oldFullImagePath = product.image && product.image.trim() !== '' 
              ? (product.image.startsWith('assets/') ? product.image : `assets/${product.image}`)
              : null;
            
            // Eski resmi sil (sadece yolu farklıysa ve eski resim varsa)
            if (oldFullImagePath && oldFullImagePath !== fullImagePath && window.GitHubAPI.deleteFile) {
              try {
                console.log('🗑️ Eski resim siliniyor:', oldFullImagePath);
                if (updateButton) {
                  updateButton.textContent = '⏳ Eski resim siliniyor...';
                }
                await window.GitHubAPI.deleteFile(oldFullImagePath);
                console.log('✅ Eski resim başarıyla silindi:', oldFullImagePath);
              } catch (deleteError) {
                // Eski resim silme hatası kritik değil, sadece logla
                console.warn('⚠️ Eski resim silinemedi (devam ediliyor):', deleteError.message);
              }
            } else if (oldFullImagePath === fullImagePath) {
              console.log('ℹ️ Resim yolu aynı, eski resmin üzerine yazılacak:', fullImagePath);
            }
            
            console.log('📤 Yeni resim GitHub\'a yükleniyor:', {
              fullPath: fullImagePath,
              fileSize: `${(imageFile.size / 1024).toFixed(2)} KB`,
              fileType: imageFile.type,
              oldPath: oldFullImagePath
            });
            
            if (updateButton) {
              updateButton.textContent = '⏳ Yeni resim yükleniyor...';
            }
            
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
      
      // Ürün bilgilerini güncelle
      const oldName = product.name;
      product.name = name;
      product.category = category;
      product.price = document.getElementById('edit-price').value.trim();
      product.shortDesc = document.getElementById('edit-short-desc').value.trim();
      product.description = document.getElementById('edit-description').value.trim();
      product.image = imagePath;
      if (editImageHidden) {
        editImageHidden.dataset.originalImage = imagePath;
        editImageHidden.value = imagePath;
      }
      product.companions = Array.from(document.getElementById('edit-companions').selectedOptions)
        .map(option => option.value)
        .filter(Boolean);
      product.hidden = document.getElementById('edit-hidden').checked;
      product.outOfStock = document.getElementById('edit-out-of-stock') ? document.getElementById('edit-out-of-stock').checked : false;
      product.subcategory = editSubcategory ? editSubcategory.value : null;
      
      console.log('✅ Ürün bilgileri güncellendi:', {
        id: product.id,
        eskiAd: oldName,
        yeniAd: product.name,
        kategori: product.category,
        fiyat: product.price,
        resim: product.image
      });
      
      // Veriyi kaydet
      saveProducts(productsData);
      
      console.log('💾 Veri kaydedildi. productsData.products içinde güncellenmiş ürün:', 
        productsData.products.find(p => p.id === id));
      
      // Ürünler listesini yenile (sayfa yenilemeden)
      displayProducts();
      displayHiddenProducts();
      
      // Ürünler tab'ına geç
      document.querySelector('[data-tab="products"]').click();
      
      // Güncellenen ürüne scroll yap
      setTimeout(() => {
        const updatedProductCard = document.querySelector(`[data-product-id="${product.id}"]`);
        if (updatedProductCard) {
          updatedProductCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const header = document.querySelector('.admin-header');
          if (header) {
            const headerHeight = header.offsetHeight;
            window.scrollBy(0, -headerHeight - 20);
          }
        } else {
          // Ürün bulunamazsa ürünler listesine scroll yap
          const productsList = document.getElementById('products-list');
          if (productsList) {
            productsList.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 100);
      
      // Preview'ı temizle
      const previewImg = document.getElementById('edit-product-image-preview');
      if (previewImg) {
        previewImg.src = '';
        previewImg.style.display = 'none';
      }
      
      alert(`Ürün başarıyla güncellendi!\n\nEski ad: ${oldName}\nYeni ad: ${product.name}\n\nNot: Değişikliklerin GitHub'a gönderilmesi için "GitHub'da Güncelle" butonuna basın.`);
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
      
      // Ürünler listesini yenile (sayfa yenilemeden)
      displayProducts();
      displayHiddenProducts();
      
      // Ürünler tab'ına geç
      document.querySelector('[data-tab="products"]').click();
      
      // Ürünler listesine scroll yap
      setTimeout(() => {
        const productsList = document.getElementById('products-list');
        if (productsList) {
          productsList.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const header = document.querySelector('.admin-header');
          if (header) {
            const headerHeight = header.offsetHeight;
            window.scrollBy(0, -headerHeight - 20);
          }
        }
      }, 100);
      
      alert(`"${product.name}" ürünü başarıyla silindi!\n\nNot: Değişikliklerin GitHub'a gönderilmesi için "GitHub'da Güncelle" butonuna basın.`);
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
    // Resim önizleme
    const newCategoryImageFile = document.getElementById('new-category-image-file');
    if (newCategoryImageFile) {
      newCategoryImageFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const previewImg = document.getElementById('new-category-image-preview');
            if (previewImg) {
              previewImg.src = event.target.result;
              previewImg.style.display = 'block';
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
    
    addCategoryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const categoryName = document.getElementById('new-category-name').value.trim();
      if (!categoryName) {
        alert('Kategori adı boş olamaz!');
        return;
      }
      
      if (productsData.categories.includes(categoryName)) {
        alert('Bu kategori zaten mevcut!');
        return;
      }
      
      const imageFile = document.getElementById('new-category-image-file').files[0];
      if (!imageFile) {
        alert('Kategori resmi seçilmedi!');
        return;
      }
      
      const categorySlug = normalizeForFileGlobal(categoryName);
      const htmlSlug = getCategoryHtmlSlug(categoryName);
      const fileExt = imageFile.name.split('.').pop().toLowerCase();
      // Resim yolu için assets klasör adını kullan (arasicaklar)
      const imageCategorySlug = categoryName === 'Ara Sıcaklar' ? 'arasicaklar' : categorySlug;
      const imagePath = `assets/${imageCategorySlug}/${getCategoryImageFileName(categoryName)}.${fileExt}`;
      const categoryHtmlPath = `categories/${htmlSlug}.html`;
      
      const submitButton = addCategoryForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton ? submitButton.textContent : 'Kategori Ekle';
      
      try {
        // GitHub API kontrolü
        if (!window.GitHubConfig || !window.GitHubConfig.isGitHubConfigComplete() || !window.GitHubAPI) {
          alert('⚠️ GitHub API yapılandırılmamış! Kategori eklemek için GitHub ayarlarını yapılandırın.');
          return;
        }
        
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = '⏳ Kategori ekleniyor...';
        }
        
        // 1. Kategori resmini yükle
        console.log('📸 Kategori resmi yükleniyor:', imagePath);
        const uploadResult = await window.GitHubAPI.uploadImage(imageFile, imagePath);
        if (!uploadResult || !uploadResult.success) {
          throw new Error('Kategori resmi yüklenemedi!');
        }
        console.log('✅ Kategori resmi yüklendi:', uploadResult.url);
        
        // 2. Kategori HTML sayfası oluştur
        const categoryHtml = generateCategoryHtml(categoryName, htmlSlug);
        console.log('📄 Kategori HTML sayfası oluşturuluyor:', categoryHtmlPath);
        const htmlResult = await window.GitHubAPI.createOrUpdateFile(
          categoryHtml,
          categoryHtmlPath,
          `Add category page: ${categoryName}`
        );
        if (!htmlResult || !htmlResult.success) {
          throw new Error('Kategori HTML sayfası oluşturulamadı!');
        }
        console.log('✅ Kategori HTML sayfası oluşturuldu:', categoryHtmlPath);
        
        // 3. Kategoriyi products.json'a ekle
        productsData.categories.push(categoryName);
        saveProducts(productsData);
        
        // 4. Formu temizle
        addCategoryForm.reset();
        const previewImg = document.getElementById('new-category-image-preview');
        if (previewImg) {
          previewImg.src = '';
          previewImg.style.display = 'none';
        }
        
        // 5. Kategorileri yeniden göster
        populateCategories();
        displayCategories();
        
        // 6. Yeni eklenen kategoriye scroll yap
        setTimeout(() => {
          const newCategoryItem = document.querySelector(`[data-category="${categoryName}"]`);
          if (newCategoryItem) {
            newCategoryItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        
        alert(`✅ Kategori başarıyla eklendi!\n\nKategori: ${categoryName}\nResim: ${imagePath}\nSayfa: ${categoryHtmlPath}`);
      } catch (error) {
        console.error('❌ Kategori ekleme hatası:', error);
        alert('Kategori eklenirken bir hata oluştu: ' + error.message);
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      }
    });
  }
  
  // Kategori düzenleme formu
  const editCategoryForm = document.getElementById('edit-category-form');
  if (editCategoryForm) {
    // Resim önizleme
    const editCategoryImageFile = document.getElementById('edit-category-image-file');
    if (editCategoryImageFile) {
      editCategoryImageFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const previewImg = document.getElementById('edit-category-image-preview');
            if (previewImg) {
              previewImg.src = event.target.result;
              previewImg.style.display = 'block';
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
    
    // Form submit
    editCategoryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const index = parseInt(document.getElementById('edit-category-index').value);
      if (isNaN(index) || index < 0 || index >= productsData.categories.length) {
        alert('Geçersiz kategori index!');
        return;
      }
      
      const oldCategoryName = productsData.categories[index];
      const newCategoryName = document.getElementById('edit-category-name').value.trim();
      
      if (!newCategoryName) {
        alert('Kategori adı boş olamaz!');
        return;
      }
      
      // Aynı isimde başka bir kategori var mı kontrol et
      if (newCategoryName !== oldCategoryName && productsData.categories.includes(newCategoryName)) {
        alert('Bu kategori adı zaten kullanılıyor!');
        return;
      }
      
      const imageFile = document.getElementById('edit-category-image-file').files[0];
      const oldCategorySlug = normalizeForFileGlobal(oldCategoryName);
      const newCategorySlug = normalizeForFileGlobal(newCategoryName);
      const newImageFileName = getCategoryImageFileName(newCategoryName);
      // "Ara Sıcaklar" için assets klasör adı "arasicaklar" (tire olmadan)
      const newImageCategorySlug = newCategoryName === 'Ara Sıcaklar' ? 'arasicaklar' : newCategorySlug;
      const oldImageCategorySlug = oldCategoryName === 'Ara Sıcaklar' ? 'arasicaklar' : oldCategorySlug;
      const oldImageFileName = getCategoryImageFileName(oldCategoryName);
      const oldHtmlSlug = getCategoryHtmlSlug(oldCategoryName);
      const newHtmlSlug = getCategoryHtmlSlug(newCategoryName);
      
      let imagePath = `assets/${newImageCategorySlug}/${newImageFileName}.jpg`;
      
      // Yeni resim seçilmişse
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop().toLowerCase();
        imagePath = `assets/${newImageCategorySlug}/${newImageFileName}.${fileExt}`;
        
        // Resmi GitHub'a yükle
        const updateButton = editCategoryForm.querySelector('button[type="submit"]');
        const originalButtonText = updateButton ? updateButton.textContent : 'Güncelle';
        
        try {
          if (window.GitHubConfig && window.GitHubConfig.isGitHubConfigComplete() && window.GitHubAPI && window.GitHubAPI.uploadImage) {
            if (updateButton) {
              updateButton.disabled = true;
              updateButton.textContent = '⏳ Resim yükleniyor...';
            }
            
            console.log('Yeni kategori resmi GitHub\'a yükleniyor:', imagePath);
            
            const uploadResult = await window.GitHubAPI.uploadImage(imageFile, imagePath);
            
            if (uploadResult && uploadResult.success) {
              console.log('✅ Kategori resmi başarıyla yüklendi:', uploadResult.url);
              
              // Eski resmi sil (eğer kategori adı değiştiyse veya farklı bir dosya adıysa)
              if (oldCategoryName !== newCategoryName || oldImageCategorySlug !== newImageCategorySlug || oldImageFileName !== newImageFileName) {
                const oldImagePath = `assets/${oldImageCategorySlug}/${oldImageFileName}.jpg`;
                try {
                  await window.GitHubAPI.deleteFile(oldImagePath);
                  console.log('✅ Eski kategori resmi silindi:', oldImagePath);
                } catch (deleteError) {
                  console.warn('⚠️ Eski kategori resmi silinemedi (dosya bulunamadı olabilir):', deleteError);
                }
              }
            } else {
              console.error('❌ Kategori resmi yüklenemedi:', uploadResult);
              alert('Resim yüklenemedi! Lütfen GitHub ayarlarını kontrol edin.');
              if (updateButton) {
                updateButton.disabled = false;
                updateButton.textContent = originalButtonText;
              }
              return;
            }
          } else {
            console.warn('⚠️ GitHub API yapılandırılmamış, resim yüklenmeyecek');
            alert('⚠️ GitHub API yapılandırılmamış! Resim GitHub\'a yüklenmeyecek. Lütfen ayarlardan GitHub API\'yi yapılandırın.');
          }
        } catch (error) {
          console.error('❌ Kategori resmi yükleme hatası:', error);
          alert('Resim yüklenirken bir hata oluştu: ' + error.message);
          if (updateButton) {
            updateButton.disabled = false;
            updateButton.textContent = originalButtonText;
          }
          return;
        }
        
        if (updateButton) {
          updateButton.disabled = false;
          updateButton.textContent = originalButtonText;
        }
      }
      
      const shouldUpdateCategoryHtml = oldCategoryName !== newCategoryName || oldHtmlSlug !== newHtmlSlug;
      
      if (shouldUpdateCategoryHtml) {
        const categoryHtmlContent = generateCategoryHtml(newCategoryName, newHtmlSlug);
        const categoryHtmlPath = `categories/${newHtmlSlug}.html`;
        
        if (window.GitHubConfig && window.GitHubConfig.isGitHubConfigComplete() && window.GitHubAPI && window.GitHubAPI.createOrUpdateFile) {
          console.log('📄 Kategori HTML sayfası güncelleniyor:', categoryHtmlPath);
          try {
            await window.GitHubAPI.createOrUpdateFile(
              categoryHtmlContent,
              categoryHtmlPath,
              `Update category page: ${newCategoryName}`
            );
            console.log('✅ Kategori HTML sayfası güncellendi:', categoryHtmlPath);
            
            if (oldHtmlSlug !== newHtmlSlug && window.GitHubAPI.deleteFile) {
              const oldHtmlPath = `categories/${oldHtmlSlug}.html`;
              try {
                await window.GitHubAPI.deleteFile(oldHtmlPath);
                console.log('🗑️ Eski kategori sayfası silindi:', oldHtmlPath);
              } catch (deleteHtmlError) {
                console.warn('⚠️ Eski kategori sayfası silinemedi (devam ediliyor):', deleteHtmlError);
              }
            }
          } catch (htmlError) {
            console.error('❌ Kategori HTML sayfası güncellenemedi:', htmlError);
            alert('Kategori sayfası güncellenirken bir hata oluştu: ' + htmlError.message);
            return;
          }
        } else {
          console.warn('⚠️ GitHub API kategori sayfasını güncellemek için hazır değil. createOrUpdateFile veya ayarlar eksik olabilir.');
          alert('GitHub API ayarları tamamlanmadığı için kategori sayfası güncellenmedi. Lütfen GitHub ayarlarını kontrol edin.');
          return;
        }
      }
      
      // Kategori adını güncelle
      productsData.categories[index] = newCategoryName;
      
      // Eğer kategori adı değiştiyse, bu kategorideki tüm ürünlerin kategorisini de güncelle
      if (oldCategoryName !== newCategoryName) {
        productsData.products.forEach(product => {
          if (product.category === oldCategoryName) {
            product.category = newCategoryName;
          }
        });
      }
      
      // Değişiklikleri kaydet
      saveProducts(productsData);
      
      // Formu temizle ve gizle
      editCategoryForm.reset();
      const editCategorySection = document.getElementById('edit-category-section');
      if (editCategorySection) {
        editCategorySection.style.display = 'none';
      }
      
      const previewImg = document.getElementById('edit-category-image-preview');
      if (previewImg) {
        previewImg.src = '';
        previewImg.style.display = 'none';
      }
      
      // Kategorileri ve ürünleri yeniden göster
      populateCategories();
      displayCategories();
      displayProducts();
      
      // Güncellenen kategoriye scroll yap
      setTimeout(() => {
        const updatedCategoryItem = document.querySelector(`[data-category="${newCategoryName}"]`);
        if (updatedCategoryItem) {
          updatedCategoryItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const header = document.querySelector('.admin-header');
          if (header) {
            const headerHeight = header.offsetHeight;
            window.scrollBy(0, -headerHeight - 20);
          }
        }
      }, 100);
      
      alert('Kategori başarıyla güncellendi!');
    });
  }
  
  // Kategori düzenleme iptal butonu
  const cancelEditCategoryBtn = document.getElementById('cancel-edit-category-btn');
  if (cancelEditCategoryBtn) {
    cancelEditCategoryBtn.addEventListener('click', () => {
      const editCategoryForm = document.getElementById('edit-category-form');
      if (editCategoryForm) {
        editCategoryForm.reset();
      }
      
      const editCategorySection = document.getElementById('edit-category-section');
      if (editCategorySection) {
        editCategorySection.style.display = 'none';
      }
      
      const previewImg = document.getElementById('edit-category-image-preview');
      if (previewImg) {
        previewImg.src = '';
        previewImg.style.display = 'none';
      }
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

// Kategori resim dosya adını al
function getCategoryImageFileName(categoryName) {
  const categoryImageNames = {
    'Ara Sıcaklar': 'ara-sicaklar',
    'Alkolsüz İçecekler': 'alkolsuz-icecekler',
    'Alkollü İçecekler': 'alkollu-icecekler'
  };
  
  return categoryImageNames[categoryName] || normalizeForFileGlobal(categoryName);
}

// Kategori HTML dosyası slug'ını al
function getCategoryHtmlSlug(categoryName) {
  if (!categoryName || typeof categoryName !== 'string') return '';
  return categoryName === 'Ara Sıcaklar' ? 'ara-sicaklar' : normalizeForFileGlobal(categoryName);
}

// Kategorileri listele
function displayCategories() {
  const categoriesList = document.getElementById('categories-list');
  if (!categoriesList) return;
  
  categoriesList.innerHTML = '';
  
  if (!productsData.categories || productsData.categories.length === 0) {
    categoriesList.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Henüz kategori eklenmemiş.</p>';
    return;
  }
  
  productsData.categories.forEach((category, index) => {
    // Kategori slug'ını oluştur (resim yolu için)
    const categorySlug = normalizeForFileGlobal(category);
    const imageFileName = getCategoryImageFileName(category);
    // "Ara Sıcaklar" için assets klasör adı "arasicaklar" (tire olmadan)
    const imageCategorySlug = category === 'Ara Sıcaklar' ? 'arasicaklar' : categorySlug;
    const categoryImage = `assets/${imageCategorySlug}/${imageFileName}.jpg`;
    
    const li = document.createElement('li');
    li.className = 'category-item';
    li.dataset.category = category;
    li.dataset.index = index;
    
    li.innerHTML = `
      <div class="category-item-content">
        <div class="category-image-container">
          <img src="${categoryImage}" alt="${category}" 
               onerror="this.src='assets/omerkaptanlogo.png'; this.style.opacity='0.5';"
               class="category-image" />
        </div>
        <div class="category-info">
          <span class="category-name">${escapeHtml(category)}</span>
          <span class="category-product-count">${getCategoryProductCount(category)} ürün</span>
        </div>
      </div>
      <div class="category-actions">
        <button class="btn-primary btn-small" onclick="editCategory(${index})" title="Düzenle">
          Düzenle
        </button>
        <button class="btn-move btn-move-up" 
                onclick="moveCategory('${category}', 'up')" 
                ${index === 0 ? 'disabled' : ''}
                title="Yukarı taşı">
          ↑
        </button>
        <button class="btn-move btn-move-down" 
                onclick="moveCategory('${category}', 'down')" 
                ${index === productsData.categories.length - 1 ? 'disabled' : ''}
                title="Aşağı taşı">
          ↓
        </button>
        <button class="btn-danger btn-small" onclick="deleteCategory('${category}')" title="Sil">
          Sil
        </button>
      </div>
    `;
    categoriesList.appendChild(li);
  });
}

// Kategori ürün sayısını al
function getCategoryProductCount(categoryName) {
  if (!productsData || !productsData.products) return 0;
  return productsData.products.filter(p => p.category === categoryName && !p.hidden).length;
}

// Kategori sırasını değiştir
function moveCategory(categoryName, direction) {
  if (!productsData || !productsData.categories) return;
  
  const currentIndex = productsData.categories.indexOf(categoryName);
  if (currentIndex === -1) return;
  
  let newIndex;
  if (direction === 'up') {
    if (currentIndex === 0) return; // Zaten en üstte
    newIndex = currentIndex - 1;
  } else if (direction === 'down') {
    if (currentIndex === productsData.categories.length - 1) return; // Zaten en altta
    newIndex = currentIndex + 1;
  } else {
    return;
  }
  
  // Kategorileri yer değiştir
  const temp = productsData.categories[currentIndex];
  productsData.categories[currentIndex] = productsData.categories[newIndex];
  productsData.categories[newIndex] = temp;
  
  // Değişiklikleri kaydet
  saveProducts(productsData);
  
  // Kategorileri yeniden göster
  displayCategories();
  populateCategories();
  
  // Taşınan kategoriye scroll yap
  setTimeout(() => {
    const movedCategoryItem = document.querySelector(`[data-category="${categoryName}"]`);
    if (movedCategoryItem) {
      movedCategoryItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
  
  console.log(`Kategori "${categoryName}" ${direction === 'up' ? 'yukarı' : 'aşağı'} taşındı`);
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
  
  // Kategoriler tabına scroll yap
  setTimeout(() => {
    const categoriesTab = document.getElementById('categories-tab');
    if (categoriesTab) {
      categoriesTab.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const header = document.querySelector('.admin-header');
      if (header) {
        const headerHeight = header.offsetHeight;
        window.scrollBy(0, -headerHeight - 20);
      }
    }
  }, 100);
  
  if (categoryProducts.length > 0) {
    alert(`"${categoryName}" kategorisi başarıyla silindi!\n\n${categoryProducts.length} ürünün kategorisi kaldırıldı.`);
  } else {
    alert(`"${categoryName}" kategorisi başarıyla silindi!`);
  }
}

// Kategori düzenle
function editCategory(index) {
  if (!productsData || !productsData.categories || index < 0 || index >= productsData.categories.length) {
    console.error('Geçersiz kategori index:', index);
    return;
  }
  
  const categoryName = productsData.categories[index];
  const categorySlug = normalizeForFileGlobal(categoryName);
  const imageFileName = getCategoryImageFileName(categoryName);
  // "Ara Sıcaklar" için assets klasör adı "arasicaklar" (tire olmadan)
  const imageCategorySlug = categoryName === 'Ara Sıcaklar' ? 'arasicaklar' : categorySlug;
  const categoryImage = `assets/${imageCategorySlug}/${imageFileName}.jpg`;
  
  // Formu doldur
  document.getElementById('edit-category-index').value = index;
  document.getElementById('edit-category-name').value = categoryName;
  document.getElementById('edit-category-image').value = categoryImage;
  
  // Mevcut resmi göster
  const previewImg = document.getElementById('edit-category-image-preview');
  if (previewImg) {
    previewImg.src = categoryImage;
    previewImg.style.display = 'block';
    previewImg.onerror = function() {
      this.src = 'assets/omerkaptanlogo.png';
      this.style.opacity = '0.5';
    };
  }
  
  // Düzenleme formunu göster
  const editCategorySection = document.getElementById('edit-category-section');
  if (editCategorySection) {
    editCategorySection.style.display = 'block';
  }
  
  // Categories tabını göster
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
  
  document.querySelector('[data-tab="categories"]').classList.add('active');
  document.getElementById('categories-tab').classList.add('active');
  
  // Düzenleme formuna yumuşak scroll
  setTimeout(() => {
    if (editCategorySection) {
      editCategorySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const header = document.querySelector('.admin-header');
      if (header) {
        const headerHeight = header.offsetHeight;
        window.scrollBy(0, -headerHeight - 20);
      }
    }
  }, 100);
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
    // Geçersiz eşlikçi kontrolü
    if (!companion || !companion.name || typeof companion.name !== 'string') {
      console.warn('Geçersiz eşlikçi objesi:', companion);
      return;
    }
    
    const card = document.createElement('div');
    card.className = 'product-card-admin';
    card.dataset.companionId = companion.id;
    
    // Eşlikçi resim yolu: assets/companions/ veya mevcut yol
    let imagePath = companion.image;
    
    // Eğer resim yolu yoksa veya geçersizse, isimden oluştur
    if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') {
      const normalizedName = normalizeForFileGlobal(companion.name);
      imagePath = normalizedName ? `assets/companions/${normalizedName}.jpg` : 'assets/omerkaptanlogo.png';
    } else {
      // Eğer assets/ ile başlamıyorsa ekle
      if (!imagePath.startsWith('assets/') && !imagePath.startsWith('http://') && !imagePath.startsWith('https://') && !imagePath.startsWith('/')) {
        imagePath = imagePath.startsWith('companions/') ? `assets/${imagePath}` : `assets/companions/${normalizeForFileGlobal(companion.name)}.jpg`;
      }
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
  
  // Mevcut resmi göster
  const previewImg = document.getElementById('edit-companion-image-preview');
  if (previewImg && companion.image) {
    previewImg.src = companion.image;
    previewImg.alt = companion.name;
    previewImg.style.display = 'block';
    previewImg.onerror = function() {
      this.src = 'assets/omerkaptanlogo.png';
      this.style.opacity = '0.5';
    };
  }
  
  // Düzenleme formunu göster
  const editCompanionSection = document.getElementById('edit-companion-section');
  editCompanionSection.style.display = 'block';
  document.querySelector('.add-companion-form').style.display = 'none';
  
  // Companions tabını göster
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
  
  document.querySelector('[data-tab="companions"]').classList.add('active');
  document.getElementById('companions-tab').classList.add('active');
  
  // Düzenleme formuna yumuşak scroll
  setTimeout(() => {
    editCompanionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Eğer header sabitse, header yüksekliği kadar offset ekle
    const header = document.querySelector('.admin-header');
    if (header) {
      const headerHeight = header.offsetHeight;
      window.scrollBy(0, -headerHeight - 20); // 20px ekstra boşluk
    }
  }, 100);
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
      
      // Eşlikçiler listesine scroll yap
      setTimeout(() => {
        const companionsList = document.getElementById('companions-list');
        if (companionsList) {
          companionsList.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const header = document.querySelector('.admin-header');
          if (header) {
            const headerHeight = header.offsetHeight;
            window.scrollBy(0, -headerHeight - 20);
          }
        }
      }, 100);
      
      alert(`"${companion.name}" eşlikçisi başarıyla silindi.`);
}

// normalizeForFile global fonksiyonu
function normalizeForFileGlobal(text) {
  if (!text || typeof text !== 'string') {
    console.warn('normalizeForFileGlobal: geçersiz text parametresi:', text);
    return '';
  }
  
  // Özel durumlar - mevcut klasör yapısına uygun
  const specialCases = {
    'Ara Sıcaklar': 'arasicaklar',
    'Alkolsüz İçecekler': 'alkolsuz-icecekler',
    'Alkollü İçecekler': 'alkollu-icecekler',
    'İçecekler': 'icecekler' // Eğer böyle bir kategori varsa
  };
  
  if (specialCases[text]) {
    return specialCases[text];
  }

  let normalizedText = text.toLowerCase();

  if (typeof normalizedText.normalize === 'function') {
    normalizedText = normalizedText
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
  
  return normalizedText
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
      
      // Yeni eklenen eşlikçiye scroll yap
      setTimeout(() => {
        const newCompanionCard = document.querySelector(`[data-companion-id="${newCompanion.id}"]`);
        if (newCompanionCard) {
          newCompanionCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // Eğer data attribute yoksa, companions listesine scroll yap
          const companionsList = document.getElementById('companions-list');
          if (companionsList) {
            companionsList.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 100);
      
      alert('Eşlikçi başarıyla eklendi!');
    });
  }
  
  // Eşlikçi düzenleme formu
  const editCompanionForm = document.getElementById('edit-companion-form');
  if (editCompanionForm) {
    // Resim önizleme
    const editCompanionImageFile = document.getElementById('edit-companion-image-file');
    if (editCompanionImageFile) {
      editCompanionImageFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const previewImg = document.getElementById('edit-companion-image-preview');
            if (previewImg) {
              previewImg.src = event.target.result;
              previewImg.style.display = 'block';
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
    
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
      
      // Preview'ı temizle
      const previewImg = document.getElementById('edit-companion-image-preview');
      if (previewImg) {
        previewImg.src = '';
        previewImg.style.display = 'none';
      }
      
      displayCompanions();
      // Eşlikçi dropdown'larını güncelle
      populateCompanionSelect(document.getElementById('add-companions'));
      populateCompanionSelect(document.getElementById('edit-companions'));
      
      // Güncellenen eşlikçiye scroll yap
      setTimeout(() => {
        const updatedCompanionCard = document.querySelector(`[data-companion-id="${companion.id}"]`);
        if (updatedCompanionCard) {
          updatedCompanionCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
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
      
      // Preview'ı temizle
      const previewImg = document.getElementById('edit-companion-image-preview');
      if (previewImg) {
        previewImg.src = '';
        previewImg.style.display = 'none';
      }
    });
  }
}

// Kategori HTML sayfası oluştur
function generateCategoryHtml(categoryName, categorySlug) {
  return `<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(categoryName)} - Menü</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="../styles.css" />
  </head>
  <body>
    <div class="loading-overlay" id="loadingOverlay">
      <div class="loading-spinner">
        <img src="../assets/capasimgesi.png" alt="Yükleniyor" />
      </div>
      <p class="loading-text">Yükleniyor...</p>
    </div>
    <header class="site-header">
      <div class="container header-inner">
        <div class="brand">
          <div class="logo" aria-hidden="true">
            <img src="../assets/omerkaptanlogo.png" alt="Ömer Kaptan" />
          </div>
          <div class="titles">
            <a href="../index.html" style="text-decoration: none; color: inherit;">
              <h1 class="site-title">Ömer Kaptan</h1>
            </a>
            <p class="site-subtitle">${escapeHtml(categoryName)}</p>
          </div>
        </div>
        <nav class="main-nav" aria-label="Geri">
          <a
            class="nav-link"
            href="../index.html"
            style="
              text-decoration: none;
              color: #4da6ff;
              display: flex;
              flex-direction: column;
              align-items: center;
            "
          >
            <span
              class="icon"
              style="display: inline-block; margin-bottom: 5px"
            >
              <img
                src="../assets/capasimgesi.png"
                alt=""
                style="width: 35px; height: 35px; object-fit: contain"
              />
            </span>
            <span style="font-size: 14px">Geri</span>
          </a>
        </nav>
      </div>
    </header>
    <main class="container">
      <div class="section-head"><h3>${escapeHtml(categoryName)}</h3></div>
      <section class="product-grid" aria-label="${escapeHtml(categoryName)} ürünleri">
      </section>
    </main>
    <footer class="site-footer">
      <div class="footer-content">
        <div class="footer-logo">
          <img src="../assets/omerkaptanlogo.png" alt="Ömer Kaptan" />
        </div>
        <div class="footer-about">
          <h4>Hakkımızda</h4>
          <p>
            Ömer Kaptan Balık Restaurant olarak, taze deniz ürünlerini en lezzetli şekilde sunmak için çalışıyoruz.
            Deniz mahsullerinin en taze halini müşterilerimize ulaştırmak bizim önceliğimizdir.
          </p>
        </div>
        <div class="footer-payments">
          <img src="../assets/odemeler.png" alt="Ödeme Yöntemleri" />
        </div>
        <div class="footer-address">
          <p>Bahçelievler, Azerbaycan Cd. No:57, 06490 Çankaya/Ankara</p>
        </div>
        <div class="footer-reservation">
          <p>Rezervasyon için</p>
          <a href="tel:03122136000">0312 213 60 00</a>
        </div>
        <div class="footer-copyright">
          <p>
            © 2025 Ömer Kaptan Balık Restaurant - İskenderun Balıkçılık. Her Hakkı Saklıdır.
          </p>
        </div>
        <div class="footer-social">
          <a
            href="https://www.instagram.com/balikciomerkaptan"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="../assets/instagram-logo.png" alt="Instagram" />
          </a>
          <a
            href="https://wa.me/903122136000"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="../assets/whatsapp-logo.png" alt="WhatsApp" />
          </a>
        </div>
        <div class="footer-designer">
          <a href="mailto:alp84202@gmail.com">Designed by Alparslan Turan➚</a>
        </div>
      </div>
    </footer>
    <button id="scrollToTopBtn" class="scroll-to-top" aria-label="Yukarı çık">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
    <script>
      // Scroll to top butonu
      (function () {
        const scrollToTopBtn = document.getElementById("scrollToTopBtn");
        if (!scrollToTopBtn) return;

        function toggleScrollButton() {
          if (window.scrollY > 300) {
            scrollToTopBtn.style.display = "flex";
          } else {
            scrollToTopBtn.style.display = "none";
          }
        }

        function checkScrollLoop() {
          toggleScrollButton();
          requestAnimationFrame(checkScrollLoop);
        }

        // İlk kontrol
        toggleScrollButton();
        // Sürekli kontrol döngüsünü başlat
        requestAnimationFrame(checkScrollLoop);

        scrollToTopBtn.addEventListener("click", function () {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        });
      })();
    </script>
    <script src="../dynamic-products.js"></script>
    <script src="../product-visibility.js"></script>
  </body>
</html>`;
}

// Global fonksiyonlar (inline onclick için)
window.editProduct = editProduct;
window.toggleProductVisibility = toggleProductVisibility;
window.deleteCategory = deleteCategory;
window.editCategory = editCategory;
window.moveCategory = moveCategory;
window.editCompanion = editCompanion;
window.deleteCompanion = deleteCompanion;

