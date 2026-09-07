// ── Живите параметри на партньорската програма от de-os (само на сървъра) ──
// GET {DEOS_PARTNERS_URL}/program със споделената тайна → Program. Кеш 10 мин
// през fetch-кеша на Next (revalidate) + кеш в паметта като втора мрежа, за да
// не удряме de-os при всеки рендер. При грешка/timeout → PROGRAM (fallback),
// с warn в лога — страницата никога не пада заради de-os.
// НЕ импортвай от client компоненти: тук се чете тайната.
import { PROGRAM, programFromDeos, type Program } from "@/app/partners/program";

export const PROGRAM_TTL_SEC = 600;

const base = () => (process.env.DEOS_PARTNERS_URL?.trim() || "https://deos.digitaleffect.bg/api/partners").replace(/\/$/, "");
const secret = () => process.env.DEOS_HELLO_SECRET?.trim() || "";

let mem: { at: number; program: Program } | null = null;

export async function loadProgram(): Promise<Program> {
	if (mem && Date.now() - mem.at < PROGRAM_TTL_SEC * 1000) return mem.program;
	try {
		const r = await fetch(`${base()}/program`, {
			headers: { Origin: "https://digitaleffect.bg", ...(secret() ? { "X-Hello-Secret": secret() } : {}) },
			next: { revalidate: PROGRAM_TTL_SEC },
			signal: AbortSignal.timeout(5000),
		});
		if (!r.ok) throw new Error(`HTTP ${r.status}`);
		const p = programFromDeos(await r.json());
		if (!p) throw new Error("невалиден отговор");
		mem = { at: Date.now(), program: p };
		return p;
	} catch (e) {
		console.warn(`[partners-program] de-os не отговори (${e instanceof Error ? e.message : e}) — ползвам fallback стойностите от program.ts`);
		// Ако имаме стар кеш — по-добре той, отколкото fallback-ът
		return mem?.program ?? PROGRAM;
	}
}
