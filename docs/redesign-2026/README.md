# Редизайн 2026 — документи

| Файл | За какво |
|---|---|
| [MOITE-ZADACHI.md](MOITE-ZADACHI.md) | Какво остава за Емил: пускане в правилния ред, GBP, индексиране, каталози, Semrush, Mercury |
| [ZA-POPALVANE.md](ZA-POPALVANE.md) | Всички празни полета и къде са |
| [3D-MODELI.md](3D-MODELI.md) | Ядрото: промптове за изображения, спецификация за Blender → GLB, включване |
| [resursi/](resursi/00-OBSHTO.md) | 7-те безплатни ресурса — по един файл за всеки |

## Как е устроен сайтът (накратко)

- **Цени** → de-os `deos_services` → de-os `/api/services` → сайтът (ISR 5 мин + мигновен revalidate при запис). Една формула за таксата (`fees.js` / `fees.ts`) за сайта, офертата и договора.
- **Страници и ресурси** → de-os `deos_site_pages` / `deos_site_resources` → `/api/site-content` → сайтът. Резервни копия: `src/data/*.fallback.json`, така че сайтът работи и когато de-os не отговаря.
- **3D** → един `<canvas>` в layout-а (`src/components/scene`). Секциите казват на сцената етапа си с `data-stage`. Изключен на `/hello`, `/oferta`, `/partners`, `/radar` и `/privacy`. При `prefers-reduced-motion` камерата не се движи плавно.
- **SEO** → `sitemap.ts`, `robots.ts` (AI ботовете са разрешени), `llms.txt`, `llms-full.txt`, JSON-LD във всяка страница (`src/lib/schema.ts`), OG картинки през `/og`.
