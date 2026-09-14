"use client";

// ═══════════════════════════════════════════════════════════════════════════
// OfferAccept — „Потвърждавам избора си“ под калкулатора.
// Клиентът вижда само фирма + имейл (решение 14.09): останалите полета за
// договора (ЕИК, ДДС, адрес, МОЛ, телефон) остават в модела, но не се показват —
// попълват се от нас в панела при уточняването. Договорът НЕ се показва тук:
// de-os прави проект само за панела; изпраща се след уточняване на детайлите.
// Изборът (selection) идва от калкулатора; сумите се смятат в de-os, не тук.
// ═══════════════════════════════════════════════════════════════════════════
import { useState } from "react";
import type { OfferSelection, CompanyForm, AcceptedInfo } from "@/lib/offer-selection";

const INPUT = "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[15px] text-gray-100 placeholder:text-gray-600 outline-none transition focus:border-brand-orange-l/50 focus:shadow-[0_0_0_3px_rgba(242,101,34,0.12)]";
const EUR = (n: number) => `${Math.round(n)} €`;

/** Пълните фирмени данни се показват само ако някога решим да ги искаме онлайн. */
const SHOW_CONTRACT_FIELDS = false;

const EMPTY: CompanyForm = { name: "", eik: "", vat: "", address: "", mol: "", email: "", phone: "" };

