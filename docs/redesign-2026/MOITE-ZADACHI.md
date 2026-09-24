# Моите задачи (Емил)

Подредени по ред. ✅ отбелязвай тук, когато приключиш.

---

## A. Пускане (в този ред — важно)

Сайтът работи и без стъпки 1–3: чете резервните цени и страници от собствените си файлове. Но за да се управлява от de-os, трябва целият ред.

- [ ] **1. Supabase → SQL editor** → пусни `de-os/lib/site/schema.sql` (създава `deos_site_pages` и `deos_site_resources`). Idempotent е — може да се пусне повторно.
- [ ] **2. Deploy на de-os** (Hetzner, PM2), както обикновено. Нови файлове: `lib/oferta/fees.js`, `lib/site/*`, `app/api/site-content/*`, `components/services/SiteContentPanel.jsx`, `scripts/services-v2.mjs`, `scripts/gen-3d-refs.mjs`.
- [ ] **3. Новите цени в Supabase:**
  ```
  cd de-os
  node scripts/services-v2.mjs           # показва промените, нищо не записва
  node scripts/services-v2.mjs --apply   # записва
  ```
  Пипа само услугите + ключовете `pilot` / `upsell` / `infoNotes` в настройките. ЕИК, IBAN и данните за договора остават.
- [ ] **4. Провери в de-os** → „Сайт и цени“: трите таба (Цени / Страници / Ресурси) се зареждат. Направи една промяна на цена и виж, че `/ceni` на сайта се сменя до ~10 сек.
- [ ] **5. Deploy на сайта** (Hostinger → Node app):
  - `npm install` (нови пакети: `three`; махнати: `framer-motion`, `@emailjs/browser`)
  - `npm run build` → restart
- [ ] **6. Env променливи**
  - **Сайт (Hostinger):** нищо ново не е задължително. По избор:
    - `NEXT_PUBLIC_CORE_MODEL_URL=/models/effect-core.glb` — когато имаш 3D модела;
    - `SITE_REVALIDATE_SECRET=…` — ако искаш отделна тайна (иначе се ползва `DEOS_HELLO_SECRET`).
  - **de-os:** нищо ново. Ползва `HELLO_SECRET`, която вече е същата като `DEOS_HELLO_SECRET` на сайта. По избор: `SITE_PUBLIC_URL`, `SITE_NOTIFY=off`, `INDEXNOW=off`.
- [ ] **7. След пускането:** отвори `https://digitaleffect.bg/sitemap.xml`, `/robots.txt`, `/llms.txt` и `/cf283919c7cb242bb741c72d06315736.txt` (ключът за IndexNow). Всички трябва да се отварят.

---

## B. Google, Bing, AI — индексиране (1 час, веднъж)

- [ ] **Google Search Console** → добави `digitaleffect.bg` (Domain property, DNS запис в Hostinger) → Sitemaps → `https://digitaleffect.bg/sitemap.xml`.
- [ ] **URL Inspection** → „Request indexing“ за: `/`, `/ceni`, `/uslugi`, 4-те главни услуги, `/za/hoteli`, `/za/stroitelstvo`.
- [ ] **Bing Webmaster Tools** → „Import from Google Search Console“ (1 клик). Bing захранва ChatGPT Search и Copilot, затова е важен. IndexNow вече е вързан: de-os пинга Bing/Yandex при всяка промяна на цена или страница.
- [ ] **Rich Results Test** (search.google.com/test/rich-results) за `/ceni` и една услуга → трябва да вижда Organization, Service, Offer, FAQ, Breadcrumb.
- [ ] **PageSpeed Insights** за `/` на мобилен → изпрати ми резултата, ако LCP > 2.5 s.

---

## C. Google Business Profile (когато дойде ЕИК) 🔴

Най-важното за „маркетинг агенция Силистра / Русе / Добрич“ в картата.

- [ ] Попълни ЕИК в `src/lib/site.ts` (`eik`) и в de-os настройките на договора.
- [ ] Създай профил: категория **„Marketing agency“** (основна) + „Internet marketing service“, „Website designer“, „Advertising agency“ (допълнителни).
- [ ] Име: **Digital Effect**, точно така, без ключови думи (Google наказва „Digital Effect – маркетинг агенция Силистра“).
- [ ] Адрес / зона на обслужване: Силистра + Русе, Добрич, Варна, Шумен, Разград. Ако нямаш офис с табела → „service area business“ (скрит адрес).
- [ ] Телефон, сайт, работно време — **същите** като на сайта (`site.ts`).
- [ ] Услуги: въведи всяка услуга с цената „от …“ (като на `/ceni`).
- [ ] 10+ снимки: ти, работният процес, екрани от проекти, лого, корица.
- [ ] Линкът към профила → `social.googleBusiness` в `site.ts`.
- [ ] **Отзиви:** поискай от всеки текущ и бивш клиент (AromaSecret, Hotel Danube, Robert Key, Northpart, MIGAMA…). Прати им директния линк за отзив. Цел: 10 отзива за първия месец, после по 2–3 на месец. Отговаряй на всеки.
- [ ] 1 публикация седмично в профила (кейс, съвет, оферта).

