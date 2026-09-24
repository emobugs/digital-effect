"use client";

// ── Формите: контакт (→ /api/contact, имейл) и списък за чакане (→ /api/hello, лийд в de-os)
import { useState } from "react";
import { ArrowRight, Loader2, Check } from "lucide-react";
import { resolvePartnerCode } from "@/lib/partner-ref";

const field = "h-14 w-full rounded-2xl bg-white/[0.04] px-5 text-[16px] text-white outline-none ring-1 ring-white/10 transition focus:bg-white/[0.06] focus:ring-[#f26522] placeholder:text-white/35";

export function ContactForm({ source = "contact" }: { source?: string }) {
	const [f, setF] = useState({ name: "", email: "", message: "", hp_field: "" });
	const [st, setSt] = useState<"idle" | "sending" | "ok" | "err">("idle");
	const [err, setErr] = useState("");
	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSt("sending"); setErr("");
		try {
			const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, message: `${f.message}\n\n— източник: ${source}` }) });
			const j = await r.json().catch(() => ({}));
			if (!r.ok) throw new Error(j.error || "Не успяхме да изпратим съобщението.");
			setSt("ok");
		} catch (x) { setSt("err"); setErr(x instanceof Error ? x.message : "Грешка"); }
	};
	if (st === "ok") return <div className="rounded-3xl bg-emerald-500/10 p-8 text-[17px] text-emerald-200 ring-1 ring-emerald-400/30"><Check className="mb-3" />Получихме го. Отговаряме до 1 работен ден.</div>;
	return (
		<form onSubmit={submit} className="grid gap-3">
			<div className="grid gap-3 sm:grid-cols-2">
				<input required aria-label="Име" placeholder="Име" className={field} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />
				<input required type="email" aria-label="Имейл" placeholder="Имейл" className={field} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" />
			</div>
			<textarea required aria-label="Съобщение" placeholder="С какво да помогнем? (бизнес, град, какво искате да се промени)" rows={5} className={`${field} h-auto py-4 leading-relaxed`} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
			<input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={f.hp_field} onChange={(e) => setF({ ...f, hp_field: e.target.value })} />
			<div className="flex flex-wrap items-center gap-4">
				<button type="submit" disabled={st === "sending"} className="btn-x btn-orange" data-magnetic="0.15">
					<span className="btn-fill" aria-hidden />
					<span className="relative inline-flex items-center gap-2">{st === "sending" && <Loader2 size={18} className="animate-spin" />}Изпрати<ArrowRight size={18} /></span>
				</button>
				<span className="text-[13px] text-[var(--dim)]">Отговаряме до 1 работен ден.</span>
			</div>
			{err && <p className="text-[14px] text-red-300">{err}</p>}
		</form>
	);
}

export function WaitlistForm({ resource, title }: { resource: string; title: string }) {
	const [f, setF] = useState({ contactName: "", email: "", name: "", website: "" });
	const [st, setSt] = useState<"idle" | "sending" | "ok" | "err">("idle");
	const [err, setErr] = useState("");
	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSt("sending"); setErr("");
		try {
			const r = await fetch("/api/hello", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...f, name: f.name || f.contactName, goal: `Списък за чакане: ${title}`, services: [], partnerCode: resolvePartnerCode() || undefined, meta: { source: "waitlist", resource } }),
			});
			const j = await r.json().catch(() => ({}));
			if (!r.ok) throw new Error(j.error || "Не успяхме да ви запишем.");
			setSt("ok");
		} catch (x) { setSt("err"); setErr(x instanceof Error ? x.message : "Грешка"); }
	};
	if (st === "ok") return <div className="rounded-3xl bg-emerald-500/10 p-6 text-[16px] text-emerald-200 ring-1 ring-emerald-400/30">Записахме ви. Ще сте сред първите, които получават достъп.</div>;
	return (
		<form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
			<input required aria-label="Име" placeholder="Име" className={field} value={f.contactName} onChange={(e) => setF({ ...f, contactName: e.target.value })} />
			<input required type="email" aria-label="Имейл" placeholder="Имейл" className={field} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
			<input aria-label="Бизнес" placeholder="Бизнес / сайт (по избор)" className={`${field} sm:col-span-2`} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
			<input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
			<button type="submit" disabled={st === "sending"} className="btn-x btn-orange sm:col-span-2">
				<span className="btn-fill" aria-hidden />
				<span className="relative inline-flex items-center gap-2">{st === "sending" && <Loader2 size={18} className="animate-spin" />}Запиши ме първи<ArrowRight size={18} /></span>
			</button>
			{err && <p className="text-[14px] text-red-300 sm:col-span-2">{err}</p>}
		</form>
	);
}
