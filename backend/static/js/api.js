/* ===========================================================================
 * БУДМАЙСТЕР — API client
 * ---------------------------------------------------------------------------
 * Обгортка над REST-бекендом (Django + DRF). Бек і фронт працюють на одному
 * домені, тому базовий URL — відносний /api. Перетворює серверні поля у
 * формат, який очікує фронт (legacy_id → id, old_price → oldPrice,
 * is_new → isNew). Всі цифри парсяться в Number.
 *
 * Глобальний об’єкт `BudMasterAPI` доступний у всіх скриптах сторінки;
 * api.js підключається ПЕРЕД js.js і checkout-інлайнами.
 *
 * Базову адресу можна перевизначити до завантаження api.js:
 *     <script>window.BUDMASTER_API_BASE = 'https://api.example.com/api';</script>
 * =========================================================================== */
window.BudMasterAPI = (() => {
    const BASE = window.BUDMASTER_API_BASE || '/api';

    // ---- мапери "бек → фронт" -----------------------------------------------
    function mapProduct(p) {
        return {
            id: String(p.legacy_id),         // фронт історично використовує string id
            slug: p.slug,
            name: p.name,
            price: Number(p.price),
            oldPrice: p.old_price != null ? Number(p.old_price) : undefined,
            type: p.type,
            category: p.category,
            age: p.age,
            brand: p.brand,
            stock: Number(p.stock),
            promo: !!p.promo,
            popular: !!p.popular,
            isNew: !!p.is_new,
            img: p.img,
            description: p.description,
        };
    }

    function mapBlogPost(p) {
        return {
            id: Number(p.legacy_id),
            slug: p.slug,
            cat: p.cat,
            date: p.date,
            title: p.title,
            excerpt: p.excerpt,
            img: p.img,
            content: p.content,
        };
    }

    // ---- низькорівневий fetch з обробкою помилок ----------------------------
    /** Якщо path абсолютний (http…) або вже містить BASE — використовуємо як є,
     *  інакше додаємо префікс BASE. Це підтримує і пагінаційний `next` від DRF
     *  (абсолютний URL), і відносні шляхи на кшталт `/catalog/products/`. */
    async function request(path, opts = {}) {
        let url;
        if (path.startsWith('http') || path.startsWith(BASE + '/') || path === BASE) {
            url = path;
        } else {
            url = `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
        }
        const r = await fetch(url, {
            headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
            ...opts,
        });
        const text = await r.text();
        let data;
        try { data = text ? JSON.parse(text) : null; } catch { data = text; }
        if (!r.ok) {
            const msg = (data && (data.detail || data.error)) || `HTTP ${r.status}`;
            const err = new Error(msg);
            err.status = r.status;
            err.body = data;
            throw err;
        }
        return data;
    }

    // ---- каталог -------------------------------------------------------------
    /** Завантажує ВСІ товари (постранично, до 100 шт на сторінку). */
    async function fetchAllProducts() {
        const all = [];
        let url = `${BASE}/catalog/products/?page_size=100`;
        while (url) {
            const data = await request(url);
            all.push(...data.results.map(mapProduct));
            url = data.next;
        }
        // зберігаємо порядок як на легасі — за legacy_id
        all.sort((a, b) => Number(a.id) - Number(b.id));
        return all;
    }

    async function fetchProduct(slug) {
        const data = await request(`/catalog/products/${slug}/`);
        return mapProduct(data);
    }

    // ---- блог ----------------------------------------------------------------
    async function fetchAllBlogPosts() {
        const all = [];
        let url = `${BASE}/blog/posts/?page_size=100`;
        while (url) {
            const data = await request(url);
            all.push(...data.results.map(mapBlogPost));
            url = data.next;
        }
        all.sort((a, b) => a.id - b.id);
        return all;
    }

    // ---- промокоди -----------------------------------------------------------
    /** Перевіряє промокод на бекенді. Повертає
     *  { valid: true, code, label, type, value, discount } або кидає Error. */
    async function validatePromo(code, subtotal) {
        return request('/orders/promo/check/', {
            method: 'POST',
            body: JSON.stringify({ code, subtotal }),
        });
    }

    // ---- auth -----------------------------------------------------------
    const TOKEN_KEY = 'budMasterAccessToken';
    const REFRESH_KEY = 'budMasterRefreshToken';
    const USER_KEY = 'budMasterUser';

    function getAccessToken() { return localStorage.getItem(TOKEN_KEY); }
    function getUser() {
        try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
    }
    function isAuthenticated() { return !!getAccessToken(); }
    function isStaff() {
        const u = getUser();
        return !!(u && (u.is_staff || u.is_superuser));
    }

    function _storeAuth(data) {
        if (data.access) localStorage.setItem(TOKEN_KEY, data.access);
        if (data.refresh) localStorage.setItem(REFRESH_KEY, data.refresh);
        if (data.user) localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    function _clearAuth() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_KEY);
    }

    async function login(credentials) {
        // credentials: { username, password }  (username = email/phone/login)
        const data = await request('/auth/login/', {
            method: 'POST',
            credentials: 'include',   // дозволяємо cookie для Django session
            body: JSON.stringify(credentials),
        });
        _storeAuth(data);
        return data;
    }

    async function register(payload) {
        const data = await request('/auth/register/', {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        _storeAuth(data);
        return data;
    }

    async function logout() {
        try {
            await request('/auth/logout/', { method: 'POST', credentials: 'include' });
        } catch (_) { /* ignore */ }
        _clearAuth();
    }

    return {
        BASE,
        fetchAllProducts,
        fetchProduct,
        fetchAllBlogPosts,
        validatePromo,
        login,
        register,
        logout,
        getAccessToken,
        getUser,
        isAuthenticated,
        isStaff,
    };
})();
