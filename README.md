# WB AI — генератор карточек товаров

MVP AI-сервиса для продавцов Wildberries/Ozon/Avito: вводишь название и
характеристики товара — получаешь готовый заголовок, буллиты, описание и
ключевые слова под требования конкретной площадки.

Стек: **Next.js 14** + **Anthropic API** (генерация текста) + **Stripe**
(подписки) + **Supabase** (пользователи и лимиты).

## Быстрый старт

```bash
npm install
cp .env.example .env.local   # заполните ключи, см. ниже
npm run dev
```

Откройте http://localhost:3000 — форма генерации уже работает, если указан
`ANTHROPIC_API_KEY`. Всё остальное (Stripe, Supabase) можно подключать
постепенно.

## Где взять ключи

1. **ANTHROPIC_API_KEY** — console.anthropic.com → API Keys.
   Без него `/api/generate` не заработает — это ядро продукта.

2. **Supabase** (пользователи, лимиты, статус подписки):
   - Создайте проект на supabase.com
   - Settings → API → скопируйте `URL`, `anon key`, `service_role key`
   - В SQL Editor выполните скрипт из комментария в `lib/supabase.js`
     (создаёт таблицу `profiles`)

3. **Stripe** (приём оплаты за подписку):
   - Создайте продукт с ценой (например, 990₽/мес) → скопируйте `price_id`
   - Developers → API keys → `STRIPE_SECRET_KEY`
   - Developers → Webhooks → добавьте endpoint `<ваш-домен>/api/stripe/webhook`,
     подпишите на события `checkout.session.completed`,
     `customer.subscription.deleted`, `invoice.payment_failed` →
     скопируйте `STRIPE_WEBHOOK_SECRET`

## Деплой на Vercel

```bash
npm install -g vercel
vercel
```

Или через сайт: залейте проект на GitHub → на vercel.com "Add New Project" →
выберите репозиторий → добавьте все переменные из `.env.example` в
Settings → Environment Variables → Deploy.

После деплоя не забудьте:
- Обновить `NEXT_PUBLIC_SITE_URL` на ваш реальный домен
- Прописать реальный URL вебхука в настройках Stripe

## Что уже готово

- [x] Генерация карточки товара через Claude (заголовок, буллиты, описание, ключевые слова)
- [x] Правила форматирования под Wildberries / Ozon / Avito
- [x] Stripe Checkout для оформления подписки
- [x] Stripe webhook — активация/отмена подписки в базе
- [x] Проверка лимита бесплатных генераций

## Что нужно доделать под ваш продукт

- [ ] **Авторизация** — сейчас `/api/generate` работает без логина.
      Добавьте Supabase Auth (email/Google) на страницу входа и передавайте
      `userId` в запрос генерации, чтобы лимиты и подписка реально работали.
- [ ] **Личный кабинет** (`app/dashboard`) — история сгенерированных карточек,
      кнопка "Оформить подписку" (вызывает `/api/stripe/checkout`)
- [ ] **Rate limiting** на уровне API (например, через Upstash) — защита от
      злоупотреблений бесплатным тарифом
- [ ] **Landing-копирайтинг** — сейчас страница минимальная, для реальных
      продаж нужен нормальный маркетинговый текст, отзывы, примеры "было/стало"
- [ ] **Пробуйте разные модели** — `claude-sonnet-4-5` даёт качественный
      результат; для экономии на больших объёмах можно тестировать более
      дешёвую модель на несложных товарах

## Структура проекта

```
app/
  page.js                    — главная страница с формой генерации
  layout.js                  — корневой layout
  api/
    generate/route.js        — вызов Anthropic API, генерация карточки
    stripe/checkout/route.js — создание сессии оплаты
    stripe/webhook/route.js  — обработка событий Stripe
lib/
  supabase.js                — клиент Supabase + SQL-схема в комментарии
  stripe.js                  — клиент Stripe
```
