# Digital Effect — Сайт Progress Notes

## Стек
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v3
- **Animations:** GSAP + ScrollTrigger + useGSAP
- **Framer Motion:** само за Navbar (scroll detection + mobile drawer)
- **Email:** Resend (server API route `/api/contact`) — EmailJS махнат от формата
- **Icons:** Lucide React
- **Deploy:** Node app (Hostinger) — `output: export` махнат за да работят API routes

---

## 2026-09-07 — Partners: параметрите на програмата идват от de-os (без второ копие)
- Проблем: `partners/program.ts` беше статично копие на настройките (10/12/18 %, проекти, 12 мес., 50 €…) — смяна в de-os панела променяше начисленията, но не и това, което страницата обещава.
- **de-os:** нов `GET /api/partners/program` (само числата от настройките, X-Hello-Secret + rate limit, като `/check`).
- **Сайт:** `src/lib/partners-program.ts` → `loadProgram()` (сървърно, кеш 10 мин през fetch revalidate + памет; при грешка/timeout → `PROGRAM` от `program.ts` като fallback, warn в лога). `program.ts` пази само fallback + `Program` тип + `programFromDeos()` (snake_case → camelCase с валидация).
- `partners/page.tsx` е вече server component (`revalidate = 600`) → подава `program` на новия клиентски `PartnersClient.tsx` (старият page.tsx; всички `PROGRAM.` → `program.`, стъпката „Печелите N месеца“ и калкулаторът също). `terms/page.tsx` — async, чете `loadProgram()`. `layout.tsx` — `generateMetadata` с „до {макс. %}“ и месеците от de-os.
- Промяна в панела → сайтът я показва до 10 мин, без rebuild. `program.ts` да се синхронизира с `DEFAULT_SETTINGS` само като резерва.
- Не е пипано: `partner-ref.ts` (90 дни за localStorage кода) — клиентски, остава константа.
- Деплой: първо de-os (git pull → build → `pm2 restart ecosystem.config.cjs --only de-os --update-env`), после сайтът (tsc/eslint/build на машината — sandbox-ът провери типовете само със stub-ове).

## 2026-09-06 — Partners: суми в кабинета
- `/partners/me`: сделките показват сума (месечна/проект), текущ процент и комисионна (`monthly_value`, `rate`, `commission` от de-os `partnerCabinet`), плюс плочка „≈ На месец“ (`monthly_estimate`). Преди се виждаха само в имейла при нова сделка.
- de-os панел: при „Добави сделка“ — избор на съществуващ лид, „+ Нов лид“ (създава лида и го връзва) или без лид.

## 2026-09-04 — Digital Effect Partners (реферална програма) + `?p=` в Клиентомата
Имплементирано от Claude (не Codex). Спецификация и одит на сигурността: в de-os `docs/PARTNERS_SPEC.md`, `docs/PARTNERS_SECURITY_AUDIT.md` (копия в Cowork → `digital-effect/Клиентомат/`).
- **Нови страници:** `src/app/partners/page.tsx` (програма: hero, 3 стъпки, нива 10/12/18 %, проекти 20/15/10 %, калкулатор, форма за регистрация), `partners/terms/page.tsx` (условия — чернова за преглед със счетоводител), `partners/me/page.tsx` (кабинет на партньора), `partners/layout.tsx` (metadata), `partners/program.ts` (КОПИЕ на стойностите от de-os настройките — при промяна там смени и тук), `partners/ui.tsx` (общи атоми).
- **Нови lib:** `src/lib/partner-ref.ts` (`?p=DE-XXXX-YYYY` → localStorage `de_partner` за 90 дни; **не** `?ref` — той е персоналният линк на Smart Reach `sr-<id>`), `src/lib/deos-proxy.ts` (proxy към de-os със споделената тайна; IP = `x-real-ip` или последният hop на XFF, не първият — клиентът може да си прати XFF).
- **Нови API route-ове (proxy към de-os `/api/partners/*`):** `api/partners/check` (GET, „Препоръчан от Иван“, кеш 60 с), `api/partners/register` (POST, валидация + honeypot, имейлът е задължителен), `api/partners/me` (POST/PATCH/DELETE — кабинет).
- **Кабинет = вход само с личен линк** `/partners/me?k=<token>` от имейла; token-ът после е в **httpOnly cookie** `de_partner` (path `/partners`, 30 дни), нищо в localStorage; `?k=` се маха от адреса с `history.replaceState`. Код + телефон служат само за „изпрати ми линка наново“ (еднакъв отговор при успех/провал). Причина: телефонът не е тайна, а кодът е публичен в линка — виж H1 в одита.
- **`/hello`:** при mount чете `?p=`/localStorage → `GET /api/partners/check` → бадж „Препоръчан от {име}“; в payload-а `partnerCode` като **отделно поле** (не в `meta` — `meta.ref` е Smart Reach). `api/hello/route.ts` валидира кода по regex, пропуска го към de-os и добавя ред „Партньор: …“ в имейла.
- **Други:** `/privacy` — абзац за партньорските данни + че пазим `?p=` кода в браузъра; Footer — линк „Партньорска програма“; `.env.example` — `DEOS_PARTNERS_URL` (по подразбиране production; тайната е същата `DEOS_HELLO_SECRET`).
- ✅ `tsc --noEmit` и `eslint src` чисти. Пълен `next build` не е правен в sandbox-а — билдни на машината преди деплой.
- ⚠️ **Деплой:** `DEOS_HELLO_SECRET` на Hostinger = `HELLO_SECRET` в de-os (`ecosystem.config.cjs`). de-os вече е **fail-closed** в production — без секрет `/api/hello` и `/api/partners/*` връщат 401 (преди приемаха всичко). Cron за начисляването е само на VPS-а (de-os), сайтът няма cron.
- Ред на пускане: първо de-os (`git pull` → `npm install` (qrcode) → build → `pm2 restart ecosystem.config.cjs --only de-os --update-env`), после сайтът; тест: регистрация на /partners → Telegram → одобри в deos/partners → отвори линка от имейла → /hello?p=<код> → попълни → в /hello панела има ред „Партньор“.

