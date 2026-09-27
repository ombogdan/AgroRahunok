# Supabase для АгроРахунку

Вхід Google іде через Supabase Auth, як у Libris: застосунок отримує токен Google і передає його в `supabase.auth.signInWithIdToken`. Профіль (`profiles`) створює тригер бази під час першого входу, ділянки пишуться й читаються прямо з таблиці `fields`. Жодних скриптів, сервісних ключів чи Cloud Functions не потрібно: лише `.env` і налаштування в панелі Supabase.

## 1. Заповнити `.env`

Скопіюйте `.env.example` у `.env` у корені проєкту:

- `SUPABASE_URL` — Supabase → **Connect** → Project URL, вигляд `https://<project-ref>.supabase.co`. `/` чи `/rest/v1` у кінці застосунок відкидає сам.
- `SUPABASE_PUBLISHABLE_KEY` — **Settings → API Keys → Publishable key**, починається на `sb_publishable_`. Secret key у мобільний застосунок не кладіть.
- `GOOGLE_WEB_CLIENT_ID` — Google Cloud Console (проєкт Firebase) → **APIs & Services → Credentials** → «Web client (auto created by Google Service)», закінчується на `.apps.googleusercontent.com`.

Файл `.env` ігнорується Git. Значення потрапляють у збірку через `react-native-config`, тому після зміни `.env` застосунок треба перезібрати: перезапуску Metro недостатньо. Publishable key і Client ID не є секретами — доступ до записів обмежує RLS.

## 2. Увімкнути Google у Supabase

**Authentication → Sign In / Providers → Google**:

- **Enable Sign in with Google** — увімкнути.
- **Client IDs** — через кому: Web Client ID (той самий, що в `.env`) та iOS client ID (`CLIENT_ID` з `ios/GoogleService-Info.plist` або «iOS client» у Credentials).
- **Skip nonce checks** — увімкнути: нативний вхід Google на iOS додає nonce, якого застосунок не бачить.
- **Client Secret** для входу з телефона не потрібен.

## 3. Створити таблиці

У **SQL Editor** виконайте по черзі файли з `supabase/migrations`, яких ще немає у вашій базі:

- `20260926000002_supabase_auth.sql` — прибирає таблиці попередньої схеми з Firebase (`app_users` і `fields` зі стовпцем `owner_uid`) і створює `profiles` та `fields`;
- `20260927000000_plantings_and_records.sql` — журнал робіт: `plantings` (що росте на ділянці в сезоні) і `records` (роботи, а згодом збори й продажі).
- `20260927000001_crop_variety.sql` — сорт культури для ділянок і посадок.
- `20260927000002_quantity_units.sql` — власні одиниці урожаю й продажів, наприклад «відро = 5 кг».
- `20260927000003_general_records.sql` — загальні витрати й доходи без прив’язки до ділянки.

Усі таблиці мають RLS: кожен користувач бачить і змінює лише свої рядки; записи ділянок можна прив’язати лише до власної ділянки. Скрипти можна запускати повторно — наявні рядки не видаляються.

## 4. Перевірити

Після входу в застосунок:

- **Authentication → Users** — з'явився ваш акаунт;
- **Table Editor → profiles** — рядок з вашим іменем і поштою;
- додайте ділянку → **Table Editor → fields**.
- додайте свою одиницю у формі збору → **Table Editor → quantity_units**.

Якщо щось не працює, у dev-збірці причину видно на екрані входу або в консолі: помилки Supabase мають підказку, який крок перевірити. Без інтернету ділянки не завантажуються й не зберігаються — офлайн-режиму поки немає.

Корисні інструкції: [Вхід Google у Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google), [ключі API Supabase](https://supabase.com/docs/guides/getting-started/api-keys).
