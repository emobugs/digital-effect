"use client";

// ═══════════════════════════════════════════════════════════════════════════
// OfferAccept — „Приемам това предложение“ под калкулатора.
// Форма с фирмени данни → „Преглед на договора“ (PDF с воден знак, нищо не се
// пази) → чекбокс „Приемам условията“ → de-os прави договора (PDF), маркира
// приемането с одитна следа и праща имейла. Изборът (selection) идва от
// калкулатора; сумите се смятат в de-os, не тук.
// ═══════════════════════════════════════════════════════════════════════════
import { useState } from "react";
import type { OfferSelection, CompanyForm, AcceptedInfo } from "@/lib/offer-selection";

const INPUT = "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[15px] text-gray-100 placeholder:text-gray-600 outline-none transition focus:border-brand-orange-l/50 focus:shadow-[0_0_0_3px_rgba(242,101,34,0.12)]";
const EUR = (n: number) => `${Math.round(n)} €`;

const EMPTY: CompanyForm = { name: "", eik: "", vat: "", address: "", mol: "", email: "", phone: "" };

type Result = { contractNo: string; acceptedAt?: string; totals?: { agency: number; budget: number; grand: number; oneTime: number }; sent?: boolean; sendError?: string; already?: boolean };

export default function OfferAccept({ token, selection, grand, clientName, contactName, contactEmail, contactPhone, accepted }: {
	token: string;
	selection: OfferSelection;
	grand: number;
	clientName: string;
	contactName?: string;
	contactEmail?: string;
	contactPhone?: string;
	accepted: AcceptedInfo | null;
}) {
	const [open, setOpen] = useState(false);
	const [f, setF] = useState<CompanyForm>({ ...EMPTY, name: clientName, mol: contactName || "", email: contactEmail || "", phone: contactPhone || "" });
	const [agree, setAgree] = useState(false);
	const [busy, setBusy] = useState<"" | "preview" | "accept">("");
	const [err, setErr] = useState("");
	const [done, setDone] = useState<Result | null>(null);
	const set = (k: keyof CompanyForm) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

	/* ── вече прието (при отваряне на линка след приемане) ── */
	if (accepted || done) {
		const a = done ?? accepted!;
		const totals = a.totals ?? null;
		return (
			<div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.06] p-5 sm:p-6">
				<div className="text-[11px] font-extrabold tracking-[.18em] uppercase text-emerald-400 mb-2">Предложението е прието</div>
				<h3 className="font-display font-black text-xl mb-2">Договор № {a.contractNo}</h3>
				<p className="text-gray-300 text-[15px] leading-relaxed">
					{done?.sent === false && done.sendError
						? "Договорът е записан. Имейлът не успя да тръгне автоматично — ще ви го изпратим ръчно до няколко часа."
						: "Изпратихме договора на посочения имейл. Ще ви пишем за достъпите и фактурата за първия месец — стартираме веднага щом ги имаме."}
				</p>
				{totals && (
					<p className="text-gray-400 text-sm mt-3">
						Месечно към Digital Effect: <strong className="text-gray-100">{EUR(totals.agency)}</strong>
						{totals.budget ? <> · рекламен бюджет: <strong className="text-gray-100">{EUR(totals.budget)}</strong></> : null}
						{totals.oneTime ? <> · еднократно: <strong className="text-gray-100">{EUR(totals.oneTime)}</strong></> : null}
					</p>
				)}
				<a href={`/api/oferta/${token}/contract`} target="_blank" rel="noopener" className="inline-block mt-4 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-brand-grad">Отвори договора (PDF)</a>
			</div>
		);
	}

	async function preview() {
		setErr(""); setBusy("preview");
		try {
			const r = await fetch(`/api/oferta/${token}/contract`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ selection, company: f, acceptedBy: f.mol }) });
			if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || "Грешка при генериране на прегледа."); }
			const blob = await r.blob();
			const url = URL.createObjectURL(blob);
			window.open(url, "_blank", "noopener");
			setTimeout(() => URL.revokeObjectURL(url), 60_000);
		} catch (e) { setErr(e instanceof Error ? e.message : "Грешка."); } finally { setBusy(""); }
	}

	async function accept() {
		setErr("");
		if (!agree) { setErr("Отбележете, че приемате условията на договора."); return; }
		setBusy("accept");
		try {
			const r = await fetch(`/api/oferta/${token}/accept`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ selection, company: f, acceptedBy: f.mol, agree: true }) });
			const j = (await r.json().catch(() => ({}))) as Result & { error?: string };
			if (!r.ok) throw new Error(j.error || "Грешка при приемането.");
			setDone(j);
			window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
		} catch (e) { setErr(e instanceof Error ? e.message : "Грешка."); } finally { setBusy(""); }
	}

	return (
		<div className="mt-6 rounded-2xl border border-brand-orange-l/30 bg-brand-orange-l/[0.05] p-5 sm:p-6">
			{!open ? (
				<div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
					<div>
						<div className="font-display font-black text-lg leading-tight">Готови ли сте?</div>
						<p className="text-gray-400 text-sm mt-1">Приемате онлайн с избраното по-горе ({EUR(grand)} месечно). Договорът идва на имейла ви веднага, без разпечатване.</p>
					</div>
					<button type="button" onClick={() => setOpen(true)} className="flex-shrink-0 px-6 py-3 rounded-xl font-bold text-[15px] text-white bg-brand-grad shadow-[0_0_24px_rgba(242,101,34,.28)] hover:shadow-[0_0_34px_rgba(242,101,34,.4)] transition">
						Приемам това предложение →
					</button>
				</div>
			) : (
				<div>
					<div className="text-[11px] font-extrabold tracking-[.18em] uppercase text-brand-orange-l mb-2">Данни за договора</div>
					<p className="text-gray-400 text-sm mb-5">Фирмата (или лицето), с която сключваме договора. Първо може да прегледате договора като PDF — нищо не се приема, докато не натиснете последния бутон.</p>
					<div className="grid gap-3 sm:grid-cols-2">
						<label className="sm:col-span-2 text-sm"><span className="block text-gray-300 font-semibold mb-1.5">Фирма / име <span className="text-brand-orange-l">*</span></span><input className={INPUT} value={f.name} onChange={set("name")} placeholder="напр. Елвис Студио ЕООД" autoComplete="organization" /></label>
						<label className="text-sm"><span className="block text-gray-300 font-semibold mb-1.5">ЕИК / ЕГН <span className="text-brand-orange-l">*</span></span><input className={INPUT} value={f.eik} onChange={set("eik")} inputMode="numeric" placeholder="9, 10 или 13 цифри" /></label>
						<label className="text-sm"><span className="block text-gray-300 font-semibold mb-1.5">ДДС номер</span><input className={INPUT} value={f.vat} onChange={set("vat")} placeholder="BG… (ако имате)" /></label>
						<label className="sm:col-span-2 text-sm"><span className="block text-gray-300 font-semibold mb-1.5">Адрес на управление <span className="text-brand-orange-l">*</span></span><input className={INPUT} value={f.address} onChange={set("address")} placeholder="град, улица, номер" autoComplete="street-address" /></label>
						<label className="text-sm"><span className="block text-gray-300 font-semibold mb-1.5">Представляващ (МОЛ) <span className="text-brand-orange-l">*</span></span><input className={INPUT} value={f.mol} onChange={set("mol")} placeholder="име и фамилия" autoComplete="name" /></label>
						<label className="text-sm"><span className="block text-gray-300 font-semibold mb-1.5">Телефон</span><input className={INPUT} value={f.phone} onChange={set("phone")} type="tel" autoComplete="tel" /></label>
						<label className="sm:col-span-2 text-sm"><span className="block text-gray-300 font-semibold mb-1.5">Имейл за договора и фактурите <span className="text-brand-orange-l">*</span></span><input className={INPUT} value={f.email} onChange={set("email")} type="email" autoComplete="email" /></label>
					</div>

					<div className="mt-5 flex flex-col sm:flex-row gap-3">
						<button type="button" disabled={!!busy} onClick={preview} className="px-5 py-3 rounded-xl border border-white/15 text-gray-200 font-semibold text-[15px] hover:border-white/30 transition disabled:opacity-50">
							{busy === "preview" ? "Генерирам…" : "Преглед на договора (PDF)"}
						</button>
					</div>

					<label className="mt-5 flex items-start gap-3 cursor-pointer select-none">
						<input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 w-4 h-4 accent-brand-orange-l" />
						<span className="text-sm text-gray-300 leading-relaxed">
							Прочетох договора и приложенията и <strong className="text-gray-100">приемам условията</strong> от името на посочената фирма. Разбирам, че приемането има силата на подпис (чл. 13, ал. 4 ЗЕДЕУУ) и че записваме датата, часа и IP адреса на приемането.
						</span>
					</label>

					{err && <div className="mt-4 text-sm text-red-400">{err}</div>}

					<div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
						<button type="button" disabled={!!busy} onClick={accept} className="px-6 py-3 rounded-xl font-bold text-[15px] text-white bg-brand-grad shadow-[0_0_24px_rgba(242,101,34,.28)] transition disabled:opacity-50">
							{busy === "accept" ? "Изготвям договора…" : `Приемам условията — ${EUR(grand)} / месец`}
						</button>
						<button type="button" disabled={!!busy} onClick={() => setOpen(false)} className="text-sm text-gray-500 hover:text-gray-300">Отказ</button>
					</div>
					<p className="mt-4 text-[12px] text-gray-500 leading-relaxed">Данните се ползват само за договора и фактурите. Подробности в <a href="/privacy" className="underline text-brand-orange-l">Политиката за поверителност</a>.</p>
				</div>
			)}
		</div>
	);
}
