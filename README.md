# Digital Effect — Next.js

## Старт

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install framer-motion
npm run dev
```

## Структура

```
src/
├── app/
│   ├── layout.tsx       # Fonts, metadata, SEO
│   ├── page.tsx         # Главна страница
│   └── globals.css      # CSS variables, utilities
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── sections/
│       ├── Hero.tsx
│       ├── Marquee.tsx
│       ├── Problem.tsx
│       ├── Services.tsx
│       ├── Stats.tsx     ← брояч тук
│       ├── Packages.tsx
│       ├── Extras.tsx
│       ├── Process.tsx
│       └── Cta.tsx
├── hooks/
│   └── hooks.ts         # useScrollReveal, useCounter, useNavScroll
└── lib/
    └── constants.ts     # ВСИЧКИ данни на сайта
```
