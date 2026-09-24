// ── /og?t=Заглавие&e=Надпис — Open Graph картинка за всяка страница (1200×630)
// Генерира се при първа заявка и се кешира. Шрифтовете са локални (кирилица).
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

let fonts: { name: string; data: Buffer; weight: 500 | 900 }[] | null = null;
async function loadFonts() {
	if (fonts) return fonts;
	const dir = path.join(process.cwd(), "src", "app", "og");
	const [m, i] = await Promise.all([readFile(path.join(dir, "montserrat-900.woff")), readFile(path.join(dir, "inter-500.woff"))]);
	fonts = [{ name: "Montserrat", data: m, weight: 900 }, { name: "Inter", data: i, weight: 500 }];
	return fonts;
}

export async function GET(req: Request) {
	const u = new URL(req.url);
	const title = (u.searchParams.get("t") || "Всяко евро да работи.").slice(0, 90);
	const eyebrow = (u.searchParams.get("e") || "Дигитална маркетинг агенция").slice(0, 60);
	const f = await loadFonts();
	return new ImageResponse(
		(
			<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "#07080a", color: "#f3efe9", fontFamily: "Inter", position: "relative" }}>
				<div style={{ position: "absolute", right: -140, top: -120, width: 620, height: 620, borderRadius: 620, background: "radial-gradient(circle at 40% 40%, #ffb070 0%, #f26522 26%, #3a1204 58%, rgba(7,8,10,0) 72%)", display: "flex" }} />
				<div style={{ position: "absolute", right: 60, top: 140, width: 330, height: 330, borderRadius: 330, border: "2px solid rgba(242,101,34,.35)", display: "flex" }} />
				<div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "Montserrat", fontSize: 26, letterSpacing: 1 }}>
					<div style={{ width: 16, height: 16, borderRadius: 16, background: "#f26522", display: "flex" }} />
					DIGITAL EFFECT
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 900 }}>
					<div style={{ display: "flex", fontSize: 24, color: "#f26522", textTransform: "uppercase", letterSpacing: 5 }}>{eyebrow}</div>
					<div style={{ display: "flex", fontFamily: "Montserrat", fontSize: title.length > 48 ? 64 : 80, lineHeight: 1.02, letterSpacing: -2 }}>{title}</div>
				</div>
				<div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "rgba(243,239,233,.6)" }}>
					<span>digitaleffect.bg</span>
					<span>Реклама · Социални мрежи · Сайтове · AI</span>
				</div>
			</div>
		),
		{ width: 1200, height: 630, fonts: f, headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" } },
	);
}
