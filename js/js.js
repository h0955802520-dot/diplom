/* ===========================================================================
 * БУДМАЙСТЕР — main JS bundle
 * ---------------------------------------------------------------------------
 * Структура файлу (за порядком згори донизу):
 *
 *  1. БАЗА ТОВАРІВ (productsData) — 100 SKU + IMG-словник Unsplash URL
 *  2. СТАН — cart / wishlist / recentlyViewed із localStorage
 *  3. КОНСТАНТИ — PROMO_CODES, FREE_DELIVERY_THRESHOLD, MIN_ORDER
 *  4. КОШИК — addToCart / updateCartBadge
 *  5. ОБРАНЕ — toggleWishlist / updateWishlistBadge
 *  6. НЕЩОДАВНО ПЕРЕГЛЯНУТІ — addToRecent
 *  7. TOAST — повідомлення внизу праворуч (showToast)
 *  8. КАРТКА ТОВАРУ HTML — productCardHTML(p) → string
 *  9. ПОШУК — handleSearch (header-форма) + initLiveSearch (live-dropdown)
 * 10. КОШИКОВІ — closeModal / processContactForm / processCheckout
 * 11. РЕНДЕР ГОЛОВНОЇ — renderHomeSections + switchProductTab (табы)
 * 12. HERO SLIDER — heroGoTo / heroNext / heroPrev / автозміна 6с
 * 13. MEGA MENU — toggleMegaMenu / closeMegaMenu
 * 14. MOBILE NAV — openMobileNav / closeMobileNav
 * 15. AUTH MODAL — openAuthModal / closeAuthModal / switchAuthTab /
 *                  switchRegMethod / submitLogin / submitRegister (заглушки)
 * 16. КАТАЛОГ — renderShop (з фільтрами та пагінацією) + goToPage
 * 17. ТОВАР — renderProductPage / changeProdQty / addProductToCart / switchTab
 * 18. resetFilters — скидання усіх фільтрів каталогу
 * 19. КАЛЬКУЛЯТОР — setCalcType / calcMaterials (4 типи робіт)
 * 20. NEWSLETTER — subscribeNewsletter (заглушка)
 * 21. MASKS / SCROLL-TOP / ESC-CLOSE — UI helpers
 * 22. БЛОГ — BLOG_POSTS array + renderBlogList / filterBlogCat / renderArticlePage
 * 23. INJECT HEADER/FOOTER — динамічна вставка шапки і підвалу на всі сторінки
 * 24. DOMContentLoaded handler — оркеструє ініціалізацію
 *
 * Persistence — localStorage ключі: budMasterCart, budMasterWishlist,
 * budMasterRecent, budMasterPromo. Готово до заміни на REST API на бекенді.
 * =========================================================================== */

// ============================================
// 1. БАЗА ТОВАРІВ (100 позицій)
// ============================================
const IMG = {
    cement:   'https://images.unsplash.com/photo-1607582544501-71f5b3ce3a4e?auto=format&fit=crop&w=600&q=80',
    brick:    'https://images.unsplash.com/photo-1530686577008-d6dd54e83b40?auto=format&fit=crop&w=600&q=80',
    block:    'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
    tool:     'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=80',
    drill:    'https://images.unsplash.com/photo-1426927308491-6380b6a9936f?auto=format&fit=crop&w=600&q=80',
    grinder:  'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80',
    paint:    'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80',
    primer:   'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?auto=format&fit=crop&w=600&q=80',
    putty:    'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80',
    metal:    'https://images.unsplash.com/photo-1517232117160-a51e4c1d3275?auto=format&fit=crop&w=600&q=80',
    rebar:    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    electric: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80',
    cable:    'https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=600&q=80',
    drywall:  'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
    site:     'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
    vacuum:   'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&q=80',
    measure:  'https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=600&q=80',
    glue:     'https://images.unsplash.com/photo-1581092249320-1e8c2c2d9d99?auto=format&fit=crop&w=600&q=80'
};

