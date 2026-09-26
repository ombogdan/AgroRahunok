# АгроРахунок

Мобільний застосунок на React Native 0.85.3 та TypeScript. Проєкт створено на основі офіційного шаблону; організація теми наслідує підхід `ettnMobile`, але кольори та код тут власні.

## Запуск

Потрібні Node.js 20.19.4+ або 22.13+ та налаштоване середовище React Native для потрібної платформи. Supabase JS зафіксовано на останній версії, що підтримує Node 20.

```sh
yarn install
yarn start
```

В іншому терміналі:

```sh
yarn android
# або для iOS після встановлення CocoaPods:
cd ios && bundle install && bundle exec pod install && cd ..
yarn ios
```

## Структура

- `App.tsx` — провайдери теми, авторизації та доступу до функцій.
- `src/navigation/` — основні вкладки й додаткові екрани.
- `src/screens/app-auth/` — окремі екрани входу.
- `src/screens/app-user/` — головна, ділянки, журнал, гроші й налаштування.
- `src/shared/components/ui/` — спільні кнопка, картка, сторінка та позначка демоданих.
- `src/shared/core/` — місце для провайдерів і сервісів авторизації та підписки.
- `src/shared/theme/theme.ts` — світла й темна палітри, відступи, радіуси, розміри тексту.
- `src/shared/theme/ThemeProvider.tsx` — тема відповідно до системного режиму.
- `src/shared/theme/useThemedStyles.ts` — типізований хук для стилів компонентів.
- `docs/PRODUCT_PLAN.md` — продуктовий план: рішення, фічі, релізи.
- `docs/ARCHITECTURE.md` — межі поточного макета й місця майбутніх інтеграцій.
- `IMPLEMENTATION_PLAN.md` — технічний план етапів MVP.

Google-вхід через Supabase Auth і карта реалізовані; профіль і ділянки зберігаються в Supabase після [налаштування проєкту](docs/SUPABASE_SETUP.md). Журнал і гроші поки порожні. Поточні базові можливості заплановані безкоштовними.

Перевірки: `yarn lint`, `yarn typecheck`, `yarn jest --watch=false`.
