(function (global) {
  const INGREDIENTS_MAP = {
    "Haydari": ["Yoğurt", "Sarımsak", "Ceviz", "Dereotu", "Zeytinyağı", "Tuz"],
    "Cacık": ["Yoğurt", "Salatalık", "Sarımsak", "Nane", "Zeytinyağı", "Tuz"],
    "Şakşuka": ["Patlıcan", "Biber", "Domates", "Sarımsak", "Zeytinyağı", "Tuz"],
    "Közlenmiş Patlıcan Salatası": ["Patlıcan", "Biber", "Sarımsak", "Zeytinyağı", "Limon", "Tuz"],
    "Muhammara": ["Kırmızı Biber", "Ceviz", "Ekmek", "Zeytinyağı", "Nar Ekşisi", "Tuz"],
    "Fava": ["Bakla", "Soğan", "Zeytinyağı", "Dereotu", "Limon", "Tuz"],
    "Zeytinyağlı Yaprak Sarma": ["Asma Yaprağı", "Pirinç", "Soğan", "Zeytinyağı", "Dereotu", "Tuz"],
    "Zeytinyağlı Barbunya": ["Barbunya", "Soğan", "Domates", "Zeytinyağı", "Havuç", "Tuz"],
    "Patlıcan Ezme": ["Patlıcan", "Biber", "Domates", "Sarımsak", "Zeytinyağı", "Limon"],
    "Acılı Ezme": ["Domates", "Biber", "Sarımsak", "Acı Biber", "Zeytinyağı", "Tuz"],
    "Yoğurtlu Semizotu": ["Semizotu", "Yoğurt", "Sarımsak", "Zeytinyağı", "Limon", "Tuz"],
    "Yoğurtlu Kabak": ["Kabak", "Yoğurt", "Sarımsak", "Dereotu", "Zeytinyağı", "Tuz"],
    "Zeytinyağlı Enginar": ["Enginar", "Soğan", "Havuç", "Zeytinyağı", "Limon", "Tuz"],
    "Havuç Tarator": ["Havuç", "Ceviz", "Sarımsak", "Ekmek", "Zeytinyağı", "Limon"],
    "Zeytinyağlı Taze Fasulye": ["Taze Fasulye", "Soğan", "Domates", "Zeytinyağı", "Tuz"],
    "Zeytinyağlı Kereviz": ["Kereviz", "Havuç", "Soğan", "Zeytinyağı", "Limon", "Tuz"],
    "Közlenmiş Kırmızı Biber Dolması": ["Kırmızı Biber", "Pirinç", "Soğan", "Zeytinyağı", "Fıstık", "Tuz"],
    "Zeytin Ezmesi": ["Siyah Zeytin", "Sarımsak", "Zeytinyağı", "Limon", "Kekik", "Tuz"],
    "Börülce Salatası": ["Börülce", "Soğan", "Zeytinyağı", "Limon", "Maydanoz", "Tuz"],
    "Zeytinyağlı Bakla": ["Bakla", "Soğan", "Dereotu", "Zeytinyağı", "Limon", "Tuz"],
    "Atom": ["Yoğurt", "Acı Biber", "Sarımsak", "Zeytinyağı", "Tuz"],
    "Babagannuş": ["Patlıcan", "Tahin", "Sarımsak", "Limon", "Zeytinyağı", "Tuz"],
    "Girit Ezmesi": ["Patlıcan", "Biber", "Domates", "Sarımsak", "Zeytinyağı", "Kekik"],
    "Deniz Börülcesi": ["Deniz Börülcesi", "Sarımsak", "Zeytinyağı", "Limon", "Tuz"],
    "Yoğurtlu Pancar": ["Pancar", "Yoğurt", "Sarımsak", "Zeytinyağı", "Limon", "Tuz"],
    "Yoğurtlu Patates Salatası": ["Patates", "Yoğurt", "Sarımsak", "Zeytinyağı", "Maydanoz", "Tuz"],
    "Kabak Borani": ["Kabak", "Yoğurt", "Sarımsak", "Dereotu", "Zeytinyağı", "Tuz"],
    "Yoğurtlu Havuç": ["Havuç", "Yoğurt", "Sarımsak", "Zeytinyağı", "Limon", "Tuz"],
    "Tahinli Patlıcan": ["Patlıcan", "Tahin", "Sarımsak", "Limon", "Zeytinyağı", "Tuz"],
    "Sarımsaklı Yoğurtlu Mantar": ["Mantar", "Yoğurt", "Sarımsak", "Zeytinyağı", "Dereotu", "Tuz"],
    "Kısır": ["Bulgur", "Domates", "Soğan", "Maydanoz", "Zeytinyağı", "Nar Ekşisi"],
    "Patates Salatası": ["Patates", "Soğan", "Maydanoz", "Zeytinyağı", "Limon", "Tuz"],
    "Gavurdağı Salatası": ["Domates", "Biber", "Soğan", "Ceviz", "Nar Ekşisi", "Zeytinyağı"],
    "Arnavut Ciğeri": ["Dana Ciğeri", "Soğan", "Biber", "Zeytinyağı", "Limon", "Kırmızı Biber"],
    "Mercimek Köftesi": ["Kırmızı Mercimek", "Bulgur", "Soğan", "Maydanoz", "Nar Ekşisi", "Zeytinyağı"],
    "Zeytinyağlı Pırasa": ["Pırasa", "Havuç", "Soğan", "Zeytinyağı", "Limon", "Tuz"],
    "Zeytinyağlı Patlıcan": ["Patlıcan", "Soğan", "Domates", "Zeytinyağı", "Biber", "Tuz"],
    "Zeytinyağlı Kabak": ["Kabak", "Soğan", "Domates", "Zeytinyağı", "Dereotu", "Tuz"],
    "Börülce Piyazı": ["Börülce", "Soğan", "Maydanoz", "Zeytinyağı", "Limon", "Tuz"],
    "Yeşil Mercimek Salatası": ["Yeşil Mercimek", "Soğan", "Maydanoz", "Zeytinyağı", "Limon", "Tuz"],
    "Karides Güveç": ["Karides", "Sarımsak", "Domates", "Biber", "Zeytinyağı", "Tuz"],
    "Ahtapot Salatası": ["Ahtapot", "Soğan", "Maydanoz", "Zeytinyağı", "Limon", "Tuz"],
    "Kalamar Tava": ["Kalamar", "Un", "Yumurta", "Zeytinyağı", "Limon", "Tuz"],
    "Midye Dolma": ["Midye", "Pirinç", "Soğan", "Zeytinyağı", "Dereotu", "Baharat"],
    "Lakerda": ["Lüfer", "Tuz", "Zeytinyağı", "Limon", "Soğan"],
    "Hamsi Marine": ["Hamsi", "Zeytinyağı", "Limon", "Sarımsak", "Kekik", "Tuz"],
    "Levrek Marin": ["Levrek", "Zeytinyağı", "Limon", "Sarımsak", "Dereotu", "Tuz"],
    "Tarama (Balık Yumurtası Ezmesi)": ["Balık Yumurtası", "Ekmek", "Limon", "Zeytinyağı", "Sarımsak"],
    "Balık Köftesi": ["Balık", "Soğan", "Ekmek", "Yumurta", "Baharat", "Tuz"],
    "Deniz Mahsullü": ["Karides", "Kalamar", "Ahtapot", "Zeytinyağı", "Limon", "Sarımsak"]
  };

  function capitalizeWords(value) {
    return value
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  function formatIngredientValue(value) {
    if (!value) return '';
    return capitalizeWords(value.trim());
  }

  function formatIngredientsList(list) {
    if (!Array.isArray(list)) return [];
    return list
      .map(formatIngredientValue)
      .filter(Boolean);
  }

  function parseIngredientsInput(value) {
    if (!value || typeof value !== 'string') return [];
    return value
      .split(',')
      .map(formatIngredientValue)
      .filter(Boolean);
  }

  function getDefaultIngredients(name) {
    if (!name || typeof name !== 'string') return null;
    const key = Object.keys(INGREDIENTS_MAP).find(k => k.toLowerCase() === name.toLowerCase());
    if (!key) return null;
    return [...INGREDIENTS_MAP[key]];
  }

  global.MezeIngredients = {
    getDefaultIngredients,
    formatIngredientsList,
    parseIngredientsInput
  };
})(typeof window !== 'undefined' ? window : globalThis);

