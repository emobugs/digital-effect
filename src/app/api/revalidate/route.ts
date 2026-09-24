// ── /api/revalidate — de-os казва „промених цени/страници“ → пресъздаваме ────
// POST { tags?: string[], paths?: string[] } + хедър X-Revalidate-Secret.
// Тайната е DEOS_HELLO_SECRET (същата като HELLO_SECRET в de-os) или
// SITE_REVALIDATE_SECRET, ако е зададена. Грешна/липсваща тайна → 401.
import { revalidatePath, revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
const ALLOWED_TAGS = new Set(["deos-catalog", "deos-content"]);

function ok(given: string) {
	const expected = (process.env.SITE_REVALIDATE_SECRET || process.env.DEOS_HELLO_SECRET || "").trim();
	if (!expected || !given) return false;
	const a = Buffer.from(given), b = Buffer.from(expected);
	return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
	if (!ok(req.headers.get("x-revalidate-secret") || "")) return Response.json({ error: "unauthorized" }, { status: 401 });
	const body = (await req.json().catch(() => ({}))) as { tags?: unknown; paths?: unknown };
	const tags = (Array.isArray(body.tags) ? body.tags : []).map(String).filter((t) => ALLOWED_TAGS.has(t));
	const paths = (Array.isArray(body.paths) ? body.paths : []).map(String).filter((p) => /^\/[a-z0-9/_-]*$/i.test(p)).slice(0, 100);
	for (const t of tags) revalidateTag(t, "max");
	for (const p of paths) revalidatePath(p);
	// Цените се виждат навсякъде — при промяна на каталога обновяваме целия layout
	if (tags.includes("deos-catalog")) revalidatePath("/", "layout");
	return Response.json({ ok: true, tags, paths, at: new Date().toISOString() });
}
