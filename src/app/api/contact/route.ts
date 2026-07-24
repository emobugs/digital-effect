import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

const TO = "contacts@digitaleffect.bg";
const FROM = "Digital Effect <noreply@digitaleffect.bg>";

function isEmail(v: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function esc(s: string) {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

export async function POST(req: Request) {
	try {
		if (!process.env.RESEND_API_KEY) {
			return NextResponse.json(
				{ error: "Сървърът не е конфигуриран." },
				{ status: 500 },
			);
		}

		const body = await req.json().catch(() => null);
		if (!body) {
			return NextResponse.json({ error: "Невалидна заявка." }, { status: 400 });
		}

		const name = String(body.name ?? "").trim();
		const email = String(body.email ?? "").trim();
		const message = String(body.message ?? "").trim();
		const honeypot = String(body.hp_field ?? "").trim(); // spam trap

		// Ботовете попълват скритото поле → тихо "успех".
		if (honeypot) {
			console.warn("[contact] honeypot triggered, skipping send");
			return NextResponse.json({ ok: true });
		}

		if (!name || !email || !message) {
			return NextResponse.json(
				{ error: "Моля попълни всички полета." },
				{ status: 400 },
			);
		}
		if (!isEmail(email)) {
			return NextResponse.json(
				{ error: "Невалиден имейл адрес." },
				{ status: 400 },
			);
		}
		if (message.length > 5000) {
			return NextResponse.json(
				{ error: "Съобщението е твърде дълго." },
				{ status: 400 },
			);
		}

		const { data, error } = await resend.emails.send({
			from: FROM,
			to: TO,
			replyTo: email,
			subject: `Ново запитване от сайта — ${name}`,
			text: `Име: ${name}\nИмейл: ${email}\n\nСъобщение:\n${message}`,
			html: `
				<div style="font-family:system-ui,Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">
					<h2 style="margin:0 0 16px;font-size:18px">Ново запитване от сайта</h2>
					<p style="margin:4px 0"><strong>Име:</strong> ${esc(name)}</p>
					<p style="margin:4px 0"><strong>Имейл:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
					<p style="margin:16px 0 4px"><strong>Съобщение:</strong></p>
					<p style="margin:0;white-space:pre-wrap;background:#f5f5f5;padding:12px;border-radius:6px">${esc(message)}</p>
				</div>
			`,
		});

		if (error) {
			console.error("Resend error:", error);
			return NextResponse.json(
				{ error: "Възникна грешка при изпращането." },
				{ status: 502 },
			);
		}

		console.log("[contact] email sent, id:", data?.id);
		return NextResponse.json({ ok: true, id: data?.id });
	} catch (err) {
		console.error("Contact route error:", err);
		return NextResponse.json(
			{ error: "Възникна грешка при изпращането." },
			{ status: 500 },
		);
	}
}
