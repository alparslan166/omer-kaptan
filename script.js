(function(){
  // DOM yüklenene kadar bekle
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductPage);
  } else {
    initProductPage();
  }
  
  function initProductPage() {
    const params = new URLSearchParams(window.location.search);
    let name = params.get('name') || 'Ürün adı';
    let category = params.get('category') || '';
    let desc = params.get('desc') || 'Lezzetli bir deniz ürünü.';
    let companions = (params.get('companions') || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    
    // products.json'dan ürün bilgilerini yükle (kalıcı kaynak)
    let productImagePath = null; // products.json'dan gelen resim yolu
    let productIngredients = null;
    
    // updateProductPage fonksiyonu - resim yolunu parametre olarak alabilir
    function updateProductPage(imagePathFromJson = null) {
      const titleEl = document.querySelector('[data-product-name]');
      const catEl = document.querySelector('[data-product-category]');
      const descEl = document.querySelector('[data-product-desc]');
      const chipsEl = document.querySelector('[data-companions]');
      const productNameTitleEl = document.querySelector('[data-product-name-title]');
      const productImageEl = document.querySelector('[data-product-image]');
      const ingredientsTitleEl = document.querySelector('[data-ingredients-title]');
      const ingredientsListEl = document.querySelector('[data-ingredients-list]');

      if (titleEl) titleEl.textContent = category ? `${category} / ${name}` : name;
      if (catEl) catEl.textContent = category;
      if (descEl) descEl.textContent = desc;
      if (productNameTitleEl) productNameTitleEl.textContent = name;
      
      // Ürün resmini yükle
      if (productImageEl && category && name) {
      let imageSrc = null;
    
      // Önce products.json'dan gelen resim yolunu kullan (parametre veya global değişken)
      const imagePath = imagePathFromJson || productImagePath;
      console.log('🖼️ Resim yolu kontrolü:', { imagePathFromJson, productImagePath, imagePath, category, name });
    
        if (imagePath) {
          // Eğer resim yolu zaten "assets/" ile başlıyorsa direkt kullan
          if (imagePath.startsWith('assets/')) {
            imageSrc = imagePath;
          } else {
            // Değilse "assets/" ekle
            imageSrc = `assets/${imagePath}`;
          }
          console.log('✅ Resim yolu products.json\'dan kullanılıyor:', imageSrc);
        } else {
          // products.json'da resim yolu yoksa, otomatik oluştur
          console.log('⚠️ products.json\'da resim yolu yok, otomatik oluşturuluyor...');
          const categorySlug = normalizeForFile(category);
          let productSlug = normalizeForFile(name);
          
          // Mezeler kategorisi için özel işlem: Parantez içindeki kısımları kaldır
          if (category === 'Mezeler') {
            // Parantez öncesi kısmı al (örn: "Atom" -> "Atom")
            const nameWithoutParentheses = name.split('(')[0].trim();
            productSlug = normalizeForFile(nameWithoutParentheses);
          }
          
          // "D." ile başlayan ürünler için özel işlem: "D." -> "deniz"
          if (name.startsWith('D. ')) {
            const nameWithoutD = name.replace(/^D\.\s*/, '');
            productSlug = 'deniz-' + normalizeForFile(nameWithoutD);
          }
          
          imageSrc = `assets/${categorySlug}/${productSlug}.jpg`;
          console.log('🔄 Resim yolu otomatik oluşturuldu:', imageSrc);
        }
        
        if (imageSrc) {
          console.log('📸 Resim yükleniyor:', imageSrc);
          productImageEl.src = imageSrc;
          productImageEl.alt = name;
          
          // Resim yükleme başarılı
          productImageEl.onload = function() {
            console.log('✅ Resim başarıyla yüklendi:', imageSrc);
          };
          
          // Resim yükleme hatası için fallback
          productImageEl.onerror = function() {
            console.error('❌ Resim yüklenemedi:', imageSrc);
            // Varsayılan resme geç
            this.src = 'assets/omerkaptanlogo.png';
            this.onerror = null; // Sonsuz döngüyü önle
            console.log('🔄 Varsayılan resim kullanılıyor');
          };
        } else {
          console.error('❌ Resim yolu oluşturulamadı!');
        }
      } else {
        console.error('❌ Resim elementi veya kategori/ürün adı bulunamadı:', {
          productImageEl: !!productImageEl,
          category,
          name
        });
      }

      // İçindekiler listesini göster (sadece Mezeler kategorisi için)
      if (category === 'Mezeler' && ingredientsTitleEl && ingredientsListEl) {
        let resolvedIngredients = null;
        if (Array.isArray(productIngredients) && productIngredients.length > 0) {
          resolvedIngredients = productIngredients;
        } else {
          resolvedIngredients = getMezeIngredients(name);
        }
        
        if (resolvedIngredients && resolvedIngredients.length > 0) {
          ingredientsTitleEl.style.display = 'block';
          ingredientsListEl.style.display = 'block';
          ingredientsListEl.innerHTML = '';
          resolvedIngredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.textContent = ingredient;
            ingredientsListEl.appendChild(li);
          });
        } else {
          ingredientsTitleEl.style.display = 'none';
          ingredientsListEl.style.display = 'none';
        }
      } else if (ingredientsTitleEl && ingredientsListEl) {
        ingredientsTitleEl.style.display = 'none';
        ingredientsListEl.style.display = 'none';
      }

      // Eşlikçi gösterilmeyecek kategoriler
      const noCompanionCategories = ['Tatlılar', 'Mezeler', 'Alkolsüz İçecekler', 'Alkollü İçecekler'];
      
      if (chipsEl) {
        // "Ücretsiz Eşlikçiler" başlığını bul
        const companionsSection = chipsEl.closest('.detail');
        const companionsTitle = companionsSection ? Array.from(companionsSection.querySelectorAll('h3')).find(h3 => h3.textContent === 'Ücretsiz Eşlikçiler') : null;
        
        // Belirtilen kategorilerde eşlikçi gösterilmez
        if (noCompanionCategories.includes(category)) {
          if (companionsTitle) {
            companionsTitle.style.display = 'none';
          }
          chipsEl.style.display = 'none';
        } else {
          chipsEl.innerHTML = '';
          // Eşlikçi varsa göster
          if (companions.length > 0) {
            companions.forEach(c => {
              const card = document.createElement('div');
              card.className = 'companion-card';
              const imgWrap = document.createElement('div');
              imgWrap.className = 'image';
              const img = document.createElement('img');
              img.src = companionImagePath(c);
              img.alt = c;
              imgWrap.appendChild(img);
              const label = document.createElement('div');
              label.className = 'label';
              label.textContent = c;
              card.appendChild(imgWrap);
              card.appendChild(label);
              chipsEl.appendChild(card);
            });
          } else {
            // Eşlikçi yoksa hiçbir şey gösterilmez
            if (companionsTitle) {
              companionsTitle.style.display = 'none';
            }
            chipsEl.style.display = 'none';
          }
        }
      }

      // Şefin Önerdiği Mezeler
      const chefRecommendationsEl = document.getElementById('chef-recommendations');
      const recommendedMezelerEl = document.getElementById('recommended-mezeler');
      
      if (chefRecommendationsEl && recommendedMezelerEl) {
        const allowedCategories = ['Tavalar', 'Izgaralar', 'Buğulamalar', 'Kavurmalar', 'Ara Sıcaklar', 'Şişler', 'Balık Ekmekler', 'Çorbalar', 'Pideler'];
        
        if (allowedCategories.includes(category)) {
          chefRecommendationsEl.style.display = 'block';
      
      // Mezeler listesi
      const mezeler = [
        { name: 'Haydari', image: 'mezeler/haydari.jpg', desc: 'Geleneksel haydari meze, özenle hazırlanmış.' },
        { name: 'Cacık', image: 'mezeler/cacik.jpg', desc: 'Taze cacık, serinletici lezzet.' },
        { name: 'Şakşuka', image: 'mezeler/saksuka.jpg', desc: 'Geleneksel şakşuka, özenle hazırlanmış.' },
        { name: 'Közlenmiş Patlıcan Salatası', image: 'mezeler/kozlenmis-patlican-salatasi.jpg', desc: 'Közlenmiş patlıcan ile hazırlanmış nefis salata.' },
        { name: 'Muhammara', image: 'mezeler/muhammara.jpg', desc: 'Muhammara meze, özenle hazırlanmış.' },
        { name: 'Fava', image: 'mezeler/fava.jpg', desc: 'Bakla ezmesi, geleneksel lezzet.' },
        { name: 'Zeytinyağlı Yaprak Sarma', image: 'mezeler/zeytinyagli-yaprak-sarma.jpg', desc: 'Zeytinyağlı yaprak sarma, özenle hazırlanmış.' },
        { name: 'Zeytinyağlı Barbunya', image: 'mezeler/zeytinyagli-barbunya.jpg', desc: 'Zeytinyağlı barbunya, geleneksel lezzet.' },
        { name: 'Patlıcan Ezme', image: 'mezeler/patlican-ezme.jpg', desc: 'Patlıcan ezme, özenle hazırlanmış.' },
        { name: 'Acılı Ezme', image: 'mezeler/acili-ezme.jpg', desc: 'Acılı ezme, şefin özel tarifi.' },
        { name: 'Yoğurtlu Semizotu', image: 'mezeler/yogurtlu-semizotu.jpg', desc: 'Yoğurtlu semizotu, özenle hazırlanmış.' },
        { name: 'Yoğurtlu Kabak', image: 'mezeler/yogurtlu-kabak.jpg', desc: 'Yoğurtlu kabak, geleneksel lezzet.' },
        { name: 'Zeytinyağlı Enginar', image: 'mezeler/zeytinyagli-enginar.jpg', desc: 'Zeytinyağlı enginar, özenle hazırlanmış.' },
        { name: 'Havuç Tarator', image: 'mezeler/havuc-tarator.jpg', desc: 'Havuç tarator, şefin özel tarifi.' },
        { name: 'Zeytinyağlı Taze Fasulye', image: 'mezeler/zeytinyagli-taze-fasulye.jpg', desc: 'Zeytinyağlı taze fasulye, özenle hazırlanmış.' },
        { name: 'Zeytinyağlı Kereviz', image: 'mezeler/zeytinyagli-kereviz.jpg', desc: 'Zeytinyağlı kereviz, geleneksel lezzet.' },
        { name: 'Közlenmiş Kırmızı Biber Dolması', image: 'mezeler/kozlenmis-kirmizi-biber-dolmasi.jpg', desc: 'Közlenmiş kırmızı biber dolması, özenle hazırlanmış.' },
        { name: 'Zeytin Ezmesi', image: 'mezeler/zeytin-ezmesi.jpg', desc: 'Zeytin ezmesi, şefin özel tarifi.' },
        { name: 'Börülce Salatası', image: 'mezeler/borulce-salatasi.jpg', desc: 'Börülce salatası, özenle hazırlanmış.' },
        { name: 'Zeytinyağlı Bakla', image: 'mezeler/zeytinyagli-bakla.jpg', desc: 'Zeytinyağlı bakla, geleneksel lezzet.' },
        { name: 'Atom', image: 'mezeler/atom.jpg', desc: 'Atom meze, yoğurt ve acı biber ile hazırlanmış.' },
        { name: 'Babagannuş', image: 'mezeler/babagannus.jpg', desc: 'Babagannuş, özenle hazırlanmış.' },
        { name: 'Girit Ezmesi', image: 'mezeler/girit-ezmesi.jpg', desc: 'Girit ezmesi, geleneksel lezzet.' },
        { name: 'Deniz Börülcesi', image: 'mezeler/deniz-borulcesi.jpg', desc: 'Deniz börülcesi, özenle hazırlanmış.' },
        { name: 'Yoğurtlu Pancar', image: 'mezeler/yogurtlu-pancar.jpg', desc: 'Yoğurtlu pancar, şefin özel tarifi.' },
        { name: 'Yoğurtlu Patates Salatası', image: 'mezeler/yogurtlu-patates-salatasi.jpg', desc: 'Yoğurtlu patates salatası, özenle hazırlanmış.' },
        { name: 'Kabak Borani', image: 'mezeler/kabak-borani.jpg', desc: 'Kabak borani, geleneksel lezzet.' },
        { name: 'Yoğurtlu Havuç', image: 'mezeler/yogurtlu-havuc.jpg', desc: 'Yoğurtlu havuç, özenle hazırlanmış.' },
        { name: 'Tahinli Patlıcan', image: 'mezeler/tahinli-patlican.jpg', desc: 'Tahinli patlıcan, şefin özel tarifi.' },
        { name: 'Sarımsaklı Yoğurtlu Mantar', image: 'mezeler/sarimsakli-yogurtlu-mantar.jpg', desc: 'Sarımsaklı yoğurtlu mantar, özenle hazırlanmış.' },
        { name: 'Kısır', image: 'mezeler/kisir.jpg', desc: 'Kısır, geleneksel lezzet.' },
        { name: 'Patates Salatası', image: 'mezeler/patates-salatasi.jpg', desc: 'Patates salatası, özenle hazırlanmış.' },
        { name: 'Gavurdağı Salatası', image: 'mezeler/gavurdagi-salatasi.jpg', desc: 'Gavurdağı salatası, şefin özel tarifi.' },
        { name: 'Arnavut Ciğeri', image: 'mezeler/arnavut-cigeri.jpg', desc: 'Arnavut ciğeri, soğuk servis edilir.' },
        { name: 'Mercimek Köftesi', image: 'mezeler/mercimek-koftesi.jpg', desc: 'Mercimek köftesi, özenle hazırlanmış.' },
        { name: 'Zeytinyağlı Pırasa', image: 'mezeler/zeytinyagli-pirasa.jpg', desc: 'Zeytinyağlı pırasa, geleneksel lezzet.' },
        { name: 'Zeytinyağlı Patlıcan', image: 'mezeler/zeytinyagli-patlican.jpg', desc: 'Zeytinyağlı patlıcan, özenle hazırlanmış.' },
        { name: 'Zeytinyağlı Kabak', image: 'mezeler/zeytinyagli-kabak.jpg', desc: 'Zeytinyağlı kabak, şefin özel tarifi.' },
        { name: 'Börülce Piyazı', image: 'mezeler/borulce-piyazi.jpg', desc: 'Börülce piyazı, özenle hazırlanmış.' },
        { name: 'Yeşil Mercimek Salatası', image: 'mezeler/yesil-mercimek-salatasi.jpg', desc: 'Yeşil mercimek salatası, geleneksel lezzet.' },
        { name: 'Karides Güveç', image: 'mezeler/karides-guvec.jpg', desc: 'Karides güveç, özenle hazırlanmış.' },
        { name: 'Ahtapot Salatası', image: 'mezeler/ahtapot-salatasi.jpg', desc: 'Ahtapot salatası, şefin özel tarifi.' },
        { name: 'Kalamar Tava', image: 'mezeler/kalamar-tava.jpg', desc: 'Kalamar tava, özenle pişirilmiş.' },
        { name: 'Midye Dolma', image: 'mezeler/midye-dolma.jpg', desc: 'Midye dolma, geleneksel lezzet.' },
        { name: 'Lakerda', image: 'mezeler/lakerda.jpg', desc: 'Lakerda, özenle hazırlanmış.' },
        { name: 'Hamsi Marine', image: 'mezeler/hamsi-marine.jpg', desc: 'Hamsi marine, şefin özel tarifi.' },
        { name: 'Levrek Marin', image: 'mezeler/levrek-marin.jpg', desc: 'Levrek marin, özenle hazırlanmış.' },
        { name: 'Tarama (Balık Yumurtası Ezmesi)', image: 'mezeler/tarama.jpg', desc: 'Tarama, balık yumurtası ezmesi, geleneksel lezzet.' },
        { name: 'Balık Köftesi', image: 'mezeler/balik-koftesi.jpg', desc: 'Balık köftesi, özenle hazırlanmış.' },
            { name: 'Deniz Mahsullü', image: 'mezeler/deniz-mahsullu.jpg', desc: 'Deniz mahsullü meze, şefin özel tarifi.' }
          ];

          // Rastgele 6 meze seç
          const shuffled = mezeler.sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 6);

          // Mezeleri göster
          selected.forEach(meze => {
            const card = document.createElement('article');
            card.className = 'product-card';
            
            const encodedName = encodeURIComponent(meze.name);
            const encodedDesc = encodeURIComponent(meze.desc);
            
            card.innerHTML = `
          <div class="media-figure">
            <img src="assets/${meze.image}" alt="${meze.name}" />
          </div>
          <div class="product-body">
            <h4 class="product-title">${meze.name}</h4>
            <p class="product-price">₺340</p>
            <p class="product-desc">Şefin önerisi.</p>
            <a
              class="link"
              href="product.html?name=${encodedName}&category=Mezeler&desc=${encodedDesc}&companions=Limon%2C%20Roka%2C%20Soğan"
              ><span class="icon"
                ><img src="assets/baliksimgesi.png" alt=""
              /></span>
              Detay</a
            >
            </div>
          `;
          
            recommendedMezelerEl.appendChild(card);
          });
        }
      }
    }
    
    // products.json'dan ürün bilgilerini yükle (kalıcı kaynak) - ÖNCELİKLE
    (async function() {
      try {
      console.log('products.json yükleniyor (product detail)...');
      const response = await fetch('products.json?' + Date.now()); // Cache-busting
      if (response.ok) {
        const productsData = await response.json();
        console.log('products.json yüklendi:', productsData);
        
        // products.json'da bu kategori var mı kontrol et
        const hasCategory = productsData.categories && productsData.categories.includes(category);
        
        if (hasCategory && productsData.products && Array.isArray(productsData.products)) {
          // URL'den gelen name ve category ile ürünü bul (daha esnek eşleştirme)
          const product = productsData.products.find(p => {
            // İsim eşleştirmesi: tam eşleşme veya küçük harf eşleşmesi
            const nameMatch = p.name === name || 
                             p.name.toLowerCase() === name.toLowerCase() ||
                             p.name.toLowerCase().trim() === name.toLowerCase().trim();
            
            // Kategori eşleştirmesi
            const categoryMatch = p.category === category || 
                                 p.category.toLowerCase() === category.toLowerCase();
            
            return nameMatch && categoryMatch;
          });
          
          if (product) {
            // products.json'dan gelen veriyi kullan (daha güncel)
            console.log('✅ Ürün products.json\'dan bulundu:', product.name);
            name = product.name;
            category = product.category;
            desc = product.description || product.shortDesc || desc;
            companions = product.companions || companions;
            productIngredients = Array.isArray(product.ingredients) ? product.ingredients : null;
            
            // products.json'dan gelen resim yolunu kullan
            const imagePath = product.image || null;
            if (imagePath) {
              productImagePath = imagePath;
              console.log('✅ Resim yolu products.json\'dan alındı:', productImagePath);
            } else {
              console.warn('⚠️ Ürün resim yolu bulunamadı:', product.name);
            }
            
            // Sayfayı güncelle (resim yolu ile)
            updateProductPage(imagePath);
            return; // Başarılı yükleme, çık
          } else {
            console.warn('⚠️ Ürün products.json\'da bulunamadı:', { name, category });
            // Kategori varsa ama ürün yoksa, URL parametrelerini kullan
            if (hasCategory) {
              console.log('📋 Kategori mevcut ama ürün bulunamadı, URL parametreleri kullanılıyor');
            }
          }
        } else {
          console.warn('⚠️ products.json\'da kategori bulunamadı veya ürün listesi yok:', { category, hasCategory });
        }
      } else {
        console.error('❌ products.json yüklenemedi, HTTP status:', response.status);
      }
    } catch (e) {
      console.error('❌ Error loading products.json:', e);
    }
    
    // Hata durumunda veya ürün bulunamadığında URL parametreleri ile sayfayı güncelle
    console.log('📋 URL parametreleri ile sayfa güncelleniyor...');
    productIngredients = null;
    updateProductPage();
  })();
  }
})();

function companionImagePath(name){
  const slug = normalizeForFile(name);
  return `assets/companions/${slug}.jpg`;
}

function getMezeIngredients(mezeName) {
  if (window.MezeIngredients && typeof window.MezeIngredients.getDefaultIngredients === 'function') {
    return window.MezeIngredients.getDefaultIngredients(mezeName);
  }
  return null;
}

function normalizeForFile(text){
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-');
}