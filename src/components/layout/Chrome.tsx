"use client";

// Скрива навигацията/footer-а там, където страницата е самостоятелен документ (/oferta).
import { usePathname } from "next/navigation";

export default function Chrome({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	if (pathname?.startsWith("/oferta")) return null;
	return <>{children}</>;
}
