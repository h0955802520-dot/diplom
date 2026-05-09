// БАЗА ТОВАРІВ
const productsData = [
    { id: '1',  name: 'Цемент Knauf ПЦ-500 Д0, 25 кг',                price: 220,  category: 'construction', type: 'cement',   age: 'medium', brand: 'knauf',   promo: false, popular: true,  img: 'https://images.unsplash.com/photo-1607582544501-71f5b3ce3a4e?auto=format&fit=crop&w=600&q=80' },
    { id: '2',  name: 'Перфоратор Bosch GBH 2-26 SDS-plus',            price: 5499, oldPrice: 6299, category: 'construction', type: 'tool',     age: 'medium', brand: 'bosch',   promo: true,  popular: true,  img: 'https://images.unsplash.com/photo-1426927308491-6380b6a9936f?auto=format&fit=crop&w=600&q=80' },
    { id: '3',  name: 'Цегла червона повнотіла М-150',                 price: 18,   category: 'construction', type: 'brick',    age: 'medium', brand: 'other',   promo: false, popular: true,  img: 'https://images.unsplash.com/photo-1530686577008-d6dd54e83b40?auto=format&fit=crop&w=600&q=80' },
    { id: '4',  name: 'Шпаклівка Knauf Rotband Pasta, 18 кг',          price: 580,  category: 'finishing',    type: 'paint',    age: 'medium', brand: 'knauf',   promo: false, popular: false, img: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80' },
    { id: '5',  name: 'Дриль ударний Makita HP1631, 710 Вт',           price: 2899, oldPrice: 3450, category: 'construction', type: 'tool',     age: 'small',  brand: 'makita',  promo: true,  popular: false, img: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=80' },
    { id: '6',  name: 'Газоблок AEROC EcoTerm 400x200x600',            price: 95,   category: 'construction', type: 'brick',    age: 'large',  brand: 'other',   promo: false, popular: false, img: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80' },
    { id: '7',  name: 'Клей плитковий Ceresit CM 11, 25 кг',           price: 320,  category: 'finishing',    type: 'cement',   age: 'medium', brand: 'henkel',  promo: false, popular: false, img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80' },
    { id: '8',  name: 'Болгарка DeWalt DWE4257, 1500 Вт',              price: 4250, oldPrice: 4900, category: 'construction', type: 'tool',     age: 'medium', brand: 'dewalt',  promo: true,  popular: true,  img: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80' },
    { id: '9',  name: 'Фарба інтер\'єрна Sniezka Eco, 10 л',           price: 850,  category: 'finishing',    type: 'paint',    age: 'medium', brand: 'sniezka', promo: false, popular: false, img: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80' },
    { id: '10', name: 'Шуруповерт акумуляторний Bosch GSR 12V-15',     price: 3199, category: 'construction', type: 'tool',     age: 'small',  brand: 'bosch',   promo: false, popular: false, img: 'https://images.unsplash.com/photo-1581244249295-7a4f2cd5cd3a?auto=format&fit=crop&w=600&q=80' },
    { id: '11', name: 'Грунтовка глибокого проникнення Henkel, 10 л',  price: 480,  category: 'finishing',    type: 'paint',    age: 'medium', brand: 'henkel',  promo: false, popular: false, img: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?auto=format&fit=crop&w=600&q=80' },
    { id: '12', name: 'Лак паркетний Sniezka Supermal, 5 л',           price: 1100, oldPrice: 1300, category: 'finishing',    type: 'paint',    age: 'medium', brand: 'sniezka', promo: true,  popular: false, img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80' },
    { id: '13', name: 'Набір ключів комбінованих, 12 шт',              price: 650,  category: 'construction', type: 'tool',     age: 'small',  brand: 'other',   promo: false, popular: false, img: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=80' },
    { id: '14', name: 'Профіль металевий CD-60 Knauf, 3 м',            price: 145,  category: 'finishing',    type: 'metal',    age: 'medium', brand: 'knauf',   promo: false, popular: false, img: 'https://images.unsplash.com/photo-1517232117160-a51e4c1d3275?auto=format&fit=crop&w=600&q=80' },
    { id: '15', name: 'Гіпсокартон Knauf вологостійкий 12.5 мм',       price: 380,  category: 'finishing',    type: 'finishing', age: 'large', brand: 'knauf',   promo: false, popular: false, img: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80' },
    { id: '16', name: 'Кабель силовий ВВГ 3х2.5, 100 м',               price: 2400, oldPrice: 2750, category: 'construction', type: 'electric', age: 'large',  brand: 'other',   promo: true,  popular: false, img: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=600&q=80' },
    { id: '17', name: 'Молоток слюсарний 500 г, фіберглас',            price: 280,  category: 'construction', type: 'tool',     age: 'small',  brand: 'other',   promo: false, popular: false, img: 'https://images.unsplash.com/photo-1426927308491-6380b6a9936f?auto=format&fit=crop&w=600&q=80' },
    { id: '18', name: 'Арматура А500С, 12 мм, 11.7 м',                 price: 320,  category: 'construction', type: 'metal',    age: 'large',  brand: 'other',   promo: false, popular: false, img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80' },
    { id: '19', name: 'Розетка Schneider Electric з заземленням',      price: 165,  oldPrice: 210, category: 'finishing',    type: 'electric', age: 'small',  brand: 'other',   promo: true,  popular: false, img: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80' },
    { id: '20', name: 'Пилосос будівельний Makita VC2512L, 1000 Вт',   price: 5499, category: 'construction', type: 'tool',     age: 'large',  brand: 'makita',  promo: false, popular: false, img: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&q=80' },
    { id: '21', name: 'Рулетка вимірювальна Stanley FatMax, 5 м',      price: 320,  category: 'construction', type: 'tool',     age: 'small',  brand: 'other',   promo: false, popular: false, img: 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=600&q=80' }
];

// КОШИК
let cart = JSON.parse(localStorage.getItem('budMasterCart')) || [];

function updateCartBadge() {
    const counts = document.querySelectorAll('.cart-count');
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    counts.forEach(c => {
        c.textContent = total;
        c.style.transform = 'scale(1.5)';
        setTimeout(() => c.style.transform = 'scale(1)', 200);
    });
}

function addToCart(id) {
    const product = productsData.find(p => p.id === id);
    if (!product) return;

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) { existingItem.quantity += 1; }
    else { cart.push({ ...product, quantity: 1 }); }
    localStorage.setItem('budMasterCart', JSON.stringify(cart));
    updateCartBadge();
}

// ОБРОБКА ПОШУКУ (З ШАПКИ)
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

        renderShop();
    } else {
        window.location.assign('shop.html?search=' + encodeURIComponent(query));
    }
}

// ЗАКРИТТЯ МОДАЛЬНОГО ВІКНА
function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) modal.style.display = 'none';
}

// ФОРМА КОНТАКТІВ
function processContactForm(event) {
    event.preventDefault();
    document.getElementById('successModal').style.display = 'flex';
    event.target.reset();
}

// ОФОРМЛЕННЯ ЗАМОВЛЕННЯ
function processCheckout(event) {
    event.preventDefault();
    if (cart.length === 0) { alert("Ваш кошик порожній!"); return; }

    const phoneInput = document.getElementById('checkoutPhone');
    if (phoneInput && phoneInput.value.length < 13) {
        alert("Введіть коректний номер: +380 та 9 цифр"); return;
    }

    document.getElementById('successModal').style.display = 'flex';

    cart = [];
    localStorage.setItem('budMasterCart', JSON.stringify(cart));
    updateCartBadge();
    event.target.reset();
    if (typeof renderCartPage === 'function') renderCartPage();
}

// ПОПУЛЯРНІ ТОВАРИ НА ГОЛОВНІЙ
function renderPopularProducts() {
    const grid = document.getElementById('popular-grid');
    if (!grid) return;

    const popularItems = productsData.filter(p => p.popular).slice(0, 4);

    grid.innerHTML = popularItems.map(p => `
        <div class="product-card">
            ${p.promo ? '<span class="discount-badge">ЗНИЖКА</span>' : ''}
            <span class="popular-badge">ХІТ</span>
            <img src="${p.img}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p class="price">
                ${p.oldPrice ? `<span class="old-price">${p.oldPrice} грн</span>` : ''}
                ${p.price} грн
            </p>
            <button class="btn-primary btn-full" onclick="addToCart('${p.id}')">
                <i class="fa fa-shopping-cart"></i> В кошик
            </button>
        </div>
    `).join('');
}

// РЕНДЕР ТОВАРІВ В КАТАЛОЗІ
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

        filtered = productsData.filter(p => {
            if (query && !p.name.toLowerCase().includes(query)) return false;
            if (cat !== 'all' && p.category !== cat) return false;
            if (type !== 'all' && p.type !== type) return false;
            if (brand !== 'all' && p.brand !== brand) return false;
            if (age !== 'all' && p.age !== age) return false;
            if (promo && !p.promo) return false;
            if (popular && !p.popular) return false;
            return true;
        });

        if (sort === 'low') filtered.sort((a, b) => a.price - b.price);
        if (sort === 'high') filtered.sort((a, b) => b.price - a.price);
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-shop-state">
                <i class="fa fa-box-open empty-shop-icon"></i>
                <h3 class="empty-shop-title">На жаль, нічого не знайдено</h3>
                <p class="empty-shop-desc">Спробуйте змінити фільтри або ввести іншу назву.</p>
                <button class="btn-primary" onclick="resetFilters()">Скинути фільтри</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(p => `
        <div class="product-card">
            ${p.promo ? '<span class="discount-badge">ЗНИЖКА</span>' : ''}
            ${p.popular ? '<span class="popular-badge">ХІТ</span>' : ''}
            <img src="${p.img}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p class="price">
                ${p.oldPrice ? `<span class="old-price">${p.oldPrice} грн</span>` : ''}
                ${p.price} грн
            </p>
            <button class="btn-primary btn-full" onclick="addToCart('${p.id}')">
                <i class="fa fa-shopping-cart"></i> В кошик
            </button>
        </div>
    `).join('');
}

// СКИНУТИ ФІЛЬТРИ
function resetFilters() {
    const headerInput = document.querySelector('.search-box input');
    if (headerInput) headerInput.value = '';

    const sidebarSearch = document.getElementById('sidebar-search');
    if (sidebarSearch) sidebarSearch.value = '';

    ['f-type', 'f-category', 'f-price', 'f-brand', 'f-age'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = el.options[0].value;
    });

    ['f-promo', 'f-popular'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = false;
    });

    if (window.location.pathname.includes('shop.html')) {
        window.history.pushState({}, '', 'shop.html');
    }
    renderShop();
}

// СТАРТ
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    renderShop();
    renderPopularProducts();

    // ЖИВИЙ ПОШУК
    const searchForm = document.querySelector('.search-box');
    const searchInput = document.querySelector('.search-box input');

    if (searchForm && searchInput) {
        searchInput.setAttribute('autocomplete', 'off');

        const resultsBox = document.createElement('div');
        resultsBox.className = 'search-results-dropdown';
        searchForm.appendChild(resultsBox);

        searchInput.addEventListener('input', function () {
            const query = this.value.toLowerCase().trim();
            resultsBox.innerHTML = '';

            if (query.length === 0) {
                resultsBox.style.display = 'none';
                return;
            }

            const matches = productsData.filter(p => p.name.toLowerCase().includes(query));

            if (matches.length > 0) {
                matches.forEach(match => {
                    const item = document.createElement('div');
                    item.className = 'search-result-item';
                    item.innerHTML = `
                        <img src="${match.img}" alt="${match.name}">
                        <span>${match.name}</span>
                    `;
                    item.onclick = () => {
                        window.location.assign(`shop.html?id=${match.id}`);
                    };
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

    // Маска телефону
    const phoneInputs = document.querySelectorAll('.phone-mask');
    phoneInputs.forEach(input => {
        input.addEventListener('focus', function () { if (this.value === '') this.value = '+380'; });
        input.addEventListener('input', function () {
            let val = this.value.replace(/[^\d+]/g, '');
            if (!val.startsWith('+380')) val = '+380' + val.replace(/^\+?(380)?/, '');
            if (val.length > 13) val = val.slice(0, 13);
            this.value = val;
        });
    });

    // Кнопка Вгору
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.id = 'scrollTopBtn';
    scrollTopBtn.innerHTML = '<i class="fa fa-arrow-up"></i>';
    document.body.appendChild(scrollTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) scrollTopBtn.classList.add('show');
        else scrollTopBtn.classList.remove('show');
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// Бургер меню mobile
function toggleMenu() {
    document.getElementById('menu').classList.toggle('active');
    document.querySelector('.burger').classList.toggle('active');
}