## 2026-07-24 — Resend fix (LIVE ✅)
- Формата работи на прод. Основната причина за 502/401: **Hostinger uppercase-ваше API ключа** в env панела → `API key is invalid` (Resend ключът е case-sensitive). Реши се като ключът се пази с правилен case.
- Next.js 16 Turbopack конфликт: build ползва `next build --webpack`; добавен празен `turbopack: {}` в next.config.ts за да върви и `next dev` чисто. Памет: `--max-old-space-size=1024`.
- `resend` записан в package.json (^6.18.0) — първият install беше прекъснат от timeout и не записа манифеста → `Module not found: resend`.
- Debug полетата в route.ts махнати след потвърждение.
- ⚠️ Deploy напомняне: `RESEND_API_KEY` да е с точен case; ако панелът го чупи → разчитай на `.env.local`.

## 2026-07-24 — Resend интеграция за контактната форма
- **Махнат** `output: "export"` от `next.config.ts` + изтрит дублиран празен `next.config.js` (сайтът върви като Node app, за да работят API routes).
- **Инсталиран** `resend` (v6.18.0).
- **Нов** `src/app/api/contact/route.ts` — server route (runtime nodejs): валидация, honeypot anti-spam, праща до `contacts@digitaleffect.bg`, `from: noreply@digitaleffect.bg`, `replyTo` = подателя.
- **Пренаписан** `src/components/sections/Cta.tsx` — вместо `emailjs.sendForm` сега `fetch("/api/contact")`; добавени loading/error states + скрито honeypot поле.
- **Env:** `.env.local` (+ `.env.example`) с `RESEND_API_KEY`. ⚠️ Трябва реален ключ преди прод.
- `@emailjs/browser` остава в package.json само заради тест страницата `src/app/hello/page.tsx`.
- ✅ `tsc --noEmit` минава чисто. Пълен `next build` не тестван локално (sandbox OOM) — да се билдне на машината преди деплой.
- **Следващи стъпки:** сложи реален `RESEND_API_KEY`; на Hostinger конфигурирай env var; тествай изпращане; изтрий `hello` тест страницата ако не трябва.

---

## Структура на страницата (page.tsx)
```
Navbar
Hero
Marquee
Services
Problem
Packages
Process
Projects
CTA
Footer
```

---

## Компоненти

### Navbar.tsx
- Framer Motion `motion.nav` — `backgroundColor` при скрол > 50px
- `px-4 md:px-16` за мобилен padding
- **Мобилен:** хамбургер (`Menu` / `X` иконка), `AnimatePresence` drawer с `opacity + y` анимация
- Drawer затваря при клик на линк или CTA
- `NAV_LINKS` и `SITE` от `@/lib/constants`

---

### Hero.tsx
- GSAP анимации на заглавие + pillars
- `matchMedia` за desktop vs mobile диференциране

---

### Marquee.tsx
- Безкраен хоризонтален скрол

---

