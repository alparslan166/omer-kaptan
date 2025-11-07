// GitHub API ile products.json'u otomatik güncelleme
// Bu modül GitHub API kullanarak products.json dosyasını otomatik olarak günceller

// Global erişim için fonksiyonlar
let loadGitHubConfig, isGitHubConfigComplete;

// github-api-config.js yüklendikten sonra çalışacak
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    // Config fonksiyonlarını al
    if (typeof window.GitHubConfig !== 'undefined') {
      loadGitHubConfig = window.GitHubConfig.loadGitHubConfig;
      isGitHubConfigComplete = window.GitHubConfig.isGitHubConfigComplete;
    }
  });
}

/**
 * GitHub API ile dosya güncelleme
 * @param {string} content - JSON içeriği (string olarak)
 * @returns {Promise<Object>} - API yanıtı
 */
async function updateFileViaGitHubAPI(content) {
  if (!loadGitHubConfig) {
    loadGitHubConfig = window.GitHubConfig?.loadGitHubConfig || (() => ({}));
  }
  if (!isGitHubConfigComplete) {
    isGitHubConfigComplete = window.GitHubConfig?.isGitHubConfigComplete || (() => false);
  }
  
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
      const error = await updateResponse.json();
      throw new Error(`GitHub API hatası: ${error.message || updateResponse.statusText}`);
    }
    
    const result = await updateResponse.json();
    return {
      success: true,
      commit: result.commit,
      content: result.content
    };
    
  } catch (error) {
    console.error('GitHub API error:', error);
    throw error;
  }
}

/**
 * GitHub API bağlantısını test et
 * @returns {Promise<boolean>} - Bağlantı başarılı mı?
 */
async function testGitHubConnection() {
  if (!loadGitHubConfig) {
    loadGitHubConfig = window.GitHubConfig?.loadGitHubConfig || (() => ({}));
  }
  if (!isGitHubConfigComplete) {
    isGitHubConfigComplete = window.GitHubConfig?.isGitHubConfigComplete || (() => false);
  }
  
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

// Export functions (ES6 modules için)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { updateFileViaGitHubAPI, testGitHubConnection };
}

// Global erişim için (script tag ile yüklenirse)
if (typeof window !== 'undefined') {
  window.GitHubAPI = {
    updateFile: updateFileViaGitHubAPI,
    testConnection: testGitHubConnection
  };
}

