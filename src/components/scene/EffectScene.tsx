"use client";

// ═══════════════════════════════════════════════════════════════════════════
// EffectScene — фиксираното 3D платно зад съдържанието.
//
// Камерата не „скача“ между секциите: всяка секция с `data-stage="N"` казва
// на шината къде сме (GSAP ScrollTrigger), а render loop-ът плавно доближава
// камерата, модулите и светлините до целевото състояние (експоненциално
// затихване) — усещането е за една непрекъсната сцена с кинематографски
// ъгли, както при луксозните сайтове.
//
// Производителност: three.js се зарежда динамично след първия кадър; DPR ≤ 1.75
// (телефон ≤ 1.3); loop-ът спира, когато табът е скрит; prefers-reduced-motion
// → без автоматично въртене, преходите са мигновени. Без WebGL → CSS фон.
// ═══════════════════════════════════════════════════════════════════════════
import { useEffect, useRef, useState } from "react";
import type * as THREE_NS from "three";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sceneBus, MODULES, type Module } from "./bus";

gsap.registerPlugin(ScrollTrigger);

type Vec = [number, number, number];
interface State { cam: Vec; look: Vec; offset: Vec; explode: number; align: number; scale: number; dim: number; spin: number; beam: number; glow: number }

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Целевото състояние за етап + локален прогрес. `portrait` = телефон. */
function target(stage: number, local: number, mode: "home" | "page", portrait: boolean): State {
	const P = portrait;
	if (mode === "page") {
		if (stage <= 0)
			return { cam: P ? [1.2, 0.9, 7.4] : [2.4, 1.0, 6.2], look: [0, 0, 0], offset: P ? [1.05, 1.6, -1] : [2.25, 0.1, 0], explode: 0.16, align: 0, scale: P ? 0.46 : 0.68, dim: P ? 0.7 : 1, spin: 0.08, beam: 0, glow: 0.9 };
		return { cam: [0.4, 0.6, 7.6], look: [0, 0, 0], offset: P ? [1.4, 2.7, -1.5] : [4, 1.75, -1.5], explode: 0.1, align: 0, scale: 0.55, dim: 0.22, spin: 0.05, beam: 0, glow: 0.6 };
	}
	switch (stage) {
		case 0: // hero — ядрото цяло, бавно дишане; с първия скрол се открехва
			return { cam: P ? [0.6, 0.6, 7.6] : [0.3, 0.45, 6.4], look: [0, 0, 0], offset: P ? [0, 1.55, 0] : [1.95, 0.2, 0], explode: 0.08 + local * 0.3, align: 0, scale: P ? 0.47 : 0.74, dim: 1, spin: 0.12, beam: 0, glow: 0.75 + local * 0.5 };
		case 1: // системата — разтваряне, камерата обикаля
			return {
				cam: P ? [2.4, 1.6, 7.6] : [lerp(3.6, 1.8, local), lerp(2.2, 1.0, local), lerp(5.2, 6.2, local)],
				look: [0, 0, 0], offset: P ? [0, -0.15, 0] : [-0.55, -0.45, 0], explode: 0.8, align: 0, scale: P ? 0.44 : 0.58, dim: 1, spin: 0.05, beam: 0, glow: 1.1,
			};
		case 2: // пътят на клиента — модулите в линия, изглед отгоре-отпред
			return { cam: P ? [0, 3.2, 11] : [0, lerp(2.2, 1.1, local), 8.6], look: [0, 0, 0], offset: P ? [0, 1.1, 0] : [0, 0.05, 0], explode: 0.8, align: 1, scale: P ? 0.36 : 0.56, dim: 1, spin: 0, beam: 1, glow: 1.1 };
		default: // фон за останалото — отдалечено ядро в ъгъла
			return { cam: [0.3, 0.5, 7.4], look: [0, 0, 0], offset: P ? [1.5, 3.0, -2] : [4.3, 1.9, -2], explode: 0.12, align: 0, scale: 0.55, dim: 0.2, spin: 0.06, beam: 0, glow: 0.5 };
	}
}

/** Страници с формуляри и непрозрачен фон — там сцената не се рендерира. */
const OFF = /^\/(hello|oferta|partners|radar|privacy)(\/|$)/;