### Services.tsx
- 6 услуги в `grid md:grid-cols-3`
- `SERVICES` от `@/lib/constants` с `ICONS` map
- **Анимация:** `gsap.matchMedia()`
  - Мобилен: всяка `.card-feature` индивидуален ScrollTrigger (`top 85%`)
  - Десктоп: всички заедно `stagger: 0.12` при `top 60%`
- `gsap.set` + `ScrollTrigger.create` с `onEnter` callback

---

### Problem.tsx
- Two-column layout (problems / solutions)
- Staggered `x: -20 → 0` анимация на items

---

### Packages.tsx

#### PACKAGES константа (4 услуги):
| Name | Price | Notes |
|------|-------|-------|
| Социални Мрежи | €180/мес | FB + IG или TikTok |
| Реклама | €80/мес + % | Meta Ads / Google Ads |
| Уеб | €400 еднократно | badge: "−20% · Първи 5" |
| Автоматизация | По запитване | badge: "Ново", violet gradient |

#### FlipCard (десктоп):
- `perspective: 1200px`, `rotateY(180deg)` на hover
- `onMouseEnter/Leave` — без onClick flip (само hover)
- Front: gradient header (200px), features list, "Виж повече →" hint
- Back: описание, features с checkmark circles, цена, CTA бутон
- **Анимация:** индивидуален `useEffect` + ScrollTrigger на всяка карта (`top 85%`)
- `.flip-feature` елементи: `x: -20 → 0`, `stagger: 0.08`

#### MobileCard (мобилен):
- Статична карта — всичко видимо, без flip
- `.mob-feature` items: `x: -20 → 0`, `stagger: 0.1`
- Индивидуален ScrollTrigger на всяка карта

#### Badge цветове:
```tsx
isAuto → violet gradient
isDiscount (badge.includes("−")) → emerald gradient
default → orange gradient from-[#e8450a] to-[#f26522]
```

#### Custom CTA Banner:
- Pills за: Брандинг & Лого, E-commerce, Мобилно Приложение, Консултация, Анализ на Конкуренция, Стратегия от Нулата
- `flex-col md:flex-row`

#### Grid layout:
- Десктоп: `hidden md:block` → `grid grid-cols-4 gap-6`
- Мобилен: `flex flex-col md:hidden`

---

### Process.tsx

#### STEPS (4 стъпки):
1. Консултация & Одит (Search icon)
2. Стратегия & Предложение (Lightbulb icon)
3. Изпълнение & Изграждане (Rocket icon)
4. Оптимизация & Растеж (TrendingUp icon)

#### Анимация:
- **Мобилен:** всяка `.step-item` индивидуален ScrollTrigger
- **Десктоп:** `gsap.timeline()` — линия расте smooth + стъпки staggered заедно
  ```tsx
  tl.to(".connector-line", { scaleX: 1, duration: 1.8, ease: "power1.inOut" })
    .to(steps, { opacity: 1, y: 0, duration: 0.5, stagger: 0.35 }, 0)
    .fromTo(".step-inner", { opacity: 0, x: -20 }, { opacity: 1, x: 0, stagger: 0.08 }, 0.3)
  ```
- Connector line: `transformOrigin: "left center"` — важно за правилен scaleX
- Track линия (faded) + animated fill линия (оранжев gradient)
- `.step-inner` клас на: dot wrapper, phase label, title, text

---

### Projects.tsx

#### PROJECTS масив:
```tsx
type Project = {
  num, name, category, tags, description, url, image, year,
  stats?: { label: string; value: string }[]
}
```

| # | Name | Notes |
|---|------|-------|
| 01 | Northpart | EV & Solar, northpart.com |
| 02 | Robert Key | Ключар Силистра, robertkey.vercel.app |
| 03 | AromaSecret | Meta Ads резултати, stats карта |

#### AromaSecret stats:
```tsx
stats: [
  { label: "Reach", value: "303K" },
  { label: "Impressions", value: "1.68M" },
  { label: "CPM", value: "$0.64" },
  { label: "Ad Spend", value: "$1.07K" },
]
```

#### Image card логика:
```
project.image → <img>
project.stats → StatsCard (2x2 grid, text-gradient числа, тъмен фон)
default → Coming soon placeholder
```

#### Desktop iframe (за сайтове с url):
```tsx
style={{ width: "1440px", height: "900px", transform: "scale(0.4)", transformOrigin: "top left" }}
```
На мобилен — `project.image` или placeholder (iframe е тежък).

#### Навигация:
- Dots (активният: `w-8 + orange gradient`, останалите: `w-3 + white/20`)
- Стрелки горе/долу (ChevronUp/Down)
- Fade анимация при смяна: `opacity + y` GSAP, всички изображения винаги са mountнати (`hidden/block`)

