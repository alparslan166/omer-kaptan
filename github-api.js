// GitHub API ile products.json'u otomatik güncelleme
// Bu modül GitHub API kullanarak products.json dosyasını otomatik olarak günceller

// Config fonksiyonlarını almak için yardımcı fonksiyon
function getConfigFunctions() {
  if (typeof window !== 'undefined' && window.GitHubConfig) {
    return {
      loadGitHubConfig: window.GitHubConfig.loadGitHubConfig,
      isGitHubConfigComplete: window.GitHubConfig.isGitHubConfigComplete
    };
  }
  // Fallback: Eğer henüz yüklenmemişse, kısa bir süre bekle
  return null;
}

/**
 * GitHub API ile dosya güncelleme
 * @param {string} content - JSON içeriği (string olarak)
 * @returns {Promise<Object>} - API yanıtı
 */
async function updateFileViaGitHubAPI(content) {
  // Config fonksiyonlarını al
  const configFuncs = getConfigFunctions();
  if (!configFuncs) {
    throw new Error('GitHub Config modülü yüklenmedi! Sayfayı yenileyin.');
  }
  
  const { loadGitHubConfig, isGitHubConfigComplete } = configFuncs;
  const config = loadGitHubConfig();
  
  if (!isGitHubConfigComplete()) {
    throw new Error('GitHub API ayarları eksik! Lütfen ayarları yapılandırın.');
  }
  
  // Repository bilgilerini parse et
  const [owner, repo] = config.repository.split('/');
  if (!owner || !repo) {
    throw new Error('Repository formatı hatalı! Format: owner/repo');
  }
  
  try {
    // 1. Mevcut dosyayı al (SHA için)
    const getFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${config.filePath}?ref=${config.branch}`;
    const getFileResponse = await fetch(getFileUrl, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    let sha = null;
    if (getFileResponse.ok) {
      const fileData = await getFileResponse.json();
      sha = fileData.sha;
    } else if (getFileResponse.status !== 404) {
      // 404 dışında bir hata varsa fırlat
      const error = await getFileResponse.json();
      throw new Error(`Dosya bilgisi alınamadı: ${error.message || getFileResponse.statusText}`);
    }
    
    // 2. Dosyayı güncelle veya oluştur
    const updateUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${config.filePath}`;
    
    // Base64 encode (Türkçe karakter desteği ile)
    const utf8Content = unescape(encodeURIComponent(content));
    const base64Content = btoa(utf8Content);
    
    const updatePayload = {
      message: config.commitMessage,
      content: base64Content,
      branch: config.branch
    };
    
    // Eğer dosya varsa SHA ekle (güncelleme için)
    if (sha) {
      updatePayload.sha = sha;
    }
    
    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });
    
    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}));
      const errorMessage = errorData.message || updateResponse.statusText || 'Bilinmeyen hata';
      console.error('GitHub API error response:', errorData);
      throw new Error(`GitHub API hatası: ${errorMessage}`);
    }
    
    const result = await updateResponse.json();
    console.log('GitHub API başarılı yanıt:', result);
    return {
      success: true,
      commit: result.commit,
      content: result.content,
      message: result.commit?.message || 'Dosya güncellendi'
    };
    
  } catch (error) {
    console.error('GitHub API error:', error);
    throw error;
  }
}

/**
 * GitHub API ile resim dosyası yükleme
 * @param {File} file - Yüklenecek resim dosyası
 * @param {string} filePath - Dosya yolu (örn: assets/tavalar/urun-adi.jpg)
 * @returns {Promise<Object>} - API yanıtı
 */
async function uploadImageFileViaGitHubAPI(file, filePath) {
  // Config fonksiyonlarını al
  const configFuncs = getConfigFunctions();
  if (!configFuncs) {
    throw new Error('GitHub Config modülü yüklenmedi! Sayfayı yenileyin.');
  }
  
  const { loadGitHubConfig, isGitHubConfigComplete } = configFuncs;
  const config = loadGitHubConfig();
  
  if (!isGitHubConfigComplete()) {
    throw new Error('GitHub API ayarları eksik! Lütfen ayarları yapılandırın.');
  }
  
  // Repository bilgilerini parse et
  const [owner, repo] = config.repository.split('/');
  if (!owner || !repo) {
    throw new Error('Repository formatı hatalı! Format: owner/repo');
  }
  
  try {
    // Dosyayı Base64'e çevir
    const base64Content = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Data URL'den base64 kısmını al (data:image/jpeg;base64, kısmını kaldır)
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    // 1. Mevcut dosyayı kontrol et (SHA için)
    const getFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${config.branch}`;
    const getFileResponse = await fetch(getFileUrl, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    let sha = null;
    if (getFileResponse.ok) {
      const fileData = await getFileResponse.json();
      sha = fileData.sha;
    } else if (getFileResponse.status !== 404) {
      const error = await getFileResponse.json().catch(() => ({}));
      throw new Error(`Dosya bilgisi alınamadı: ${error.message || getFileResponse.statusText}`);
    }
    
    // 2. Dosyayı yükle veya güncelle
    const updateUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    
    const updatePayload = {
      message: `Upload image: ${filePath}`,
      content: base64Content,
      branch: config.branch
    };
    
    // Eğer dosya varsa SHA ekle (güncelleme için)
    if (sha) {
      updatePayload.sha = sha;
    }
    
    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });
    
    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}));
      const errorMessage = errorData.message || updateResponse.statusText || 'Bilinmeyen hata';
      console.error('GitHub API image upload error:', errorData);
      throw new Error(`Resim yükleme hatası: ${errorMessage}`);
    }
    
    const result = await updateResponse.json();
    console.log('GitHub API resim yükleme başarılı:', result);
    return {
      success: true,
      commit: result.commit,
      content: result.content,
      url: result.content.download_url
    };
    
  } catch (error) {
    console.error('GitHub API image upload error:', error);
    throw error;
  }
}

/**
 * GitHub API bağlantısını test et
 * @returns {Promise<boolean>} - Bağlantı başarılı mı?
 */
async function testGitHubConnection() {
  // Config fonksiyonlarını al
  const configFuncs = getConfigFunctions();
  if (!configFuncs) {
    return false;
  }
  
  const { loadGitHubConfig, isGitHubConfigComplete } = configFuncs;
  const config = loadGitHubConfig();
  
  if (!isGitHubConfigComplete()) {
    return false;
  }
  
  const [owner, repo] = config.repository.split('/');
  if (!owner || !repo) {
    return false;
  }
  
  try {
    const testUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('GitHub connection test error:', error);
    return false;
  }
}

// Global erişim için (script tag ile yüklenirse)
// Hemen window.GitHubAPI'yi oluştur (script yüklendiğinde)
if (typeof window !== 'undefined') {
  window.GitHubAPI = {
    updateFile: updateFileViaGitHubAPI,
    uploadImage: uploadImageFileViaGitHubAPI,
    testConnection: testGitHubConnection
  };
  console.log('✅ GitHub API modülü yüklendi');
}

// Export functions (ES6 modules için)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    updateFileViaGitHubAPI, 
    uploadImageFileViaGitHubAPI,
    testGitHubConnection 
  };
}

