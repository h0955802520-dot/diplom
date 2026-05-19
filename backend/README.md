# БудМайстер — інтегрований Django-проєкт

Інтернет-магазин будівельних матеріалів. **Один Django-процес подає і фронт, і REST API** — підходить для звичайного хостингу (VPS / shared hosting з Python).

Стек: **Python 3.12 + Django 5 + DRF + PostgreSQL + Simple JWT + WhiteNoise**.

---

## Структура

```
backend/
├── budmaster/                  # Django project (settings, urls, wsgi)
├── apps/
│   ├── accounts/               # кастомний User + JWT
│   ├── catalog/                # товари, категорії, бренди, типи, відгуки
│   ├── cart/                   # кошик + обране
│   ├── orders/                 # замовлення, промокоди
│   └── blog/                   # статті, категорії блогу
├── templates/
│   └── pages/                  # HTML-сторінки фронту (index, shop, …)
├── static/
│   ├── css/style.css
│   ├── js/api.js, js.js
│   ├── img/, vendor/
├── staticfiles/                # збирається через collectstatic (gitignored)
├── media/                      # завантажені файли (gitignored)
├── Dockerfile
├── docker-compose.yml          # web (Django+gunicorn) + db (Postgres)
├── requirements.txt
├── .env.example
└── manage.py
```

URL-схема: `/` → `index.html`, `/shop.html` → каталог, `/api/...` → REST, `/admin/` → Django Admin, `/static/...` → CSS/JS/img.

---

## Дефолтні облікові дані

> ⚠️ **Для розробки тільки.** Перед деплоєм у прод обов'язково змініть пароль через `python manage.py changepassword admin`.

| Роль | Логін | Email | Пароль |
|------|-------|-------|--------|
| **Адміністратор** | `admin` | `admin@budmaster.local` | `admin12345` |

**Як увійти:**
- **З головної сторінки сайту**: натисніть іконку 👤 у шапці → введіть `admin` / `admin12345` → автоматично перенаправить у `/admin/`.
- **Через адмінку напряму**: <http://127.0.0.1:8001/admin/> → ті ж credentials.

Для звичайних користувачів реєстрація проходить аналогічно — модалка реєстрації у шапці → email + пароль → одразу автоматичний вхід. Після створення кабінету (Етап 5) користувачі будуть перенаправлятись у `/account/`.

---

## Запуск локально

### Варіант 1. SQLite (швидко, без Docker)

```bash
cd backend

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env             # опційно
python manage.py migrate
python manage.py seed_data       # 100 товарів, 6 постів, 3 промокоди
python manage.py createsuperuser

python manage.py runserver 8001
```

Відкрити:
- Сайт: <http://127.0.0.1:8001/>
- Каталог: <http://127.0.0.1:8001/shop.html>
- Адмінка: <http://127.0.0.1:8001/admin/>
- API: <http://127.0.0.1:8001/api/health/>

### Варіант 2. PostgreSQL через Docker Compose

```bash
cd backend
cp .env.example .env
docker compose up --build
```

- API + фронт → <http://localhost:8000>
- Postgres → `localhost:5432`
- При першому старті: `collectstatic` під час build, потім `migrate` + `seed_data` + `gunicorn`

```bash
docker compose exec web python manage.py createsuperuser
docker compose down              # зберегти дані
docker compose down -v           # знести Postgres-том теж
```

---

## Production deploy

### На VPS з nginx + systemd (типовий звичайний хостинг)

1. `git clone … && cd diplom/backend`
2. `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt`
3. У `.env` виставити:
   ```
   DJANGO_SECRET_KEY=<довгий випадковий рядок>
   DJANGO_DEBUG=False
   DJANGO_ALLOWED_HOSTS=budmaster.example.com
   DATABASE_URL=postgres://user:pass@localhost/budmaster
   ```
4. `.venv/bin/python manage.py migrate && seed_data && collectstatic --noinput`
5. systemd unit для gunicorn:
   ```
   ExecStart=/opt/budmaster/.venv/bin/gunicorn budmaster.wsgi:application \
            --bind unix:/run/budmaster.sock --workers 3
   ```
