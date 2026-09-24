// ── /llms-full.txt — за езикови модели и AI асистенти (генерира се от de-os данните) ──
import { buildLlms } from "@/lib/llms";

export const revalidate = 3600;

export async function GET() {
	const body = await buildLlms(true);
	return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=3600" } });
}
