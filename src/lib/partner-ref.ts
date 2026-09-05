// ── Digital Effect Partners — партньорски код в браузъра ────────────────────
// Кодът идва като ?p=DE-XXXX-YYYY (НЕ ?ref — той е персоналният линк на
// Smart Reach). Пази се в localStorage за attribution_days дни, за да се
// брои и ако клиентът попълни анкетата по-късно. Всичко в try/catch — SSR,
// private mode и блокирано storage не трябва да чупят страницата.

export const CODE_RE = /^DE-[A-Z0-9]{2,8}-[A-Z0-9]{4}$/;
const KEY = "de_partner";
export const DEFAULT_DAYS = 90;

export function normalizeCode(raw: string | null | undefined): string | null {
	const c = String(raw ?? "").trim().toUpperCase();
	return CODE_RE.test(c) ? c : null;
}

/** Чете ?p= от URL-а (или подаден search string). */
export function readPartnerCode(search?: string): string | null {
	try {
		const s = search ?? (typeof window !== "undefined" ? window.location.search : "");
		return normalizeCode(new URLSearchParams(s).get("p"));
	} catch {
		return null;
	}
}

export function storePartnerCode(code: string): void {
	try {
		const c = normalizeCode(code);
		if (!c) return;
		localStorage.setItem(KEY, JSON.stringify({ code: c, ts: Date.now() }));
	} catch { /* storage недостъпен */ }
}

export function getStoredPartnerCode(days = DEFAULT_DAYS): string | null {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		const { code, ts } = JSON.parse(raw) as { code?: string; ts?: number };
		if (!ts || Date.now() - ts > days * 86400000) { localStorage.removeItem(KEY); return null; }
		return normalizeCode(code);
	} catch {
		return null;
	}
}

/** ?p= от URL-а има предимство; иначе запазеният. Записва новия, ако има. */
export function resolvePartnerCode(): string | null {
	const fromUrl = readPartnerCode();
	if (fromUrl) { storePartnerCode(fromUrl); return fromUrl; }
	return getStoredPartnerCode();
}

export const partnerLink = (code: string) => `https://digitaleffect.bg/hello?p=${code}`;