const productsData = [
    // ЦЕМЕНТ ТА СУМІШІ (1-15)
    { id:'1',  name:'Цемент ПЦ-500 Д0 Knauf, 25 кг',           price:220,  oldPrice:260, type:'cement', category:'construction', age:'medium', brand:'knauf',   stock:340, promo:true,  popular:true,  isNew:false, img:IMG.cement },
    { id:'2',  name:'Цемент ПЦ-400 Д20 Heidelberg, 25 кг',     price:185,  type:'cement', category:'construction', age:'medium', brand:'other',   stock:520, promo:false, popular:true,  isNew:false, img:IMG.cement },
    { id:'3',  name:'Білий цемент Aalborg, 25 кг',             price:480,  type:'cement', category:'finishing',    age:'medium', brand:'other',   stock:80,  promo:false, popular:false, isNew:false, img:IMG.cement },
    { id:'4',  name:'Клей плитковий Ceresit CM 11, 25 кг',     price:320,  type:'cement', category:'finishing',    age:'medium', brand:'ceresit', stock:210, promo:false, popular:true,  isNew:false, img:IMG.glue },
    { id:'5',  name:'Клей плитковий Ceresit CM 17, 25 кг',     price:480,  oldPrice:560, type:'cement', category:'finishing',    age:'medium', brand:'ceresit', stock:140, promo:true,  popular:false, isNew:false, img:IMG.glue },
    { id:'6',  name:'Шпаклівка Knauf Rotband Pasta, 18 кг',    price:580,  type:'cement', category:'finishing',    age:'medium', brand:'knauf',   stock:95,  promo:false, popular:false, isNew:true,  img:IMG.putty },
    { id:'7',  name:'Шпаклівка стартова Knauf HP Start, 30 кг',price:340,  type:'cement', category:'finishing',    age:'large',  brand:'knauf',   stock:160, promo:false, popular:false, isNew:false, img:IMG.putty },
    { id:'8',  name:'Шпаклівка фінішна Knauf HP Finish, 25 кг',price:380,  type:'cement', category:'finishing',    age:'medium', brand:'knauf',   stock:175, promo:false, popular:true,  isNew:false, img:IMG.putty },
    { id:'9',  name:'Гіпсова штукатурка Knauf Rotband, 30 кг', price:420,  oldPrice:490, type:'cement', category:'finishing',    age:'large',  brand:'knauf',   stock:230, promo:true,  popular:true,  isNew:false, img:IMG.putty },
    { id:'10', name:'Цементно-піщана суміш Ceresit, 25 кг',    price:180,  type:'cement', category:'construction', age:'medium', brand:'ceresit', stock:400, promo:false, popular:false, isNew:false, img:IMG.cement },
    { id:'11', name:'Самовирівнююча підлога Henkel, 25 кг',    price:520,  type:'cement', category:'finishing',    age:'medium', brand:'henkel',  stock:110, promo:false, popular:false, isNew:true,  img:IMG.cement },
    { id:'12', name:'Розчинна суміш для кладки М-100, 25 кг',  price:165,  type:'cement', category:'construction', age:'medium', brand:'other',   stock:380, promo:false, popular:false, isNew:false, img:IMG.cement },
    { id:'13', name:'Гідроізоляція цементна Ceresit CR 65',    price:680,  type:'cement', category:'construction', age:'medium', brand:'ceresit', stock:60,  promo:false, popular:false, isNew:false, img:IMG.cement },
    { id:'14', name:'Декоративна штукатурка короїд Sniezka',   price:850,  type:'cement', category:'finishing',    age:'medium', brand:'sniezka', stock:75,  promo:false, popular:false, isNew:true,  img:IMG.putty },
    { id:'15', name:'Клей для газоблоку Knauf, 25 кг',         price:295,  type:'cement', category:'construction', age:'medium', brand:'knauf',   stock:185, promo:false, popular:false, isNew:false, img:IMG.cement },

    // ЦЕГЛА ТА БЛОКИ (16-28)
    { id:'16', name:'Цегла червона повнотіла М-150',           price:18,   type:'brick',  category:'construction', age:'medium', brand:'other', stock:12500, promo:false, popular:true,  isNew:false, img:IMG.brick },
    { id:'17', name:'Цегла силікатна біла М-200',              price:14,   type:'brick',  category:'construction', age:'medium', brand:'other', stock:8800,  promo:false, popular:false, isNew:false, img:IMG.brick },
    { id:'18', name:'Цегла лицьова клінкерна Roben',           price:42,   oldPrice:52,  type:'brick', category:'finishing',    age:'medium', brand:'other', stock:3200,  promo:true,  popular:false, isNew:false, img:IMG.brick },
    { id:'19', name:'Газоблок AEROC EcoTerm 400x200x600',      price:95,   type:'brick',  category:'construction', age:'large',  brand:'other', stock:2400,  promo:false, popular:true,  isNew:false, img:IMG.block },
    { id:'20', name:'Газоблок UDK 300x200x600',                price:78,   type:'brick',  category:'construction', age:'large',  brand:'other', stock:3100,  promo:false, popular:false, isNew:false, img:IMG.block },
    { id:'21', name:'Газоблок Стоунлайт 200x200x600',          price:62,   oldPrice:72,  type:'brick', category:'construction', age:'large',  brand:'other', stock:4500,  promo:true,  popular:false, isNew:false, img:IMG.block },
    { id:'22', name:'Шлакоблок 390x190x190',                   price:28,   type:'brick',  category:'construction', age:'large',  brand:'other', stock:6800,  promo:false, popular:false, isNew:false, img:IMG.block },
    { id:'23', name:'Керамоблок Porotherm 38 P+W',             price:165,  type:'brick',  category:'construction', age:'large',  brand:'other', stock:1850,  promo:false, popular:false, isNew:false, img:IMG.brick },
    { id:'24', name:'Керамоблок Porotherm 25 P+W',             price:128,  type:'brick',  category:'construction', age:'large',  brand:'other', stock:2300,  promo:false, popular:false, isNew:true,  img:IMG.brick },
    { id:'25', name:'Цегла вогнетривка ШБ-5',                  price:48,   type:'brick',  category:'construction', age:'medium', brand:'other', stock:1450,  promo:false, popular:false, isNew:false, img:IMG.brick },
    { id:'26', name:'Цегла декоративна гіперпресована',        price:22,   type:'brick',  category:'finishing',    age:'medium', brand:'other', stock:5600,  promo:false, popular:false, isNew:true,  img:IMG.brick },
    { id:'27', name:'Пінобетонний блок D500 200x300x600',      price:58,   type:'brick',  category:'construction', age:'large',  brand:'other', stock:4200,  promo:false, popular:false, isNew:false, img:IMG.block },
    { id:'28', name:'Цегла рваний камінь, рустікальна',        price:35,   oldPrice:42,  type:'brick', category:'finishing',    age:'medium', brand:'other', stock:2800,  promo:true,  popular:false, isNew:false, img:IMG.brick },

    // ІНСТРУМЕНТ (29-55)
    { id:'29', name:'Перфоратор Bosch GBH 2-26 SDS-plus',      price:5499, oldPrice:6299, type:'tool', category:'construction', age:'medium', brand:'bosch',  stock:18,  promo:true,  popular:true,  isNew:false, img:IMG.drill },
    { id:'30', name:'Перфоратор Makita HR2470, 780 Вт',        price:4850, type:'tool',   category:'construction', age:'medium', brand:'makita',  stock:24,  promo:false, popular:true,  isNew:false, img:IMG.drill },
    { id:'31', name:'Перфоратор DeWalt D25133K, SDS-plus',     price:5899, type:'tool',   category:'construction', age:'medium', brand:'dewalt',  stock:12,  promo:false, popular:false, isNew:true,  img:IMG.drill },
    { id:'32', name:'Дриль ударний Makita HP1631, 710 Вт',     price:2899, oldPrice:3450, type:'tool', category:'construction', age:'small',  brand:'makita',  stock:36,  promo:true,  popular:false, isNew:false, img:IMG.drill },
    { id:'33', name:'Дриль безударний Bosch GBM 6 RE',         price:1850, type:'tool',   category:'construction', age:'small',  brand:'bosch',   stock:48,  promo:false, popular:false, isNew:false, img:IMG.drill },
    { id:'34', name:'Шуруповерт акум. Bosch GSR 12V-15',       price:3199, type:'tool',   category:'construction', age:'small',  brand:'bosch',   stock:42,  promo:false, popular:true,  isNew:false, img:IMG.drill },
    { id:'35', name:'Шуруповерт акум. Makita DDF482',          price:4250, oldPrice:4990, type:'tool', category:'construction', age:'small',  brand:'makita',  stock:28,  promo:true,  popular:false, isNew:false, img:IMG.drill },
    { id:'36', name:'Шуруповерт DeWalt DCD771, 18V',           price:5599, type:'tool',   category:'construction', age:'small',  brand:'dewalt',  stock:15,  promo:false, popular:false, isNew:true,  img:IMG.drill },
    { id:'37', name:'Болгарка DeWalt DWE4257, 1500 Вт',        price:4250, oldPrice:4900, type:'tool', category:'construction', age:'medium', brand:'dewalt',  stock:22,  promo:true,  popular:true,  isNew:false, img:IMG.grinder },
    { id:'38', name:'Болгарка Makita 9558HN, 840 Вт, 125 мм',  price:2150, type:'tool',   category:'construction', age:'small',  brand:'makita',  stock:55,  promo:false, popular:true,  isNew:false, img:IMG.grinder },
    { id:'39', name:'Болгарка Bosch GWS 750-125',              price:2480, type:'tool',   category:'construction', age:'small',  brand:'bosch',   stock:38,  promo:false, popular:false, isNew:false, img:IMG.grinder },
    { id:'40', name:'Болгарка Hilti AG 125-A22, акум.',        price:8950, type:'tool',   category:'construction', age:'medium', brand:'hilti',   stock:8,   promo:false, popular:false, isNew:true,  img:IMG.grinder },
    { id:'41', name:'Лобзик Bosch PST 700 E, 500 Вт',          price:1850, type:'tool',   category:'construction', age:'small',  brand:'bosch',   stock:32,  promo:false, popular:false, isNew:false, img:IMG.tool },
    { id:'42', name:'Циркулярна пила Makita 5008MG, 210 мм',   price:7299, oldPrice:8450, type:'tool', category:'construction', age:'medium', brand:'makita',  stock:14,  promo:true,  popular:false, isNew:false, img:IMG.tool },
    { id:'43', name:'Пилосос будівельний Makita VC2512L',      price:5499, type:'tool',   category:'construction', age:'large',  brand:'makita',  stock:11,  promo:false, popular:false, isNew:false, img:IMG.vacuum },
    { id:'44', name:'Пилосос Bosch GAS 18V-10 L, акум.',       price:7899, type:'tool',   category:'construction', age:'large',  brand:'bosch',   stock:9,   promo:false, popular:false, isNew:true,  img:IMG.vacuum },
    { id:'45', name:'Молоток слюсарний 500 г, фіберглас',      price:280,  type:'tool',   category:'construction', age:'small',  brand:'stanley', stock:120, promo:false, popular:false, isNew:false, img:IMG.tool },
    { id:'46', name:'Кувалда 3 кг з фіберглас. ручкою',        price:580,  type:'tool',   category:'construction', age:'medium', brand:'stanley', stock:65,  promo:false, popular:false, isNew:false, img:IMG.tool },
    { id:'47', name:'Набір ключів комбінованих, 12 шт',        price:650,  type:'tool',   category:'construction', age:'small',  brand:'stanley', stock:78,  promo:false, popular:false, isNew:false, img:IMG.tool },
    { id:'48', name:'Набір викруток Stanley FatMax, 8 шт',     price:780,  oldPrice:920,  type:'tool', category:'construction', age:'small',  brand:'stanley', stock:52,  promo:true,  popular:false, isNew:false, img:IMG.tool },
    { id:'49', name:'Рулетка Stanley FatMax 5 м',              price:320,  type:'tool',   category:'construction', age:'small',  brand:'stanley', stock:140, promo:false, popular:false, isNew:false, img:IMG.measure },
    { id:'50', name:'Рулетка Bosch Zamo III, лазерна 20 м',    price:2499, type:'tool',   category:'construction', age:'small',  brand:'bosch',   stock:38,  promo:false, popular:true,  isNew:true,  img:IMG.measure },
    { id:'51', name:'Лазерний рівень Bosch GLL 2-15 G',        price:5899, oldPrice:6800, type:'tool', category:'construction', age:'small',  brand:'bosch',   stock:14,  promo:true,  popular:false, isNew:false, img:IMG.measure },
    { id:'52', name:'Будівельний рівень Stanley FatMax, 60 см',price:480,  type:'tool',   category:'construction', age:'small',  brand:'stanley', stock:88,  promo:false, popular:false, isNew:false, img:IMG.measure },
    { id:'53', name:'Степлер механічний Stanley TR250',        price:550,  type:'tool',   category:'construction', age:'small',  brand:'stanley', stock:72,  promo:false, popular:false, isNew:false, img:IMG.tool },
    { id:'54', name:'Шліфмашина Bosch PSS 250 AE',             price:2399, type:'tool',   category:'finishing',    age:'small',  brand:'bosch',   stock:26,  promo:false, popular:false, isNew:false, img:IMG.tool },
    { id:'55', name:'Тепловентилятор Hilti CT 10000',          price:8400, type:'tool',   category:'construction', age:'large',  brand:'hilti',   stock:6,   promo:false, popular:false, isNew:true,  img:IMG.tool },

    // ФАРБИ ТА ЛАКИ (56-72)
    { id:'56', name:'Фарба інтер\'єрна Sniezka Eco, 10 л',     price:850,  type:'paint', category:'finishing',    age:'medium', brand:'sniezka', stock:88,  promo:false, popular:true,  isNew:false, img:IMG.paint },
    { id:'57', name:'Фарба фасадна Sniezka Acryl-Putz, 10 л',  price:1250, oldPrice:1450, type:'paint', category:'finishing',    age:'medium', brand:'sniezka', stock:64,  promo:true,  popular:false, isNew:false, img:IMG.paint },
    { id:'58', name:'Фарба латексна Henkel Ceresit, 5 л',      price:680,  type:'paint', category:'finishing',    age:'medium', brand:'henkel',  stock:95,  promo:false, popular:false, isNew:false, img:IMG.paint },
    { id:'59', name:'Емаль алкідна ПФ-115 біла, 2.8 кг',       price:340,  type:'paint', category:'finishing',    age:'small',  brand:'other',   stock:160, promo:false, popular:true,  isNew:false, img:IMG.paint },
    { id:'60', name:'Лак паркетний Sniezka Supermal, 5 л',     price:1100, oldPrice:1300, type:'paint', category:'finishing',    age:'medium', brand:'sniezka', stock:42,  promo:true,  popular:false, isNew:false, img:IMG.paint },
    { id:'61', name:'Лак яхтний Sniezka, 2.5 л',               price:780,  type:'paint', category:'finishing',    age:'small',  brand:'sniezka', stock:58,  promo:false, popular:false, isNew:false, img:IMG.paint },
    { id:'62', name:'Грунтовка глибокого проникнення, 10 л',   price:480,  type:'paint', category:'finishing',    age:'medium', brand:'henkel',  stock:120, promo:false, popular:true,  isNew:false, img:IMG.primer },
    { id:'63', name:'Грунтовка-концентрат Ceresit CT 17, 10 л',price:550,  type:'paint', category:'finishing',    age:'medium', brand:'ceresit', stock:98,  promo:false, popular:false, isNew:false, img:IMG.primer },
    { id:'64', name:'Грунтовка адгезійна Knauf Betokontakt',   price:680,  type:'paint', category:'finishing',    age:'medium', brand:'knauf',   stock:74,  promo:false, popular:false, isNew:true,  img:IMG.primer },
    { id:'65', name:'Антисептик деревозахисний Sniezka, 5 л',  price:580,  type:'paint', category:'finishing',    age:'medium', brand:'sniezka', stock:82,  promo:false, popular:false, isNew:false, img:IMG.paint },
    { id:'66', name:'Колер-паста Sniezka, 100 мл',             price:65,   type:'paint', category:'finishing',    age:'small',  brand:'sniezka', stock:340, promo:false, popular:false, isNew:false, img:IMG.paint },
    { id:'67', name:'Розчинник 646 ГОСТ, 1 л',                 price:85,   type:'paint', category:'finishing',    age:'small',  brand:'other',   stock:280, promo:false, popular:false, isNew:false, img:IMG.paint },
    { id:'68', name:'Уайт-спірит Sniezka, 0.9 л',              price:75,   type:'paint', category:'finishing',    age:'small',  brand:'sniezka', stock:310, promo:false, popular:false, isNew:false, img:IMG.paint },
    { id:'69', name:'Емаль молоткова Hammerite, 2.5 л',        price:1450, oldPrice:1690, type:'paint', category:'finishing',    age:'small',  brand:'other',   stock:48,  promo:true,  popular:false, isNew:true,  img:IMG.paint },
    { id:'70', name:'Силіконова фарба фасадна Ceresit, 10 л',  price:1890, type:'paint', category:'finishing',    age:'medium', brand:'ceresit', stock:32,  promo:false, popular:false, isNew:true,  img:IMG.paint },
    { id:'71', name:'Декоративна фарба під шовк Sniezka, 5 л', price:1280, type:'paint', category:'finishing',    age:'medium', brand:'sniezka', stock:38,  promo:false, popular:false, isNew:false, img:IMG.paint },
    { id:'72', name:'Лак для каменю Ceresit CT 13, 5 л',       price:1150, type:'paint', category:'finishing',    age:'medium', brand:'ceresit', stock:44,  promo:false, popular:false, isNew:false, img:IMG.paint },

    // МЕТАЛОПРОКАТ (73-83)
    { id:'73', name:'Арматура А500С, 12 мм, 11.7 м',           price:320,  type:'metal',  category:'construction', age:'large',  brand:'other', stock:1240, promo:false, popular:true,  isNew:false, img:IMG.rebar },
    { id:'74', name:'Арматура А500С, 10 мм, 11.7 м',           price:235,  type:'metal',  category:'construction', age:'large',  brand:'other', stock:1580, promo:false, popular:false, isNew:false, img:IMG.rebar },
    { id:'75', name:'Арматура А500С, 14 мм, 11.7 м',           price:435,  type:'metal',  category:'construction', age:'large',  brand:'other', stock:980,  promo:false, popular:false, isNew:false, img:IMG.rebar },
    { id:'76', name:'Профіль металевий CD-60 Knauf, 3 м',      price:145,  type:'metal',  category:'finishing',    age:'medium', brand:'knauf', stock:680,  promo:false, popular:true,  isNew:false, img:IMG.metal },
    { id:'77', name:'Профіль UD-27 Knauf, 3 м',                price:95,   type:'metal',  category:'finishing',    age:'medium', brand:'knauf', stock:840,  promo:false, popular:false, isNew:false, img:IMG.metal },
    { id:'78', name:'Куточок металевий 50x50x5, 6 м',          price:680,  type:'metal',  category:'construction', age:'large',  brand:'other', stock:160,  promo:false, popular:false, isNew:false, img:IMG.metal },
    { id:'79', name:'Труба профільна 40x40x2, 6 м',            price:580,  oldPrice:680, type:'metal', category:'construction', age:'large',  brand:'other', stock:240,  promo:true,  popular:false, isNew:false, img:IMG.metal },
    { id:'80', name:'Лист оцинкований 1x2 м, 0.5 мм',          price:780,  type:'metal',  category:'construction', age:'large',  brand:'other', stock:180,  promo:false, popular:false, isNew:false, img:IMG.metal },
    { id:'81', name:'Сітка зварна 50x50, 1.5x2 м',             price:480,  type:'metal',  category:'construction', age:'large',  brand:'other', stock:320,  promo:false, popular:false, isNew:false, img:IMG.metal },
    { id:'82', name:'Цвях будівельний 100 мм, 5 кг',           price:280,  type:'metal',  category:'construction', age:'medium', brand:'other', stock:420,  promo:false, popular:false, isNew:false, img:IMG.metal },
    { id:'83', name:'Саморіз по металу 4.2x16, 1000 шт',       price:185,  type:'metal',  category:'finishing',    age:'small',  brand:'other', stock:560,  promo:false, popular:false, isNew:false, img:IMG.metal },

    // ЕЛЕКТРИКА (84-94)
    { id:'84', name:'Кабель ВВГ 3х2.5, 100 м',                 price:2400, oldPrice:2750, type:'electric', category:'construction', age:'large',  brand:'other',     stock:42,  promo:true,  popular:true,  isNew:false, img:IMG.cable },
    { id:'85', name:'Кабель ВВГ 3х1.5, 100 м',                 price:1680, type:'electric', category:'construction', age:'large',  brand:'other',     stock:56,  promo:false, popular:true,  isNew:false, img:IMG.cable },
    { id:'86', name:'Кабель ВВГ 3х4, 100 м',                   price:3850, type:'electric', category:'construction', age:'large',  brand:'other',     stock:28,  promo:false, popular:false, isNew:false, img:IMG.cable },
    { id:'87', name:'Розетка з заземленням Schneider Electric',price:165,  oldPrice:210,  type:'electric', category:'finishing',    age:'small',  brand:'schneider', stock:340, promo:true,  popular:false, isNew:false, img:IMG.electric },
    { id:'88', name:'Вимикач 1-кл. Schneider Sedna',           price:145,  type:'electric', category:'finishing',    age:'small',  brand:'schneider', stock:280, promo:false, popular:false, isNew:false, img:IMG.electric },
    { id:'89', name:'Вимикач 2-кл. Schneider Asfora',          price:185,  type:'electric', category:'finishing',    age:'small',  brand:'schneider', stock:240, promo:false, popular:false, isNew:false, img:IMG.electric },
    { id:'90', name:'Автомат 1P 16A Schneider Easy 9',         price:120,  type:'electric', category:'construction', age:'small',  brand:'schneider', stock:420, promo:false, popular:true,  isNew:false, img:IMG.electric },
    { id:'91', name:'УЗО Schneider 2P 25A 30mA',               price:580,  type:'electric', category:'construction', age:'small',  brand:'schneider', stock:96,  promo:false, popular:false, isNew:true,  img:IMG.electric },
    { id:'92', name:'Щит розподільчий на 12 модулів',          price:780,  type:'electric', category:'construction', age:'medium', brand:'schneider', stock:54,  promo:false, popular:false, isNew:false, img:IMG.electric },
    { id:'93', name:'LED-світильник стельовий 18 Вт',          price:280,  type:'electric', category:'finishing',    age:'small',  brand:'other',     stock:185, promo:false, popular:false, isNew:true,  img:IMG.electric },
    { id:'94', name:'Прожектор LED 50 Вт IP65',                price:680,  oldPrice:820,  type:'electric', category:'construction', age:'small',  brand:'other',     stock:78,  promo:true,  popular:false, isNew:true,  img:IMG.electric },

    // ОЗДОБЛЕННЯ (95-100)
    { id:'95',  name:'Гіпсокартон Knauf вологостійкий 12.5 мм', price:380,  type:'finishing', category:'finishing', age:'large',  brand:'knauf', stock:340, promo:false, popular:true,  isNew:false, img:IMG.drywall },
    { id:'96',  name:'Гіпсокартон Knauf стандарт 9.5 мм',       price:280,  type:'finishing', category:'finishing', age:'large',  brand:'knauf', stock:520, promo:false, popular:false, isNew:false, img:IMG.drywall },
    { id:'97',  name:'Утеплювач мінвата Knauf, 100 мм, 5 м²',   price:680,  oldPrice:780, type:'finishing', category:'finishing', age:'large',  brand:'knauf', stock:240, promo:true,  popular:true,  isNew:false, img:IMG.drywall },
    { id:'98',  name:'Пінопласт ПСБ-С 25, 50 мм, 1x1 м',        price:185,  type:'finishing', category:'finishing', age:'medium', brand:'other', stock:680, promo:false, popular:false, isNew:false, img:IMG.drywall },
    { id:'99',  name:'Сітка штукатурна склотканина, 50 м²',     price:480,  type:'finishing', category:'finishing', age:'medium', brand:'other', stock:160, promo:false, popular:false, isNew:false, img:IMG.drywall },
    { id:'100', name:'Підвіс прямий для CD-профілю, 100 шт',    price:120,  type:'finishing', category:'finishing', age:'small',  brand:'knauf', stock:420, promo:false, popular:false, isNew:false, img:IMG.metal }
];

