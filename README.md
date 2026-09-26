# АгроРахунок

Мобільний застосунок на React Native 0.85.3 та TypeScript. Проєкт створено на основі офіційного шаблону; організація теми наслідує підхід `ettnMobile`, але кольори та код тут власні.

## Запуск

Потрібні Node.js 22.11+ та налаштоване середовище React Native для потрібної платформи.

```sh
npm install
npm start
```

В іншому терміналі:

```sh
npm run android
# або для iOS після встановлення CocoaPods:
cd ios && bundle install && bundle exec pod install && cd ..
npm run ios
```

## Структура

- `App.tsx` — тимчасовий стартовий екран.
- `src/shared/theme/theme.ts` — світла й темна палітри, відступи, радіуси, розміри тексту.
- `src/shared/theme/ThemeProvider.tsx` — тема відповідно до системного режиму.
- `src/shared/theme/useThemedStyles.ts` — типізований хук для стилів компонентів.
- `IMPLEMENTATION_PLAN.md` — план наступних етапів.

Перевірки: `npm run lint`, `npx tsc --noEmit`, `npm test -- --watch=false`.