/**
 * Живее в root layout-а, за да не се пресъздава при навигация — ядрото
 * „прелита“ към новата си позиция. Страницата казва какво иска чрез DOM-а:
 *   data-stage="N"          — секции, които движат камерата
 *   data-scene-focus="ads"  — модулът на фокус (страници на услуги)
 */
export default function EffectScene() {
	const host = useRef<HTMLDivElement>(null);
	const wrap = useRef<HTMLDivElement>(null);
	const [fallback, setFallback] = useState(false);
	const pathname = usePathname();

	/* ── Директорът: секциите [data-stage] → шината ─────────────────────── */
	useEffect(() => {
		const off = OFF.test(pathname || "");
		sceneBus.enabled = !off;
		if (wrap.current) wrap.current.style.visibility = off ? "hidden" : "visible";
		const els = Array.from(document.querySelectorAll<HTMLElement>("[data-stage]"));
		const focusEl = document.querySelector<HTMLElement>("[data-scene-focus]");
		sceneBus.set({
			mode: pathname === "/" ? "home" : "page",
			focus: (focusEl?.dataset.sceneFocus as Module) || null,
			stage: els.length ? Number(els[0].dataset.stage) || 0 : 3,
			local: 0,
		});
		const triggers = els.map((el) =>
			ScrollTrigger.create({
				trigger: el,
				start: "top 60%",
				end: "bottom 40%",
				onToggle: (self) => { if (self.isActive) sceneBus.set({ stage: Number(el.dataset.stage) || 0 }); },
				onUpdate: (self) => { if (self.isActive) sceneBus.set({ stage: Number(el.dataset.stage) || 0, local: self.progress }); },
			}),
		);
		const t = setTimeout(() => ScrollTrigger.refresh(), 400);
		return () => { clearTimeout(t); triggers.forEach((x) => x.kill()); };
	}, [pathname]);

	/* ── three.js ─────────────────────────────────────────────────────── */
	useEffect(() => {
		const el = host.current;
		if (!el) return;
		let disposed = false;
		let cleanup = () => {};
		// ?instant — без затихване (за скрийншоти/тестове)
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || new URLSearchParams(window.location.search).has("instant");

		const start = async () => {
			const test = document.createElement("canvas");
			if (!(test.getContext("webgl2") || test.getContext("webgl"))) { setFallback(true); return; }
			const THREE = await import("three");
			const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
			const core = await import("./core");
			if (disposed) return;

			const mobile = window.matchMedia("(max-width: 767px)").matches;
			const renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: true, powerPreference: "high-performance" });
			renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.3 : 1.75));
			renderer.outputColorSpace = THREE.SRGBColorSpace;
			renderer.toneMapping = THREE.ACESFilmicToneMapping;
			renderer.toneMappingExposure = 1.05;
			renderer.setClearColor(0x000000, 0);
			el.appendChild(renderer.domElement);
			renderer.domElement.setAttribute("aria-hidden", "true");

			const scene = new THREE.Scene();
			const pmrem = new THREE.PMREMGenerator(renderer);
			const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
			scene.environment = envTex;

			const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 120);
			const world = new THREE.Group();
			scene.add(world);

			// Ядрото: GLB, ако го има; иначе placeholder
			let built: { root: import("three").Object3D; modules: import("./core").CoreModule[] } = core.buildPlaceholder();
			world.add(built.root);
			(async () => {
				try {
					if (!core.MODEL_URL || disposed) return;
					const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
					const { DRACOLoader } = await import("three/examples/jsm/loaders/DRACOLoader.js");
					const loader = new GLTFLoader();
					const draco = new DRACOLoader();
					draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
					loader.setDRACOLoader(draco);
					const gltf = await loader.loadAsync(core.MODEL_URL);
					const next = core.modulesFromGltf(gltf.scene);
					if (next && !disposed) { world.remove(built.root); built = next; world.add(built.root); }
					else if (!next) console.warn("[scene] effect-core.glb няма module_ads/smm/web/ai — оставам на placeholder-а");
				} catch { /* няма модел — placeholder */ }
			})();

			// Вътрешното сияние + светлини
			const heart = new THREE.Mesh(new THREE.SphereGeometry(0.34, 32, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffb070") }));
			world.add(heart);
			const heartLight = new THREE.PointLight(new THREE.Color("#f26522"), 0, 9, 1.6);
			world.add(heartLight);
			const spark = new THREE.PointLight(new THREE.Color("#f59c1a"), 6, 7, 1.8);
			scene.add(spark);
			const rim = new THREE.DirectionalLight(new THREE.Color("#8a5cff"), 2.4);
			rim.position.set(-4, 2, -5);
			scene.add(rim);
			const key = new THREE.DirectionalLight(new THREE.Color("#fff1e6"), 1.6);
			key.position.set(3, 4, 5);
			scene.add(key);
			scene.add(new THREE.AmbientLight(0xffffff, 0.12));

			const particles = core.buildParticles(mobile ? 700 : 1600);
			scene.add(particles);
			const beam = core.buildBeam();
			world.add(beam);

			// Орбита — тънък пръстен около ядрото
			const ring = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.0035, 6, 220), new THREE.MeshBasicMaterial({ color: new THREE.Color("#f26522"), transparent: true, opacity: 0.3 }));
			ring.rotation.x = Math.PI / 2.3;
			world.add(ring);

			const resize = () => {
				const w = window.innerWidth, h = window.innerHeight;
				renderer.setSize(w, h, false);
				renderer.domElement.style.width = "100%";
				renderer.domElement.style.height = "100%";
				camera.aspect = w / h;
				camera.updateProjectionMatrix();
			};
			resize();
			window.addEventListener("resize", resize);

			const onPointer = (e: PointerEvent) => {
				sceneBus.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
				sceneBus.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
			};
			window.addEventListener("pointermove", onPointer, { passive: true });

			const portrait = () => window.innerWidth / window.innerHeight < 0.9;
			const s: State = target(0, 0, sceneBus.mode, portrait());
			const tmpQ = new THREE.Quaternion();
			const yAxis = new THREE.Vector3(0, 1, 0);
			const v = new THREE.Vector3();
			const lineV = new THREE.Vector3();
			const pointer = { x: 0, y: 0 };
			let spinAngle = 0;
			let raf = 0;
			let last = performance.now();
			let lastDim = -1;

			const frame = (now: number) => {
				const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
				last = now;
				if (!sceneBus.enabled) { raf = requestAnimationFrame(frame); return; }
				const tgt = target(sceneBus.stage, sceneBus.local, sceneBus.mode, portrait());
				const k = reduce ? 1 : 1 - Math.exp(-dt * 2.6);
				for (const key of ["cam", "look", "offset"] as const) for (let i = 0; i < 3; i++) s[key][i] = lerp(s[key][i], tgt[key][i], k);
				for (const key of ["explode", "align", "scale", "dim", "spin", "beam", "glow"] as const) s[key] = lerp(s[key], tgt[key], k);

				// мишката — лек паралакс на камерата + „искрата“
				pointer.x = lerp(pointer.x, sceneBus.pointer.x, reduce ? 1 : 1 - Math.exp(-dt * 4));
				pointer.y = lerp(pointer.y, sceneBus.pointer.y, reduce ? 1 : 1 - Math.exp(-dt * 4));
				camera.position.set(s.cam[0] + pointer.x * 0.35, s.cam[1] + pointer.y * 0.22, s.cam[2]);
				camera.lookAt(s.look[0], s.look[1], s.look[2]);

				world.position.set(s.offset[0], s.offset[1], s.offset[2]);
				world.scale.setScalar(s.scale);
				if (!reduce) spinAngle += dt * s.spin;
				built.root.rotation.y = spinAngle * (1 - s.align);
				ring.rotation.z = spinAngle * 0.6;
				(ring.material as THREE_NS.MeshBasicMaterial).opacity = 0.28 * (1 - s.align) * s.dim;

				// кой модул свети
				const stage = sceneBus.stage;
				const hl: Module | null = sceneBus.mode === "page" ? sceneBus.focus : stage === 1 ? MODULES[Math.min(3, Math.floor(sceneBus.local * 4))] : sceneBus.highlight;
				for (const m of built.modules) {
					const isFocus = hl === m.id || (sceneBus.focus === "growth" && sceneBus.mode === "page");
					const push = sceneBus.mode === "page" ? (isFocus ? 1.25 : s.explode) : s.explode * 0.95 + (isFocus && stage === 1 ? 0.45 : 0);
					v.copy(m.dir).multiplyScalar(push);
					// в линията: центърът на резена (не пивотът) застава на позицията си
					const yaw = Math.PI - Math.atan2(m.dir.x, m.dir.z);
					tmpQ.setFromAxisAngle(yAxis, yaw * 0.62);
					lineV.copy(m.dir).applyQuaternion(tmpQ).multiplyScalar(-0.5).add(m.line);
					v.lerp(lineV, s.align);
					if (sceneBus.mode === "page" && isFocus) v.y += 0.12;
					m.obj.position.lerp(v, reduce ? 1 : 1 - Math.exp(-dt * 5));
					// в линията всеки резен се обръща с разреза към камерата
					tmpQ.setFromAxisAngle(yAxis, yaw * Math.max(s.align * 0.62, sceneBus.mode === "page" && isFocus ? 0.55 : 0));
					m.obj.quaternion.slerp(tmpQ.multiply(m.baseQuat), reduce ? 1 : 1 - Math.exp(-dt * 4));
					const glow = s.glow * (hl ? (isFocus ? 1.9 : 0.45) : 1) * s.dim;
					for (const mat of m.glowMats) mat.emissiveIntensity = lerp(mat.emissiveIntensity, glow, 1 - Math.exp(-dt * 6));
				}
				heart.scale.setScalar(0.65 + s.explode * 0.55 * (1 - s.align));
				(heart.material as THREE_NS.MeshBasicMaterial).color.setRGB(1, 0.62 * s.dim + 0.1, 0.35 * s.dim);
				heart.visible = s.align < 0.9;
				heartLight.intensity = (1.5 + s.explode * 14) * s.dim * (1 - s.align * 0.7);
				(beam.material as THREE_NS.MeshBasicMaterial).opacity = s.beam * 0.9;
				beam.scale.x = Math.max(0.001, s.beam);

				// искрата следва мишката в равнината пред ядрото
				spark.position.set(pointer.x * 4 + s.offset[0] * 0.3, pointer.y * 2.6, 2.2);
				spark.intensity = 5 * s.dim;
				particles.rotation.y = spinAngle * 0.15;
				particles.position.y = -window.scrollY * 0.0006;

				if (Math.abs(s.dim - lastDim) > 0.005) { el.style.opacity = String(0.2 + 0.8 * Math.min(1, s.dim * 1.2)); lastDim = s.dim; }
				renderer.render(scene, camera);
				raf = requestAnimationFrame(frame);
			};

			const onVis = () => {
				cancelAnimationFrame(raf);
				if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); }
			};
			document.addEventListener("visibilitychange", onVis);
			raf = requestAnimationFrame(frame);
			el.dataset.ready = "1";

			cleanup = () => {
				cancelAnimationFrame(raf);
				window.removeEventListener("resize", resize);
				window.removeEventListener("pointermove", onPointer);
				document.removeEventListener("visibilitychange", onVis);
				scene.traverse((o) => {
					const m = o as THREE_NS.Mesh;
					m.geometry?.dispose?.();
					const mat = m.material as THREE_NS.Material | THREE_NS.Material[] | undefined;
					(Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
				});
				envTex.dispose();
				pmrem.dispose();
				renderer.dispose();
				renderer.domElement.remove();
			};
		};

		// след първия кадър — LCP е текстът, не WebGL
		const id = window.requestIdleCallback ? window.requestIdleCallback(() => start(), { timeout: 900 }) : window.setTimeout(start, 250);
		return () => {
			disposed = true;
			if (window.cancelIdleCallback) window.cancelIdleCallback(id as number); else clearTimeout(id as number);
			cleanup();
		};
	}, []);

	return (
		<div ref={wrap} aria-hidden className="pointer-events-none fixed inset-0 z-0">
			{/* CSS фон — видим веднага и като резерва без WebGL */}
			<div className="absolute inset-0" style={{ background: "radial-gradient(60% 55% at 72% 42%, rgba(242,101,34,0.16), transparent 60%), radial-gradient(40% 40% at 20% 80%, rgba(107,59,214,0.10), transparent 60%)" }} />
			{fallback && (
				<div className="absolute right-[8%] top-[18%] h-[44vmin] w-[44vmin] rounded-full" style={{ background: "radial-gradient(circle at 40% 35%, #ffb070 0%, #f26522 22%, #2a0d02 55%, transparent 70%)", filter: "blur(2px)", opacity: 0.8 }} />
			)}
			<div ref={host} className="absolute inset-0 transition-opacity duration-700" />
		</div>
	);
}
