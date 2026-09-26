# Supabase для АгроРахунку

Firebase Auth лишається входом Google. У Supabase зберігаються профіль користувача (`app_users`) і його ділянки (`fields`). Паролі, Google OAuth токени й Firebase ID токени в таблиці не записуються. Журнал і гроші поки є порожніми екранами; для них додамо таблиці разом із робочими формами.

## 1. Заповнити `.env`

Скопіюйте `.env.example` у `.env` у корені проєкту. Потрібні два значення:

- `SUPABASE_URL`: у своєму проєкті Supabase натисніть **Connect** угорі праворуч і скопіюйте **Project URL**. Він має вигляд `https://<project-ref>.supabase.co`. Якщо берете URL у **Integrations → Data API**, приберіть з кінця `/rest/v1`.
- `SUPABASE_PUBLISHABLE_KEY`: **Settings → API Keys → Publishable key**. Починається на `sb_publishable_`. Не використовуйте `Secret key` або `service_role` у мобільному застосунку.

Файл `.env` ігнорується Git. У React Native значення потрапляють у збірку через `react-native-config`, тому після їх зміни застосунок потрібно перебудувати; лише перезапуск Metro не оновить нативну конфігурацію. Publishable key сам по собі не є секретом: доступ до записів обмежує RLS.

## 2. Дозволити Firebase Auth у Supabase

1. У **Firebase Console → Project settings → General** скопіюйте **Project ID** (не Web OAuth Client ID).
2. У **Supabase → Authentication → Third-Party Auth** додайте інтеграцію **Firebase** й укажіть цей Project ID.
3. Firebase ID token має містити custom claim `role: "authenticated"`. Цей claim встановлюється тільки через Firebase Admin SDK, а не через застосунок.

## 3. Створити таблиці та правила доступу

У **Supabase → SQL Editor** один раз виконайте в такому порядку:

1. `supabase/migrations/20260926000000_create_fields.sql`
2. `supabase/migrations/20260926000001_create_app_users.sql`

Обидві таблиці мають RLS: користувач бачить та змінює лише рядки зі своїм Firebase UID. UID у Firebase є текстом, тому політики порівнюють його з `sub` у токені.

## 4. Надати claim наявним користувачам

У **Firebase Console → Project settings → Service accounts** натисніть **Generate new private key**. Збережіть JSON поза репозиторієм; він має адміністративні права. На своєму комп’ютері встановіть залежності каталогу `functions`, задайте `GOOGLE_APPLICATION_CREDENTIALS` як шлях до цього JSON і `FIREBASE_PROJECT_ID` як Project ID, після чого запустіть `node grant-existing-users.cjs` з каталогу `functions`.

Приклад команд, які виконуєте ви:

```sh
cd functions
npm install
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/firebase-service-account.json"
export FIREBASE_PROJECT_ID="your-firebase-project-id"
node grant-existing-users.cjs
```

Скрипт додає claim усім поточним користувачам, зберігаючи інші їхні claims. Після цього вийдіть із застосунку й увійдіть знову або дочекайтеся автоматичного оновлення токена.

## 5. Автоматично обробляти нових користувачів

Підготовлена Firebase Function `grantSupabaseRole` додає той самий claim при створенні нового Firebase-користувача. Для її розгортання Firebase вимагає тариф Blaze. Коли будете готові, після встановлення Firebase CLI виконайте з кореня проєкту:

```sh
npx firebase-tools login
npx firebase-tools deploy --only functions:grantSupabaseRole --project your-firebase-project-id
```

Якщо функцію ще не розгорнуто, повторіть крок 4 після появи нових користувачів. Перший вхід нового користувача може відбутися до появи claim; застосунок повторює синхронізацію.

## 6. Встановити залежності та перевірити

У корені проєкту виконайте `yarn install` і перебудуйте застосунок самостійно. Нові залежності: `@supabase/supabase-js`, `react-native-config`, `react-native-url-polyfill`. Поточний `postinstall` проєкту також запускає `pod install`.

Для наявного Node 20 пакет `@supabase/supabase-js` зафіксовано на `2.109.0` без `^`: новіші версії вимагають Node 22. Після переходу на Node 22 його можна буде оновити.

Після входу відкрийте **Supabase → Table Editor → app_users**: має з’явитися рядок із вашим Firebase UID. Додайте ділянку й перевірте **Table Editor → fields**. Якщо хмара недоступна, ділянка залишається локальною та синхронізується пізніше; стан видно на головній та в розділі «Ділянки».

Корисні офіційні інструкції: [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys), [Firebase Auth у Supabase](https://supabase.com/docs/guides/auth/third-party/firebase-auth), [Firebase custom claims](https://firebase.google.com/docs/auth/admin/custom-claims).
