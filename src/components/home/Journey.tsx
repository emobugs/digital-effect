// ── „Пътят на клиента“ — етап 2: модулите застават в линия ───────────────────
// Внимание → Доверие → Запитване → Клиент. Под всеки модул — какво прави.
const STEPS = [
	{ k: "Внимание", by: "Реклама", text: "Точните хора виждат точното послание — в Google, Facebook и Instagram." },
	{ k: "Доверие", by: "Социални мрежи", text: "Профилът и отзивите потвърждават, че сте истински и добри." },
	{ k: "Запитване", by: "Сайт", text: "Бърза страница с ясна оферта, форма и телефон на всеки екран." },
	{ k: "Клиент", by: "AI и автоматизация", text: "Отговор за секунди, напомняне, оферта — нищо не се губи." },
];

export default function Journey() {
	return (
		<section data-stage="2" className="relative min-h-[150svh]">
			<div className="sticky top-0 flex h-[100svh] flex-col justify-between pb-10 pt-28">
				<div className="wrap text-center">
					<span data-reveal className="eyebrow">Пътят на клиента</span>
					<h2 data-reveal style={{ ["--d" as string]: "0.06s" }} className="display t-2 mx-auto mt-5 max-w-[16ch] text-balance">
						От „кой сте вие?“ до <span className="text-gradient">„кога започваме?“</span>
					</h2>
				</div>
				<ol className="wrap grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4">
					{STEPS.map((s, i) => (
						<li key={s.k} data-reveal style={{ ["--d" as string]: `${0.1 + i * 0.08}s` }} className="relative border-t border-white/10 pt-5">
							<span className="absolute -top-[5px] left-0 h-[9px] w-[9px] rounded-full bg-[#f26522] shadow-[0_0_18px_4px_rgba(242,101,34,.55)]" />
							<div className="flex items-baseline justify-between gap-2">
								<span className="font-display text-[clamp(20px,2vw,28px)] font-black tracking-[-0.02em]">{s.k}</span>
								<span className="text-[11px] tabular text-[var(--dim)]">0{i + 1}</span>
							</div>
							<div className="mt-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f5813a]">{s.by}</div>
							<p className="mt-3 max-w-[32ch] text-[14px] leading-relaxed text-[var(--muted)]">{s.text}</p>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