// ============================================
// СТАН: КОШИК / ВИБРАНІ / ПЕРЕГЛЯНУТІ
// ============================================
let cart = JSON.parse(localStorage.getItem('budMasterCart')) || [];
let wishlist = JSON.parse(localStorage.getItem('budMasterWishlist')) || [];
let recentlyViewed = JSON.parse(localStorage.getItem('budMasterRecent')) || [];

const PROMO_CODES = {
    'BUD10':    { type: 'percent', value: 10, label: '-10%' },
    'BUD500':   { type: 'fixed',   value: 500, label: '-500 грн' },
    'NEW2026':  { type: 'percent', value: 15, label: '-15%' }
};

const FREE_DELIVERY_THRESHOLD = 5000;
const MIN_ORDER = 300;

// ============================================
// КОШИК
// ============================================
function updateCartBadge() {
    const counts = document.querySelectorAll('.cart-count');
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    counts.forEach(c => {
        c.textContent = total;
        c.style.transform = 'scale(1.5)';
        setTimeout(() => c.style.transform = 'scale(1)', 200);
    });
}

function addToCart(id, qty) {
    const product = productsData.find(p => p.id === id);
    if (!product) return;
    const quantity = qty || 1;

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) { existingItem.quantity += quantity; }
    else { cart.push({ ...product, quantity }); }
    localStorage.setItem('budMasterCart', JSON.stringify(cart));
    updateCartBadge();
    showToast(`«${product.name}» додано в кошик`);
}

// ============================================
// ВИБРАНЕ
// ============================================
function updateWishlistBadge() {
    const counts = document.querySelectorAll('.wishlist-count');
    counts.forEach(c => c.textContent = wishlist.length);
}

function toggleWishlist(id, event) {
    if (event) { event.stopPropagation(); event.preventDefault(); }
    const idx = wishlist.indexOf(id);
    if (idx > -1) { wishlist.splice(idx, 1); }
    else { wishlist.push(id); }
    localStorage.setItem('budMasterWishlist', JSON.stringify(wishlist));
    updateWishlistBadge();
    document.querySelectorAll(`.wish-btn[data-id="${id}"]`).forEach(btn => {
        btn.classList.toggle('active', wishlist.includes(id));
    });
}

// ============================================
// НЕЩОДАВНО ПЕРЕГЛЯНУТІ
// ============================================
function addToRecent(id) {
    recentlyViewed = recentlyViewed.filter(x => x !== id);
    recentlyViewed.unshift(id);
    if (recentlyViewed.length > 8) recentlyViewed = recentlyViewed.slice(0, 8);
    localStorage.setItem('budMasterRecent', JSON.stringify(recentlyViewed));
}

