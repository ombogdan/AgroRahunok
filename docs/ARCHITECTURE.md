# Поточна структура АгроРахунку

- `src/navigation` — кореневий перехід між входом і основним застосунком; після входу чотири нижні вкладки з дизайну: Головна, Ділянки, Журнал, Гроші.
- `src/screens/app-auth` — екран входу Google через Supabase Auth.
- `src/screens/app-user` — головна з порожнім станом, ділянки, тимчасові порожні вкладки й налаштування з виходом з акаунта (відкриваються з головної). Старі прототипні екрани швидкого запису й підсумків поки не входять у навігацію.
- `src/shared/theme` та `src/shared/components/ui` — токени з дизайн handoff і спільні елементи.
- `src/shared/core/providers/auth` і `services/auth` — стан сесії Supabase, вхід та вихід.
- `src/shared/core/fields` — модель ділянки, розрахунки площі й запити до таблиці `fields`.
- `src/shared/core/providers/subscription` — майбутній шар платних прав; зараз усі базові можливості безкоштовні.

Реальними даними зараз є профіль користувача та ділянки. Вхід — Google через Supabase Auth, як у Libris: токен Google передається в `signInWithIdToken`, сесія зберігається в AsyncStorage. Профіль (`profiles`) створює тригер бази при першому вході, ділянки пишуться й читаються прямо з таблиці `fields` з RLS за `auth.uid()`. Локальної копії та синхронізації немає, тож без інтернету ділянки недоступні. Журнал і гроші поки порожні; їхні таблиці додамо разом із робочими екранами. Налаштування — у [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

Firebase проєкт лишається джерелом OAuth-клієнтів Google і файлів `GoogleService-Info.plist` / `google-services.json`, див. [FIREBASE_GOOGLE_SETUP.md](FIREBASE_GOOGLE_SETUP.md). Візуальний референс — у [DESIGN_REFERENCE.md](DESIGN_REFERENCE.md).
