"use client";

// ── /radar — Local Competitor Radar (публичен лид-магнит) ───────────────────
// Град + ниша (+ бизнес) → тийзър: колко конкуренти рекламират, топ 3, „Вие
// сте #N“. Пълната таблица се отключва с имейл → лид в de-os (/radar панел).
// ?t=<token> отваря вече пуснат радар (споделен линк) без нов скан.
// Браузърът говори само със сайта (/api/radar → proxy към de-os със секрета).

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Shell, Card, Kicker, H2, Note, INPUT, BTN, BTN_GHOST, cx } from "../partners/ui";

type Teaser = {
	token: string; city: string; niche: string; checkedAt: string;
	total: number; checked: number; withMeta: number; withGoogle: number; withPixel: number; noSite: number;
	avgRating: number; avgReviews: number;
	you: { rank: number; of: number; reviews: number; rating: number | null; name: string } | null;
	top: { rank: number; name: string; reviews: number }[];
	fresh?: boolean;
};
type Competitor = { rank: number; name: string; rating: number | null; reviews: number; website: string | null; metaAds: boolean | null; metaCount: number | null; googleAds: boolean | null; pixel: boolean | null; https: boolean | null; alive: boolean | null };
type Full = Teaser & { competitors: Competitor[]; ranking: { rank: number; name: string; reviews: number; rating: number | null }[] };

async function post(url: string, body: unknown) {
	const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
	const d = await r.json().catch(() => ({}));
	if (!r.ok) throw new Error(d.error || "Нещо се обърка. Опитайте пак.");
	return d;
}

const Mark = ({ v, yes = "✓", no = "—" }: { v: boolean | null | undefined; yes?: string; no?: string }) =>
	v === null || v === undefined ? <span className="text-gray-600">·</span> : v ? <span className="text-emerald-400 font-bold">{yes}</span> : <span className="text-gray-500">{no}</span>;

function Stat({ n, of, label, hot }: { n: number; of?: number; label: string; hot?: boolean }) {
	return (
		<div className="rounded-xl border border-white/10 bg-black/30 p-4">
			<div className={cx("font-display font-black text-2xl sm:text-3xl leading-none", hot ? "text-brand-orange-l" : "text-gray-100")}>{n}{of ? <span className="text-base text-gray-500 font-bold"> / {of}</span> : null}</div>
			<div className="text-xs text-gray-400 mt-1.5 leading-snug">{label}</div>
		</div>
	);
}

