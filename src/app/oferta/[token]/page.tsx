// ── /oferta/[token] — офертата, която клиентът отваря ─────────────────────
// Данните живеят в de-os (hello_offers); сайтът ги взима по токена със
// споделената тайна (DEOS_HELLO_SECRET) и рендерира калкулатора. Няма списък,
// няма индексиране — токенът е единственият вход. ?preview=1 (от панела) не се
// брои като преглед от клиента.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OfferCalculator from "@/components/OfferCalculator";
import { deosApi } from "@/lib/services";
import type { OfferData } from "@/lib/offer-types";
import type { AcceptedInfo } from "@/lib/offer-selection";

export const dynamic = "force-dynamic";

type Params = Promise<{ token: string }>;
type Search = Promise<{ preview?: string }>;

interface OfferResponse { data: OfferData; status: string; mode: string; updatedAt?: string; accepted?: AcceptedInfo | null }

async function loadOffer(token: string, preview: boolean): Promise<OfferResponse | null> {
	if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return null;
	const secret = process.env.DEOS_HELLO_SECRET?.trim() || "";
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), 8000);
	try {
		const r = await fetch(`${deosApi()}/oferta/${encodeURIComponent(token)}${preview ? "?preview=1" : ""}`, {
			headers: { Origin: "https://digitaleffect.bg", ...(secret ? { "X-Hello-Secret": secret } : {}) },
			cache: "no-store",
			signal: ctrl.signal,
		});
		if (r.status === 404) return null;
		if (!r.ok) throw new Error(`HTTP ${r.status}`);
		const j = (await r.json()) as OfferResponse;
		return j?.data?.brandTitle ? j : null;
	} catch (e) {
		console.error("[oferta] de-os:", e instanceof Error ? e.message : e);
		throw e; // 500 → страницата за грешка; не 404, защото офертата може да съществува
	} finally {
		clearTimeout(t);
	}
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { token } = await params;
	let title = "Предложение — Digital Effect";
	try {
		const o = await loadOffer(token, true);
		if (o?.data?.client?.name) title = `Предложение за ${o.data.client.name} — Digital Effect`;
	} catch { /* заглавието не е критично */ }
	return { title, robots: { index: false, follow: false } };
}

export default async function OfertaPage({ params, searchParams }: { params: Params; searchParams: Search }) {
	const { token } = await params;
	const { preview } = await searchParams;
	const offer = await loadOffer(token, preview === "1");
	if (!offer) notFound();
	return (
		<main className="min-h-screen bg-dark-obsidian text-gray-100">
			<OfferCalculator data={offer.data} token={token} accepted={offer.accepted ?? null} />
		</main>
	);
}
