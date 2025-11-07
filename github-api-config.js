// GitHub API Configuration
// Bu dosya GitHub API ayarlarını içerir
// Güvenlik için bu dosyayı .gitignore'a eklemeyi unutmayın!

const GITHUB_CONFIG = {
  // GitHub repository bilgileri
  // Örnek: 'alparslan166/omer-kaptan'
  repository: '',
  
  // GitHub Personal Access Token
  // Token oluşturmak için: https://github.com/settings/tokens
  // İzinler: repo (Full control of private repositories)
  token: '',
  
  // Branch adı (genellikle 'main' veya 'master')
  branch: 'main',
  
  // Dosya yolu (products.json'un repository'deki yolu)
  filePath: 'products.json',
  
  // Commit mesajı
  commitMessage: 'Update products.json from admin panel'
};

// LocalStorage'dan ayarları yükle
function loadGitHubConfig() {
  const stored = localStorage.getItem('github_api_config');
  if (stored) {
    try {
      const config = JSON.parse(stored);
      Object.assign(GITHUB_CONFIG, config);
    } catch (e) {
      console.error('Error loading GitHub config:', e);
    }
  }
  return GITHUB_CONFIG;
}

// Ayarları kaydet
function saveGitHubConfig(config) {
  localStorage.setItem('github_api_config', JSON.stringify(config));
  Object.assign(GITHUB_CONFIG, config);
}

// Ayarların tamamlanıp tamamlanmadığını kontrol et
function isGitHubConfigComplete() {
  return GITHUB_CONFIG.repository && GITHUB_CONFIG.token;
}

// Global erişim için
if (typeof window !== 'undefined') {
  window.GitHubConfig = {
    loadGitHubConfig,
    saveGitHubConfig,
    isGitHubConfigComplete,
    getConfig: () => GITHUB_CONFIG
  };
}

