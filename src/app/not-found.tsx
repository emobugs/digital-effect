// ── 404 — с пътища обратно, не задънена улица ─────────────────────────────────
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
	return (
		<main id="main" className="relative z-10 flex min-h-[90svh] items-center pt-28">
			<div className="wrap" data-stage="3">
				<p className="eyebrow">404</p>
				<h1 className="display t-hero mt-6"><span className="text-outline">Няма</span> <span className="text-gradient">ефект.</span></h1>
				<p className="lead mt-6 max-w-xl">Тази страница я няма. Но тези работят:</p>
				<div className="mt-8 flex flex-wrap gap-3">
					<Button href="/">Начало</Button>
					<Button href="/uslugi" variant="line" arrow="none">Услуги</Button>
					<Button href="/ceni" variant="line" arrow="none">Цени</Button>
				</div>
				<p className="mt-8 text-[14px] text-[var(--dim)]"><Link href="/kontakti" className="underline hover:text-white">Пишете ни</Link>, ако нещо липсва.</p>
			</div>
		</main>
	);
}
