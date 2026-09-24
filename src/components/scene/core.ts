// ═══════════════════════════════════════════════════════════════════════════
// „Ядрото“ — 3D обектът на Digital Effect.
//
// Placeholder (докато няма модел): сфера, разрязана на 4 резена (модули).
// Отвън — тъмен полиран метал; разрезите отвътре — горящо оранжево. Когато
// модулите се разтворят, се вижда енергията вътре — „ефектът“.
//
// Истински модел: public/models/effect-core.glb с 4 обекта с имена
//   module_ads, module_smm, module_web, module_ai  (+ по избор core_glow)
// Ако файлът го има — зарежда се вместо placeholder-а, анимациите са същите.
// Спецификация: docs/redesign-2026/3D-MODELI.md
// ═══════════════════════════════════════════════════════════════════════════
import * as THREE from "three";
import type { Module } from "./bus";

/**
 * Моделът се включва с env променлива (без код): на Hostinger добави
 *   NEXT_PUBLIC_CORE_MODEL_URL=/models/effect-core.glb
 * и качи файла в public/models/. Празно → placeholder (без 404 в конзолата).
 */
export const MODEL_URL = process.env.NEXT_PUBLIC_CORE_MODEL_URL || "";

export interface CoreModule {
	id: Module;
	obj: THREE.Object3D;
	/** посока на разтваряне (от центъра навън) */
	dir: THREE.Vector3;
	/** позиция в „пътя на клиента“ (етап 2) */
	line: THREE.Vector3;
	glowMats: THREE.MeshStandardMaterial[];
	baseQuat: THREE.Quaternion;
}

const ORDER: Module[] = ["ads", "smm", "web", "ai"];

export function makeMaterials() {
	const shell = new THREE.MeshPhysicalMaterial({
		color: new THREE.Color("#121217"),
		metalness: 1,
		roughness: 0.2,
		clearcoat: 1,
		clearcoatRoughness: 0.08,
		envMapIntensity: 1.35,
		iridescence: 0.25,
		iridescenceIOR: 1.4,
	});
	const glow = () =>
		new THREE.MeshStandardMaterial({
			color: new THREE.Color("#140500"),
			emissive: new THREE.Color("#ff4d0d"),
			emissiveIntensity: 0.7,
			roughness: 0.32,
			metalness: 0.55,
			side: THREE.DoubleSide,
		});
	return { shell, glow };
}

/** Един резен: 1/4 от сфера + две полукръгли стени, които го затварят. */
function wedge(index: number, r: number, mats: ReturnType<typeof makeMaterials>) {
	const g = new THREE.Group();
	const a0 = index * (Math.PI / 2);
	const shellGeo = new THREE.SphereGeometry(r, 64, 48, a0, Math.PI / 2);
	const shell = new THREE.Mesh(shellGeo, mats.shell);
	g.add(shell);
	const glowMat = mats.glow();
	// Полукръгът е в равнината XY (x ≥ 0). В SphereGeometry посоката при phi = a е
	// (-cos a, 0, sin a) — въртене около Y с π + a праща +X точно там.
	const edgeGeo = new THREE.TorusGeometry(r * 1.001, 0.006, 6, 96, Math.PI);
	for (const a of [a0, a0 + Math.PI / 2]) {
		const cap = new THREE.Mesh(new THREE.CircleGeometry(r * 0.999, 48, -Math.PI / 2, Math.PI), glowMat);
		cap.rotation.y = Math.PI + a;
		g.add(cap);
		// тънък оранжев ръб по разреза
		const holder = new THREE.Group();
		const edge = new THREE.Mesh(edgeGeo, glowMat);
		edge.rotation.z = -Math.PI / 2;
		holder.add(edge);
		holder.rotation.y = Math.PI + a;
		g.add(holder);
	}
	const mid = a0 + Math.PI / 4;
	const dir = new THREE.Vector3(-Math.cos(mid), 0, Math.sin(mid)).normalize();
	return { g, dir, glowMats: [glowMat] };
}

