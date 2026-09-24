# 3D модели — „Ядрото“ на Digital Effect

Сайтът вече работи с **placeholder**, направен в код (three.js). Той е същата форма като финалния модел, само по-прост. Когато имаш GLB, го включваш с една env променлива — без промяна в кода.

---

## 1. Идеята

**Ядрото** е една сфера, разрязана на **4 резена**. Всеки резен е една услуга:

| Резен | Име в модела | Услуга | Къде на сайта |
|---|---|---|---|
| 1 | `module_ads` | Реклама | Внимание |
| 2 | `module_smm` | Социални мрежи | Доверие |
| 3 | `module_web` | Сайт | Запитване |
| 4 | `module_ai` | AI и автоматизация | Клиент |

- **Отвън:** черен полиран метал, като обсидиан или черен хром. Много тъмен, с остри отражения и лек ирисцентен отблясък по ръбовете.
- **Отвътре**, по срезовете: горяща оранжева енергия (#f26522 → #f59c1a). Като разтопен метал или нажежена сърцевина, с фини линии, които напомнят на вени или верига.
- **В центъра** (когато резените се разтворят) свети малко ядро. Това е „ефектът“.

Сцената има 4 етапа по време на скрол:

1. **Hero:** ядрото е цяло и бавно се върти. Разрезите едва се виждат като тънки оранжеви линии.
2. **„Системата“:** резените се разтварят навън и камерата обикаля около тях.
3. **„Пътят на клиента“:** четирите резена застават в линия, свързани с лъч светлина.
4. **Останалото:** ядрото е отдалечено в ъгъла като тих фон.

Логото ти е ветрило от оранжеви пластини. Ядрото е същото ветрило, затворено в сфера.

---

## 2. Промптове за изображения (референции за Blender)

Генерирай ги първо като картинки. Те са референцията, по която моделираш. Промптовете са на английски, защото моделите за изображения ги разбират по-точно.

**Как да ги генерираш през Mercury (GPT Image 2):** виж раздел 5. Всички изображения са 1:1, 1024×1024, `quality: high`.

### 2.1 Главен кадър — затворено ядро (hero)

```
Hero product render of a perfect sphere made of black polished obsidian and black chrome,
floating in a pitch-black void. The sphere is precisely cut into 4 equal vertical wedges
(like an orange cut into quarters along its vertical axis); the wedges are closed together
with hairline gaps. Through the hairline gaps a molten orange light (#f26522 to #f59c1a)
leaks out, as if a star is contained inside. Surface: mirror-like clearcoat, sharp studio
reflections of long softbox strips, a very subtle iridescent sheen (purple-to-teal) only
at grazing angles. Thin glowing orange rim along every cut line. Small orange ember particles
drifting around. Low-key lighting, one warm orange rim light from behind-right, one cool
white softbox from top-left. Camera 35mm, slightly from above, 3/4 view. Ultra clean,
luxury tech, Apple-product-render quality, octane / cycles look, 8k detail, no text,
no logo, black background.
```

### 2.2 Разтворено ядро („Системата“)

```
The same black obsidian-chrome sphere, now exploded: its 4 vertical quarter-wedges have
separated outward from the center by about one third of the radius, each slightly rotated.
The flat inner cut faces of each wedge are revealed: they glow molten orange (#f26522) with
fine hair-thin filament lines like circuitry or lava veins, brighter near the center.
In the exact center floats a small intensely glowing core — white-hot at its heart, fading
to amber and orange — casting warm light on all inner faces. Thin orange light rims on all
cut edges. Tiny sparks and ember particles. Pitch-black background, dramatic low-key studio
lighting, 3/4 view from slightly above, 50mm lens, shallow depth of field. Luxury product
render, hyper-detailed, no text.
```

### 2.3 Резените в линия („Пътят на клиента“)

```
Four black obsidian-chrome quarter-sphere wedges arranged in a straight horizontal line,
evenly spaced, each showing its glowing molten-orange flat inner face toward the camera at a
slight angle. A thin horizontal beam of amber light connects all four wedges through their
centers. Pitch-black background with faint orange haze and floating embers. Front view from
slightly above, 35mm, cinematic, symmetrical composition, luxury tech product render,
no text.
```

### 2.4 Близък план на материала (за текстурите)

```
Extreme macro close-up of the cut face of a black obsidian sphere: the polished black
outer shell (mirror clearcoat, tiny iridescent sheen) meets a flat inner face made of
glowing molten orange material with hair-thin branching filament lines, like lava veins
or a circuit board made of light. Sharp thin orange glowing rim exactly at the edge where
shell meets face. Black background, studio lighting, 100mm macro, ultra-detailed.
```

### 2.5 Ортографски изгледи (за моделиране)

```
Technical orthographic reference sheet of a sphere cut into 4 equal vertical quarter wedges,
slightly exploded apart. Three views on a neutral dark grey background: front view, top view,
side view. Black glossy shell, flat inner faces colored flat orange. Clean, even lighting,
no perspective distortion, no shadows, labeled nothing, no text.
```

---

## 3. Спецификация за Blender → GLB

### Структура (задължително)

```
effect-core (Empty, в 0,0,0)
├── module_ads   (Object/Empty + мешовете му)
├── module_smm
├── module_web
├── module_ai
└── core_glow    (по избор — малката светеща сфера в центъра)
```

- **Имената** трябва да са точно `module_ads`, `module_smm`, `module_web`, `module_ai`. Ако липсва някое, сайтът остава на placeholder-а и пише предупреждение в конзолата.
- **Pivot (origin) на всеки модул е в 0,0,0**, т.е. в центъра на цялата сфера, **не** в центъра на резена. Точно така е и в placeholder-а. Посоката на разтваряне се смята от центъра на резена спрямо 0,0,0.
- **Сглобена поза:** резените са затворени (сфера). Разтварянето и подреждането в линия се правят от кода.
- **Ред около оста Y:** ads → smm → web → ai, един след друг, по 90° всеки. Точната начална позиция не е критична. В линията кодът ги подрежда по име, независимо къде са в сферата.
- **Размер:** няма значение, кодът нормализира до радиус ≈ 1.15. Препоръка: радиус 1 m.
- **Ос:** Y нагоре (стандартният glTF експорт от Blender го прави сам).

### Материали (Principled BSDF, експортират се директно)

| Част | Настройки |
|---|---|
| Външна обвивка | Base #121217, Metallic 1, Roughness 0.18–0.22, Coat 1, Coat roughness 0.08. По избор Thin film / Iridescence 0.25 |
| Вътрешни стени | Base #140500, Metallic 0.5, Roughness 0.3, **Emission #ff4d0d**, strength 1–3. Текстурата с „вените“ отива в Emission Color. |
| Ръбове по разреза | Малък bevel с emission материала или отделен тънък mesh със същия материал |
| core_glow | Emission #ffb070, strength 5+ |

Кодът намира всеки материал с **emission ≠ черно** и го „разпалва“ при скрол и hover. Затова вътрешните стени трябва да имат emission, а обвивката — не.

### Оптимизация

- Общо **под 1 MB** (цел 400–700 KB).
- Обвивка: 2–4k триъгълника на резен (гладкостта идва от shading-а — Shade Auto Smooth).
- Текстури: максимум 1024×1024, WebP/KTX2, ако експортът позволява. За emission е достатъчна 512.
- Експорт: **glTF Binary (.glb)**, Apply Modifiers, +Y Up, Compression: **Draco** (level 6–7). Декодерът е вече включен в сайта.
- Без камери, светлини и анимации — те са в кода.

### Включване

1. Файлът: `public/models/effect-core.glb` (в репото на сайта).
2. В Hostinger → Node app → Environment variables: `NEXT_PUBLIC_CORE_MODEL_URL=/models/effect-core.glb`
3. Rebuild + restart. Празна променлива = placeholder (без 404 в конзолата).

Проверка: отвори сайта, скролни до „Системата“. Резените трябва да се разтворят навън. Ако излизат в грешна посока или се въртят около грешна точка, значи origin-ът не е в 0,0,0.

---

## 4. По избор (фаза 2): обекти за всяка услуга

За hero-то на страниците на услугите — всеки обект е „отломък“ от ядрото, в същите материали. Засега страниците ползват самото ядро, така че това не е спешно.

| Страница | Обект | Промпт (към базата от 2.1) |
|---|---|---|
| Реклама | Резенът `module_ads`, от който излиза конус от светлина към мишена | „…a single black obsidian quarter-wedge emitting a focused cone of orange light toward a floating thin ring target…“ |
| Социални мрежи | Три тънки черни стъклени карти, наредени като ветрило (логото) | „…three thin black glass cards fanned like a hand of cards, orange glowing edges, floating…“ |
| Сайтове | Плоча от черен хром с издълбана решетка като wireframe на страница | „…a floating black chrome slab with a laser-engraved glowing orange website wireframe grid…“ |
| AI | Малкото светещо ядро в клетка от тънки черни пръстени | „…a white-hot glowing orb inside a gyroscope of thin black chrome rings, orange light…“ |

Имената в GLB са същите: `module_*` + `core_glow`. Всеки като отделен файл, а включването ще добавим, когато ги имаш.

---

## 5. Генерация през Mercury (de-os) вместо Higgsfield

Mercury вече има GPT Image 2 (`lib/mercury/providers/gptimage.js`). Добавих скрипт, който генерира петте референции от раздел 2:

```
cd de-os
node scripts/gen-3d-refs.mjs            # всички 5
node scripts/gen-3d-refs.mjs hero       # само една (hero | explode | line | macro | ortho)
node scripts/gen-3d-refs.mjs --medium   # по-евтино качество за проби
```

- Картинките се записват в `de-os/out/3d-refs/*.png`.
- Скриптът чете `OPENAI_API_KEY` от `.env.local`, както останалите скриптове.
- Цена: ≈ $0.21 на картинка на `high` (≈ $1 за всичките 5) и ≈ $0.05 на `medium`.

**Защо не ги генерирах аз оттук:** средата, в която работя, няма достъп до `api.openai.com` (мрежовият allowlist на организацията го блокира). Има два начина да се оправи:

1. **Най-лесно:** пускаш скрипта локално или на VPS-а (Hetzner), където ключът вече е.
2. За да мога аз да генерирам директно: Claude → Settings (Admin) → Capabilities → мрежов достъп → добави `api.openai.com` (и `ark.ap-southeast.bytepluses.com` за Seedream/Seedance) в allowlist-а. Ключът остава в `.env.local` на компютъра ти и не се копира никъде.

Видео (Seedance) за hero-то не е нужно. 3D сцената е истинска и реагира на скрола, а видео би добавило 3–10 MB. Seedance е полезен за social промо на новия сайт: например 6-секунден клип на разтварящото се ядро от кадрите в 2.1 → 2.2 като start/end frame.
