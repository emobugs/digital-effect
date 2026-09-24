// Картинката по подразбиране за споделяне (началната страница).
import { GET } from "./og/route";
export const alt = "Digital Effect — Всяко евро да работи.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image() {
	return GET(new Request("https://digitaleffect.bg/og?t=Всяко евро да работи.&e=Дигитална маркетинг агенция"));
}
