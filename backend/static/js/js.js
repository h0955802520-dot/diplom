/* ===========================================================================
 * БУДМАЙСТЕР — main JS bundle
 * ---------------------------------------------------------------------------
 * Структура файлу (за порядком згори донизу):
 *
 *  1. ДАНІ — productsData / BLOG_POSTS заповнюються асинхронно з REST-бекенду
 *            через BudMasterAPI (див. js/api.js). До завершення завантаження
 *            масиви порожні.
 *  2. СТАН — cart / wishlist / recentlyViewed із localStorage
 *  3. КОНСТАНТИ — FREE_DELIVERY_THRESHOLD, MIN_ORDER (бізнес-пороги UI)
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
// 1. ДАНІ (заповнюються асинхронно з REST-бекенду через BudMasterAPI)
// ============================================
// До завершення fetch ці масиви порожні — render-функції викликаються
// після bootstrap() у DOMContentLoaded handler-і.
let productsData = [];

// ============================================
// СТАН: КОШИК / ВИБРАНІ / ПЕРЕГЛЯНУТІ
// ============================================
let cart = JSON.parse(localStorage.getItem('budMasterCart')) || [];
let wishlist = JSON.parse(localStorage.getItem('budMasterWishlist')) || [];
let recentlyViewed = JSON.parse(localStorage.getItem('budMasterRecent')) || [];

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

async function submitLogin() {
    hideAuthError('login-error');
    const btn = document.querySelector('#auth-login .auth-submit');
    const id = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    if (!id) { showAuthError('login-error', 'Вкажіть email або номер телефону'); return; }
    if (!pass || pass.length < 4) { showAuthError('login-error', 'Введіть пароль (мін. 4 символи)'); return; }

    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Вхід...'; }
    try {
        const data = await BudMasterAPI.login({ username: id, password: pass });
        // Якщо staff/superuser — одразу в адмінку
        if (data.user && (data.user.is_staff || data.user.is_superuser)) {
            window.location.href = '/admin/';
            return;
        }
        // Звичайний користувач: оновлюємо UI, поки кабінет не зроблений
        updateUserHeader();
        showSuccessAuth(`Вітаємо, ${data.user.first_name || data.user.username}! Кабінет з'явиться найближчим часом.`);
    } catch (err) {
        showAuthError('login-error', err.message || 'Помилка входу');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa fa-sign-in-alt"></i> Увійти'; }
    }
}

async function submitRegister() {
    hideAuthError('reg-error');
    const btn = document.querySelector('#auth-register .auth-submit');
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

    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Створюємо...'; }
    try {
        const data = await BudMasterAPI.register({
            name: name,
            email: isPhone ? '' : email,
            phone: isPhone ? phone : '',
            password: pass,
        });
        // Тільки що зареєстрований — точно не staff. Оновлюємо хедер.
        updateUserHeader();
        showSuccessAuth(`Вітаємо, ${data.user.first_name || name}! Реєстрація успішна.`);
    } catch (err) {
        let msg = err.message || 'Помилка реєстрації';
        // DRF може віддати помилки полями
        if (err.body && typeof err.body === 'object') {
            const parts = [];
            for (const [k, v] of Object.entries(err.body)) {
                parts.push(`${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
            }
            if (parts.length) msg = parts.join(' · ');
        }
        showAuthError('reg-error', msg);
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa fa-user-plus"></i> Зареєструватись'; }
    }
}

// ============================================
// UI: показ юзера в шапці + logout
// ============================================
function updateUserHeader() {
    document.querySelectorAll('.hdr-user-state').forEach(el => {
        const user = BudMasterAPI.getUser();
        if (user) {
            const label = user.first_name || user.username || 'Кабінет';
            const adminLink = (user.is_staff || user.is_superuser)
                ? `<a href="/admin/" class="hdr-user-admin" title="Адмінка"><i class="fa fa-cog"></i></a>`
                : '';
            el.innerHTML = `
                <span class="hdr-user-name"><i class="fa fa-user-check"></i> ${label}</span>
                ${adminLink}
                <button class="hdr-user-logout" onclick="logoutUser()" title="Вийти"><i class="fa fa-sign-out-alt"></i></button>
            `;
            el.classList.add('authenticated');
        } else {
            el.innerHTML = `
                <button class="hdr-icon" onclick="openAuthModal('login')" title="Особистий кабінет" aria-label="Вхід">
                    <i class="fa fa-user"></i>
                </button>
            `;
            el.classList.remove('authenticated');
        }
    });
}

async function logoutUser() {
    await BudMasterAPI.logout();
    updateUserHeader();
    showToast('Ви вийшли з акаунту');
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
                <p class="prod-stock stock-line ${stockClass}"><i class="fa fa-circle"></i> ${stockLabel}</p>
                <div class="prod-price-block">
                    ${product.oldPrice ? `<span class="old-price">${product.oldPrice} грн</span>` : ''}
                    <span class="prod-price">${product.price} грн</span>
                </div>

                <div class="prod-qty-row">
                    <label>Кількість:</label>
                    <div class="cart-controls">
                        <button class="cart-control-btn" type="button" onclick="changeProdQty(-1)" aria-label="Зменшити">−</button>
                        <input type="text" inputmode="numeric" class="cart-control-input" id="prod-qty" value="1" aria-label="Кількість" oninput="sanitizeProdQty(this)" onblur="if(!this.value||parseInt(this.value)<1)this.value=1">
                        <button class="cart-control-btn" type="button" onclick="changeProdQty(1)" aria-label="Збільшити">+</button>
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
    let q = (parseInt(el.value, 10) || 1) + delta;
    if (q < 1) q = 1;
    if (q > 999) q = 999;
    el.value = q;
}

function sanitizeProdQty(el) {
    let v = el.value.replace(/[^\d]/g, '');
    if (v.length > 3) v = v.slice(0, 3);
    el.value = v;
}

function addProductToCart(id) {
    const el = document.getElementById('prod-qty');
    const qty = Math.max(1, parseInt(el && el.value, 10) || 1);
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
    const email = input.value;
    event.target.reset();

    const modal = document.getElementById('newsletterModal');
    if (modal) {
        const emailEl = modal.querySelector('.newsletter-email');
        if (emailEl) emailEl.textContent = email;
        modal.style.display = 'flex';
    }
}

function closeNewsletterModal() {
    const modal = document.getElementById('newsletterModal');
    if (modal) modal.style.display = 'none';
}

// ============================================
// МОДАЛКИ ПОВЕРНЕННЯ ТОВАРУ (services.html)
// ============================================
function openReturnChoiceModal() {
    closeReturnModals();
    const m = document.getElementById('returnChoiceModal');
    if (m) m.style.display = 'flex';
}

function chooseReturnEmail() {
    window.location.href = 'mailto:returns@budmaster.ua?subject=' + encodeURIComponent('Повернення товару');
    closeReturnModals();
}

function openReturnForm() {
    closeReturnModals();
    const m = document.getElementById('returnFormModal');
    if (m) {
        m.style.display = 'flex';
        if (typeof initPhoneMask === 'function') initPhoneMask();
    }
}

function submitReturnForm(event) {
    event.preventDefault();
    event.target.reset();
    closeReturnModals();
    const m = document.getElementById('returnSuccessModal');
    if (m) m.style.display = 'flex';
}

function closeReturnModals() {
    ['returnChoiceModal', 'returnFormModal', 'returnSuccessModal'].forEach(id => {
        const m = document.getElementById(id);
        if (m) m.style.display = 'none';
    });
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
// COOKIE BANNER
// ============================================
function initCookieBanner() {
    if (localStorage.getItem('budMasterCookiesAccepted') === '1') return;

    const banner = document.createElement('div');
    banner.id = 'cookieBanner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Повідомлення про файли cookie');
    banner.innerHTML = `
        <div class="cookie-banner-inner">
            <div class="cookie-icon" aria-hidden="true">
                <i class="fa fa-cookie-bite"></i>
            </div>
            <div class="cookie-text">
                <strong>Ми використовуємо файли cookie</strong>
                <p>Cookie допомагають нам покращувати роботу сайту, запам'ятовувати ваші вподобання та аналізувати відвідуваність. Продовжуючи користуватися сайтом, ви погоджуєтесь з нашою політикою конфіденційності.</p>
            </div>
            <div class="cookie-actions">
                <button type="button" class="btn-primary" onclick="acceptCookies()">Прийняти всі</button>
            </div>
        </div>
    `;
    document.body.appendChild(banner);
    document.body.classList.add('has-cookie-banner');
}

function acceptCookies() {
    localStorage.setItem('budMasterCookiesAccepted', '1');
    const banner = document.getElementById('cookieBanner');
    if (banner) {
        banner.classList.add('hide');
        setTimeout(() => banner.remove(), 250);
    }
    document.body.classList.remove('has-cookie-banner');
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
let BLOG_POSTS = [];

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
                <div class="hdr-user-state">
                    <button class="hdr-icon" onclick="openAuthModal('login')" title="Особистий кабінет" aria-label="Вхід">
                        <i class="fa fa-user"></i>
                    </button>
                </div>
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
    <div id="newsletterModal" class="modal-overlay" onclick="if(event.target===this)closeNewsletterModal()">
        <div class="modal-content">
            <i class="fa fa-check-circle newsletter-check"></i>
            <h2>Ви підписані</h2>
            <p class="modal-desc">Дякуємо! Адресу <strong class="newsletter-email"></strong> додано до розсилки. Найближчим часом ви отримаєте першого листа з добіркою корисних матеріалів.</p>
            <button class="btn-primary btn-full" onclick="closeNewsletterModal()">Продовжити</button>
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
// Bootstrap: завантажує товари і блог з REST-бекенду, потім рендерить сторінку.
// Шапка/футер інжектяться одразу (вони не потребують даних) — щоб не мигало.
// Render-функції викликаються лише після того, як productsData/BLOG_POSTS
// наповнились, або після помилки fetch (тоді показуємо банер).

function pageNeedsProducts() {
    return !!(
        document.getElementById('shop-grid')
        || document.getElementById('popular-grid')
        || document.getElementById('product-page-container')
    );
}

function pageNeedsBlog() {
    return !!(
        document.getElementById('blog-list-grid')
        || document.getElementById('article-container')
    );
}

function showApiErrorBanner(message) {
    if (document.getElementById('api-error-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'api-error-banner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#dc2626;color:#fff;padding:12px 20px;text-align:center;font-size:14px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,0.2);';
    banner.innerHTML = `<i class="fa fa-exclamation-triangle" style="margin-right:8px;"></i> ${message} <button onclick="location.reload()" style="margin-left:16px;background:#fff;color:#dc2626;border:none;padding:6px 14px;border-radius:4px;font-weight:600;cursor:pointer;">Повторити</button>`;
    document.body.appendChild(banner);
    document.body.style.paddingTop = '52px';
}

async function bootstrapData() {
    const tasks = [];
    if (pageNeedsProducts()) {
        tasks.push(
            BudMasterAPI.fetchAllProducts()
                .then(list => { productsData = list; })
        );
    }
    if (pageNeedsBlog()) {
        tasks.push(
            BudMasterAPI.fetchAllBlogPosts()
                .then(list => { BLOG_POSTS = list; })
        );
    }
    if (tasks.length === 0) return;
    try {
        await Promise.all(tasks);
    } catch (err) {
        console.error('[BudMaster] Не вдалося завантажити дані з API:', err);
        showApiErrorBanner(`Не вдалося завантажити дані з сервера (${err.message}). Перевірте, чи запущено бекенд на ${BudMasterAPI.BASE}.`);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Інжект спільних блоків (header + footer + modals)
    injectHeader();
    injectFooter();

    // 2. Базова ініціалізація стану (бейджі кошика, обраного, юзер у шапці)
    updateCartBadge();
    updateWishlistBadge();
    updateUserHeader();

    // 3. UI-helpers (працюють для всіх сторінок, не залежать від даних)
    initLiveSearch();
    initPhoneMask();
    initScrollTopBtn();
    initHeroSlider();
    initEscClose();
    initCookieBanner();

    // 4. Завантаження даних з бекенду (потрібно лише на сторінках, де є каталог чи блог)
    await bootstrapData();

    // 5. Render-функції — викликаємо лише ті, що є на поточній сторінці
    if (document.getElementById('shop-grid')) renderShop();
    if (document.getElementById('popular-grid')) renderHomeSections();
    if (document.getElementById('product-page-container')) renderProductPage();
    if (document.getElementById('cart-items-container') && typeof renderCartPage === 'function') renderCartPage();
    if (document.getElementById('blog-list-grid')) renderBlogList();
    if (document.getElementById('article-container')) renderArticlePage();
});
