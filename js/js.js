// БАЗА ТОВАРІВ
const productsData = [
    { id: '1', name: 'LEGO City Поліцейська дільниця', price: 1500, category: 'boys', type: 'constructor', age: '6+', brand: 'lego', promo: false, popular: true, img: 'img/lego-1.jpg' },
    { id: '2', name: 'Лялька L.O.L. Surprise O.M.G.', price: 999, oldPrice: 1250, category: 'girls', type: 'doll', age: '3-6', brand: 'lol', promo: true, popular: true, img: 'img/lol.jpg' },
    { id: '3', name: 'Машинка Hot Wheels Базовий набір', price: 450, category: 'boys', type: 'car', age: '3-6', brand: 'hotwheels', promo: false, popular: true, img: 'img/HotWheels.jpg' },
    { id: '4', name: 'Інтерактивний Песик Fisher-Price', price: 1200, category: 'girls', type: 'educational', age: '0-3', brand: 'fisherprice', promo: false, popular: false, img: 'img/dog.jpg' },
    { id: '5', name: 'Барбі Будинок Мрії', price: 3500, oldPrice: 4000, category: 'girls', type: 'doll', age: '6+', brand: 'barbie', promo: true, popular: false, img: 'img/barbi.jpg' },
    { id: '6', name: 'LEGO Friends Кафе', price: 850, category: 'girls', type: 'constructor', age: '6+', brand: 'lego', promo: false, popular: false, img: 'img/lego-2.jpg' },
    { id: '7', name: 'Трек Hot Wheels Подвійна петля', price: 1800, category: 'boys', type: 'car', age: '6+', brand: 'hotwheels', promo: false, popular: false, img: 'img/wheels.jpg' },
    { id: '8', name: 'Екскаватор на радіокеруванні', price: 950, oldPrice: 1100, category: 'boys', type: 'car', age: '3-6', brand: 'other', promo: true, popular: true, img: 'img/toy-1.jpg' },
    { id: '9', name: 'Розвиваючий килимок Fisher-Price', price: 1400, category: 'boys', type: 'educational', age: '0-3', brand: 'fisherprice', promo: false, popular: false, img: 'img/toys.jpg' },
    { id: '10', name: 'Конструктор LEGO Ninjago', price: 1100, category: 'boys', type: 'constructor', age: '6+', brand: 'lego', promo: false, popular: false, img: 'img/lego-3.jpg' },
    { id: '11', name: 'Набір для ліплення Play-Doh', price: 550, category: 'girls', type: 'educational', age: '3-6', brand: 'other', promo: false, popular: false, img: 'img/nabor.jpg' },
    { id: '12', name: 'Лялька L.O.L. Tweens', price: 750, oldPrice: 900, category: 'girls', type: 'doll', age: '6+', brand: 'lol', promo: true, popular: false, img: 'img/lol-2.jpg' },
    { id: '13', name: 'Набір лікаря', price: 400, category: 'girls', type: 'educational', age: '3-6', brand: 'other', promo: false, popular: false, img: 'img/nabor.jpg' },
    { id: '14', name: 'Спортивна RC Машинка', price: 1600, category: 'boys', type: 'car', age: '6+', brand: 'other', promo: false, popular: false, img: 'img/car.jpg' },
    { id: '15', name: 'Барбі Русалонька', price: 650, category: 'girls', type: 'doll', age: '3-6', brand: 'barbie', promo: false, popular: false, img: 'img/barbie.jpg' },
    { id: '16', name: 'LEGO Duplo Поїзд', price: 1300, oldPrice: 1600, category: 'boys', type: 'constructor', age: '0-3', brand: 'lego', promo: true, popular: false, img: 'img/lego-4.jpg' },
    { id: '17', name: 'Пірамідка дерев\'яна', price: 250, category: 'girls', type: 'educational', age: '0-3', brand: 'fisherprice', promo: false, popular: false, img: 'img/piramida.jpg' },
    { id: '18', name: 'Колекційна модель Porsche', price: 500, category: 'boys', type: 'car', age: '6+', brand: 'other', promo: false, popular: false, img: 'img/porshe.jpg' },
    { id: '19', name: 'Ляльковий візочок', price: 800, oldPrice: 1000, category: 'girls', type: 'doll', age: '3-6', brand: 'other', promo: true, popular: false, img: 'img/wos.jpg' },
    { id: '20', name: 'Дитячий набір інструментів', price: 650, category: 'boys', type: 'educational', age: '3-6', brand: 'other', promo: false, popular: false, img: 'img/tools.jpg' },
    { id: '21', name: 'Головоломка Кубик Рубіка', price: 350, category: 'boys', type: 'educational', age: '6+', brand: 'other', promo: false, popular: false, img: 'img/kub.jpg' }
];

// КОШИК
let cart = JSON.parse(localStorage.getItem('toyShopCart')) || [];

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
    localStorage.setItem('toyShopCart', JSON.stringify(cart));
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
        if(sidebarSearch) sidebarSearch.value = query;
        
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

// ОФОРМЛЕННЯ ЗАМОВЛЕННЯ (КОШИК)
function processCheckout(event) {
    event.preventDefault();
    if (cart.length === 0) { alert("Ваш кошик порожній!"); return; }

    const phoneInput = document.getElementById('checkoutPhone');
    if (phoneInput && phoneInput.value.length < 13) {
        alert("Введіть коректний номер: +380 та 9 цифр"); return;
    }

    document.getElementById('successModal').style.display = 'flex';

    cart = [];
    localStorage.setItem('toyShopCart', JSON.stringify(cart));
    updateCartBadge();
    event.target.reset();
    if (typeof renderCartPage === 'function') renderCartPage();
}

// ВИВІД ПОПУЛЯРНИХ ТОВАРІВ НА ГОЛОВНІЙ
function renderPopularProducts() {
    const grid = document.getElementById('popular-grid');
    if (!grid) return;

    const popularItems = productsData.filter(p => p.popular).slice(0, 4);

    grid.innerHTML = popularItems.map(p => `
        <div class="product-card">
            ${p.promo ? '<span class="discount-badge">ЗНИЖКА</span>' : ''}
            <span class="popular-badge">ПОПУЛЯРНЕ</span>
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

// РЕНДЕР ТОВАРІВ В МАГАЗИНІ
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
            ${p.popular ? '<span class="popular-badge">ПОПУЛЯРНЕ</span>' : ''}
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

// ЗАПУСК СКРИПТІВ ТА ЛОГІКА ПОШУКУ
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    renderShop();
    renderPopularProducts();

    // СТВОРЕННЯ ВИПАДАЮЧОГО СПИСКУ ДЛЯ ПОШУКУ
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