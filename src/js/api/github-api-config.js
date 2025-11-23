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
      // Tüm alanları güncelle
      GITHUB_CONFIG.repository = config.repository || GITHUB_CONFIG.repository;
      GITHUB_CONFIG.token = config.token || GITHUB_CONFIG.token;
      GITHUB_CONFIG.branch = config.branch || GITHUB_CONFIG.branch;
      GITHUB_CONFIG.filePath = config.filePath || GITHUB_CONFIG.filePath;
      GITHUB_CONFIG.commitMessage = config.commitMessage || GITHUB_CONFIG.commitMessage;
      console.log('✅ GitHub Config localStorage\'dan yüklendi:', {
        repository: GITHUB_CONFIG.repository ? '✅' : '❌',
        token: GITHUB_CONFIG.token ? '✅' : '❌',
        branch: GITHUB_CONFIG.branch,
        filePath: GITHUB_CONFIG.filePath
      });
    } catch (e) {
      console.error('❌ Error loading GitHub config:', e);
    }
  } else {
    console.log('ℹ️ GitHub Config localStorage\'da bulunamadı, varsayılan değerler kullanılıyor');
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
  // Sayfa yüklendiğinde localStorage'dan ayarları yükle
  loadGitHubConfig();
  
  window.GitHubConfig = {
    loadGitHubConfig,
    saveGitHubConfig,
    isGitHubConfigComplete,
    getConfig: () => GITHUB_CONFIG
  };
  
  console.log('✅ GitHub Config modülü yüklendi ve ayarlar localStorage\'dan yüklendi');
}