#### Ляво — info структура:
- `min-h-[320px]` + `justify-between` за consistent height
- Dots → категория/година → заглавие → описание → stats (ако има) → tags → CTA

---

### CTA.tsx
- EmailJS: service `digital_effect`, template `template_uz4id85`
- Grid: `md:grid-cols-[1fr_1.6fr]`
- **Ляво:**
  - Email + Phone иконки (w-11 h-11 rounded-full)
  - Десктоп: `button` с `navigator.clipboard.writeText` + Copy/Check иконка (2s timeout)
  - Мобилен: `<a href="mailto:">` и `<a href="tel:">` — директно набира/отваря
  - `copied` state: `"email" | "phone" | null`
- **Дясно:** форма с name, email, message + EmailJS submit
- След успех: confirmation с CheckIcon (setSent(true))
- `formRef.current.reset()` след изпращане

---

### Footer.tsx
- 3 колони: Лого + tagline | Навигация | Контакт + социални
- `NAV_LINKS` за навигацията
- Copyright с `new Date().getFullYear()`
- `border-t border-white/[0.05]` divider преди copyright реда

---

## Глобални CSS класове (globals.css / tailwind)

```css
* { cursor: none !important; }  /* ако Cursor компонент е активен */
```

### Custom класове:
- `.btn-primary` — оранжев gradient бутон
- `.btn-ghost` — outline бутон
- `.section-label` — малък оранжев uppercase label
- `.section-title` — голям display заглавие
- `.text-gradient` — оранжев gradient текст
- `.bg-dark-charcoal` — тъмен фон на секции
- `.bg-dark-surface` — малко по-светъл тъмен фон

---

## Cursor.tsx (опционален)
- Оранжева точка (instant) + ring с lag (`duration: 0.18`)
- На hover на `a, button`: ring scale 2.2x, точката изчезва
- Само десктоп (`window.matchMedia("(max-width: 767px)")`)
- **Проблем:** чупи се в iframe — препоръчително е да се махне ако има iframe в Projects

---

## Constants (`@/lib/constants`)

### NAV_LINKS:
```ts
{ label: "Услуги", href: "#services" },
{ label: "Пакети", href: "#packages" },
{ label: "Процес", href: "#process" },
{ label: "Проекти", href: "#projects" },
{ label: "Контакт", href: "#cta" },
```

### SERVICES (6 бр.):
- Социални Мрежи (social)
- Видео Съдържание (video)
- Уеб Разработка (web)
- Автоматизация (automation)
- Анализ & Стратегия (chart)
- Платена Реклама (ads)

---

## GSAP Patterns използвани в проекта

### Индивидуален ScrollTrigger per element:
```tsx
useEffect(() => {
  const el = ref.current;
  if (!el) return;
  gsap.fromTo(el, { opacity: 0, y: 40 }, {
    opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
    scrollTrigger: { trigger: el, start: "top 85%" }
  });
}, []);
```

### matchMedia за responsive анимации:
```tsx
const mm = gsap.matchMedia();
mm.add("(max-width: 767px)", () => { /* mobile */ });
mm.add("(min-width: 768px)", () => { /* desktop */ });
return () => mm.revert();
```

### Timeline с sync анимации:
```tsx
const tl = gsap.timeline({ scrollTrigger: { trigger, start } });
tl.to(line, { scaleX: 1, duration: 1.8 })
  .to(items, { opacity: 1, stagger: 0.35 }, 0)  // 0 = starts at same time
  .fromTo(inner, { x: -20 }, { x: 0, stagger: 0.08 }, 0.3);
```

### gsap.set + onEnter (без flash):
```tsx
gsap.set(cards, { opacity: 0, y: 50 });
ScrollTrigger.create({
  trigger: el, start: "top 60%",
  onEnter: () => gsap.to(cards, { opacity: 1, y: 0, stagger: 0.12 })
});
```

---

## Известни Issues / Бележки

- `text-[8px]` в Tailwind — VS Code показва "No definition found" но работи
- Connector line в Process: задължително `transformOrigin: "left center"` в `gsap.set`, не в Tailwind клас
- iframe в Projects: много сайтове блокират embed с `X-Frame-Options: DENY` — тествай
- EmailJS ключове са в кода — при production помисли за env variables
- `cursor-none !important` е нужен за да override-не браузъра на `a` и `button` елементи
- `AnimatePresence` от framer-motion се използва само в Navbar — не смесвай с GSAP в същия компонент