// ============================================
// TOAST
// ============================================
function showToast(text) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa fa-check-circle"></i> ${text}`;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ============================================
// КАРТКА ТОВАРУ (HTML)
// ============================================
function productCardHTML(p) {
    const inWish = wishlist.includes(p.id);
    const stockClass = p.stock > 50 ? 'in-stock' : (p.stock > 0 ? 'low-stock' : 'no-stock');
    const stockLabel = p.stock > 50 ? `В наявності` : (p.stock > 0 ? `Закінчується (${p.stock} шт)` : 'Немає в наявності');
    return `
        <div class="product-card">
            ${p.promo ? '<span class="discount-badge">ЗНИЖКА</span>' : ''}
            ${p.popular ? '<span class="popular-badge">ХІТ</span>' : ''}
            ${p.isNew && !p.popular ? '<span class="new-badge">НОВИНКА</span>' : ''}
            <button class="wish-btn ${inWish ? 'active' : ''}" data-id="${p.id}" onclick="toggleWishlist('${p.id}', event)" title="В обране" aria-label="Додати в обране">
                <i class="fa fa-heart"></i>
            </button>
            <a href="product.html?id=${p.id}" class="product-card-link">
                <img src="${p.img}" alt="${p.name}" loading="lazy">
                <h3>${p.name}</h3>
            </a>
            <p class="stock-line ${stockClass}"><i class="fa fa-circle"></i> ${stockLabel}</p>
            <p class="price">
                ${p.oldPrice ? `<span class="old-price">${p.oldPrice} грн</span>` : ''}
                ${p.price} грн
            </p>
            <button class="btn-primary btn-full" onclick="addToCart('${p.id}')" ${p.stock === 0 ? 'disabled' : ''}>
                <i class="fa fa-shopping-cart"></i> В кошик
            </button>
        </div>
    `;
}

// ============================================
// ПОШУК
// ============================================
function handleSearch(event) {
    event.preventDefault();
    const input = document.querySelector('.search-box input');
    const query = input ? input.value.trim() : '';

    if (window.location.pathname.includes('shop.html')) {
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('id');
        if (query) newUrl.searchParams.set('search', query);
        else newUrl.searchParams.delete('search');
        window.history.pushState({}, '', newUrl);

        const sidebarSearch = document.getElementById('sidebar-search');
        if (sidebarSearch) sidebarSearch.value = query;

        if (typeof renderShop === 'function') renderShop();
    } else {
        window.location.assign('shop.html?search=' + encodeURIComponent(query));
    }
}

function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) modal.style.display = 'none';
}

function processContactForm(event) {
    event.preventDefault();
    const modal = document.getElementById('successModal');
    if (modal) modal.style.display = 'flex';
    event.target.reset();
}

// ============================================
// ОФОРМЛЕННЯ ЗАМОВЛЕННЯ
// ============================================
function processCheckout(event) {
    event.preventDefault();
    if (cart.length === 0) { alert("Ваш кошик порожній!"); return; }

    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    if (subtotal < MIN_ORDER) {
        alert(`Мінімальна сума замовлення: ${MIN_ORDER} грн`);
        return;
    }

    const phoneInput = document.getElementById('checkoutPhone');
    if (phoneInput && phoneInput.value.length < 13) {
        alert("Введіть коректний номер: +380 та 9 цифр"); return;
    }

    const modal = document.getElementById('successModal');
    if (modal) modal.style.display = 'flex';

    cart = [];
    localStorage.setItem('budMasterCart', JSON.stringify(cart));
    localStorage.removeItem('budMasterPromo');
    updateCartBadge();
    event.target.reset();
    if (typeof renderCartPage === 'function') renderCartPage();
}

// ============================================
// ХІТИ / НОВИНКИ / АКЦІЇ НА ГОЛОВНІЙ
// ============================================
function renderProductSection(gridId, items) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = items.map(productCardHTML).join('');
}

function renderHomeSections() {
    const popularItems = productsData.filter(p => p.popular).slice(0, 8);
    const newItems = productsData.filter(p => p.isNew).slice(0, 8);
    const promoItems = productsData.filter(p => p.promo).slice(0, 8);

    renderProductSection('popular-grid', popularItems);
    renderProductSection('new-grid', newItems);
    renderProductSection('promo-grid', promoItems);

    const recent = recentlyViewed
        .map(id => productsData.find(p => p.id === id))
        .filter(Boolean)
        .slice(0, 4);
    if (recent.length > 0) {
        renderProductSection('recent-grid', recent);
        const sec = document.getElementById('recent-section');
        if (sec) sec.style.display = 'block';
    }
}

// Перемикання табів товарів на головній
function switchProductTab(event, tabId) {
    document.querySelectorAll('.ps-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.ps-grid').forEach(g => g.classList.remove('active'));
    event.currentTarget.classList.add('active');
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');
}

// ============================================
// HERO SLIDER
// ============================================
let heroIndex = 0;
let heroTimer = null;

function heroGoTo(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    if (!slides.length) return;
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
    heroIndex = index;
    resetHeroAuto();
}

function heroNext() { heroGoTo(heroIndex + 1); }
function heroPrev() { heroGoTo(heroIndex - 1); }

function resetHeroAuto() {
    if (heroTimer) clearTimeout(heroTimer);
    heroTimer = setTimeout(() => heroGoTo(heroIndex + 1), 6000);
}

function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 1) resetHeroAuto();
}

// ============================================
// MEGA MENU
// ============================================
function toggleMegaMenu() {
    const menu = document.getElementById('mega-menu');
    const overlay = document.getElementById('mega-overlay');
    const btn = document.getElementById('catalog-btn');
    if (!menu || !overlay) return;
    const isActive = menu.classList.contains('active');
    if (isActive) closeMegaMenu();
    else {
        menu.classList.add('active');
        overlay.classList.add('active');
        if (btn) btn.classList.add('active');
        document.body.classList.add('no-scroll');
    }
}

