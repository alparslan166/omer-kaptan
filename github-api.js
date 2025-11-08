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
  
  // SHA uyuşmazlığı durumunda retry mekanizması
  const maxRetries = 5;
  let retryCount = 0;
  let lastSha = null;
  
  while (retryCount < maxRetries) {
    try {
      // 1. Mevcut dosyayı al (SHA için) - Her retry'da güncel SHA'yı al (cache bypass için timestamp ekle)
      const cacheBuster = Date.now();
      const getFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${config.filePath}?ref=${config.branch}&t=${cacheBuster}`;
      const getFileResponse = await fetch(getFileUrl, {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        cache: 'no-store'
      });
      
      let sha = null;
      if (getFileResponse.ok) {
        const fileData = await getFileResponse.json();
        sha = fileData.sha;
        
        // Eğer SHA değişmediyse, biraz daha uzun bekle (başka bir işlem devam ediyor olabilir)
        if (lastSha === sha && retryCount > 0) {
          console.warn(`⚠️ SHA değişmedi (${sha.substring(0, 8)}...), başka bir güncelleme devam ediyor olabilir. Daha uzun bekleniyor...`);
          await new Promise(resolve => setTimeout(resolve, 3000 * (retryCount + 1)));
        }
        
        lastSha = sha;
        console.log(`📋 Mevcut dosya SHA'sı alındı: ${sha.substring(0, 8)}... (Retry: ${retryCount + 1}/${maxRetries})`);
      } else if (getFileResponse.status === 404) {
        console.log('📋 Dosya bulunamadı, yeni dosya oluşturulacak');
      } else {
        // 404 dışında bir hata varsa fırlat
        const error = await getFileResponse.json().catch(() => ({}));
        throw new Error(`Dosya bilgisi alınamadı: ${error.message || getFileResponse.statusText}`);
      }
      
      // 2. Dosyayı güncelle veya oluştur
      const updateUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${config.filePath}`;
      
      // Base64 encode (Türkçe karakter desteği ile)
      const utf8Content = unescape(encodeURIComponent(content));
      const base64Content = btoa(utf8Content);
      
      const updatePayload = {
        message: `${config.commitMessage} (${new Date().toISOString()})`,
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
        body: JSON.stringify(updatePayload),
        cache: 'no-store'
      });
      
      if (updateResponse.ok) {
        // Başarılı!
        const result = await updateResponse.json();
        console.log(`✅ GitHub API başarılı yanıt (Retry ${retryCount + 1} başarılı):`, result);
        return {
          success: true,
          commit: result.commit,
          content: result.content
        };
      } else {
        const errorData = await updateResponse.json().catch(() => ({}));
        const errorMessage = errorData.message || updateResponse.statusText || 'Bilinmeyen hata';
        
        // SHA uyuşmazlığı hatası (409 Conflict) - Retry yap
        if (updateResponse.status === 409 && errorMessage.includes('does not match') && retryCount < maxRetries - 1) {
          retryCount++;
          const waitTime = Math.min(2000 * retryCount, 10000); // Max 10 saniye bekle
          console.warn(`⚠️ SHA uyuşmazlığı tespit edildi (${retryCount}/${maxRetries}), ${waitTime/1000} saniye bekleniyor...`);
          console.warn(`   Beklenen SHA: ${errorMessage.match(/does not match ([a-f0-9]+)/)?.[1]?.substring(0, 8) || 'bilinmiyor'}...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue; // Döngünün başına dön
        } else {
          // Diğer hatalar veya max retry'a ulaşıldı
          console.error('GitHub API error response:', errorData);
          if (retryCount >= maxRetries - 1) {
            throw new Error(`GitHub API hatası: SHA uyuşmazlığı nedeniyle ${maxRetries} deneme başarısız oldu. Lütfen sayfayı yenileyip birkaç saniye bekledikten sonra tekrar deneyin.`);
          }
          throw new Error(`GitHub API hatası: ${errorMessage}`);
        }
      }
    } catch (error) {
      // Retry sayısına ulaşılmadıysa ve SHA uyuşmazlığı varsa retry yap
      if (retryCount < maxRetries - 1 && error.message && error.message.includes('does not match')) {
        retryCount++;
        const waitTime = Math.min(2000 * retryCount, 10000);
        console.warn(`⚠️ Hata tespit edildi (${retryCount}/${maxRetries}), ${waitTime/1000} saniye bekleniyor...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }
  
  // Max retry'a ulaşıldıysa hata fırlat
  throw new Error('Dosya güncelleme başarısız: SHA uyuşmazlığı nedeniyle maksimum deneme sayısına ulaşıldı. Lütfen sayfayı yenileyip birkaç saniye bekledikten sonra tekrar deneyin.');
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
    
    // 1. Mevcut dosyayı kontrol et (SHA için) - sadece dosya varsa SHA al
    let sha = null;
    try {
      const getFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${config.branch}`;
      const getFileResponse = await fetch(getFileUrl, {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (getFileResponse.ok) {
        const fileData = await getFileResponse.json();
        sha = fileData.sha;
        console.log(`📋 Mevcut dosya bulundu, SHA: ${sha.substring(0, 8)}...`);
      } else if (getFileResponse.status === 404) {
        console.log(`📋 Yeni dosya oluşturulacak: ${filePath}`);
      } else {
        // 404 dışında bir hata varsa logla ama devam et (yeni dosya oluşturulabilir)
        const error = await getFileResponse.json().catch(() => ({}));
        console.warn(`⚠️ Dosya bilgisi alınamadı (404 değil), yeni dosya olarak oluşturulacak:`, error.message || getFileResponse.statusText);
      }
    } catch (error) {
      // SHA kontrolü hatası kritik değil, yeni dosya olarak oluşturulabilir
      console.warn(`⚠️ SHA kontrolü başarısız, yeni dosya olarak oluşturulacak:`, error.message);
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
 * GitHub API ile dosya silme
 * @param {string} filePath - Silinecek dosya yolu (örn: assets/tavalar/eski-urun.jpg)
 * @returns {Promise<Object>} - API yanıtı
 */
async function deleteFileViaGitHubAPI(filePath) {
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
    const getFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${config.branch}`;
    const getFileResponse = await fetch(getFileUrl, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!getFileResponse.ok) {
      if (getFileResponse.status === 404) {
        console.log(`📋 Dosya zaten mevcut değil: ${filePath}`);
        return {
          success: true,
          message: 'Dosya zaten mevcut değil'
        };
      }
      const error = await getFileResponse.json().catch(() => ({}));
      throw new Error(`Dosya bilgisi alınamadı: ${error.message || getFileResponse.statusText}`);
    }
    
    const fileData = await getFileResponse.json();
    const sha = fileData.sha;
    console.log(`📋 Dosya bulundu, SHA: ${sha.substring(0, 8)}...`);
    
    // 2. Dosyayı sil
    const deleteUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    
    const deletePayload = {
      message: `Delete old image: ${filePath}`,
      sha: sha,
      branch: config.branch
    };
    
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deletePayload)
    });
    
    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json().catch(() => ({}));
      const errorMessage = errorData.message || deleteResponse.statusText || 'Bilinmeyen hata';
      console.error('GitHub API delete error:', errorData);
      throw new Error(`Dosya silme hatası: ${errorMessage}`);
    }
    
    const result = await deleteResponse.json();
    console.log('✅ Dosya başarıyla silindi:', filePath);
    return {
      success: true,
      commit: result.commit,
      message: 'Dosya başarıyla silindi'
    };
    
  } catch (error) {
    console.error('GitHub API delete error:', error);
    throw error;
  }
}

/**
 * GitHub API bağlantısını test et
 * @returns {Promise<Object>} - Test sonucu ve detaylı bilgiler
 */
async function testGitHubConnection() {
  // Config fonksiyonlarını al
  const configFuncs = getConfigFunctions();
  if (!configFuncs) {
    return {
      success: false,
      error: 'GitHub Config modülü yüklenmedi! Sayfayı yenileyin.',
      details: {}
    };
  }
  
  const { loadGitHubConfig, isGitHubConfigComplete } = configFuncs;
  const config = loadGitHubConfig();
  
  if (!isGitHubConfigComplete()) {
    return {
      success: false,
      error: 'GitHub API ayarları eksik! Repository veya Token eksik.',
      details: {
        hasRepository: !!config.repository,
        hasToken: !!config.token,
        repository: config.repository || '(boş)',
        branch: config.branch || '(boş)',
        filePath: config.filePath || '(boş)'
      }
    };
  }
  
  const [owner, repo] = config.repository.split('/');
  if (!owner || !repo) {
    return {
      success: false,
      error: 'Repository formatı hatalı! Format: owner/repo',
      details: {
        repository: config.repository
      }
    };
  }
  
  try {
    // 1. Repository erişimini test et
    const testUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: `Repository erişilemiyor: ${errorData.message || response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          repository: config.repository,
          error: errorData
        }
      };
    }
    
    // 2. products.json dosyasının varlığını kontrol et
    const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${config.filePath}?ref=${config.branch}`;
    const fileResponse = await fetch(fileUrl, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (fileResponse.status === 404) {
      return {
        success: false,
        error: `products.json dosyası bulunamadı!`,
        details: {
          repository: config.repository,
          branch: config.branch,
          filePath: config.filePath,
          suggestion: 'Dosya yolunu kontrol edin veya products.json dosyasını repository\'ye ekleyin.'
        }
      };
    } else if (!fileResponse.ok) {
      const errorData = await fileResponse.json().catch(() => ({}));
      return {
        success: false,
        error: `products.json dosyası kontrol edilemedi: ${errorData.message || fileResponse.statusText}`,
        details: {
          status: fileResponse.status,
          statusText: fileResponse.statusText,
          repository: config.repository,
          branch: config.branch,
          filePath: config.filePath,
          error: errorData
        }
      };
    }
    
    // Başarılı!
    const repoData = await response.json();
    const fileData = await fileResponse.json();
    
    return {
      success: true,
      error: null,
      details: {
        repository: config.repository,
        branch: config.branch,
        filePath: config.filePath,
        repoExists: true,
        fileExists: true,
        repoName: repoData.full_name,
        fileSize: fileData.size || 0
      }
    };
  } catch (error) {
    console.error('GitHub connection test error:', error);
    return {
      success: false,
      error: `Bağlantı hatası: ${error.message}`,
      details: {
        repository: config.repository,
        branch: config.branch,
        filePath: config.filePath,
        networkError: true
      }
    };
  }
}

// Global erişim için (script tag ile yüklenirse)
// Hemen window.GitHubAPI'yi oluştur (script yüklendiğinde)
if (typeof window !== 'undefined') {
  window.GitHubAPI = {
    updateFile: updateFileViaGitHubAPI,
    uploadImage: uploadImageFileViaGitHubAPI,
    deleteFile: deleteFileViaGitHubAPI,
    testConnection: testGitHubConnection
  };
  console.log('✅ GitHub API modülü yüklendi');
}

// Export functions (ES6 modules için)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    updateFileViaGitHubAPI, 
    uploadImageFileViaGitHubAPI,
    deleteFileViaGitHubAPI,
    testGitHubConnection 
  };
}

