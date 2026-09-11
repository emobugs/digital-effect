// ── /api/services — каталогът за браузъра (/hello избира услуги оттук) ─────
// Проксира de-os /api/services?for=hello със същия fallback като сървърните
// секции. Публично, без тайна (цените са публични), кеш 60 с.
import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/services";

export const revalidate = 60;

export async function GET(req: Request) {
	const forHello = new URL(req.url).searchParams.get("for") === "hello";
	const cat = await getCatalog(forHello);
	return NextResponse.json(cat, {
		headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" },
	});
}