function closeMegaMenu() {
    const menu = document.getElementById('mega-menu');
    const overlay = document.getElementById('mega-overlay');
    const btn = document.getElementById('catalog-btn');
    if (menu) menu.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    if (btn) btn.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

// ============================================
// MOBILE NAV
// ============================================
function openMobileNav() {
    const nav = document.getElementById('mobile-nav');
    const overlay = document.getElementById('mobile-nav-overlay');
    if (nav) nav.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.classList.add('no-scroll');
}

function closeMobileNav() {
    const nav = document.getElementById('mobile-nav');
    const overlay = document.getElementById('mobile-nav-overlay');
    if (nav) nav.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

// ============================================
// AUTH MODAL
// ============================================
function openAuthModal(mode) {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.classList.add('active');
    document.body.classList.add('no-scroll');
    switchAuthTab(mode || 'login');
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.classList.remove('no-scroll');
    // Скидання форм
    setTimeout(() => {
        document.getElementById('auth-success').style.display = 'none';
        document.getElementById('auth-login').style.display = 'flex';
        document.getElementById('auth-register').style.display = 'none';
        document.getElementById('tab-login-btn').classList.add('active');
        document.getElementById('tab-reg-btn').classList.remove('active');
        ['login-email', 'login-pass', 'reg-name', 'reg-email', 'reg-phone', 'reg-pass', 'reg-pass2'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const agree = document.getElementById('reg-agree');
        if (agree) agree.checked = false;
        const loginErr = document.getElementById('login-error');
        if (loginErr) loginErr.style.display = 'none';
        const regErr = document.getElementById('reg-error');
        if (regErr) regErr.style.display = 'none';
    }, 300);
}

function authOverlayClick(e) {
    if (e.target.id === 'auth-modal') closeAuthModal();
}

function switchAuthTab(tab) {
    const loginBtn = document.getElementById('tab-login-btn');
    const regBtn = document.getElementById('tab-reg-btn');
    const loginForm = document.getElementById('auth-login');
    const regForm = document.getElementById('auth-register');
    const success = document.getElementById('auth-success');
    if (!loginBtn || !regBtn) return;

    if (success) success.style.display = 'none';

    if (tab === 'register') {
        loginBtn.classList.remove('active');
        regBtn.classList.add('active');
        loginForm.style.display = 'none';
        regForm.style.display = 'flex';
    } else {
        loginBtn.classList.add('active');
        regBtn.classList.remove('active');
        loginForm.style.display = 'flex';
        regForm.style.display = 'none';
    }
}

function switchRegMethod(method) {
    const segEmail = document.getElementById('seg-email');
    const segPhone = document.getElementById('seg-phone');
    const emailField = document.getElementById('reg-email');
    const phoneField = document.getElementById('reg-phone');
    if (!segEmail || !segPhone) return;

    if (method === 'phone') {
        segEmail.classList.remove('active');
        segPhone.classList.add('active');
        emailField.style.display = 'none';
        phoneField.style.display = '';
        if (!phoneField.value) phoneField.value = '+380';
    } else {
        segEmail.classList.add('active');
        segPhone.classList.remove('active');
        emailField.style.display = '';
        phoneField.style.display = 'none';
    }
}

function showAuthError(boxId, message) {
    const box = document.getElementById(boxId);
    if (!box) return;
    box.className = 'auth-error';
    box.style.display = 'block';
    box.textContent = message;
}

function hideAuthError(boxId) {
    const box = document.getElementById(boxId);
    if (box) box.style.display = 'none';
}

function submitLogin() {
    hideAuthError('login-error');
    const id = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    if (!id) { showAuthError('login-error', 'Вкажіть email або номер телефону'); return; }
    if (!pass || pass.length < 4) { showAuthError('login-error', 'Введіть пароль (мін. 4 символи)'); return; }
    // Заглушка — успіх
    showSuccessAuth('Вхід виконано! Кабінет буде доступний у повній версії.');
}

function submitRegister() {
    hideAuthError('reg-error');
    const name = document.getElementById('reg-name').value.trim();
    const isPhone = document.getElementById('seg-phone').classList.contains('active');
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const pass2 = document.getElementById('reg-pass2').value;
    const agree = document.getElementById('reg-agree').checked;

    if (!name) { showAuthError('reg-error', 'Вкажіть ваше ім\'я'); return; }
    if (isPhone) {
        if (!phone || phone.length < 13) { showAuthError('reg-error', 'Введіть номер у форматі +380XXXXXXXXX'); return; }
    } else {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showAuthError('reg-error', 'Вкажіть коректний email'); return; }
    }
    if (!pass || pass.length < 6) { showAuthError('reg-error', 'Пароль має містити мінімум 6 символів'); return; }
    if (pass !== pass2) { showAuthError('reg-error', 'Паролі не співпадають'); return; }
    if (!agree) { showAuthError('reg-error', 'Підтвердіть згоду з умовами використання'); return; }

    showSuccessAuth();
}

function showSuccessAuth(text) {
    document.getElementById('auth-login').style.display = 'none';
    document.getElementById('auth-register').style.display = 'none';
    const success = document.getElementById('auth-success');
    if (text) {
        const sub = success.querySelector('.auth-sub');
        if (sub) sub.textContent = text;
    }
    success.style.display = 'flex';
}

// ============================================
// КАТАЛОГ З ПАГІНАЦІЄЮ
// ============================================
const PAGE_SIZE = 12;
let currentPage = 1;

function renderShop() {
    const grid = document.getElementById('shop-grid');
    if (!grid) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    let searchQuery = urlParams.get('search')?.toLowerCase() || '';
    let urlType = urlParams.get('type') || '';

    let filtered = [];

    if (productId) {
        filtered = productsData.filter(p => p.id === productId);
    } else {
        const headerSearch = document.querySelector('.search-box input');
        const sidebarSearch = document.getElementById('sidebar-search');
        const typeFilter = document.getElementById('f-type');

        if (sidebarSearch && searchQuery && !sidebarSearch.dataset.synced) {
            sidebarSearch.value = urlParams.get('search');
            sidebarSearch.dataset.synced = "true";
            if (headerSearch) headerSearch.value = urlParams.get('search');
        }

        if (typeFilter && urlType && !typeFilter.dataset.synced) {
            typeFilter.value = urlType;
            typeFilter.dataset.synced = "true";
        }

        const query = sidebarSearch ? sidebarSearch.value.toLowerCase().trim() : searchQuery;
        const cat = document.getElementById('f-category')?.value || 'all';
        const type = typeFilter?.value || urlType || 'all';
        const sort = document.getElementById('f-price')?.value || 'default';
        const brand = document.getElementById('f-brand')?.value || 'all';
        const age = document.getElementById('f-age')?.value || 'all';
        const promo = document.getElementById('f-promo')?.checked || false;
        const popular = document.getElementById('f-popular')?.checked || false;
        const onlyWish = document.getElementById('f-wish')?.checked || false;
        const priceMin = parseFloat(document.getElementById('f-price-min')?.value) || 0;
        const priceMax = parseFloat(document.getElementById('f-price-max')?.value) || Infinity;

        filtered = productsData.filter(p => {
            if (query && !p.name.toLowerCase().includes(query)) return false;
            if (cat !== 'all' && p.category !== cat) return false;
            if (type !== 'all' && p.type !== type) return false;
            if (brand !== 'all' && p.brand !== brand) return false;
            if (age !== 'all' && p.age !== age) return false;
            if (promo && !p.promo) return false;
            if (popular && !p.popular) return false;
            if (onlyWish && !wishlist.includes(p.id)) return false;
            if (p.price < priceMin || p.price > priceMax) return false;
            return true;
        });

        if (sort === 'low')  filtered.sort((a, b) => a.price - b.price);
        if (sort === 'high') filtered.sort((a, b) => b.price - a.price);
        if (sort === 'new')  filtered.sort((a, b) => (b.isNew?1:0) - (a.isNew?1:0));
        if (sort === 'popular') filtered.sort((a, b) => (b.popular?1:0) - (a.popular?1:0));
    }

    const countEl = document.getElementById('shop-count');
    if (countEl) countEl.textContent = `Знайдено: ${filtered.length} ${filtered.length === 1 ? 'товар' : 'товарів'}`;

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-shop-state">
                <i class="fa fa-box-open empty-shop-icon"></i>
                <h3 class="empty-shop-title">На жаль, нічого не знайдено</h3>
                <p class="empty-shop-desc">Спробуйте змінити фільтри або ввести іншу назву.</p>
                <button class="btn-primary" onclick="resetFilters()">Скинути фільтри</button>
            </div>
        `;
        const pag = document.getElementById('pagination');
        if (pag) pag.innerHTML = '';
        return;
    }

    if (productId) {
        grid.innerHTML = filtered.map(productCardHTML).join('');
        const pag = document.getElementById('pagination');
        if (pag) pag.innerHTML = '';
        return;
    }

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    if (currentPage > totalPages) currentPage = 1;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    grid.innerHTML = pageItems.map(productCardHTML).join('');
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const pag = document.getElementById('pagination');
    if (!pag) return;
    if (totalPages <= 1) { pag.innerHTML = ''; return; }

    let html = `<button class="pag-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})" aria-label="Назад"><i class="fa fa-chevron-left"></i></button>`;
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
            html += `<button class="pag-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        } else if (Math.abs(i - currentPage) === 2) {
            html += `<span class="pag-dots">...</span>`;
        }
    }
    html += `<button class="pag-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})" aria-label="Вперед"><i class="fa fa-chevron-right"></i></button>`;
    pag.innerHTML = html;
}

function goToPage(p) {
    currentPage = p;
    renderShop();
    const grid = document.getElementById('shop-grid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// СТОРІНКА ТОВАРУ
// ============================================
function renderProductPage() {
    const container = document.getElementById('product-page-container');
    if (!container) return;

    const id = new URLSearchParams(window.location.search).get('id');
    const product = productsData.find(p => p.id === id);

    if (!product) {
        container.innerHTML = `
            <div class="empty-shop-state">
                <i class="fa fa-box-open empty-shop-icon"></i>
                <h3 class="empty-shop-title">Товар не знайдено</h3>
                <a href="shop.html" class="btn-primary">До каталогу</a>
            </div>`;
        return;
    }

    addToRecent(id);

    const inWish = wishlist.includes(product.id);
    const stockClass = product.stock > 50 ? 'in-stock' : (product.stock > 0 ? 'low-stock' : 'no-stock');
    const stockLabel = product.stock > 50 ? `В наявності (${product.stock} шт)` : (product.stock > 0 ? `Закінчується (${product.stock} шт)` : 'Немає в наявності');

    const typeLabels = { cement:'Цемент та суміші', brick:'Цегла та блоки', tool:'Інструменти', paint:'Фарби та лаки', metal:'Металопрокат', electric:'Електрика', finishing:'Оздоблення' };
    const brandLabels = { knauf:'Knauf', bosch:'Bosch', makita:'Makita', henkel:'Henkel', sniezka:'Sniezka', dewalt:'DeWalt', ceresit:'Ceresit', stanley:'Stanley', hilti:'Hilti', schneider:'Schneider Electric', other:'—' };
    const ageLabels = { small:'до 5 кг / шт', medium:'5-25 кг', large:'понад 25 кг' };

    document.title = `${product.name} — БудМайстер`;

    container.innerHTML = `
        <nav class="breadcrumbs">
            <a href="index.html">Головна</a> /
            <a href="shop.html">Каталог</a> /
            <a href="shop.html?type=${product.type}">${typeLabels[product.type] || ''}</a> /
            <span>${product.name}</span>
        </nav>

        <div class="product-detail">
            <div class="product-detail-img">
                <img src="${product.img}" alt="${product.name}">
                ${product.promo ? '<span class="discount-badge">ЗНИЖКА</span>' : ''}
                ${product.popular ? '<span class="popular-badge">ХІТ</span>' : ''}
                ${product.isNew && !product.popular ? '<span class="new-badge">НОВИНКА</span>' : ''}
            </div>
            <div class="product-detail-info">
                <h1>${product.name}</h1>
                <p class="prod-brand">Бренд: <strong>${brandLabels[product.brand] || '—'}</strong></p>
                <p class="stock-line ${stockClass}" style="justify-content:flex-start"><i class="fa fa-circle"></i> ${stockLabel}</p>
                <div class="prod-price-block">
                    ${product.oldPrice ? `<span class="old-price">${product.oldPrice} грн</span>` : ''}
                    <span class="prod-price">${product.price} грн</span>
                </div>

                <div class="prod-qty-row">
                    <label>Кількість:</label>
                    <div class="cart-controls">
                        <button class="cart-control-btn" onclick="changeProdQty(-1)" aria-label="Зменшити">-</button>
                        <span class="cart-control-qty" id="prod-qty">1</span>
                        <button class="cart-control-btn" onclick="changeProdQty(1)" aria-label="Збільшити">+</button>
                    </div>
                </div>

                <div class="prod-actions">
                    <button class="btn-primary" onclick="addProductToCart('${product.id}')" ${product.stock === 0 ? 'disabled' : ''}>
                        <i class="fa fa-shopping-cart"></i> Додати в кошик
                    </button>
                    <button class="btn-outline wish-btn-large ${inWish ? 'active' : ''}" data-id="${product.id}" onclick="toggleWishlist('${product.id}', event)">
                        <i class="fa fa-heart"></i> В обране
                    </button>
                </div>

                <ul class="prod-services">
                    <li><i class="fa fa-truck"></i> Доставка від 24 годин по всій Україні</li>
                    <li><i class="fa fa-shield-alt"></i> Гарантія якості, оригінальна продукція</li>
                    <li><i class="fa fa-undo"></i> Повернення товару протягом 14 днів</li>
                    <li><i class="fa fa-headset"></i> Безкоштовна консультація фахівця</li>
                </ul>
            </div>
        </div>

        <div class="prod-tabs">
            <div class="tab-buttons">
                <button class="tab-btn active" onclick="switchTab(event, 'tab-desc')">Опис</button>
                <button class="tab-btn" onclick="switchTab(event, 'tab-specs')">Характеристики</button>
                <button class="tab-btn" onclick="switchTab(event, 'tab-delivery')">Доставка та оплата</button>
            </div>
            <div id="tab-desc" class="tab-content active">
                <p>${product.name} — якісний матеріал від виробника <strong>${brandLabels[product.brand] || 'перевіреного бренду'}</strong>, який підходить як для професійного будівництва, так і для приватних робіт. Відповідає всім стандартам ДСТУ та має сертифікати якості.</p>
                <p>Замовляйте з доставкою або забирайте з найближчого складу — Київ, Львів, Дніпро. На великі обсяги діє система оптових знижок.</p>
            </div>
            <div id="tab-specs" class="tab-content">
                <table class="specs-table">
                    <tr><td>Категорія</td><td>${typeLabels[product.type] || '—'}</td></tr>
                    <tr><td>Бренд</td><td>${brandLabels[product.brand] || '—'}</td></tr>
                    <tr><td>Фасування</td><td>${ageLabels[product.age] || '—'}</td></tr>
                    <tr><td>Артикул</td><td>BM-${product.id.padStart(5, '0')}</td></tr>
                    <tr><td>Сертифікат якості</td><td>Так, ДСТУ</td></tr>
                    <tr><td>Гарантія</td><td>12 місяців</td></tr>
                </table>
            </div>
            <div id="tab-delivery" class="tab-content">
                <p><strong>Способи доставки:</strong></p>
                <ul style="margin-left: 20px; line-height: 1.8;">
                    <li>Самовивіз зі складу (Київ, Львів, Дніпро) — безкоштовно</li>
                    <li>Нова Пошта — за тарифами перевізника</li>
                    <li>Доставка вантажним авто по Києву та області — від 350 грн</li>
                    <li>Безкоштовна доставка по Києву при замовленні від 5000 грн</li>
                </ul>
                <p style="margin-top: 15px;"><strong>Оплата:</strong> готівкою, картою, безготівковий розрахунок для юр. осіб.</p>
            </div>
        </div>

        <section class="related-products">
            <h2 class="section-title">Схожі <span>товари</span></h2>
            <div class="products-grid" id="related-grid"></div>
        </section>
    `;

    const related = productsData.filter(p => p.type === product.type && p.id !== product.id).slice(0, 4);
    renderProductSection('related-grid', related);
}

function changeProdQty(delta) {
    const el = document.getElementById('prod-qty');
    if (!el) return;
    let q = parseInt(el.textContent) + delta;
    if (q < 1) q = 1;
    if (q > 999) q = 999;
    el.textContent = q;
}

function addProductToCart(id) {
    const qty = parseInt(document.getElementById('prod-qty').textContent) || 1;
    addToCart(id, qty);
}

function switchTab(event, tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    event.currentTarget.classList.add('active');
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');
}

// ============================================
// СКИНУТИ ФІЛЬТРИ
// ============================================
function resetFilters() {
    const headerInput = document.querySelector('.search-box input');
    if (headerInput) headerInput.value = '';

    const sidebarSearch = document.getElementById('sidebar-search');
    if (sidebarSearch) sidebarSearch.value = '';

    ['f-type', 'f-category', 'f-price', 'f-brand', 'f-age'].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.options) el.value = el.options[0].value;
    });

    ['f-promo', 'f-popular', 'f-wish'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = false;
    });

    ['f-price-min', 'f-price-max'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    if (window.location.pathname.includes('shop.html')) {
        window.history.pushState({}, '', 'shop.html');
    }
    currentPage = 1;
    renderShop();
}