type Result = { acceptedAt?: string; totals?: { agency: number; budget: number; grand: number; oneTime: number }; sent?: boolean; contractNo?: string | null; confirmed?: boolean; already?: boolean };

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
	const [busy, setBusy] = useState(false);
	const [err, setErr] = useState("");
	const [done, setDone] = useState<Result | null>(null);
	const set = (k: keyof CompanyForm) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

	/* ── вече одобрено (при отваряне на линка след одобрение) ── */
	if (accepted || done) {
		const a = done ?? accepted!;
		const totals = a.totals ?? null;
		const contractSent = !!(a.sent && a.contractNo);
		return (
			<div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.06] p-5 sm:p-6">
				<div className="text-[11px] font-extrabold tracking-[.18em] uppercase text-emerald-400 mb-2">Получихме избора ви</div>
				<h3 className="font-display font-black text-xl mb-2">{contractSent ? `Договор № ${a.contractNo}` : "Благодарим за доверието"}</h3>
				<p className="text-gray-300 text-[15px] leading-relaxed">
					{contractSent
						? "Договорът е на имейла ви. Прегледайте го и го потвърдете с отговор на имейла — от този момент стартираме."
						: "Ще се свържем с вас в рамките на 1 работен ден, за да уточним детайлите — достъпи, срокове и критерий за успех. Договорът ще получите след това на посочения имейл."}
				</p>
				{totals && (
					<p className="text-gray-400 text-sm mt-3">
						Месечно към Digital Effect: <strong className="text-gray-100">{EUR(totals.agency)}</strong>
						{totals.budget ? <> · рекламен бюджет: <strong className="text-gray-100">{EUR(totals.budget)}</strong></> : null}
						{totals.oneTime ? <> · еднократно: <strong className="text-gray-100">{EUR(totals.oneTime)}</strong></> : null}
					</p>
				)}
				{contractSent && (
					<a href={`/api/oferta/${token}/contract`} target="_blank" rel="noopener" className="inline-block mt-4 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-brand-grad">Отвори договора (PDF)</a>
				)}
			</div>
		);
	}

	async function accept() {
		setErr("");
		if (!f.name.trim()) { setErr("Напишете името на фирмата (или вашето име)."); return; }
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) { setErr("Напишете валиден имейл."); return; }
		if (!agree) { setErr("Отбележете, че потвърждавате избора си."); return; }
		setBusy(true);
		try {
			const r = await fetch(`/api/oferta/${token}/accept`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ selection, company: f, acceptedBy: f.mol || f.name, agree: true }) });
			const j = (await r.json().catch(() => ({}))) as Result & { error?: string };
			if (!r.ok) throw new Error(j.error || "Грешка при изпращането.");
			setDone(j);
			window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
		} catch (e) { setErr(e instanceof Error ? e.message : "Грешка."); } finally { setBusy(false); }
	}

	return (
		<div className="mt-6 rounded-2xl border border-brand-orange-l/30 bg-brand-orange-l/[0.05] p-5 sm:p-6">
			{!open ? (
				<div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
					<div>
						<div className="font-display font-black text-lg leading-tight">Готови ли сте?</div>
						<p className="text-gray-400 text-sm mt-1">Потвърждавате избора си онлайн ({EUR(grand)} месечно). После уточняваме детайлите заедно и ви изпращаме договора — без разпечатване.</p>
					</div>
					<button type="button" onClick={() => setOpen(true)} className="flex-shrink-0 px-6 py-3 rounded-xl font-bold text-[15px] text-white bg-brand-grad shadow-[0_0_24px_rgba(242,101,34,.28)] hover:shadow-[0_0_34px_rgba(242,101,34,.4)] transition">
						Приемам това предложение →
					</button>
				</div>
			) : (
				<div>
					<div className="text-[11px] font-extrabold tracking-[.18em] uppercase text-brand-orange-l mb-2">Потвърждение</div>
					<p className="text-gray-400 text-sm mb-5">Само две неща — с кого работим и къде да пишем. Нищо не се плаща на този етап.</p>
					<div className="grid gap-3 sm:grid-cols-2">
						<label className="text-sm"><span className="block text-gray-300 font-semibold mb-1.5">Фирма / име <span className="text-brand-orange-l">*</span></span><input className={INPUT} value={f.name} onChange={set("name")} placeholder="напр. Елвис Студио ЕООД" autoComplete="organization" /></label>
						<label className="text-sm"><span className="block text-gray-300 font-semibold mb-1.5">Имейл <span className="text-brand-orange-l">*</span></span><input className={INPUT} value={f.email} onChange={set("email")} type="email" autoComplete="email" /></label>
						{SHOW_CONTRACT_FIELDS && (
							<>
								<label className="text-sm"><span className="block text-gray-300 font-semibold mb-1.5">ЕИК / ЕГН</span><input className={INPUT} value={f.eik} onChange={set("eik")} inputMode="numeric" placeholder="9, 10 или 13 цифри" /></label>
								<label className="text-sm"><span className="block text-gray-300 font-semibold mb-1.5">ДДС номер</span><input className={INPUT} value={f.vat} onChange={set("vat")} placeholder="BG… (ако имате)" /></label>
								<label className="sm:col-span-2 text-sm"><span className="block text-gray-300 font-semibold mb-1.5">Адрес на управление</span><input className={INPUT} value={f.address} onChange={set("address")} placeholder="град, улица, номер" autoComplete="street-address" /></label>
								<label className="text-sm"><span className="block text-gray-300 font-semibold mb-1.5">Представляващ (МОЛ)</span><input className={INPUT} value={f.mol} onChange={set("mol")} placeholder="име и фамилия" autoComplete="name" /></label>
								<label className="text-sm"><span className="block text-gray-300 font-semibold mb-1.5">Телефон</span><input className={INPUT} value={f.phone} onChange={set("phone")} type="tel" autoComplete="tel" /></label>
							</>
						)}
					</div>

					<label className="mt-5 flex items-start gap-3 cursor-pointer select-none">
						<input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 w-4 h-4 accent-brand-orange-l" />
						<span className="text-sm text-gray-300 leading-relaxed">
							<strong className="text-gray-100">Потвърждавам избора си</strong> от името на посочената фирма. Разбирам, че договорът идва след уточняване на детайлите и че записваме датата, часа и IP адреса на потвърждението.
						</span>
					</label>

					{err && <div className="mt-4 text-sm text-red-400">{err}</div>}

					<div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
						<button type="button" disabled={busy} onClick={accept} className="px-6 py-3 rounded-xl font-bold text-[15px] text-white bg-brand-grad shadow-[0_0_24px_rgba(242,101,34,.28)] transition disabled:opacity-50">
							{busy ? "Изпращам…" : `Потвърждавам — ${EUR(grand)} / месец`}
						</button>
						<button type="button" disabled={busy} onClick={() => setOpen(false)} className="text-sm text-gray-500 hover:text-gray-300">Отказ</button>
					</div>
					<p className="mt-4 text-[12px] text-gray-500 leading-relaxed">Данните се ползват само за договора и фактурите. Подробности в <a href="/privacy" className="underline text-brand-orange-l">Политиката за поверителност</a>.</p>
				</div>
			)}
		</div>
	);
}
