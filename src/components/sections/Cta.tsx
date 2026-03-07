"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Mail, Phone, Copy, Check as CheckIcon } from "lucide-react";
import emailjs from "@emailjs/browser";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function CTA() {
	const container = useRef<HTMLElement>(null);
	const [form, setForm] = useState({ name: "", email: "", message: "" });
	const [sent, setSent] = useState(false);
	const [copied, setCopied] = useState<"email" | "phone" | null>(null);
	const formRef = useRef<HTMLFormElement>(null);

	const copyTo = (text: string, type: "email" | "phone") => {
		navigator.clipboard.writeText(text);
		setCopied(type);
		setTimeout(() => setCopied(null), 2000);
	};

	useGSAP(
		() => {
			gsap.fromTo(
				".cta-head",
				{ opacity: 0, x: 40 },
				{
					opacity: 1,
					x: 0,
					duration: 0.7,
					force3D: true,
					ease: "power2.out",
					scrollTrigger: { trigger: ".cta-head", start: "top 90%" },
					toggleActions: "play none none none",
				},
			);
			gsap.fromTo(
				".cta-body > *",
				{ opacity: 0, y: 30 },
				{
					opacity: 1,
					y: 0,
					duration: 0.6,
					stagger: 0.12,
					ease: "power2.out",
					scrollTrigger: { trigger: ".cta-body", start: "top 80%" },
				},
			);
		},
		{ scope: container },
	);

	const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!formRef.current) return;
		try {
			const result = await emailjs.sendForm(
				"digital_effect",
				"template_uz4id85",
				formRef.current,
				"kdG_3cmBdAuzpN3ke",
			);
			console.log("Success:", result.text);
			setSent(true);
			formRef.current.reset();
		} catch (error) {
			const err = error as { text: string };
			console.error("Error:", err.text);
			alert("Възникна грешка при изпращането.");
		}
	};

	return (
		<section ref={container} id="cta" className="md:py-24 py-12 px-4 md:px-16">
			{/* HEADER */}
			<div className="cta-head text-center mb-16">
				<span className="section-label">Свържи се с нас</span>
				<h2 className="section-title">
					Готов да
					<br />
					<span className="text-gradient uppercase">Изградиш ефекта?</span>
				</h2>
				<p className="text-[15px] text-white/50 max-w-md mx-auto mt-5 leading-relaxed">
					Безплатна консултация. Без ангажимент. Само разговор за това как можем да
					помогнем на твоя бизнес.
				</p>
			</div>

			{/* BODY */}
			<div className="cta-body max-w-5xl mx-auto grid md:grid-cols-[1fr_1.6fr] gap-12 md:gap-20">
				{/* LEFT — contact info */}
				<div className="flex flex-col gap-8 justify-center">
					<div>
						<p className="text-[10px] font-semibold tracking-[3px] uppercase text-[#f26522] mb-4">
							Директен контакт
						</p>

						{/* Email */}
						<div className="flex items-center gap-3 mb-4 group">
							{/* Иконк — на мобилен е линк, на десктоп е декорация */}
							<a
								href="mailto:digitaleffect@gmail.com"
								className="w-11 h-11 rounded-full border border-white/[0.07] flex items-center justify-center group-hover:border-[#f26522]/30 transition-colors duration-300 flex-shrink-0"
							>
								<Mail className="w-4 h-4 text-[#f26522]" />
							</a>

							{/* Десктоп — copy on click */}
							<button
								onClick={() => copyTo("digitaleffect@gmail.com", "email")}
								className="hidden md:flex items-center gap-2 text-[13px] text-white/50 hover:text-white transition-colors duration-300"
							>
								thedigitaleffectagency@gmail.com
								{copied === "email" ? (
									<CheckIcon className="w-3 h-3 text-[#f26522] flex-shrink-0" />
								) : (
									<Copy className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors duration-300 flex-shrink-0" />
								)}
							</button>

							{/* Мобилен — кликабелен текст */}
							<a
								href="mailto:thedigitaleffectagency@gmail.com"
								className="md:hidden text-[13px] text-white/50"
							>
								thedigitaleffectagency@gmail.com
							</a>
						</div>

						{/* Phone */}
						<div className="flex items-center gap-3 group">
							<a
								href="tel:+359895883713"
								className="w-11 h-11 rounded-full border border-white/[0.07] flex items-center justify-center group-hover:border-[#f26522]/30 transition-colors duration-300 flex-shrink-0"
							>
								<Phone className="w-4 h-4 text-[#f26522]" />
							</a>

							{/* Десктоп — copy on click */}
							<button
								onClick={() => copyTo("+359 89 588 3713", "phone")}
								className="hidden md:flex items-center gap-2 text-[13px] text-white/50 hover:text-white transition-colors duration-300"
							>
								+359 89 588 3713
								{copied === "phone" ? (
									<CheckIcon className="w-3 h-3 text-[#f26522] flex-shrink-0" />
								) : (
									<Copy className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors duration-300 flex-shrink-0" />
								)}
							</button>

							{/* Мобилен — кликабъл текст (набира директно) */}
							<a
								href="tel:+359895883713"
								className="md:hidden text-[13px] text-white/50"
							>
								+359 89 588 3713
							</a>
						</div>
					</div>

					<div className="h-px bg-white/[0.06]" />

					<div>
						<p className="text-[10px] font-semibold tracking-[3px] uppercase text-white/25 mb-3">
							Работно време
						</p>
						<p className="text-[13px] text-white/45 leading-relaxed">
							Пон – Пет: 09:00 – 18:00
							<br />
							Съб – Нед: По договаряне
						</p>
					</div>
				</div>

				{/* RIGHT — form */}
				<div className="relative border border-white/[0.07] bg-dark-surface p-8 md:p-10">
					<div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#c0300a] via-[#e8450a] to-[#f26522]" />

					{sent ? (
						<div className="flex flex-col items-center justify-center h-full gap-4 py-12 text-center">
							<div className="w-14 h-14 rounded-full bg-[#f26522]/10 border border-[#f26522]/30 flex items-center justify-center mb-2">
								<CheckIcon className="w-5 h-5 text-[#f26522]" />
							</div>
							<h3 className="font-display font-black text-[22px]">
								Получихме съобщението!
							</h3>
							<p className="text-[13px] text-white/45">
								Ще се свържем с теб до 24 часа.
							</p>
						</div>
					) : (
						<form ref={formRef} onSubmit={sendEmail} className="flex flex-col gap-5">
							<div className="flex flex-col gap-1.5">
								<label className="text-[10px] font-semibold tracking-[2px] uppercase text-white/30">
									Име
								</label>
								<input
									type="text"
									required
									name="name"
									value={form.name}
									onChange={(e) => setForm({ ...form, name: e.target.value })}
									placeholder="Твоето име"
									className="bg-white/[0.03] border border-white/[0.07] px-4 py-3 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#f26522]/40 transition-colors duration-300 rounded-[2px]"
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-[10px] font-semibold tracking-[2px] uppercase text-white/30">
									Имейл
								</label>
								<input
									type="email"
									name="email"
									required
									value={form.email}
									onChange={(e) => setForm({ ...form, email: e.target.value })}
									placeholder="email@example.com"
									className="bg-white/[0.03] border border-white/[0.07] px-4 py-3 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#f26522]/40 transition-colors duration-300 rounded-[2px]"
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-[10px] font-semibold tracking-[2px] uppercase text-white/30">
									Съобщение
								</label>
								<textarea
									required
									name="message"
									rows={4}
									value={form.message}
									onChange={(e) => setForm({ ...form, message: e.target.value })}
									placeholder="Разкажи ни за твоя бизнес и целите ти..."
									className="bg-white/[0.03] border border-white/[0.07] px-4 py-3 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#f26522]/40 transition-colors duration-300 rounded-[2px] resize-none"
								/>
							</div>
							<button
								type="submit"
								className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
							>
								Изпрати съобщение
								<ArrowRight className="w-4 h-4" />
							</button>
							<p className="text-[10px] text-white/20 text-center">
								Отговаряме до 24 часа · Без спам
							</p>
						</form>
					)}
				</div>
			</div>
		</section>
	);
}
