// Безкрайна лента с обещанията — текст (не картинки), за да го четат и търсачките.
const ITEMS = [
	"Запитвания, не харесвания",
	"Бюджетът е ваш — плащате директно на Meta и Google",
	"Седмичен отчет на човешки език",
	"Без резултат — без такса",
	"Рекламният акаунт остава ваш",
	"Един екип: реклама, съдържание, сайт, AI",
	"Цените са на сайта",
];

export default function Ticker() {
	const row = [...ITEMS, ...ITEMS];
	return (
		<div className="relative z-10 overflow-hidden border-y border-white/[0.07] bg-[#07080a]/60 py-5 backdrop-blur-sm mask-fade-x" aria-label="Какво обещаваме">
			<div className="marquee">
				{row.map((t, i) => (
					<span key={i} className="flex items-center gap-8 pr-8 font-display text-[clamp(18px,2vw,26px)] font-extrabold tracking-[-0.01em] text-[var(--text)]/85" aria-hidden={i >= ITEMS.length}>
						{t}
						<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M7 0l1.8 5.2L14 7l-5.2 1.8L7 14l-1.8-5.2L0 7l5.2-1.8z" fill="#f26522" /></svg>
					</span>
				))}
			</div>
		</div>
	);
}
