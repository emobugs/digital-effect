// Начална страница — сървърна обвивка: дърпа ценоразписа от de-os (ISR 5 мин,
// fallback в src/data) и го подава на клиентската част. Цените на сайта и в
// офертите са едни и същи — идват от едно място.
import HomeClient from "./HomeClient";
import { getCatalog, toPackageCards } from "@/lib/services";

export const revalidate = 300;

export default async function Home() {
	const cat = await getCatalog(false);
	return <HomeClient packages={toPackageCards(cat)} />;
}
