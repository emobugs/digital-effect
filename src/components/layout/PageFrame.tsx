// ── Обвивка за страниците с формуляри (/hello, /partners/*, /radar, /privacy) ──
// Navbar, Footer и 3D сцената са в root layout-а; тук остава само непрозрачният
// фон (сцената не се рендерира зад тези страници) и отместването под навигацията.
export default function PageFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
	return <main id="main" className={`relative z-10 min-h-screen bg-dark-obsidian pt-[72px] text-gray-100 ${className}`}>{children}</main>;
}
