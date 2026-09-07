// ── /partners — сървърната обвивка: тегли живите параметри от de-os и ги
//    подава на клиентската страница. Кеш 10 мин (loadProgram), fallback program.ts.
import PartnersClient from "./PartnersClient";
import { loadProgram } from "@/lib/partners-program";

export const revalidate = 600; // Next иска литерал; = PROGRAM_TTL_SEC

export default async function PartnersPage() {
	const program = await loadProgram();
	return <PartnersClient program={program} />;
}
