# Поточна структура АгроРахунку

- `src/navigation` — кореневий перехід між входом і основним застосунком; після входу чотири нижні вкладки з дизайну: Головна, Ділянки, Журнал, Гроші.
- `src/screens/app-auth` — екран входу Google через Supabase Auth.
- `src/screens/app-user` — головна, ділянки, журнал, підсумки грошей і налаштування. Старі прототипні екрани швидкого запису й підсумків не входять у навігацію.
- `src/shared/theme` та `src/shared/components/ui` — токени з дизайн handoff і спільні елементи.
- `src/shared/core/providers/auth` і `services/auth` — стан сесії Supabase, вхід та вихід.
- `src/shared/core/fields` — модель ділянки, розрахунки площі й запити до таблиці `fields`.
- `src/shared/core/records` — записи робіт, зборів, продажів та інших сум; спільний вибір сезону для головної та «Грошей», перерахунок одиниць, підсумки й гроші в копійках. Таблиці `records`, `plantings` і `quantity_units`.
- `src/screens/app-user/records` — кнопка «+ Записати», шторка вибору, форми роботи, збору, продажу та інших сум.
- `src/shared/core/providers/subscription` — майбутній шар платних прав; зараз усі базові можливості безкоштовні.

Вхід — Google через Supabase Auth, як у Libris: токен Google передається в `signInWithIdToken`, сесія зберігається в AsyncStorage. Профіль (`profiles`) створює тригер бази при першому вході. Ділянки й записи читаються та пишуться в Supabase з RLS за `auth.uid()`. Локальної копії та синхронізації немає, тож без інтернету дані недоступні. Запис на ділянці автоматично прив'язується до її посадки (`plantings`) та сезону; загальні витрати й доходи не мають ділянки. Сезон — рік урожаю: осінні роботи під озимі належать наступному року. «Гроші» рахують фактичні доходи, витрати, врожайність і собівартість. Налаштування бази — у [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

Firebase проєкт лишається джерелом OAuth-клієнтів Google і файлів `GoogleService-Info.plist` / `google-services.json`, див. [FIREBASE_GOOGLE_SETUP.md](FIREBASE_GOOGLE_SETUP.md). Візуальний референс — у [DESIGN_REFERENCE.md](DESIGN_REFERENCE.md).