// ============================================
// КАЛЬКУЛЯТОР МАТЕРІАЛІВ
// ============================================
function setCalcType(event, type) {
    document.querySelectorAll('.calc-tab-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
    const hidden = document.getElementById('calc-type');
    if (hidden) hidden.value = type;
    const result = document.getElementById('calc-result');
    if (result) result.innerHTML = '';
}

function calcMaterials() {
    const result = document.getElementById('calc-result');
    const type = document.getElementById('calc-type').value;
    const area = parseFloat(document.getElementById('calc-area').value);

    if (!area || area <= 0) {
        result.innerHTML = '<p class="calc-error">Вкажіть площу більше 0</p>';
        return;
    }

    let html = '<div class="calc-output"><h4>Орієнтовна потреба:</h4><ul>';

    if (type === 'wall') {
        const bricks = Math.ceil(area * 51);
        const cement = Math.ceil(area * 0.05 * 25);
        html += `<li>Цегла червона: <strong>${bricks} шт</strong></li>`;
        html += `<li>Цементно-піщана суміш: <strong>~${cement} мішків (по 25 кг)</strong></li>`;
    } else if (type === 'screed') {
        const cement = Math.ceil(area * 0.05 * 1.6);
        html += `<li>Самовирівнююча суміш або стяжка: <strong>~${cement} мішків (25 кг) на 5 см товщини</strong></li>`;
    } else if (type === 'paint') {
        const liters = Math.ceil(area * 0.18);
        const layers = Math.ceil(area * 0.18 * 2);
        html += `<li>Фарба (1 шар): <strong>~${liters} л</strong></li>`;
        html += `<li>Фарба (2 шари): <strong>~${layers} л</strong></li>`;
        html += `<li>Грунтовка: <strong>~${Math.ceil(area * 0.1)} л</strong></li>`;
    } else if (type === 'tile') {
        const tiles = Math.ceil(area * 1.1);
        const glue = Math.ceil(area * 5 / 25);
        html += `<li>Плитка з запасом 10%: <strong>~${tiles} м²</strong></li>`;
        html += `<li>Клей плитковий (5 кг/м²): <strong>~${glue} мішків (25 кг)</strong></li>`;
    }

    html += '</ul><p class="calc-note">* Розрахунок приблизний. Для точного — зв\'яжіться з менеджером.</p></div>';
    result.innerHTML = html;
}

// ============================================
// NEWSLETTER
// ============================================
function subscribeNewsletter(event) {
    event.preventDefault();
    const input = event.target.querySelector('input');
    showToast(`Дякуємо! ${input.value} підписано на новини.`);
    event.target.reset();
}

// ============================================
// ЖИВИЙ ПОШУК
// ============================================
function initLiveSearch() {
    const searchForm = document.querySelector('.search-box');
    const searchInput = document.querySelector('.search-box input');
    if (!searchForm || !searchInput) return;

    searchInput.setAttribute('autocomplete', 'off');

    let resultsBox = searchForm.querySelector('.search-results-dropdown');
    if (!resultsBox) {
        resultsBox = document.createElement('div');
        resultsBox.className = 'search-results-dropdown';
        searchForm.appendChild(resultsBox);
    }

    searchInput.addEventListener('input', function () {
        const query = this.value.toLowerCase().trim();
        resultsBox.innerHTML = '';

        if (query.length === 0) {
            resultsBox.style.display = 'none';
            return;
        }

        const matches = productsData.filter(p => p.name.toLowerCase().includes(query)).slice(0, 8);

        if (matches.length > 0) {
            matches.forEach(match => {
                const item = document.createElement('a');
                item.className = 'search-result-item';
                item.href = `product.html?id=${match.id}`;
                item.innerHTML = `
                    <img src="${match.img}" alt="${match.name}">
                    <div>
                        <div>${match.name}</div>
                        <div style="color: var(--accent); font-weight: bold; font-size: 13px;">${match.price} грн</div>
                    </div>
                `;
                resultsBox.appendChild(item);
            });
        } else {
            resultsBox.innerHTML = '<div class="empty-search-dropdown">Товарів не знайдено</div>';
        }
        resultsBox.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
        if (!searchForm.contains(e.target)) {
            resultsBox.style.display = 'none';
        }
    });
}

// ============================================
// МАСКА ТЕЛЕФОНУ
// ============================================
function initPhoneMask() {
    document.querySelectorAll('.phone-mask').forEach(input => {
        input.addEventListener('focus', function () { if (this.value === '') this.value = '+380'; });
        input.addEventListener('input', function () {
            let val = this.value.replace(/[^\d+]/g, '');
            if (!val.startsWith('+380')) val = '+380' + val.replace(/^\+?(380)?/, '');
            if (val.length > 13) val = val.slice(0, 13);
            this.value = val;
        });
    });
}

// ============================================
// КНОПКА ВГОРУ
// ============================================
function initScrollTopBtn() {
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.id = 'scrollTopBtn';
    scrollTopBtn.setAttribute('aria-label', 'Прокрутити нагору');
    scrollTopBtn.innerHTML = '<i class="fa fa-arrow-up"></i>';
    document.body.appendChild(scrollTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) scrollTopBtn.classList.add('show');
        else scrollTopBtn.classList.remove('show');
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================
// ЗАКРИТТЯ ПО ESC
// ============================================
function initEscClose() {
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        const authModal = document.getElementById('auth-modal');
        if (authModal && authModal.classList.contains('active')) { closeAuthModal(); return; }
        const megaMenu = document.getElementById('mega-menu');
        if (megaMenu && megaMenu.classList.contains('active')) { closeMegaMenu(); return; }
        const mobileNav = document.getElementById('mobile-nav');
        if (mobileNav && mobileNav.classList.contains('active')) { closeMobileNav(); return; }
        const successModal = document.getElementById('successModal');
        if (successModal && successModal.style.display === 'flex') { closeModal(); return; }
    });
}

