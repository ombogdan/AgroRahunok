# Firebase Google вхід: що налаштувати

Android package ID змінено на `com.laro.fields`. Firebase-конфігурація має бути з того самого проєкту й містити новий package ID. Після додавання відбитків релізного ключа повторно завантажте `google-services.json`, щоб у ньому з’явився Android OAuth-клієнт. Підписний ключ залишається чинним.

## 1. Увімкнути Google

1. Відкрити [Firebase Console](https://console.firebase.google.com/) → потрібний проєкт.
2. **Build / Authentication → Get started** (якщо це перший вхід) → **Sign-in method → Google → Enable**.
3. Вибрати **Project support email** і натиснути **Save**.

## 2. Android

1. **Project settings** (шестерня біля Project Overview) → **General → Your apps**. Додати **новий Android застосунок** із package name `com.laro.fields` у наявному Firebase-проєкті. Старий Firebase-застосунок не перейменовуємо.
2. У картці Android застосунку натиснути **Add fingerprint** і додати обидва відбитки чинного релізного ключа:
   - SHA-1: `CF:6A:A1:3B:C5:A5:69:C2:96:95:C7:E2:49:A3:FF:71:0E:00:57:A1`
   - SHA-256: `EE:88:A2:1A:E6:8D:67:D5:E0:E3:67:D1:22:1D:AC:40:84:2C:15:2D:3C:36:84:73:6A:4E:46:5F:E4:BD:19:B4`
3. Завантажити **оновлений** `google-services.json` після додавання SHA і покласти в `android/app/google-services.json`. Переконатися, що `client_info.android_client_info.package_name` у новому файлі дорівнює `com.laro.fields`. Поточний файл для старого пакета не підійде.
4. Після публікації через Google Play додати також SHA-1/SHA-256 сертифіката **Play App Signing** з Play Console: магазин може перепідписувати збірку.

Файли підпису: `android/app/my-release-key.keystore` і `android/key.properties`. Новий ключ для зміни package ID **не потрібен**: debug і release збірки використовують наявний ключ. Його SHA-1 і SHA-256 перевірені через `keytool`. Збережіть захищену копію обох файлів. Android вважатиме `com.laro.fields` окремим застосунком від попередніх `com.land.in.hand` і `com.agrorahunok.mobile`, тому локальні дані зі старих тестових інсталяцій автоматично не перейдуть.

## 3. iOS

1. У **Project settings → General → Your apps** звірити наявний iOS застосунок із bundle ID `com.laro.fields` (цей ідентифікатор встановлено в Xcode).
2. Завантажити `GoogleService-Info.plist` і покласти в `ios/GoogleService-Info.plist`. Xcode project уже посилається на цей шлях і додає файл у Resources.
3. Відкрити цей plist і знайти `REVERSED_CLIENT_ID`. У `ios/LaroFields/Info.plist` звірити URL scheme із точним значенням з plist. Воно потрібне для повернення з Google входу в застосунок.

## 4. Web Client ID

Знайти OAuth **Web application client ID** (закінчується на `.apps.googleusercontent.com`) у Google Cloud Console → **APIs & Services → Credentials** («Web client (auto created by Google Service)»), або в `google-services.json` серед `oauth_client` з `client_type: 3`. Вписати його в `.env` як `GOOGLE_WEB_CLIENT_ID` і додати в Supabase → Google provider → Client IDs (див. [SUPABASE_SETUP.md](SUPABASE_SETUP.md)). Це публічний ID, не Client Secret.

## 5. Встановлення і перевірка — виконує власник проєкту

1. Встановити залежності обраним пакетним менеджером. У `package.json` зараз є `postinstall`, який також виконує `pod install`.
2. Запустити Android/iOS застосунок власноруч. Перевірити Google вхід, повернення в застосунок, чотири вкладки, вихід і повторний вхід без нового запиту після перезапуску.
3. Якщо Android показує `DEVELOPER_ERROR`, перевірити `com.laro.fields`, SHA-1, увімкнений Google provider, Web Client ID і новий `google-services.json`. Для Google Maps API key оновити обмеження Android-застосунку на `com.laro.fields` із тим самим SHA-1.

## Архітектурне рішення

Користувач і сесія — у **Supabase Auth**, як у Libris: застосунок отримує токен Google і передає його в `supabase.auth.signInWithIdToken`. Firebase Auth для входу більше не використовується; Firebase проєкт потрібен лише як джерело OAuth-клієнтів Google і конфігураційних файлів вище.
