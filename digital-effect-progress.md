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
