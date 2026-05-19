# БудМайстер — Backend (Django + DRF)

REST API для інтернет-магазину будівельних матеріалів. Стек: **Python 3.12 + Django 5 + DRF + PostgreSQL + Simple JWT**.

---

## Структура

```
backend/
├── budmaster/          # Django project (settings, urls, wsgi)
├── apps/
│   ├── accounts/       # кастомний User + JWT-аутентифікація
│   ├── catalog/        # товари, категорії, бренди, типи, відгуки
│   ├── cart/           # кошик + обране (wishlist)
│   ├── orders/         # замовлення, промокоди
│   └── blog/           # статті, категорії блогу
├── Dockerfile
├── docker-compose.yml  # backend + Postgres
├── requirements.txt
├── .env.example
└── manage.py
```

---

## Запуск локально

### Варіант 1. SQLite (швидко, без Docker)

```bash
cd backend

# 1. Створити venv та поставити залежності
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 2. (опційно) .env — для SQLite можна не створювати, дефолти підійдуть
cp .env.example .env

# 3. Міграції
python manage.py migrate

# 4. Сидинг — заливає 100 товарів, 6 постів, 3 промокоди з js/js.js
python manage.py seed_data

# 5. Суперюзер для адмінки
python manage.py createsuperuser

# 6. Запуск
python manage.py runserver 8001
```

Адмінка: <http://127.0.0.1:8001/admin/>
Health: <http://127.0.0.1:8001/api/health/>

### Варіант 2. PostgreSQL через Docker Compose

```bash
cd backend
cp .env.example .env   # за бажанням підправити SECRET_KEY, CORS
docker compose up --build
```

- Postgres підніметься на `localhost:5432`
- API — на `http://localhost:8001`
- При першому старті `Dockerfile` автоматично виконає `migrate` і `seed_data`

Створити суперюзера в контейнері:

```bash
docker compose exec backend python manage.py createsuperuser
```

Зупинити:

```bash
docker compose down            # зберегти дані
docker compose down -v         # знести й Postgres-том теж
```

---

## Корисні команди

```bash
# Перегенерувати міграції після правки моделей
python manage.py makemigrations
python manage.py migrate

# Перезалити дані з js.js (idempotent, оновлює існуючі)
python manage.py seed_data

# Жорстке перезаливання (видалить товари/блог/промокоди)
python manage.py seed_data --flush

# Django shell
python manage.py shell

# Запустити тести (коли з’являться)
python manage.py test
```

---

## API ендпоінти

Базовий префікс: `/api/`

### Auth (`/api/auth/`)
| Метод | URL | Опис |
|-------|-----|------|
| POST  | `register/`  | Реєстрація (username, email, password) |
| POST  | `login/`     | JWT login → `{ access, refresh }` |
| POST  | `refresh/`   | Оновлення access-токена |
| GET / PATCH | `me/`  | Профіль поточного юзера (потрібен Bearer) |

### Каталог (`/api/catalog/`)
| URL | Опис |
|-----|------|
| `products/`                | Список товарів (фільтри: `type`, `category`, `brand`, `age`, `price_min`, `price_max`, `promo`, `popular`, `is_new`, `in_stock`; `search=`, `ordering=`, `page=`) |
| `products/<slug>/`         | Деталі товару |
| `products/<slug>/similar/` | До 4 схожих товарів того ж типу |
| `products/<slug>/reviews/` | GET/POST відгуків (POST потребує auth) |
| `categories/`              | construction / finishing |
| `types/`                   | cement, brick, tool, paint, metal, electric, finishing |
| `brands/`                  | Knauf, Bosch, Makita … |
| `reviews/`                 | CRUD відгуків |

### Кошик (`/api/cart/`)
| Метод | URL | Опис |
|-------|-----|------|
| GET    | `/`             | Поточний кошик |
| POST   | `/`             | Додати: `{ product_id, quantity }` |
| DELETE | `/`             | Очистити кошик |
| PATCH  | `/items/<id>/`  | Змінити кількість (0 → видалення) |
| DELETE | `/items/<id>/`  | Видалити позицію |
| GET    | `/wishlist/`    | Список обраного |
| POST   | `/wishlist/toggle/` | Перемкнути обране для `product_id` |

### Замовлення (`/api/orders/`)
| Метод | URL | Опис |
|-------|-----|------|
| POST | `/`              | Створити замовлення (із кошика або переданого `items[]`) |
| GET  | `/`              | Список своїх замовлень (auth) |
| GET  | `/<id>/`         | Деталі замовлення |
| POST | `/promo/check/`  | Перевірити промокод: `{ code, subtotal }` |

### Блог (`/api/blog/`)
| URL | Опис |
|-----|------|
| `posts/`         | Список статей (фільтр `category__slug=`) |
| `posts/<slug>/`  | Стаття |
| `categories/`    | Категорії блогу |

---

## Промокоди (засіяні з фронту)

| Код      | Знижка       | Мін. замовлення |
|----------|--------------|-----------------|
| BUD10    | -10%         | 0               |
| BUD500   | -500 грн     | 1000 грн        |
| NEW2026  | -15%         | 0               |

---

## Швидкий тест API

```bash
# health
curl http://127.0.0.1:8001/api/health/

# каталог
curl "http://127.0.0.1:8001/api/catalog/products/?type=cement&promo=true&page_size=5"

# реєстрація + логін
curl -X POST http://127.0.0.1:8001/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"ivan","email":"i@i.com","password":"Pa$$word2026!"}'

TOKEN=$(curl -s -X POST http://127.0.0.1:8001/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"ivan","password":"Pa$$word2026!"}' \
  | python3 -c "import json,sys;print(json.load(sys.stdin)['access'])")

# додати в кошик
curl -X POST http://127.0.0.1:8001/api/cart/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"product_id":1,"quantity":2}'

# промокод
curl -X POST http://127.0.0.1:8001/api/orders/promo/check/ \
  -H "Content-Type: application/json" \
  -d '{"code":"BUD10","subtotal":1000}'
```

---

## CORS

За замовчуванням дозволені origin'и (з `.env.example`):
- `http://localhost:8000`, `http://127.0.0.1:8000` (фронт через `python3 -m http.server 8000`)
- `http://localhost:5500`, `http://127.0.0.1:5500` (Live Server у VSCode)

Змінити — у `.env` через `CORS_ALLOWED_ORIGINS`.

---

## Що далі

- [ ] Уточнити модель замовлення під формат checkout (адреси, отримувач)
- [ ] Тести (pytest або стандартний `manage.py test`)
- [ ] Інтеграція фронту: замінити `productsData` у `js/js.js` на `fetch('/api/catalog/products/')`
- [ ] CI (GitHub Actions)
- [ ] Деплой бека на Railway/Render
