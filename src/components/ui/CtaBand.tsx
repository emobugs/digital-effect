// ── Финален призив: огромен текст + формата ─────────────────────────────────
import { ContactForm } from "@/components/ui/Forms";
import Button from "@/components/ui/Button";
import { SITE, telHref } from "@/lib/site";

export default function CtaBand({ title = "Да поговорим 15 минути", text = "Разкажете ни за бизнеса. До 1 работен ден ще знаете какво бихме направили, колко струва и какво може да върне.", source = "cta" }: { title?: string; text?: string; source?: string }) {
	return (
		<section id="kontakt" data-stage="3" className="section relative">
			<div className="wrap">
				<div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start">
					<div>
						<span data-reveal className="eyebrow">Контакт</span>
						<h2 data-reveal style={{ ["--d" as string]: "0.05s" }} className="display t-1 mt-6 text-balance">{title.split(" ").slice(0, -1).join(" ")} <span className="text-gradient">{title.split(" ").slice(-1)}</span></h2>
						<p data-reveal style={{ ["--d" as string]: "0.1s" }} className="lead mt-6 max-w-lg">{text}</p>
						<div data-reveal style={{ ["--d" as string]: "0.15s" }} className="mt-8 flex flex-wrap gap-3">
							<Button href="/hello" variant="line">Или попълнете анкетата — 2 мин</Button>
							{SITE.phone && <Button href={telHref(SITE.phone)} variant="line" arrow="none">{SITE.phone}</Button>}
						</div>
						<p className="mt-6 text-[14px] text-[var(--dim)]"><a href={`mailto:${SITE.email}`} className="hover:text-white">{SITE.email}</a></p>
					</div>
					<div data-reveal style={{ ["--d" as string]: "0.1s" }} className="card bg-[#0c0d10]/85 p-6 backdrop-blur md:p-8">
						<ContactForm source={source} />
					</div>
				</div>
			</div>
		</section>
	);
}