6. nginx як reverse-proxy:
   ```nginx
   server {
       listen 80;
       server_name budmaster.example.com;

       location /static/ { alias /opt/budmaster/backend/staticfiles/; }
       location /media/  { alias /opt/budmaster/backend/media/; }
       location / {
           proxy_pass http://unix:/run/budmaster.sock;
           proxy_set_header Host $host;
           proxy_set_header X-Forwarded-For $remote_addr;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

WhiteNoise теж може роздавати статику без nginx — для маленьких проектів цього досить.

### На shared hosting з cPanel/Passenger

Завантажити репозиторій, в Passenger вказати `budmaster/wsgi.py` як WSGI-application, прокинути env-змінні, запустити `python manage.py migrate && collectstatic`.

---

## Корисні команди

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data            # idempotent
python manage.py seed_data --flush    # жорстке перезаливання
python manage.py collectstatic        # перед деплоєм
python manage.py shell
```

---

## API ендпоінти

Базовий префікс: `/api/`

### Auth (`/api/auth/`)
| Метод | URL | Опис |
|-------|-----|------|
| POST  | `register/`  | Реєстрація |
| POST  | `login/`     | JWT login → `{ access, refresh }` |
| POST  | `refresh/`   | Оновлення access-токена |
| GET / PATCH | `me/`  | Профіль (Bearer) |

### Каталог (`/api/catalog/`)
- `products/` — фільтри: `type`, `category`, `brand`, `age`, `price_min`, `price_max`, `promo`, `popular`, `is_new`, `in_stock`; `search=`, `ordering=`, `page=`
- `products/<slug>/` — деталі
- `products/<slug>/similar/` — схожі
- `products/<slug>/reviews/` — GET/POST відгуків
- `categories/`, `types/`, `brands/`, `reviews/`

### Кошик (`/api/cart/`)
- GET / POST / DELETE на `/` — отримати / додати / очистити
- PATCH / DELETE на `/items/<id>/`
- `/wishlist/` — CRUD обраного
- `/wishlist/toggle/` — `{ product_id }`

### Замовлення (`/api/orders/`)
- POST `/` — створити (з кошика або переданого `items[]`)
- GET `/` та `/<id>/`
- POST `/promo/check/` — `{ code, subtotal }`

### Блог (`/api/blog/`)
- `posts/`, `posts/<slug>/`, `categories/`

---

## Промокоди (засіяні)

| Код      | Знижка       | Мін. замовлення |
|----------|--------------|-----------------|
| BUD10    | -10%         | 0               |
| BUD500   | -500 грн     | 1000 грн        |
| NEW2026  | -15%         | 0               |

---

## Швидкий тест

```bash
curl http://127.0.0.1:8001/api/health/
curl "http://127.0.0.1:8001/api/catalog/products/?type=cement&promo=true&page_size=5"

TOKEN=$(curl -s -X POST http://127.0.0.1:8001/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"<u>","password":"<p>"}' \
  | python3 -c "import json,sys;print(json.load(sys.stdin)['access'])")

curl -X POST http://127.0.0.1:8001/api/cart/ \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"product_id":1,"quantity":2}'
```

---

## Як це працює

1. Користувач відкриває `/shop.html` → Django повертає `templates/pages/shop.html`.
2. У HTML підключені `/static/js/api.js` і `/static/js/js.js`.
3. `js.js` у `DOMContentLoaded` викликає `BudMasterAPI.fetchAllProducts()` → `fetch('/api/catalog/products/')`.
4. Бек повертає JSON, фронт рендерить.
5. CORS НЕ потрібен — один origin.

Якщо API недоступне, фронт показує червоний банер «Не вдалося завантажити дані з сервера» з кнопкою Повторити.

---

## Що далі (планується)

- [ ] Кастомна адмін-панель у стилі сайту (товари, заказы, промокоди, статистика, повернення, форми, блог із текстовим редактором, користувачі з категоріями regular/wholesale/partner)
- [ ] Особистий кабінет користувача (профіль, історія замовлень, обране, адреси)
- [ ] Реальна auth-модалка на фронті з мерджем гостьового кошика
- [ ] Кастомні ціни для wholesale/partner
- [ ] Тести
