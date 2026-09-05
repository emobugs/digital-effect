import { NextResponse } from "next/server";
import { proxy, limited, ipOf } from "@/lib/deos-proxy";
import { normalizeCode } from "@/lib/partner-ref";

// GET /api/partners/check?code=DE-… → {valid, name?} — „Препоръчан от Иван“.
export const runtime = "nodejs";

const cache = new Map<string, { at: number; body: unknown }>();
const TTL = 60_000;

export async function GET(req: Request) {
	if (limited("check", ipOf(req), 30, 10 * 60 * 1000)) return NextResponse.json({ valid: false }, { status: 429 });
	const code = normalizeCode(new URL(req.url).searchParams.get("code"));
	if (!code) return NextResponse.json({ valid: false });
	const hit = cache.get(code);
	if (hit && Date.now() - hit.at < TTL) return NextResponse.json(hit.body);
	const r = await proxy(`/check?code=${encodeURIComponent(code)}`, { method: "GET" }, 5000);
	if (r.status === 200) {
		const body = await r.clone().json().catch(() => ({ valid: false }));
		if (cache.size > 1000) cache.clear();
		cache.set(code, { at: Date.now(), body });
		return NextResponse.json(body);
	}
	return NextResponse.json({ valid: false });
}