// ============================================
// BLOG PAGE
// ============================================
const BLOG_POSTS = [
    { id: 1, cat: 'Будівництво', date: '15 січня 2026', title: 'Як вибрати цемент для фундаменту', excerpt: 'Розглядаємо марки цементу, рекомендації виробників та лайфхаки досвідчених прорабів.', img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80' },
    { id: 2, cat: 'Ремонт', date: '10 січня 2026', title: 'Шпаклівка стін: 7 типових помилок', excerpt: 'Покрокова інструкція для якісного шпаклювання та поради, як уникнути дефектів.', img: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80' },
    { id: 3, cat: 'Інструмент', date: '3 січня 2026', title: 'Топ-5 перфораторів 2026 року', excerpt: 'Огляд найкращих моделей Bosch, Makita, DeWalt — характеристики, ціни, плюси та мінуси.', img: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80' },
    { id: 4, cat: 'Будівництво', date: '28 грудня 2025', title: 'Газобетон чи цегла: що краще для будинку?', excerpt: 'Порівнюємо два популярних матеріали за ціною, теплоізоляцією, складністю кладки та довговічністю.', img: 'https://images.unsplash.com/photo-1530686577008-d6dd54e83b40?auto=format&fit=crop&w=800&q=80' },
    { id: 5, cat: 'Ремонт', date: '20 грудня 2025', title: 'Як обрати фарбу для квартири: гайд від професіоналів', excerpt: 'Розбираємо типи фарб (латекс, акрил, силікон), де яку використовувати та скільки шарів робити.', img: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80' },
    { id: 6, cat: 'Інструмент', date: '12 грудня 2025', title: 'Шуруповерт vs дриль: чим відрізняються?', excerpt: 'Поширені помилки при виборі — що купити для дому, а що для професійної роботи.', img: 'https://images.unsplash.com/photo-1426927308491-6380b6a9936f?auto=format&fit=crop&w=800&q=80' }
];

function blogCardHTML(post) {
    return `
        <a href="article.html?id=${post.id}" class="blog-card" data-cat="${post.cat}">
            <img src="${post.img}" alt="${post.title}" loading="lazy">
            <div class="blog-card-body">
                <div class="blog-meta">
                    <span class="blog-tag">${post.cat}</span>
                    <span class="blog-date">${post.date}</span>
                </div>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <span class="blog-link">Читати <i class="fa fa-arrow-right"></i></span>
            </div>
        </a>
    `;
}

function renderBlogList() {
    const grid = document.getElementById('blog-list-grid');
    if (!grid) return;
    const cat = document.querySelector('.blog-cat-btn.active')?.dataset.cat || 'all';
    const items = cat === 'all' ? BLOG_POSTS : BLOG_POSTS.filter(p => p.cat === cat);
    grid.innerHTML = items.map(blogCardHTML).join('');
}

function filterBlogCat(event, cat) {
    document.querySelectorAll('.blog-cat-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
    event.currentTarget.dataset.cat = cat;
    renderBlogList();
}

function renderArticlePage() {
    const container = document.getElementById('article-container');
    if (!container) return;
    const id = parseInt(new URLSearchParams(window.location.search).get('id')) || 1;
    const post = BLOG_POSTS.find(p => p.id === id) || BLOG_POSTS[0];
    document.title = `${post.title} — БудМайстер`;

    container.innerHTML = `
        <nav class="breadcrumbs">
            <a href="index.html">Головна</a> /
            <a href="blog.html">Блог</a> /
            <span>${post.title}</span>
        </nav>
        <div class="article-meta">
            <span class="blog-tag">${post.cat}</span>
            <span class="blog-date">${post.date}</span>
        </div>
        <h1>${post.title}</h1>
        <img src="${post.img.replace('w=800', 'w=1200')}" alt="${post.title}" class="article-cover">
        <div class="article-content">
            <p>${post.excerpt} У цій статті ми детально розберемо ключові моменти, які допоможуть вам зробити правильний вибір та уникнути типових помилок під час будівництва й ремонту.</p>

            <h2>Що варто знати перед початком</h2>
            <p>Перед тим як приступити до робіт, важливо ретельно спланувати кожен етап. Помилки на початковому етапі коштують дорого і часто потребують повної переробки. Ось ключові моменти, на які варто звернути увагу:</p>
            <ul>
                <li><strong>Якість матеріалів</strong> — економія на матеріалах рідко окупається. Краще обирати перевірені бренди.</li>
                <li><strong>Правильний розрахунок</strong> — використовуйте наш <a href="index.html#calc">калькулятор матеріалів</a> для точних обсягів.</li>
                <li><strong>Умови зберігання</strong> — більшість будівельних матеріалів не люблять вологи й перепадів температур.</li>
                <li><strong>Терміни придатності</strong> — особливо актуально для цементу, шпаклівок, фарб.</li>
            </ul>

            <h2>Покрокова інструкція</h2>
            <p>Розглянемо весь процес поетапно — від підготовки до фінальної перевірки.</p>

            <h3>Крок 1. Підготовка</h3>
            <p>На цьому етапі підготуйте інструмент, очистіть робочу поверхню, забезпечте належне освітлення та вентиляцію. Не нехтуйте засобами індивідуального захисту.</p>

            <h3>Крок 2. Виконання робіт</h3>
            <p>Дотримуйтеся технології виробника матеріалу. Кожен виробник вказує оптимальні умови температури, вологості й товщини шару — не відхиляйтеся від цих рекомендацій.</p>

            <h3>Крок 3. Контроль якості</h3>
            <p>Після завершення робіт обов'язково перевірте якість. Якщо помітите дефекти — виправляйте їх одразу, не чекайте, поки матеріал застигне.</p>

            <blockquote>«Якісно виконана робота — це не тільки про результат. Це про правильно підібрані матеріали, інструмент та чітке дотримання технології.» — Андрій К., прораб з 15-річним досвідом</blockquote>

            <h2>Висновки</h2>
            <p>Будівництво і ремонт — це складний процес, але з правильним підходом ви досягнете відмінного результату. Не соромтеся звертатися за консультацією до наших фахівців — це <strong>безкоштовно</strong>, а часу й нервів економить багато.</p>
            <p>Усі необхідні матеріали ви можете замовити у нашому <a href="shop.html">каталозі</a> з доставкою по Україні від 24 годин.</p>
        </div>
    `;
}

// ============================================
// ІН'ЄКЦІЯ ШАПКИ І ПІДВАЛУ (DRY для всіх сторінок)
// ============================================
// Вставляє повноцінний header (top-bar + sticky header + mega-menu + mobile nav)
// у будь-яку сторінку, де є <div id="header-placeholder"></div>
function injectHeader() {
    const placeholder = document.getElementById('header-placeholder');
    if (!placeholder) return;
    placeholder.innerHTML = `
    <div class="top-bar">
        <div class="tb-inner">
            <div class="tb-left">
                <span class="tb-city"><i class="fa fa-map-marker-alt"></i> Київ <i class="fa fa-chevron-down" style="font-size:10px"></i></span>
                <span><i class="fa fa-phone"></i> +380 (44) 555 12 34</span>
                <span><i class="fa fa-clock"></i> Пн-Сб 8:00-20:00</span>
                <span><i class="fa fa-warehouse"></i> Склади: Київ · Львів · Дніпро</span>
            </div>
            <div class="tb-right">
                <span class="tb-free"><i class="fa fa-truck"></i> Безкоштовна доставка від 5000 грн</span>
            </div>
        </div>
    </div>
    <header class="site-header">
        <div class="hdr-inner">
            <a href="index.html" class="logo">Буд<span>Майстер</span></a>
            <button class="catalog-btn" id="catalog-btn" onclick="toggleMegaMenu()" aria-label="Відкрити каталог">
                <i class="fa fa-bars"></i> <span>Каталог</span>
            </button>
            <form class="search-box" onsubmit="handleSearch(event)">
                <input type="text" placeholder="Пошук матеріалів, інструменту, брендів..." autocomplete="off" required>
                <button type="submit" aria-label="Пошук"><i class="fa fa-search"></i></button>
            </form>
            <div class="hdr-actions">
                <button class="hdr-icon" onclick="openAuthModal('login')" title="Особистий кабінет" aria-label="Вхід">
                    <i class="fa fa-user"></i>
                </button>
                <a href="shop.html?wish=1" class="hdr-icon wishlist-header" title="Обране" data-mobile-hide>
                    <i class="fa fa-heart"></i>
                    <span class="wishlist-count">0</span>
                </a>
                <a href="cart.html" class="hdr-icon cart" title="Кошик">
                    <i class="fa fa-shopping-cart"></i>
                    <span class="cart-count">0</span>
                </a>
                <button class="hdr-mobile-nav-toggle" onclick="openMobileNav()" aria-label="Меню">
                    <i class="fa fa-bars"></i>
                </button>
            </div>
        </div>
    </header>
    <div class="mega-overlay" id="mega-overlay" onclick="closeMegaMenu()"></div>
    <div class="mega-menu" id="mega-menu">
        <div class="mega-inner">
            <div class="mega-col">
                <h4><i class="fa fa-cubes"></i> Цемент та суміші</h4>
                <ul>
                    <li><a href="shop.html?type=cement">Цемент ПЦ-400, ПЦ-500</a></li>
                    <li><a href="shop.html?type=cement">Шпаклівки</a></li>
                    <li><a href="shop.html?type=cement">Штукатурки</a></li>
                    <li><a href="shop.html?type=cement">Клей плитковий</a></li>
                    <li><a href="shop.html?type=cement">Гідроізоляція</a></li>
                </ul>
            </div>
            <div class="mega-col">
                <h4><i class="fa fa-th-large"></i> Цегла та блоки</h4>
                <ul>
                    <li><a href="shop.html?type=brick">Цегла червона</a></li>
                    <li><a href="shop.html?type=brick">Цегла силікатна</a></li>
                    <li><a href="shop.html?type=brick">Газоблоки</a></li>
                    <li><a href="shop.html?type=brick">Керамоблоки</a></li>
                    <li><a href="shop.html?type=brick">Шлакоблоки</a></li>
                </ul>
            </div>
            <div class="mega-col">
                <h4><i class="fa fa-screwdriver-wrench"></i> Інструмент</h4>
                <ul>
                    <li><a href="shop.html?type=tool">Перфоратори</a></li>
                    <li><a href="shop.html?type=tool">Шуруповерти</a></li>
                    <li><a href="shop.html?type=tool">Болгарки</a></li>
                    <li><a href="shop.html?type=tool">Лазерні рівні</a></li>
                    <li><a href="shop.html?type=tool">Ручний інструмент</a></li>
                </ul>
            </div>
            <div class="mega-col">
                <h4><i class="fa fa-paint-roller"></i> Фарби та лаки</h4>
                <ul>
                    <li><a href="shop.html?type=paint">Фарби інтер'єрні</a></li>
                    <li><a href="shop.html?type=paint">Фарби фасадні</a></li>
                    <li><a href="shop.html?type=paint">Грунтовки</a></li>
                    <li><a href="shop.html?type=paint">Лаки та емалі</a></li>
                    <li><a href="shop.html?type=paint">Антисептики</a></li>
                </ul>
            </div>
            <a href="shop.html?promo=1" class="mega-promo" style="text-decoration:none">
                <div>
                    <span class="promo-tag">Акція тижня</span>
                    <h3>-30% на інструмент Bosch, Makita, DeWalt</h3>
                </div>
                <span style="color:var(--primary); font-weight:700; font-size:14px; text-transform:uppercase">Перейти <i class="fa fa-arrow-right"></i></span>
            </a>
            <div class="mega-col">
                <h4><i class="fa fa-bolt"></i> Електрика</h4>
                <ul>
                    <li><a href="shop.html?type=electric">Кабельна продукція</a></li>
                    <li><a href="shop.html?type=electric">Розетки, вимикачі</a></li>
                    <li><a href="shop.html?type=electric">Автомати, УЗО</a></li>
                    <li><a href="shop.html?type=electric">Освітлення LED</a></li>
                </ul>
            </div>
            <div class="mega-col">
                <h4><i class="fa fa-industry"></i> Металопрокат</h4>
                <ul>
                    <li><a href="shop.html?type=metal">Арматура А500С</a></li>
                    <li><a href="shop.html?type=metal">Профілі металеві</a></li>
                    <li><a href="shop.html?type=metal">Труби профільні</a></li>
                    <li><a href="shop.html?type=metal">Листовий метал</a></li>
                </ul>
            </div>
            <div class="mega-col">
                <h4><i class="fa fa-house-chimney"></i> Оздоблення</h4>
                <ul>
                    <li><a href="shop.html?type=finishing">Гіпсокартон Knauf</a></li>
                    <li><a href="shop.html?type=finishing">Утеплювачі</a></li>
                    <li><a href="shop.html?type=finishing">Профілі CD/UD</a></li>
                    <li><a href="shop.html?type=finishing">Сітки, підвіси</a></li>
                </ul>
            </div>
            <div class="mega-col">
                <h4><i class="fa fa-tag"></i> Спецпропозиції</h4>
                <ul>
                    <li><a href="shop.html?promo=1">Усі акції</a></li>
                    <li><a href="shop.html?popular=1">Хіти продажів</a></li>
                    <li><a href="shop.html?sort=new">Новинки</a></li>
                    <li><a href="business.html">Опт для бригад</a></li>
                </ul>
            </div>
        </div>
    </div>
    <div class="mobile-nav-overlay" id="mobile-nav-overlay" onclick="closeMobileNav()"></div>
    <nav class="mobile-nav" id="mobile-nav">
        <div class="mobile-nav-header">
            <a href="index.html" class="logo">Буд<span>Майстер</span></a>
            <button class="mobile-nav-close" onclick="closeMobileNav()" aria-label="Закрити"><i class="fa fa-times"></i></button>
        </div>
        <ul>
            <li><a href="index.html">Головна</a></li>
            <li><a href="shop.html">Каталог</a></li>
            <li><a href="services.html">Послуги</a></li>
            <li><a href="business.html">Для бізнесу</a></li>
            <li><a href="blog.html">Блог</a></li>
            <li><a href="about.html">Про нас</a></li>
            <li><a href="contacts.html">Контакти</a></li>
        </ul>
        <button class="btn-primary btn-full" onclick="closeMobileNav(); openAuthModal('login')">
            <i class="fa fa-user"></i> Увійти
        </button>
    </nav>`;
}

// Вставляє mega-footer + auth modal + success modal у будь-яку сторінку,
// де є <div id="footer-placeholder"></div>
function injectFooter() {
    const placeholder = document.getElementById('footer-placeholder');
    if (!placeholder) return;
    placeholder.innerHTML = `
    <div class="auth-modal-overlay" id="auth-modal" onclick="authOverlayClick(event)">
        <div class="auth-modal-box" role="dialog" aria-modal="true" aria-label="Авторизація">
            <button class="auth-close" onclick="closeAuthModal()" aria-label="Закрити"><i class="fa fa-times"></i></button>
            <div class="auth-tabs">
                <button class="auth-tab active" id="tab-login-btn" onclick="switchAuthTab('login')">Вхід</button>
                <button class="auth-tab" id="tab-reg-btn" onclick="switchAuthTab('register')">Реєстрація</button>
            </div>
            <div id="auth-login" class="auth-form">
                <h2>Вхід до кабінету</h2>
                <p class="auth-sub">Введіть email або номер телефону</p>
                <div id="login-error" style="display:none"></div>
                <input type="text" placeholder="Email або +380..." class="auth-input" id="login-email" autocomplete="username">
                <input type="password" placeholder="Пароль" class="auth-input" id="login-pass" autocomplete="current-password">
                <div class="auth-row">
                    <label class="auth-check"><input type="checkbox"> Запам'ятати мене</label>
                    <button type="button" class="auth-link" onclick="showToast('Відновлення паролю — скоро буде!')">Забули пароль?</button>
                </div>
                <button class="btn-primary btn-full auth-submit" onclick="submitLogin()"><i class="fa fa-sign-in-alt"></i> Увійти</button>
            </div>
            <div id="auth-register" class="auth-form" style="display:none">
                <h2>Реєстрація</h2>
                <p class="auth-sub">Оберіть зручний спосіб реєстрації</p>
                <div id="reg-error" style="display:none"></div>
                <div class="auth-segmented">
                    <button type="button" class="seg-btn active" id="seg-email" onclick="switchRegMethod('email')"><i class="fa fa-envelope"></i> За email</button>
                    <button type="button" class="seg-btn" id="seg-phone" onclick="switchRegMethod('phone')"><i class="fa fa-phone"></i> За телефоном</button>
                </div>
                <input type="text" placeholder="Ім'я" class="auth-input" id="reg-name" autocomplete="given-name">
                <input type="email" placeholder="Email" class="auth-input reg-email-field" id="reg-email" autocomplete="email">
                <input type="tel" placeholder="+380" class="auth-input phone-mask reg-phone-field" id="reg-phone" autocomplete="tel" style="display:none">
                <input type="password" placeholder="Пароль (мін. 6 символів)" class="auth-input" id="reg-pass" autocomplete="new-password">
                <input type="password" placeholder="Повторіть пароль" class="auth-input" id="reg-pass2" autocomplete="new-password">
                <label class="auth-check"><input type="checkbox" id="reg-agree"> Я погоджуюсь з умовами використання</label>
                <button class="btn-primary btn-full auth-submit" onclick="submitRegister()"><i class="fa fa-user-plus"></i> Зареєструватись</button>
            </div>
            <div id="auth-success" class="auth-form" style="display:none; text-align:center">
                <i class="fa fa-check-circle" style="font-size:60px; color:#16a34a; margin: 8px auto 16px"></i>
                <h2>Дякуємо!</h2>
                <p class="auth-sub">Особистий кабінет буде доступний після запуску повної версії сайту. Ми сповістимо вас на email.</p>
                <button class="btn-primary btn-full" onclick="closeAuthModal()">Чудово!</button>
            </div>
        </div>
    </div>
    <div id="successModal" class="modal-overlay">
        <div class="modal-content">
            <i class="fa fa-check-circle"></i>
            <h2>Дякуємо!</h2>
            <p class="modal-desc">Ми отримали вашу заявку. Менеджер зв'яжеться з вами протягом 30 хвилин.</p>
            <button class="btn-primary btn-full" onclick="closeModal()">Закрити</button>
        </div>
    </div>
    <footer class="site-footer">
        <div class="footer-top">
            <div class="footer-col">
                <div class="footer-logo">Буд<span>Майстер</span></div>
                <p class="footer-desc">Будівельні матеріали та інструменти — від фундаменту до фінішної обробки. 12 років на ринку, 5000+ найменувань, склади у 3 містах України.</p>
                <div class="footer-social">
                    <a href="#" class="social-btn" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" class="social-btn" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                    <a href="#" class="social-btn" aria-label="Telegram"><i class="fab fa-telegram-plane"></i></a>
                    <a href="#" class="social-btn" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
                    <a href="#" class="social-btn" aria-label="Viber"><i class="fab fa-viber"></i></a>
                </div>
            </div>
            <div class="footer-col">
                <h4>Каталог</h4>
                <ul>
                    <li><a href="shop.html?type=cement">Цемент та суміші</a></li>
                    <li><a href="shop.html?type=brick">Цегла та блоки</a></li>
                    <li><a href="shop.html?type=tool">Інструмент</a></li>
                    <li><a href="shop.html?type=paint">Фарби та лаки</a></li>
                    <li><a href="shop.html?type=metal">Металопрокат</a></li>
                    <li><a href="shop.html?type=electric">Електрика</a></li>
                    <li><a href="shop.html?type=finishing">Оздоблення</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Покупцям</h4>
                <ul>
                    <li><a href="services.html">Доставка та оплата</a></li>
                    <li><a href="services.html#returns">Повернення товару</a></li>
                    <li><a href="services.html#warranty">Гарантія</a></li>
                    <li><a href="cart.html">Кошик</a></li>
                    <li><a href="shop.html?wish=1">Обране</a></li>
                    <li><a href="blog.html">Корисні статті</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Компанія</h4>
                <ul>
                    <li><a href="about.html">Про нас</a></li>
                    <li><a href="business.html">Для бізнесу</a></li>
                    <li><a href="blog.html">Блог</a></li>
                    <li><a href="contacts.html">Контакти</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Контакти</h4>
                <div class="footer-contact-item"><i class="fa fa-map-marker-alt"></i><span>м. Київ, вул. Промислова, 25</span></div>
                <div class="footer-contact-item"><i class="fa fa-phone-alt"></i><a href="tel:+380445551234">+380 (44) 555 12 34</a></div>
                <div class="footer-contact-item"><i class="fa fa-envelope"></i><a href="mailto:info@budmaster.ua">info@budmaster.ua</a></div>
                <div class="footer-contact-item"><i class="fa fa-clock"></i><span>Пн-Сб: 8:00-20:00<br>Нд: 9:00-17:00</span></div>
                <div class="footer-payments">
                    <span class="pay-icon">VISA</span>
                    <span class="pay-icon">MasterCard</span>
                    <span class="pay-icon">Готівка</span>
                    <span class="pay-icon">Безготівка</span>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <div class="footer-bottom-inner">
                <p>&copy; 2026 БудМайстер. Всі права захищені.</p>
                <p>Склади: Київ · Львів · Дніпро</p>
            </div>
        </div>
    </footer>`;
}

// ============================================
// ЗАПУСК
// ============================================
// Викликається після завантаження DOM. Спершу інжектимо шапку та підвал
// (бо інша логіка від них залежить), потім — вся інша ініціалізація.
document.addEventListener('DOMContentLoaded', () => {
    // 1. Інжект спільних блоків (header + footer + modals)
    injectHeader();
    injectFooter();

    // 2. Базова ініціалізація стану (бейджі кошика та обраного)
    updateCartBadge();
    updateWishlistBadge();

    // 3. Render-функції — викликаємо лише ті, що є на поточній сторінці
    if (document.getElementById('shop-grid')) renderShop();
    if (document.getElementById('popular-grid')) renderHomeSections();
    if (document.getElementById('product-page-container')) renderProductPage();
    if (document.getElementById('cart-items-container') && typeof renderCartPage === 'function') renderCartPage();
    if (document.getElementById('blog-list-grid')) renderBlogList();
    if (document.getElementById('article-container')) renderArticlePage();

    // 4. UI-helpers (працюють для всіх сторінок)
    initLiveSearch();
    initPhoneMask();
    initScrollTopBtn();
    initHeroSlider();
    initEscClose();
});