function RadarInner() {
	const sp = useSearchParams();
	const sharedToken = sp.get("t") || "";
	const [f, setF] = useState({ city: "", niche: "", business: "", website: "" });
	const [busy, setBusy] = useState(false);
	const [err, setErr] = useState("");
	const [t, setT] = useState<Teaser | null>(null);
	const [full, setFull] = useState<Full | null>(null);
	const [g, setG] = useState({ email: "", name: "", phone: "", website: "" });
	const [gBusy, setGBusy] = useState(false);
	const [gErr, setGErr] = useState("");

	useEffect(() => {
		if (!sharedToken) return;
		post("/api/radar", { token: sharedToken }).then(setT).catch((e: Error) => setErr(e.message));
	}, [sharedToken]);

	const run = async () => {
		if (busy) return;
		setBusy(true); setErr(""); setT(null); setFull(null);
		try { setT(await post("/api/radar", f)); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
	};
	const unlock = async () => {
		if (!t || gBusy) return;
		setGBusy(true); setGErr("");
		try {
			const d = await post("/api/radar/unlock", { ...g, token: t.token, business: f.business || t.you?.name || "" });
			setFull(d);
		} catch (e) { setGErr((e as Error).message); } finally { setGBusy(false); }
	};

	const notAdvertising = t ? Math.max(0, t.checked - Math.max(t.withMeta, t.withGoogle)) : 0;

	return (
		<Shell wide>
			<Card>
				<Kicker>Competitor Radar · безплатно</Kicker>
				<H2>Кой във Вашия град вече рекламира онлайн — и къде сте Вие</H2>
				<Note>Град и ниша. За 1–2 минути виждате колко от конкурентите Ви пускат реклами във Facebook и Google, кой има сайт с Pixel и на кое място сте по отзиви. Данните са публични — Google Maps, Meta Ad Library, Google Ads Transparency.</Note>
				<div className="grid gap-3 sm:grid-cols-2 mt-5">
					<input className={INPUT} placeholder="Град — Силистра" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} onKeyDown={(e) => e.key === "Enter" && run()} autoComplete="address-level2" />
					<input className={INPUT} placeholder="Ниша — зъболекар, автосервиз, фризьор…" value={f.niche} onChange={(e) => setF({ ...f, niche: e.target.value })} onKeyDown={(e) => e.key === "Enter" && run()} />
					<input className={cx(INPUT, "sm:col-span-2")} placeholder="Вашият бизнес (по избор — за да видите мястото си)" value={f.business} onChange={(e) => setF({ ...f, business: e.target.value })} onKeyDown={(e) => e.key === "Enter" && run()} />
					<input className="hidden" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} aria-hidden="true" />
				</div>
				<div className="flex items-center gap-4 mt-4 flex-wrap">
					<button className={BTN} disabled={busy || f.city.trim().length < 2 || f.niche.trim().length < 2} onClick={run}>{busy ? "Сканираме… 30–90 сек" : "Пусни радара"}</button>
					{busy && <span className="text-sm text-gray-400">Проверяваме до 10 конкурента един по един.</span>}
				</div>
				{err && <p className="text-sm text-red-300 mt-3">{err}</p>}
			</Card>

			{t && (
				<Card>
					<Kicker>{t.niche} · {t.city}</Kicker>
					<H2>{t.total} бизнеса в Google, {t.checked} проверени</H2>
					<div className="grid gap-3 grid-cols-2 sm:grid-cols-4 mt-4">
						<Stat n={t.withMeta} of={t.checked} label="рекламират във Facebook / Instagram" hot />
						<Stat n={t.withGoogle} of={t.checked} label="рекламират в Google" hot />
						<Stat n={notAdvertising} of={t.checked} label="не рекламират никъде — свободен терен" />
						<Stat n={t.noSite} of={t.checked} label="без собствен сайт" />
					</div>
					{t.you ? (
						<div className="mt-5 rounded-xl border border-brand-orange-l/30 bg-brand-orange-l/[0.06] p-4">
							<div className="font-display font-black text-xl">Вие сте #{t.you.rank} от {t.you.of} по отзиви</div>
							<div className="text-sm text-gray-400 mt-1">{t.you.name} · {t.you.reviews} отзива{t.you.rating ? ` · ${t.you.rating}★` : ""} · средно за нишата: {t.avgReviews} отзива, {t.avgRating}★</div>
						</div>
					) : f.business ? (
						<div className="mt-5 text-sm text-gray-400">Не открихме „{f.business}“ в първите резултати на Google за {t.niche} в {t.city} — това само по себе си е сигнал: клиентите Ви също не Ви намират там.</div>
					) : null}
					<div className="mt-5">
						<div className="text-[11px] font-extrabold tracking-[.18em] uppercase text-gray-500 mb-2">Топ 3 по отзиви</div>
						<ol className="space-y-1.5">
							{t.top.map((x) => <li key={x.rank} className="flex justify-between gap-3 text-[15px]"><span><span className="text-gray-500 mr-2">#{x.rank}</span>{x.name}</span><span className="text-gray-400">{x.reviews} отз.</span></li>)}
						</ol>
					</div>

					{!full && (
						<div className="mt-6 pt-6 border-t border-white/10">
							<H2>Пълният списък: кой точно рекламира, къде и с какъв сайт</H2>
							<Note>Всички {t.checked} проверени конкурента — реклами във Facebook и Google, сайт, HTTPS, Pixel. Оставете имейл и таблицата се отваря веднага.</Note>
							<div className="grid gap-3 sm:grid-cols-2 mt-4">
								<input className={INPUT} type="email" placeholder="Имейл *" value={g.email} onChange={(e) => setG({ ...g, email: e.target.value })} onKeyDown={(e) => e.key === "Enter" && unlock()} autoComplete="email" />
								<input className={INPUT} placeholder="Име (по избор)" value={g.name} onChange={(e) => setG({ ...g, name: e.target.value })} autoComplete="name" />
								<input className={INPUT} placeholder="Телефон (по избор — ако искате да Ви разкажем какво виждаме)" value={g.phone} onChange={(e) => setG({ ...g, phone: e.target.value })} autoComplete="tel" />
								<input className="hidden" tabIndex={-1} autoComplete="off" value={g.website} onChange={(e) => setG({ ...g, website: e.target.value })} aria-hidden="true" />
							</div>
							<div className="flex items-center gap-4 mt-4 flex-wrap">
								<button className={BTN} disabled={gBusy || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(g.email)} onClick={unlock}>{gBusy ? "Отваряме…" : "Покажи пълния списък"}</button>
								<span className="text-xs text-gray-500">Без спам. Данните се обработват по <Link href="/privacy" className="underline">политиката за поверителност</Link>.</span>
							</div>
							{gErr && <p className="text-sm text-red-300 mt-3">{gErr}</p>}
						</div>
					)}
				</Card>
			)}

			{full && (
				<Card>
					<Kicker>Пълен списък · {full.checked} проверени</Kicker>
					<div className="overflow-x-auto -mx-2">
						<table className="w-full text-sm min-w-[560px]">
							<thead className="text-gray-500 uppercase tracking-wider text-[10px]">
								<tr className="text-left"><th className="py-2 px-2">#</th><th className="px-2">Бизнес</th><th className="px-2">Отз.</th><th className="px-2">Сайт</th><th className="px-2">Pixel</th><th className="px-2">Facebook</th><th className="px-2">Google</th></tr>
							</thead>
							<tbody>
								{full.competitors.map((c) => {
									const me = full.you && c.rank === full.you.rank;
									return (
										<tr key={c.rank} className={cx("border-t border-white/[.06]", me && "bg-brand-orange-l/[0.08]")}>
											<td className="py-2 px-2 text-gray-500">{c.rank}</td>
											<td className="px-2 text-gray-100">{c.name}{me ? <span className="ml-2 text-[10px] uppercase tracking-wider text-brand-orange-l font-extrabold">Вие</span> : null}</td>
											<td className="px-2 text-gray-300">{c.reviews}{c.rating ? <span className="text-gray-500"> · {c.rating}★</span> : null}</td>
											<td className="px-2"><Mark v={c.website ? (c.alive ?? true) : false} yes={c.https === false ? "✓ (без HTTPS)" : "✓"} no="няма" /></td>
											<td className="px-2"><Mark v={c.pixel} /></td>
											<td className="px-2"><Mark v={c.metaAds} yes={c.metaCount ? `✓ ${c.metaCount} реклами` : "✓"} /></td>
											<td className="px-2"><Mark v={c.googleAds} /></td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
					{full.ranking.length > full.competitors.length && (
						<p className="text-xs text-gray-500 mt-3">Останалите {full.ranking.length - full.competitors.length} са класирани само по отзиви: {full.ranking.slice(full.competitors.length).map((x) => `#${x.rank} ${x.name}`).join(", ")}.</p>
					)}
					<div className="mt-6 pt-6 border-t border-white/10">
						<H2>{full.withMeta + full.withGoogle > 0 ? "Конкурентите Ви вече плащат за клиентите, които Вие чакате." : "Никой не рекламира — първият, който започне, взима всичко."}</H2>
						<Note>Четири минути анкета и получавате конкретен план за Вашия бизнес — какво да оправите първо и с какъв бюджет да влезете, без ангажимент.</Note>
						<div className="flex gap-3 mt-4 flex-wrap">
							<Link href="/hello" className={BTN}>Искам план за моя бизнес →</Link>
							<Link href="/partners" className={BTN_GHOST}>Познавате някого от списъка? Партньорска програма</Link>
						</div>
					</div>
				</Card>
			)}

			<p className="text-xs text-gray-600 text-center">Ориентировъчни данни от публични източници към {t ? String(t.checkedAt).slice(0, 10) : "днес"}. Не е обвързано с Google или Meta.</p>
		</Shell>
	);
}

export default function RadarPage() {
	return <Suspense fallback={<Shell wide><Card><Note>Зареждаме…</Note></Card></Shell>}><RadarInner /></Suspense>;
}