export function buildPlaceholder(r = 1.15) {
	const mats = makeMaterials();
	const root = new THREE.Group();
	const modules: CoreModule[] = ORDER.map((id, i) => {
		const w = wedge(i, r, mats);
		w.g.name = `module_${id}`;
		root.add(w.g);
		return { id, obj: w.g, dir: w.dir, line: new THREE.Vector3(), glowMats: w.glowMats, baseQuat: w.g.quaternion.clone() };
	});
	placeLine(modules);
	return { root, modules };
}

/** Позициите на модулите, подредени в линия (етап 2 — пътят на клиента). */
function placeLine(modules: CoreModule[]) {
	const gap = 2.35;
	modules.forEach((m, i) => m.line.set((i - 1.5) * gap, 0, 0));
}

/** Модулите от GLB модел (имената module_*). Липсващи → null (ползваме placeholder-а). */
export function modulesFromGltf(scene: THREE.Object3D): { root: THREE.Object3D; modules: CoreModule[] } | null {
	const found: CoreModule[] = [];
	for (const id of ORDER) {
		const obj = scene.getObjectByName(`module_${id}`);
		if (!obj) return null;
		const box = new THREE.Box3().setFromObject(obj);
		const c = box.getCenter(new THREE.Vector3());
		const dir = c.lengthSq() > 1e-4 ? c.clone().setY(0).normalize() : new THREE.Vector3(1, 0, 0);
		const glowMats: THREE.MeshStandardMaterial[] = [];
		obj.traverse((o) => {
			const mesh = o as THREE.Mesh;
			const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
			if (mesh.isMesh && mat && "emissive" in mat && mat.emissive.getHex() !== 0) glowMats.push(mat);
		});
		found.push({ id, obj, dir, line: new THREE.Vector3(), glowMats, baseQuat: obj.quaternion.clone() });
	}
	placeLine(found);
	// нормализираме размера до ~ радиус 1.15
	const box = new THREE.Box3().setFromObject(scene);
	const size = box.getSize(new THREE.Vector3()).length();
	if (size > 0) scene.scale.multiplyScalar(2.6 / size);
	return { root: scene, modules: found };
}

/** Облак от частици — дълбочина и паралакс. */
export function buildParticles(count: number) {
	const geo = new THREE.BufferGeometry();
	const pos = new Float32Array(count * 3);
	const col = new Float32Array(count * 3);
	const orange = new THREE.Color("#f26522"), amber = new THREE.Color("#f59c1a"), white = new THREE.Color("#f3efe9");
	for (let i = 0; i < count; i++) {
		const r = 4 + Math.random() * 16;
		const t = Math.random() * Math.PI * 2;
		const p = Math.acos(2 * Math.random() - 1);
		pos.set([r * Math.sin(p) * Math.cos(t), (r * Math.cos(p)) * 0.55, r * Math.sin(p) * Math.sin(t)], i * 3);
		const c = Math.random() < 0.18 ? orange : Math.random() < 0.3 ? amber : white;
		col.set([c.r, c.g, c.b], i * 3);
	}
	geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
	geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
	// кръгла мека точка вместо квадрат
	const c = document.createElement("canvas");
	c.width = c.height = 64;
	const g = c.getContext("2d")!;
	const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
	grd.addColorStop(0, "rgba(255,255,255,1)");
	grd.addColorStop(0.35, "rgba(255,255,255,.55)");
	grd.addColorStop(1, "rgba(255,255,255,0)");
	g.fillStyle = grd;
	g.fillRect(0, 0, 64, 64);
	const map = new THREE.CanvasTexture(c);
	const mat = new THREE.PointsMaterial({ size: 0.05, map, vertexColors: true, transparent: true, opacity: 0.7, depthWrite: false, sizeAttenuation: true, blending: THREE.AdditiveBlending });
	return new THREE.Points(geo, mat);
}

/** Светлата линия, която свързва модулите в етап 2. */
export function buildBeam() {
	const geo = new THREE.CylinderGeometry(0.012, 0.012, 7.1, 8, 1, true);
	geo.rotateZ(Math.PI / 2);
	const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#f59c1a"), transparent: true, opacity: 0, depthWrite: false });
	return new THREE.Mesh(geo, mat);
}
