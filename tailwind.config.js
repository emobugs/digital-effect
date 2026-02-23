/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				brand: {
					orange: "#e8450a",
					"orange-l": "#f26522",
					"orange-ll": "#f5813a",
					red: "#c0300a",
					amber: "#f59c1a",
				},
				dark: {
					obsidian: "#07080a",
					charcoal: "#0c0d0f",
					surface: "#111214",
					surface2: "#161719",
				},
			},
			fontFamily: {
				sans: ["var(--font-inter)"],
				display: ["var(--font-montserrat)"],
			},
			backgroundImage: {
				"brand-grad": "linear-gradient(135deg, #c0300a, #e8450a, #f26522)",
				"brand-grad-text": "linear-gradient(90deg, #f26522, #f59c1a)",
			},
			animation: {
				marquee: "marquee 22s linear infinite",
				pulse: "pulse 2s ease-in-out infinite",
				fadeUp: "fadeUp 0.8s ease forwards",
			},
			keyframes: {
				marquee: {
					from: { transform: "translateX(0)" },
					to: { transform: "translateX(-50%)" },
				},
				fadeUp: {
					from: { opacity: "0", transform: "translateY(32px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
			},
		},
	},
	plugins: [],
};
