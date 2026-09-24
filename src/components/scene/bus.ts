// ── Шината между DOM-а и 3D сцената ─────────────────────────────────────────
// Секциите казват „сега сме на етап N“ (SceneStage + ScrollTrigger), сцената
// плавно се придвижва натам в своя render loop. Нищо от React не се пререндерира
// при скрол — само числа в този обект.

export type Module = "ads" | "smm" | "web" | "ai" | "growth";

export const MODULES: Module[] = ["ads", "smm", "web", "ai"];

export const MODULE_LABEL: Record<Module, string> = {
	ads: "Реклама",
	smm: "Социални мрежи",
	web: "Сайтове",
	ai: "AI и автоматизация",
	growth: "Growth Partner",
};

type Mode = "home" | "page";

type Patch = Partial<Pick<SceneBus, "stage" | "local" | "focus" | "highlight" | "mode">>;
interface SceneBus {
	mode: Mode;
	/** целеви етап: 0 hero · 1 системата · 2 пътят · 3 фон */
	stage: number;
	/** 0..1 — прогрес вътре в текущия етап */
	local: number;
	/** кой модул е на фокус (страници на услуги, hover в менюто) */
	focus: Module | null;
	/** модул, осветен от DOM-а (hover върху карта) */
	highlight: Module | null;
	pointer: { x: number; y: number };
	/** false на страниците с формуляри (/hello, /oferta…) — loop-ът не рендерира */
	enabled: boolean;
	listeners: Set<() => void>;
	set(patch: Patch): void;
}

export const sceneBus: SceneBus = {
	mode: "home",
	stage: 0,
	local: 0,
	focus: null,
	highlight: null,
	pointer: { x: 0, y: 0 },
	enabled: true,
	listeners: new Set(),
	set(patch) {
		Object.assign(sceneBus, patch);
		sceneBus.listeners.forEach((f) => f());
	},
};
