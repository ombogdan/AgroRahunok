# Firebase Google вхід: що налаштувати

Код і native wiring підготовлені. До першого встановлення залежностей і запуску власник проєкту має додати конфігураційні файли зі свого Firebase проєкту. У репозиторії вони і приватний Android keystore ігноруються Git.

## 1. Увімкнути Google

1. Відкрити [Firebase Console](https://console.firebase.google.com/) → потрібний проєкт.
2. **Build / Authentication → Get started** (якщо це перший вхід) → **Sign-in method → Google → Enable**.
3. Вибрати **Project support email** і натиснути **Save**.

## 2. Android

1. **Project settings** (шестерня біля Project Overview) → **General → Your apps**. Додати Android застосунок із package name `com.agrorahunok.mobile` або перевірити це значення в уже створеному застосунку.
2. У картці Android застосунку натиснути **Add fingerprint** і додати обидва відбитки нового ключа AgroRahunok:
   - SHA-1: `CF:6A:A1:3B:C5:A5:69:C2:96:95:C7:E2:49:A3:FF:71:0E:00:57:A1`
   - SHA-256: `EE:88:A2:1A:E6:8D:67:D5:E0:E3:67:D1:22:1D:AC:40:84:2C:15:2D:3C:36:84:73:6A:4E:46:5F:E4:BD:19:B4`
3. Завантажити **оновлений** `google-services.json` після додавання SHA і покласти в `android/app/google-services.json`. Не використовувати файл від Libris: у нього інший package name.
4. Після публікації через Google Play додати також SHA-1/SHA-256 сертифіката **Play App Signing** з Play Console: магазин може перепідписувати збірку.

Файли підпису: `android/app/my-release-key.keystore` і `android/key.properties`. Ключ **новий**, але alias і паролі такі самі, як у Libris. Debug і release збірки AgroRahunok підписуються цим ключем. Старий `android/app/debug.keystore` видалено. Зробіть захищену резервну копію обох файлів: без них неможливо оновлювати власноруч підписані збірки. Після зміни сертифіката раніше встановлений debug застосунок, якщо він був, потрібно видалити з телефона перед новим встановленням.

## 3. iOS

1. У **Project settings → General → Your apps** додати iOS застосунок із bundle ID `com.agrorahunok.mobile` або звірити його з уже створеним.
2. Завантажити `GoogleService-Info.plist` і покласти в `ios/AgroRahunok/GoogleService-Info.plist`. Xcode project уже посилається на цей шлях і додає файл у Resources.
3. Відкрити цей plist і знайти `REVERSED_CLIENT_ID`. У `ios/AgroRahunok/Info.plist` замінити `PASTE_REVERSED_CLIENT_ID` на точне значення. Воно потрібне для повернення з Google входу в застосунок.

## 4. Web Client ID

Знайти OAuth **Web application client ID** (закінчується на `.apps.googleusercontent.com`) у Google Cloud Console → **APIs & Services → Credentials** («Web client (auto created by Google Service)»), або в `google-services.json` серед `oauth_client` з `client_type: 3`. Вписати його в `.env` як `GOOGLE_WEB_CLIENT_ID` і додати в Supabase → Google provider → Client IDs (див. [SUPABASE_SETUP.md](SUPABASE_SETUP.md)). Це публічний ID, не Client Secret.

## 5. Встановлення і перевірка — виконує власник проєкту

1. Встановити залежності обраним пакетним менеджером. У `package.json` зараз є `postinstall`, який також виконує `pod install`.
2. Запустити Android/iOS застосунок власноруч. Перевірити Google вхід, повернення в застосунок, чотири вкладки, вихід і повторний вхід без нового запиту після перезапуску.
3. Якщо Android показує `DEVELOPER_ERROR`, перевірити package name, SHA-1, увімкнений Google provider, Web Client ID і чи завантажено **новий** `google-services.json`.

## Архітектурне рішення

Користувач і сесія — у **Supabase Auth**, як у Libris: застосунок отримує токен Google і передає його в `supabase.auth.signInWithIdToken`. Firebase Auth для входу більше не використовується; Firebase проєкт потрібен лише як джерело OAuth-клієнтів Google і конфігураційних файлів вище.
