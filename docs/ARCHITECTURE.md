# Поточна структура АгроРахунку

- `src/navigation` — кореневий перехід між входом і основним застосунком; після входу чотири нижні вкладки з дизайну: Головна, Ділянки, Журнал, Гроші.
- `src/screens/app-auth` — екран входу Google через Firebase Auth.
- `src/screens/app-user` — головна з порожнім станом і тимчасові порожні вкладки. Старі прототипні екрани деталей, швидкого запису, підсумків і профілю поки не входять у навігацію.
- `src/shared/theme` та `src/shared/components/ui` — токени з дизайн handoff і спільні елементи.
- `src/shared/core/providers/auth` і `services/auth` — стан Firebase сесії, вхід та вихід.
- `src/shared/core/providers/subscription` — майбутній шар платних прав; зараз усі базові можливості безкоштовні.

Реальними даними зараз є профіль користувача та ділянки. Firebase Auth є джерелом ідентичності; Supabase зберігає профіль і ділянки з RLS за Firebase UID. Локальна черга змін забезпечує офлайн-додавання й видалення ділянок. Журнал і гроші поки порожні; їхні таблиці додамо разом із робочими екранами. Налаштування — у [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

Налаштування власного Firebase проєкту описане в [FIREBASE_GOOGLE_SETUP.md](FIREBASE_GOOGLE_SETUP.md). Візуальний референс — у [DESIGN_REFERENCE.md](DESIGN_REFERENCE.md).
