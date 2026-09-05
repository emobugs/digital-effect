# Codex задачи за сайта — Digital Effect Partners

Спецификацията е в de-os: `docs/PARTNERS_SPEC.md` (копие: Cowork
`digital-effect/Клиентомат/partners-spec.md`). Изпълнявай в реда 65 → 66.
Изисква de-os задачи 61–62 да са деплойнати (endpoint-ите /api/partners/*).
Стек: Next.js App Router, TypeScript, Tailwind, mobile-first, Вие-форма,
bg/en както в `src/app/hello/page.tsx`. Без нови зависимости.

═══════════════════════════════════════════════════════════════════

Task ID: site-hello-ref-65

Objective:
Клиентомата (/hello) да пренася партньорския код към de-os. Кодът идва
като `?p=DE-XXXX-YYYY` (НЕ `?ref` — той е зает за друго и не се пипа).

What to build:

1. src/lib/partner-ref.ts — `readPartnerCode(searchParams): string|null`
   (валидира /^DE-[A-Z0-9]{2,8}-[A-Z0-9]{4}$/i, връща главни),
   `storePartnerCode(code)` → localStorage "de_partner" = {code, ts},
   `getStoredPartnerCode(days=90)` → code или null ако е по-старо от days.
   Всичко в try/catch (SSR/private mode).
2. src/app/hello/page.tsx: в useEffect при mount — ако има `?p=` → store;
   `const partnerCode = readPartnerCode(...) ?? getStoredPartnerCode()`.
   Ако има partnerCode → fetch към `/api/partners/check?code=` (proxy, т. 4)
   → при {valid:true, name} показвай над интрото малък бадж „Препоръчан от
   {name}“ / „Referred by {name}“ (стилът на бадж-етикетите в страницата,
   brand-orange-l). Невалиден → без бадж, анкетата продължава нормално.
   В submit(): добави `partnerCode` в body като ОТДЕЛНО поле на първо ниво
   (не в meta — meta.ref е document.referrer). Не променяй нищо друго в payload-а.
3. src/app/api/hello/route.ts: пропусни `partnerCode` към de-os без промяна
   (ако payload-ът се сглобява поле по поле — добави го). В имейла през
   Resend: ред „Партньор: <code>“ ако има.
4. Proxy route-ове към de-os (същият модел като src/app/api/hello/route.ts —
   DEOS_HELLO_URL база + заглавка X-Hello-Secret = DEOS_HELLO_SECRET,
   timeout, 1 retry):
   - src/app/api/partners/check/route.ts — GET → de-os GET /api/partners/check
     (без секрет; кеш 60 сек с `revalidate` или in-memory Map)
   - src/app/api/partners/register/route.ts — POST → de-os POST /api/partners/register
   - src/app/api/partners/me/route.ts — POST → de-os POST /api/partners/me
   Грешка от de-os → същият статус + {error}. .env.example: без нови
   променливи (ползват се съществуващите DEOS_*), само коментар.

Allowed files:
- src/lib/partner-ref.ts (нов)
- src/app/hello/page.tsx
- src/app/api/hello/route.ts
- src/app/api/partners/** (нови)
- .env.example

Do not:
- change lead-scoring.ts, privacy/page.tsx
- add dependencies

Acceptance checks:
- npx tsc --noEmit && npx eslint src → чисто
- /hello?p=DE-TEST-AB12 → localStorage.de_partner е записан; при активен код
  бадж „Препоръчан от …“; при невалиден — без бадж
- попълване → в de-os hello_submissions.partner_code = кодът
- /hello без ?p и без localStorage → payload без partnerCode (както досега)

═══════════════════════════════════════════════════════════════════

Task ID: site-partners-page-66

Objective:
Публичната страница на програмата + кабинет. Спецификация секция 8.
Визуален стил: като /hello (тъмен фон, brand-grad бутони, font-display
заглавия, max-w-2xl). GSAP само за fade-in на секциите при скрол, ако вече
е в проекта; иначе CSS.

What to build:

1. src/app/partners/page.tsx (bg/en превключвател като Shell в /hello):
   - Hero: „Познавате собственици на бизнес. Ние им намираме клиенти. Вие
     получавате процент.“ + CTA към формата.
   - Как работи — 3 стъпки (получавате код → споделяте линк/QR → клиентът
     попълва анкетата, вие печелите 12 месеца).
   - Нива: таблица 1 клиент 10 % / 2 → 12 % / 3+ → 18 % + текст, че третият
     клиент вдига процента и на първите два. Отделна малка таблица за
     еднократни проекти (до 1 000 € → 20 %, до 3 000 € → 15 %, над → 10 %).
     Стойностите — в един const PROGRAM обект най-отгоре, за да се сменят
     на едно място (dе-os настройките са източникът; тук е копие).
   - Калкулатор: два слайдера (брой клиенти 1–10, средна месечна стойност
     200–2 000 €) → показва „≈ X €/месец · Y € за 12 месеца“ с процента по
     нивото. Чиста функция tierRate като в de-os.
   - За кого е: списък роли (счетоводители, адвокати, брокери, фотографи/
     видеографи, IT support, POS/ERP, печат и табели, web freelancers).
   - Условия накратко (6 реда) + линк към /partners/terms.
   - Форма: име*, телефон*, имейл, роля (select), фирма, „Аз съм и клиент на
     Digital Effect“ (checkbox → показва избор: отстъпка от сметката /
     банков превод), съгласие с условията*, honeypot `website`. При mount
     чете `?p=` (readPartnerCode/store от src/lib/partner-ref.ts) → праща
     `parent_code`. POST /api/partners/register → успех екран: „Вашият код:
     DE-… (чака одобрение, ще Ви пишем)“, линкът, QR (ако qr != null —
     inline SVG), бутони Копирай линк / Сподели (navigator.share с fallback
     към копиране), линк към /partners/me.
2. src/app/partners/terms/page.tsx — пълните условия (bg само): база без ДДС
   и без рекламен бюджет; 12 месеца от първото плащане; нива и ретроактивно
   преизчисляване; проекти; второ ниво 3 % само от директно доведени
   партньори; изплащане до 10-то число, минимум 50 €, банков превод или
   кредит +10 %; документ (фактура/договор); клиентът трябва да е нов за DE;
   първият код печели; право на промяна с 30-дневно предизвестие; GDPR
   (линк към /privacy). Прост текст, h2 секции, без таблици.
3. src/app/partners/me/page.tsx — вход: код + телефон → POST /api/partners/me
   → кабинет: ниво и следващ праг („още 1 клиент до 18 %“), лидове (бизнес,
   дата, статус на български), сделки (клиент, вид, статус — без суми на
   клиента), начислено/изплатено/за изплащане, доведени партньори, история
   на плащанията. 404 → „Не открихме такъв партньор“. Кодът/телефонът се
   пазят в sessionStorage за сесията.
4. src/app/privacy/page.tsx — абзац за партньорските данни (какво пазим,
   защо, колко време).
5. Metadata (title/description bg) за трите страници; линк „Партньори“ във
   footer-а на сайта, ако има footer компонент.

Allowed files:
- src/app/partners/** (нови)
- src/lib/partner-ref.ts (само ако трябва helper за share/copy)
- src/app/privacy/page.tsx
- footer компонентът (само линк)

Do not:
- touch /hello, api routes
- add dependencies

Acceptance checks:
- npx tsc --noEmit && npx eslint src → чисто
- /partners на 375px: без хоризонтален скрол, калкулаторът работи с touch
- регистрация → код на екрана, Telegram в de-os, /partners/me отваря кабинета
- /partners?p=<code на активен партньор> → register получава parent_code
