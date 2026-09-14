// ── /api/oferta/[token]/contract — PDF на договора за клиента ───────────────
// POST { selection, company } → предварителен преглед (воден знак)
// GET → приетият договор
import { NextResponse } from "next/server";
import { deosApi } from "@/lib/services";
import { ipOf, limited } from "@/lib/deos-proxy";

const headersFor = () => {
	const secret = process.env.DEOS_HELLO_SECRET?.trim() || "";
	return { Origin: "https://digitaleffect.bg", ...(secret ? { "X-Hello-Secret": secret } : {}) };
};

async function relayPdf(r: Response) {
	if (!r.ok) {
		const data = await r.json().catch(() => ({ error: "Грешка при генериране на договора." }));
		return NextResponse.json(data, { status: r.status });
	}
	const buf = Buffer.from(await r.arrayBuffer());
	return new NextResponse(buf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": r.headers.get("content-disposition") || "inline", "Cache-Control": "no-store" } });
}

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
	const { token } = await params;
	if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return NextResponse.json({ error: "Невалиден линк." }, { status: 404 });
	const ip = ipOf(req);
	if (limited("oferta-preview", ip, 30, 60 * 60 * 1000)) return NextResponse.json({ error: "Твърде много опити." }, { status: 429 });
	const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
	if (!body) return NextResponse.json({ error: "Невалидна заявка." }, { status: 400 });
	try {
		const r = await fetch(`${deosApi()}/oferta/${encodeURIComponent(token)}/contract`, {
			method: "POST", headers: { "Content-Type": "application/json", ...headersFor() },
			body: JSON.stringify({ selection: body.selection, company: body.company, acceptedBy: body.acceptedBy, ip }),
			cache: "no-store", signal: AbortSignal.timeout(25000),
		});
		return await relayPdf(r);
	} catch (e) {
		console.error("[oferta/contract]", e instanceof Error ? e.message : e);
		return NextResponse.json({ error: "Услугата е временно недостъпна." }, { status: 503 });
	}
}

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
	const { token } = await params;
	if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return NextResponse.json({ error: "Невалиден линк." }, { status: 404 });
	try {
		const r = await fetch(`${deosApi()}/oferta/${encodeURIComponent(token)}/contract`, { headers: headersFor(), cache: "no-store", signal: AbortSignal.timeout(15000) });
		return await relayPdf(r);
	} catch (e) {
		console.error("[oferta/contract]", e instanceof Error ? e.message : e);
		return NextResponse.json({ error: "Услугата е временно недостъпна." }, { status: 503 });
	}
}
