const fs = require('fs');
const path = require('path');

// Dosyaları oku
const changeLogPath = path.join(__dirname, 'data', 'change-log.json');
const productsPath = path.join(__dirname, 'data', 'products.json');

const changeLog = JSON.parse(fs.readFileSync(changeLogPath, 'utf8'));
const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Change-log'daki değişiklikleri parse et
function parseChangeDescription(description) {
  const changes = {
    name: null,
    price: null,
    companions: null,
    subcategory: null
  };

  if (!description) return changes;

  // İsim değişikliği: İsim: "X" → "Y"
  const nameMatch = description.match(/İsim:\s*"([^"]+)"\s*→\s*"([^"]+)"/);
  if (nameMatch) {
    changes.name = nameMatch[2];
  }

  // Fiyat değişikliği: Fiyat: ₺X → ₺Y
  const priceMatch = description.match(/Fiyat:\s*₺(\d+)\s*→\s*₺(\d+)/);
  if (priceMatch) {
    changes.price = priceMatch[2];
  }

  // Eşlikçiler değişikliği: Eşlikçiler: A, B → C, D
  const companionsMatch = description.match(/Eşlikçiler:\s*([^→]+)\s*→\s*([^|]+)/);
  if (companionsMatch) {
    const newCompanions = companionsMatch[2]
      .split(',')
      .map(c => c.trim())
      .filter(c => c && c !== '—');
    if (newCompanions.length > 0) {
      changes.companions = newCompanions;
    }
  }

  // Alt Kategori değişikliği: Alt Kategori: — → X
  const subcategoryMatch = description.match(/Alt Kategori:\s*[^→]+\s*→\s*([^|]+)/);
  if (subcategoryMatch) {
    const subcategory = subcategoryMatch[1].trim();
    if (subcategory && subcategory !== '—') {
      changes.subcategory = subcategory;
    } else {
      changes.subcategory = '';
    }
  }

  return changes;
}

// Ürünleri güncelle
let updatedCount = 0;
const notFoundProducts = [];

changeLog.entries.forEach(entry => {
  if (!entry.productName || !entry.description) return;

  const productName = entry.productName.trim();
  const changes = parseChangeDescription(entry.description);

  // Ürünü bul
  let product = productsData.products.find(p => p.name === productName);

  if (!product) {
    // Eski isimle de dene (isim değişikliği varsa)
    if (changes.name) {
      const oldNameMatch = entry.description.match(/İsim:\s*"([^"]+)"\s*→/);
      if (oldNameMatch) {
        const oldName = oldNameMatch[1];
        const productByOldName = productsData.products.find(p => p.name === oldName);
        if (productByOldName) {
          // Eski isimle bulundu, yeni isimle güncelle
          if (changes.name) productByOldName.name = changes.name;
          if (changes.price) productByOldName.price = changes.price;
          if (changes.companions) productByOldName.companions = changes.companions;
          if (changes.subcategory !== null) productByOldName.subcategory = changes.subcategory || '';
          updatedCount++;
          console.log(`✅ Güncellendi (isim değişti): "${oldName}" → "${changes.name || productName}"`);
          return;
        }
      }
    }
    
    // Özel durumlar: Kısaltılmış isimler
    let foundByAlias = false;
    if (productName === "D. Çupra Kavurma") {
      const aliasProduct = productsData.products.find(p => p.name === "Deniz Çupra Kavurma");
      if (aliasProduct) {
        product = aliasProduct;
        foundByAlias = true;
      }
    } else if (productName === "D. Levrek Kavurma") {
      const aliasProduct = productsData.products.find(p => p.name === "Deniz Levrek Kavurma");
      if (aliasProduct) {
        product = aliasProduct;
        foundByAlias = true;
      }
    } else if (productName === "Alabalık Ekmek") {
      // "Ekmek Arası Alabalık" olarak değiştirilmiş olabilir
      const aliasProduct = productsData.products.find(p => p.name === "Ekmek Arası Alabalık");
      if (aliasProduct) {
        product = aliasProduct;
        foundByAlias = true;
      }
    }
    
    if (!foundByAlias) {
      notFoundProducts.push(productName);
      console.log(`⚠️  Bulunamadı: "${productName}"`);
      return;
    }
  }

  // Değişiklikleri uygula
  let hasChanges = false;
  if (changes.name && product.name !== changes.name) {
    product.name = changes.name;
    hasChanges = true;
  }
  if (changes.price && product.price !== changes.price) {
    product.price = changes.price;
    hasChanges = true;
  }
  if (changes.companions) {
    product.companions = changes.companions;
    hasChanges = true;
  }
  if (changes.subcategory !== null && product.subcategory !== changes.subcategory) {
    product.subcategory = changes.subcategory || '';
    hasChanges = true;
  }

  if (hasChanges) {
    updatedCount++;
    console.log(`✅ Güncellendi: "${productName}"`);
  }
});

// Güncellenmiş products.json'u kaydet
fs.writeFileSync(productsPath, JSON.stringify(productsData, null, 2), 'utf8');

console.log(`\n📊 Özet:`);
console.log(`   ✅ Güncellenen ürün sayısı: ${updatedCount}`);
console.log(`   ⚠️  Bulunamayan ürün sayısı: ${notFoundProducts.length}`);
if (notFoundProducts.length > 0) {
  console.log(`\n   Bulunamayan ürünler:`);
  notFoundProducts.forEach(name => console.log(`      - ${name}`));
}
console.log(`\n✅ products.json güncellendi!`);

