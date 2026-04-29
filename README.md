## Обзор

Kartograf - клиент-серверная система для наложения пользовательских и исторических карт поверх современной картографической подложки.

Этот репозиторий содержит frontend-приложение (Vite + React + TypeScript) для пользовательского и административного сценариев.

## Конфиг URL без пересборки

Внешние URL берутся из runtime-конфига:

- `public/content/site-config.json`

Пример:

```json
{
  "endpoints": {
    "apiBaseUrl": "https://api.kartograf.xyz",
    "mapsBaseUrl": "https://maps.kartograf.xyz"
  }
}
```

Что это дает:

- не нужно хардкодить URL в коде
- не нужно передавать `VITE_*` в build
- можно обновлять URL на сервере через `site-config.json` без новой сборки образа

## Локальная разработка

Требования:

- Node.js 20+
- npm 10+

Установка зависимостей:

```bash
npm install
```

Запуск dev-сервера:

```bash
npm run dev
```

По умолчанию приложение доступно на `http://localhost:5173`.

## Сборка

Production-сборка:

```bash
npm run build
```

Результат сборки - каталог `dist/`.

Локальная проверка собранной версии:

```bash
npm run preview
```
