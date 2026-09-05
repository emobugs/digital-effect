import { NextResponse } from "next/server";
import { proxy, limited, ipOf, str } from "@/lib/deos-proxy";
import { normalizeCode } from "@/lib/partner-ref";

// POST /api/partners/register → de-os. Валидира тук, за да не стигат
// боклуци до de-os; тайната се добавя в proxy().
export const runtime = "nodejs";

const ROLES = new Set(["accountant", "lawyer", "broker", "photographer", "it", "pos", "print", "web", "consultant", "hr", "other"]);

export async function POST(req: Request) {
	const ip = ipOf(req);
	if (limited("register", ip, 3, 60 * 60 * 1000)) return NextResponse.json({ error: "Твърде много опити. Опитайте по-късно." }, { status: 429 });
	const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
	if (!body) return NextResponse.json({ error: "Невалидна заявка." }, { status: 400 });
	if (str(body.website)) return NextResponse.json({ ok: true, code: null }); // honeypot

	const name = str(body.name, 80);
	const phone = str(body.phone, 30);
	const email = str(body.email, 120);
	if (name.length < 2) return NextResponse.json({ error: "Въведете име." }, { status: 400 });
	if (phone.replace(/\D/g, "").length < 9) return NextResponse.json({ error: "Въведете валиден телефон." }, { status: 400 });
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return NextResponse.json({ error: "Въведете валиден имейл — там пращаме линка за кабинета." }, { status: 400 });
	if (!body.consent) return NextResponse.json({ error: "Приемете условията." }, { status: 400 });

	return proxy("/register", {
		method: "POST", ip,
		body: {
			name, phone, email,
			role: ROLES.has(String(body.role)) ? body.role : "other",
			company: str(body.company, 120),
			is_client: !!body.is_client,
			pay_method: body.pay_method === "cash" || body.pay_method === "credit" ? body.pay_method : undefined,
			parent_code: normalizeCode(str(body.parent_code, 20)) ?? "",
			consent: true,
		},
	});
}
