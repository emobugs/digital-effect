import Link from "next/link";

export default function OfertaNotFound() {
	return (
		<main className="min-h-screen bg-dark-obsidian text-gray-100 grid place-items-center px-4">
			<div className="max-w-md text-center">
				<div className="font-display font-black tracking-tight text-lg mb-6">Digital<span className="text-brand-orange-l">Effect</span></div>
				<h1 className="font-display font-black text-2xl mb-3">Тази оферта не е намерена.</h1>
				<p className="text-gray-400 text-[15px] leading-relaxed mb-6">Линкът може да е непълен или предложението да е било заменено с ново. Пишете ни и ще го изпратим отново.</p>
				<a href="mailto:contacts@digitaleffect.bg" className="inline-block px-6 py-3 rounded-xl font-bold text-white bg-brand-grad">contacts@digitaleffect.bg</a>
				<div className="mt-6"><Link href="/" className="text-sm text-gray-500 hover:text-gray-300 underline">Към сайта</Link></div>
			</div>
		</main>
	);
}