---

## D. Каталози и профили (NAP — еднакво навсякъде)

- [ ] **Bing Places** (импорт от Google профила)
- [ ] **Apple Business Connect** (Apple Maps / Siri)
- [ ] **Facebook страницата** → адрес, телефон, сайт = като на сайта
- [ ] **LinkedIn Company Page** + твоят профил (линковете → `site.ts`)
- [ ] **Clutch.co** — главният каталог за агенции. Поискай 2–3 клиента за верифициран отзив (правят го по телефон с тях). Добави и **GoodFirms**, **DesignRush**, **Sortlist** — безплатни профили с линк.
- [ ] **Златни страници** (zlatnistranici.bg) и 2–3 български бизнес каталога

---

## E. Semrush (свързан MCP)

- [ ] MCP-то е свързано, но акаунтът **няма API units** (грешка `no_api_units`), затова не можах да дръпна данни за ключови думи и конкуренти. Активиране: https://www.semrush.com/mcp-access
- [ ] Когато има units, кажи ми и ще направя:
  - анализ на ключовите думи за всяка услуга и град;
  - позициите на конкурентите;
  - Position Tracking проект за 30 думи;
  - Site Audit.
- **Безплатни алтернативи**, докато няма:
  - Ahrefs Webmaster Tools (безплатен за собствен сайт — backlinks + одит);
  - Ahrefs Free Keyword Generator;
  - Google Search Console (реалните заявки след 2–3 седмици).

---

## F. Mercury / генерации

- [ ] **3D референции:** `node scripts/gen-3d-refs.mjs` в de-os (локално или на VPS-а) → `out/3d-refs/*.png` → Blender по [3D-MODELI.md](3D-MODELI.md). Цена ≈ $1 за всичките 5.
- [ ] Ако искаш аз да генерирам директно от сесията: Claude → Admin settings → Capabilities → мрежов allowlist → добави `api.openai.com` (и доставчиците на Seedream/Seedance). Сега средата ми няма достъп до тях, затова не генерирах.

---

## G. Съдържание и правни неща

- [ ] Попълни всичко от [ZA-POPALVANE.md](ZA-POPALVANE.md) — най-важни са телефон, снимка, текст „За нас“, цитати от клиенти.
- [ ] **Клаузата „Първи месец без риск“ в договора** (`lib/oferta/contract.js`) — дай я на юрист/счетоводител. Пише: без постигнат договорен критерий таксата за управление и setup-ът не се дължат или се връщат до 14 дни; рекламният бюджет не се връща; не важи, ако клиентът не изпълни чл. 5.
- [ ] Страницата `/privacy`: добави, че имейлите от ресурсите (Radar, списък за чакане) се ползват за изпращане на резултата и месечни обновления, с отписване.

---

## H. Awwwards и видимост на самия сайт

След 3D модела и снимките:

- [ ] **Awwwards** (Submit → ~$60 такса) + **CSS Design Awards** + **Godly / Land-book / SiteInspire** (безплатни). Всяко признание е линк + доверие.
- [ ] Кратко видео (screen recording) на скрола с 3D ядрото → Instagram / LinkedIn / Behance. Seedance може да направи 6-сек. промо от кадрите на ядрото.

---

## I. Почистване

- [ ] Папката `version1\src` (извън `digital-effect`) е стара и грешна — изтрий я, ако не ти трябва.
- [ ] Старите файлове на сайта, които новият дизайн не ползва (старите секции, `Cursor.tsx`, `hooks.ts`, `constants.ts`, `HomeClient.tsx`, статичните `robots.txt` / `sitemap.xml`), са преместени в `version1\_to_delete-digital-effect\` (извън репото, за да не влизат в build-а). Прегледай и изтрий папката, както и празните `src\components\sections` и `src\hooks`.

---

## J. Всеки месец (рутина за SEO и AI видимост)

- [ ] 1 статия в „Знание“ за въпрос, който клиентите задават преди да купят (цени, сравнения, „как да изберем“)
- [ ] 1 нов кейс или обновени числа в съществуващ
- [ ] 2–3 нови отзива в Google + отговор на всеки
- [ ] Search Console → Performance: кои заявки имат импресии, но позиция 8–20 → добавяме съдържание / FAQ за тях в страницата
- [ ] Провери как ни виждат AI асистентите: попитай ChatGPT, Perplexity и Gemini „маркетинг агенция Силистра“, „колко струва реклама във Facebook България“ и запиши дали ни споменават
- [ ] 1–2 споменавания или линка отвън: гост статия, подкаст, местна медия, партньор (Radar и Индексът са най-лесният повод)
