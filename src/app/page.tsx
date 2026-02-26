"use client";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import Problem from "@/components/sections/Problem";
import Services from "@/components/sections/Services";
import Stats from "@/components/sections/Stats";
import Packages from "@/components/sections/Packages";
import Extras from "@/components/sections/Extras";
import Process from "@/components/sections/Process";
import Cta from "@/components/sections/Cta";
import { ReactLenis, LenisRef } from "lenis/react";
import gsap from "gsap";
import { useEffect, useRef } from "react";

export default function Home() {
	// const lenis = useLenis((lenis) => {
	// 	// called every scroll
	// 	console.log(lenis);
	// });

	const lenisRef = useRef<LenisRef>(null);

	useEffect(() => {
		function update(time: number) {
			lenisRef.current?.lenis?.raf(time * 1000);
		}

		gsap.ticker.add(update);

		return () => gsap.ticker.remove(update);
	}, []);
	return (
		<>
			<Navbar />
			<ReactLenis
				root
				options={{
					autoRaf: false,
					lerp: 0.15, // Колкото по-малко, толкова по-плавно (0.05 - 0.1 е стандарт)
					duration: 1.5,
					smoothWheel: true,
				}}
				ref={lenisRef}
			>
				<main>
					<Hero />
					<Marquee />
					<Problem />
					<Services />
					<Stats />
					<Packages />
					<Extras />
					<Process />
					<Cta />
				</main>
			</ReactLenis>
			{/* <Footer /> */}
		</>
	);
}
