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

export default function Home() {
	return (
		<>
			<Navbar />
			<main>
				<Hero />
				<Stats />
				<Marquee />
				<Problem />
				<Services />
				<Packages />
				<Extras />
				<Process />
				<Cta />
			</main>
			{/* <Footer /> */}
		</>
	);
}
