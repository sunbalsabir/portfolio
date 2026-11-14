import { createFileRoute } from "@tanstack/react-router";
import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  animate,
  motion,
  MotionConfig,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Briefcase,
  Bug,
  Calendar,
  Check,
  ClipboardCheck,
  Code,
  Download,
  FileSearch,
  FileText,
  FolderKanban,
  Gauge,
  GitBranch,
  Globe,
  GraduationCap,
  Kanban,
  Languages as LanguagesIcon,
  Layers,
  ListChecks,
  Mail,
  MapPin,
  Menu,
  Moon,
  MousePointerClick,
  Phone,
  RotateCcw,
  Send,
  ShieldCheck,
  Smartphone,
  Sun,
  TestTube,
  User,
  Workflow as WorkflowIcon,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";

import resume from "@/assets/resume.pdf?url";
import cypressCraftPdf from "@/assets/case-studies/cypress-automation-craft-ai.pdf?url";
import nexusPdf from "@/assets/case-studies/nexus-case-study.pdf?url";
import {
  certifications,
  contactLinks,
  education,
  facts,
  highlights,
  jobs,
  languages,
  navItems,
  person,
  principles,
  projects,
  releaseChecks,
  roles,
  skills,
  terminalLines,
  tickerItems,
  toolbox,
  workflow,
  type ContactLink,
  type Project,
} from "@/data/profile";

const HeroScene = lazy(() => import("@/components/HeroScene"));

const pageTitle = `${person.name} — ${person.title}`;
const pageDescription =
  "QA Engineer with 4+ years in manual & automation testing across blockchain, Web3, e-commerce and IoT. Cypress, Playwright, Appium, Postman and JMeter.";

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: person.name,
  jobTitle: person.title,
  email: `mailto:${person.email}`,
  telephone: person.phone,
  address: { "@type": "PostalAddress", addressLocality: "Karachi", addressCountry: "PK" },
  sameAs: [person.linkedin],
  knowsAbout: Object.values(skills).flat(),
  alumniOf: { "@type": "CollegeOrUniversity", name: education.school },
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: pageTitle },
      { name: "description", content: pageDescription },
      { property: "og:title", content: pageTitle },
      { property: "og:description", content: pageDescription },
      { property: "og:type", content: "profile" },
      { property: "og:image", content: "/og.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: `${person.name}, ${person.title}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: pageTitle },
      { name: "twitter:description", content: pageDescription },
      { name: "twitter:image", content: "/og.png" },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(personSchema) }],
  }),
  component: Index,
});

const ease = [0.22, 1, 0.36, 1] as const;
/** Milliseconds after the page starts loading when the splash begins to clear. */
const SPLASH_LEAVE_MS = 2300;
/** How long the splash tiles take to clear. */
const SPLASH_CLEAR_MS = 1200;
/**
 * Seconds from hydration until the splash clears; hero entrance animations are
 * delayed by this. Anchored to page start (performance.now) rather than to
 * hydration, so a slow script load shortens the wait instead of extending it.
 * Only feeds transition delays and timers, so the SSR value never shows up in markup.
 */
const INTRO =
  typeof window === "undefined"
    ? SPLASH_LEAVE_MS / 1000
    : Math.max(0.3, (SPLASH_LEAVE_MS - performance.now()) / 1000 + 0.2);
const hasWork = projects.length > 0;

/** Section order drives the "01 — About" numbering. */
const sectionOrder = [
  "about",
  "process",
  ...(hasWork ? ["work"] : []),
  "experience",
  "skills",
  "contact",
];
const num = (id: string) => String(sectionOrder.indexOf(id) + 1).padStart(2, "0");

const firstName = person.firstName;
const lastName = person.name.slice(firstName.length).trim();

/* ------------------------------------------------------------------ */
/* Icon maps                                                           */
/* ------------------------------------------------------------------ */

const toolIcons: Record<string, LucideIcon> = {
  Cypress: TestTube,
  Playwright: Globe,
  Appium: Smartphone,
  Postman: Send,
  JMeter: Gauge,
  Jira: Kanban,
  GitHub: GitBranch,
  "Chrome DevTools": Bug,
};

const categoryIcons: Record<string, LucideIcon> = {
  Automation: Bot,
  "API & Performance": Activity,
  "Testing & QA": ClipboardCheck,
  Tools: Wrench,
};

const stepIcons: LucideIcon[] = [
  FileSearch,
  ListChecks,
  MousePointerClick,
  Bot,
  Activity,
  ShieldCheck,
];

const contactIcons: Record<ContactLink["icon"], ComponentType<{ className?: string }>> = {
  mail: Mail,
  phone: Phone,
  linkedin: ({ className }) => (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

/** True once we know the browser can run WebGL. Never true during SSR or in jsdom. */
function useWebGL() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setOk(Boolean(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

/** Drives the page-wide spotlight by writing --mx/--my on <html>. */
function useSpotlight() {
  useEffect(() => {
    const root = document.documentElement;
    const move = (e: MouseEvent) => {
      root.style.setProperty("--mx", `${e.clientX}px`);
      root.style.setProperty("--my", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, []);
}

/* ------------------------------------------------------------------ */
/* Motion primitives                                                   */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  delay = 0,
  className = "",
  blur = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  blur?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 36, filter: blur ? "blur(8px)" : "none" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Word-by-word slide-up reveal. Words are separated by real spaces for accessibility. */
function SplitText({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  return (
    <span className={className}>
      {text.split(" ").map((w, k) => (
        <span key={k}>
          <span className="inline-block overflow-hidden pb-1 align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: "110%", rotate: 4 }}
              animate={{ y: 0, rotate: 0 }}
              transition={{ duration: 0.9, delay: delay + k * 0.07, ease }}
            >
              {w}
            </motion.span>
          </span>{" "}
        </span>
      ))}
    </span>
  );
}

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const [v, setV] = useState(reduced ? to : 0);
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setV(to);
      return;
    }
    const c = animate(0, to, { duration: 1.6, ease, onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to, reduced]);
  return (
    <span ref={ref}>
      {v}
      {suffix}
    </span>
  );
}

/** 3D tilt + light glare that follows the pointer. Static on touch devices. */
function Tilt({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const rx = useSpring(0, { stiffness: 220, damping: 20 });
  const ry = useSpring(0, { stiffness: 220, damping: 20 });
  const [g, setG] = useState({ x: 50, y: 50, on: false });
  const move = (e: ReactMouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 10);
    rx.set(-(py - 0.5) * 10);
    setG({ x: px * 100, y: py * 100, on: true });
  };
  const leave = () => {
    rx.set(0);
    ry.set(0);
    setG((s) => ({ ...s, on: false }));
  };
  const M = motion[Tag];
  return (
    <M
      onMouseMove={move}
      onMouseLeave={leave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className={`glass card-glow relative overflow-hidden rounded-2xl ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: g.on ? 1 : 0,
          background: `radial-gradient(420px circle at ${g.x}% ${g.y}%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 60%)`,
        }}
      />
      <span className="relative block h-full">{children}</span>
    </M>
  );
}

/** Button that leans toward the cursor. */
function Magnetic({ children, className = "" }: { children: ReactNode; className?: string }) {
  const x = useSpring(0, { stiffness: 260, damping: 16 });
  const y = useSpring(0, { stiffness: 260, damping: 16 });
  return (
    <motion.div
      style={{ x, y }}
      className={`inline-block ${className}`}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.3);
        y.set((e.clientY - r.top - r.height / 2) * 0.3);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

function Typer() {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setI((x) => x + 1), 2300);
    return () => clearInterval(t);
  }, [reduced]);
  return (
    <span className="relative inline-flex h-[1.4em] overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          className="text-primary"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          {roles[i % roles.length]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Chip({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, scale: 0.6, y: 8 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, type: "spring", stiffness: 320, damping: 18 }}
      whileHover={{ y: -4, scale: 1.06 }}
      className="cursor-default rounded-md border bg-secondary/70 px-3 py-1.5 font-mono text-xs transition-colors hover:border-primary hover:text-primary"
    >
      {children}
    </motion.li>
  );
}

const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*<>/";

/** Decoder-style scramble on hover. Visual only: the parent link carries the real label. */
function Scramble({ text }: { text: string }) {
  const [out, setOut] = useState(text);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);
  const run = () => {
    clearInterval(timer.current);
    let frame = 0;
    timer.current = setInterval(() => {
      frame += 1;
      const settled = Math.floor(frame / 2);
      setOut(
        text
          .split("")
          .map((ch, i) =>
            i < settled || ch === " " ? ch : glyphs[Math.floor(Math.random() * glyphs.length)],
          )
          .join(""),
      );
      if (settled >= text.length) clearInterval(timer.current);
    }, 32);
  };
  return (
    <span aria-hidden="true" onMouseEnter={run}>
      {out}
    </span>
  );
}

/** Hero name: letters rise in on load and jump when hovered. */
function Letters({
  text,
  delay = 0,
  className = "",
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  return (
    <span className={`inline-block ${className}`}>
      {text.split("").map((ch, k) => (
        <span key={k} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
          <motion.span
            className="inline-block cursor-default"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: delay + k * 0.05, ease }}
            whileHover={{ y: "-12%", color: "var(--primary)", transition: { duration: 0.2 } }}
          >
            {ch}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Animated wave edge that joins a colour-blocked section to the page. */
function Wave({ flip = false }: { flip?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 h-12 overflow-hidden md:h-20 ${
        flip ? "top-full -scale-y-100" : "bottom-full"
      }`}
    >
      <svg
        viewBox="0 0 2880 80"
        preserveAspectRatio="none"
        className="wave-slide absolute inset-y-0 left-0 h-full w-[200%]"
      >
        <path
          fill="var(--background)"
          d="M0,40 C240,80 480,80 720,40 C960,0 1200,0 1440,40 C1680,80 1920,80 2160,40 C2400,0 2640,0 2880,40 V80 H0 Z"
        />
      </svg>
    </div>
  );
}

const splashGradient =
  "linear-gradient(135deg, oklch(0.82 0.08 222) 0%, oklch(0.66 0.12 240) 50%, oklch(0.48 0.13 258) 100%)";
const tileCols = 8;
const tileRows = 6;
const splashName = person.name.toUpperCase();

/**
 * Splash screen shown on every load, after obliviousaman.netlify.app: the name
 * fades in letter by letter in random order over a soft gradient, then the
 * gradient breaks into tiles that clear diagonally to reveal the page.
 * Rendered during SSR so the page never flashes underneath; a CSS failsafe
 * hides it if scripts never run.
 */
function Splash({ leaving }: { leaving: boolean }) {
  // Lock scrolling only while the name is on screen; release it as the tiles clear.
  useEffect(() => {
    if (leaving) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [leaving]);
  const letters = splashName.split("");
  // Fixed scramble (not Math.random) so server and client render the same order.
  const order = (k: number) => ((k * 7 + 3) % letters.length) / letters.length;
  return (
    <div
      aria-hidden="true"
      className={`splash-failsafe fixed inset-0 z-[80] overflow-hidden ${leaving ? "pointer-events-none" : ""}`}
      data-testid="splash"
    >
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${tileCols}, 1fr)`,
          gridTemplateRows: `repeat(${tileRows}, 1fr)`,
        }}
      >
        {Array.from({ length: tileCols * tileRows }, (_, i) => {
          const c = i % tileCols;
          const r = Math.floor(i / tileCols);
          return (
            <motion.div
              key={i}
              initial={false}
              animate={leaving ? { opacity: 0, scale: 0.4 } : { opacity: 1, scale: 1 }}
              transition={{
                duration: 0.35,
                delay: 0.25 + (tileCols - 1 - c + r) * 0.045,
                ease,
              }}
              className="-m-px"
              style={{
                backgroundImage: splashGradient,
                backgroundSize: "100vw 100vh",
                backgroundPosition: `calc(-${c} * 100vw / ${tileCols}) calc(-${r} * 100vh / ${tileRows})`,
              }}
            />
          );
        })}
      </div>
      <motion.p
        initial={false}
        animate={
          leaving
            ? { opacity: 0, scale: 0.94, filter: "blur(8px)" }
            : { opacity: 1, scale: 1, filter: "blur(0px)" }
        }
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center whitespace-pre px-6 text-center font-wide text-[clamp(1.6rem,5.5vw,4.5rem)] font-black tracking-[-0.02em] text-white drop-shadow-[0_2px_24px_rgb(0_0_0/0.15)]"
      >
        {/* Plain CSS so the letters start at first paint, before scripts load. */}
        {letters.map((ch, k) => (
          <span
            key={k}
            className="splash-letter inline-block"
            style={{ animationDelay: `${0.15 + order(k) * 0.9}s` }}
          >
            {ch}
          </span>
        ))}
      </motion.p>
    </div>
  );
}

const bugSpots = [
  { left: "4%", top: "26%", dur: 9 },
  { left: "47%", top: "16%", dur: 11 },
  { left: "40%", top: "84%", dur: 8 },
  { left: "93%", top: "15%", dur: 10 },
  { left: "66%", top: "88%", dur: 12 },
];

/** Easter egg: a few bugs wander the hero. Catch them all. Desktop only, purely decorative. */
function BugHunt() {
  const [caught, setCaught] = useState<number[]>([]);
  const total = bugSpots.length;
  const all = caught.length === total;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 hidden md:block">
      {bugSpots.map((s, k) => (
        <div key={k} className="absolute" style={{ left: s.left, top: s.top }}>
          <AnimatePresence>
            {caught.includes(k) ? (
              <motion.span
                key="ok"
                initial={{ scale: 0.4, opacity: 1 }}
                animate={{ scale: 1.6, opacity: 0, y: -24 }}
                transition={{ duration: 0.9, ease }}
                className="absolute font-mono text-xs font-bold text-pass"
              >
                +1
              </motion.span>
            ) : (
              <motion.div
                key="bug"
                exit={{ scale: 0, rotate: 200, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="crawl"
                  style={{ animationDuration: `${s.dur}s`, animationDelay: `-${k * 1.7}s` }}
                >
                  <Bug
                    onClick={() => setCaught((c) => [...c, k])}
                    className="pointer-events-auto h-5 w-5 cursor-crosshair text-muted-foreground/50 transition-colors hover:text-destructive"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: INTRO + 1.6 }}
        className={`glass absolute bottom-16 right-24 rounded-full px-3 py-1.5 font-mono text-[11px] ${
          all ? "text-pass" : "text-muted-foreground"
        }`}
      >
        <Bug className="mr-1.5 inline h-3 w-3 align-[-2px]" />
        {all
          ? "5/5 caught. You'd make a good tester."
          : `${caught.length}/${total} bugs caught · click to squash`}
      </motion.p>
    </div>
  );
}

/**
 * Section header in the style shared by the reference portfolios: icon tile,
 * numbered eyebrow, giant display title, gradient rule, watermark number.
 */
function SectionHeader({
  id,
  icon: Icon,
  eyebrow,
  title,
  sub,
  headingId,
}: {
  id: string;
  icon: LucideIcon;
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  headingId: string;
}) {
  const n = num(id);
  return (
    <Reveal className="relative">
      <span aria-hidden="true" className="watermark absolute -top-10 right-0 hidden md:block">
        {n}
      </span>
      <span className="icon-tile h-11 w-11">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      <p className="mt-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-primary">
        <span aria-hidden="true" className="h-px w-8 bg-primary" />
        {n} — {eyebrow}
      </p>
      <h2 id={headingId} className="mt-3 text-5xl leading-none md:text-7xl">
        {title}
      </h2>
      {sub && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{sub}</p>}
      <span
        aria-hidden="true"
        className="mt-8 block h-px w-full bg-gradient-to-r from-primary via-accent to-transparent"
      />
    </Reveal>
  );
}

const btn =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-mono text-sm font-semibold transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:scale-[1.04]";
const btnPrimary = `${btn} bg-primary text-primary-foreground shadow-[var(--glow)]`;
const btnGhost = `${btn} glass text-foreground hover:border-primary`;

/* ------------------------------------------------------------------ */
/* Theme toggle, header, mobile menu, side rails                       */
/* ------------------------------------------------------------------ */

function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* storage unavailable: theme still applies for this page view */
    }
    setDark(next);
  };
  const label = dark ? "Switch to light theme" : "Switch to dark theme";
  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      data-testid="theme-toggle"
      whileTap={{ scale: 0.9, rotate: 20 }}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-card/60 text-foreground transition-colors hover:border-primary hover:text-primary"
    >
      {dark ? (
        <Sun aria-hidden="true" className="h-4 w-4" />
      ) : (
        <Moon aria-hidden="true" className="h-4 w-4" />
      )}
    </motion.button>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Highlight the nav item whose section is on screen.
  useEffect(() => {
    const sections = navItems
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: INTRO - 0.4, duration: 0.8, ease }}
        className="fixed inset-x-0 top-0 z-40 border-b bg-background shadow-[0_6px_24px_-18px_color-mix(in_oklab,var(--foreground)_45%,transparent)]"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 md:px-8">
          <a href="#top" className="flex items-center gap-2" aria-label={`${person.name} — home`}>
            <span className="icon-tile h-8 w-8 font-hero text-base tracking-wider">
              {firstName[0]}
              {lastName[0]}
            </span>
            <span className="hidden font-display text-sm font-bold tracking-tight sm:inline">
              {person.name}
              <span className="text-primary">.</span>
            </span>
          </a>
          <nav
            aria-label="Sections"
            className="hidden items-center gap-7 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground md:flex"
          >
            {navItems.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                aria-label={label}
                aria-current={active === id ? "location" : undefined}
                className={`group relative py-1 transition-colors hover:text-foreground ${active === id ? "text-primary" : ""}`}
              >
                <Scramble text={label} />
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full ${active === id ? "w-full" : "w-0"}`}
                />
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href={resume}
              download
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-mono text-xs font-semibold text-primary-foreground transition-transform hover:scale-105"
            >
              <Download aria-hidden="true" className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download CV</span>
              <span className="sm:hidden" aria-hidden="true">
                CV
              </span>
              <span className="sr-only sm:hidden">Download CV</span>
            </a>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-card/60 md:hidden"
            >
              {open ? (
                <X aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Menu aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-md md:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.nav
              aria-label="Mobile sections"
              initial={{ y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              transition={{ duration: 0.35, ease }}
              className="glass mx-3 mt-20 flex flex-col gap-1 rounded-3xl p-3"
              onClick={(e) => e.stopPropagation()}
            >
              {navItems.map(({ id, label }, k) => (
                <motion.a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + k * 0.05 }}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 font-hero text-2xl tracking-wider hover:bg-secondary"
                >
                  {label}
                  <span aria-hidden="true" className="font-mono text-xs text-muted-foreground">
                    {num(id)}
                  </span>
                </motion.a>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Fixed rails on wide screens: "scroll down" on the left, social icons on the right. */
function SideRails() {
  return (
    <>
      <div
        aria-hidden="true"
        className="fixed bottom-10 left-8 z-30 hidden flex-col items-center gap-3 lg:flex"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground [writing-mode:vertical-rl]">
          scroll down
        </span>
        <span className="relative block h-16 w-px overflow-hidden bg-border">
          <span className="rail-line absolute inset-0" />
        </span>
      </div>
      <nav
        aria-label="Social links"
        className="fixed bottom-10 right-8 z-30 hidden flex-col gap-3 lg:flex"
      >
        {contactLinks.map((c) => {
          const Icon = contactIcons[c.icon];
          return (
            <a
              key={c.href}
              href={c.href}
              aria-label={c.short}
              title={c.short}
              {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="glass card-glow inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary"
            >
              <Icon className="h-4 w-4" />
            </a>
          );
        })}
      </nav>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Hero widgets                                                        */
/* ------------------------------------------------------------------ */

/** The "Release check" card: each gate ticks green in turn, then can be run again. */
function ReleaseCheck() {
  const reduced = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [done, setDone] = useState(reduced ? releaseChecks.length : 0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDone(releaseChecks.length);
      return;
    }
    setDone(0);
    // The first run waits for the splash screen to lift; "Run again" starts right away.
    const start = run === 0 ? INTRO * 1000 + 400 : 700;
    const timers = releaseChecks.map((_, i) => setTimeout(() => setDone(i + 1), start + i * 650));
    return () => timers.forEach(clearTimeout);
  }, [inView, run, reduced]);

  const total = releaseChecks.length;
  const complete = done === total;

  return (
    <motion.section
      ref={ref}
      aria-label="Release check"
      aria-live="polite"
      className="glass relative w-full max-w-md rounded-3xl p-5 shadow-[var(--glow)] md:p-6"
      style={{ background: "color-mix(in oklab, var(--card) 92%, transparent)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold">Release check</p>
          <p className="font-mono text-xs text-muted-foreground">blockchain app · sample run</p>
        </div>
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs transition-colors hover:border-primary hover:text-primary"
        >
          <RotateCcw aria-hidden="true" className="h-3 w-3" />
          Run again
        </button>
      </div>
      <ul className="mt-4 divide-y">
        {releaseChecks.map((c, i) => {
          const ok = i < done;
          const active = i === done && !complete;
          return (
            <li key={c.title} className="flex items-center gap-3 py-2.5">
              <span
                className={`relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  ok ? "border-pass bg-pass/15 text-pass" : "border-border text-transparent"
                }`}
              >
                <AnimatePresence>
                  {ok && (
                    <motion.span
                      initial={{ scale: 0, rotate: -40 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 18 }}
                      className="inline-flex"
                    >
                      <Check aria-hidden="true" className="h-3 w-3" strokeWidth={3} />
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 animate-ping rounded-full border border-primary/60"
                  />
                )}
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-sm font-medium transition-colors ${ok ? "" : "text-muted-foreground"}`}
                >
                  {c.title}
                </span>
                <span className="block truncate font-mono text-[11px] text-muted-foreground">
                  {c.detail}
                </span>
              </span>
              <span className="ml-auto font-mono text-[10px] uppercase tracking-wider">
                {ok ? (
                  <span className="text-pass">pass</span>
                ) : active ? (
                  <span className="text-primary">running</span>
                ) : (
                  <span className="text-muted-foreground/60">queued</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex items-center gap-3">
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
          <motion.span
            className="block h-full rounded-full bg-gradient-to-r from-primary to-accent"
            animate={{ width: `${(done / total) * 100}%` }}
            transition={{ duration: 0.5, ease }}
          />
        </span>
        <span className="font-mono text-xs text-muted-foreground" data-testid="release-progress">
          {done} / {total} checks
        </span>
      </div>
    </motion.section>
  );
}

/** Decorative terminal that types out a few commands when it scrolls into view. */
function Terminal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion() ?? false;
  const flat = terminalLines.flatMap((l) => [`$ ${l.cmd}`, ...l.out]);
  const [shown, setShown] = useState(reduced ? flat.length : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    const timers = flat.map((_, i) => setTimeout(() => setShown(i + 1), 250 + i * 260));
    return () => timers.forEach(clearTimeout);
    // flat is derived from static data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="glass overflow-hidden rounded-2xl font-mono text-[13px] leading-relaxed shadow-[var(--glow)]"
    >
      <div className="flex items-center gap-2 border-b bg-secondary/50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-pass/80" />
        <span className="ml-auto text-[11px] text-muted-foreground">
          {firstName.toLowerCase()}@qa ~ portfolio
        </span>
      </div>
      <div className="min-h-[260px] p-4">
        {flat.slice(0, shown).map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className={
              line.startsWith("$")
                ? "text-primary"
                : line.startsWith("✓")
                  ? "text-pass"
                  : "text-muted-foreground"
            }
          >
            {line}
          </motion.p>
        ))}
        {shown < flat.length && (
          <span className="inline-block h-4 w-2 animate-pulse bg-primary align-middle" />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function Hero() {
  const webgl = useWebGL();
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll();
  const textY = useTransform(scrollYProgress, [0, 0.25], [0, -100]);
  const textO = useTransform(scrollYProgress, [0, 0.18], [1, 0]);
  const sceneY = useTransform(scrollYProgress, [0, 0.3], [0, 120]);
  const sceneRef = useRef<HTMLDivElement>(null);
  const sceneInView = useInView(sceneRef, { amount: 0.05 });

  return (
    <section
      id="top"
      aria-label="Introduction"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-16 md:pt-32"
    >
      {/* Ambient blobs (CSS fallback + extra depth behind the WebGL scene) */}
      <motion.div
        aria-hidden="true"
        animate={{ scale: [1, 1.25, 1], rotate: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-40 top-10 h-[560px] w-[560px] rounded-full bg-accent/25 blur-[130px]"
      />
      <motion.div
        aria-hidden="true"
        animate={{ scale: [1.2, 1, 1.2] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-40 bottom-0 h-[460px] w-[460px] rounded-full bg-primary/20 blur-[130px]"
      />

      {/* 3D scene: behind the release card on desktop, faintly behind the text on phones */}
      <motion.div
        ref={sceneRef}
        aria-hidden="true"
        style={{ y: sceneY }}
        className="pointer-events-none absolute inset-x-0 top-0 h-full opacity-35 md:left-[45%] md:opacity-90"
        data-testid="hero-scene"
        data-webgl={webgl ? "on" : "off"}
      >
        {webgl && (
          <Suspense fallback={null}>
            <HeroScene reduced={reduced} active={sceneInView} />
          </Suspense>
        )}
      </motion.div>

      {!reduced && <BugHunt />}

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-12 px-5 md:grid-cols-[1.2fr_1fr] md:px-8 lg:px-20">
        <motion.div style={{ y: textY, opacity: textO }}>
          <motion.p
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: INTRO, duration: 0.6 }}
            className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-primary"
          >
            <span aria-hidden="true" className="h-px w-10 bg-primary" />
            {person.title} — {person.location}
          </motion.p>

          <h1 className="mt-6 font-wide text-[clamp(2.6rem,5.7vw,5.6rem)] font-black whitespace-nowrap leading-[0.95] tracking-[-0.03em]">
            <Letters text={firstName} delay={INTRO} /> <br />
            <Letters text={lastName} delay={INTRO + 0.25} className="text-outline" />
            <span
              aria-hidden="true"
              className="caret-block ml-[0.08em] inline-block h-[0.2em] w-[0.42em] bg-primary align-baseline shadow-[var(--glow)]"
            />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: INTRO + 0.8, duration: 0.6 }}
            className="mt-6 font-display text-2xl font-bold md:text-3xl"
          >
            I break things <span className="text-gradient">so users don't.</span>
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: INTRO + 1 }}
            className="mt-3 font-mono text-sm md:text-base"
          >
            <span className="text-muted-foreground">Focus · </span>
            <Typer />
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: INTRO + 1.1, duration: 0.6 }}
            className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            {person.summary}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: INTRO + 1.25, duration: 0.6 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Magnetic>
              <a href="#contact" className={btnPrimary}>
                Get in touch
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
            </Magnetic>
            <Magnetic>
              <a href={resume} download className={btnGhost}>
                Download CV
                <Download aria-hidden="true" className="h-4 w-4" />
              </a>
            </Magnetic>
          </motion.div>

          {person.available && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: INTRO + 1.4 }}
              className="mt-6 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground"
            >
              <span aria-hidden="true" className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pass opacity-75" />
                <span className="relative h-2 w-2 rounded-full bg-pass" />
              </span>
              {person.openTo} · {person.workMode.toLowerCase()}
            </motion.p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, rotate: 2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: INTRO + 0.6, duration: 0.9, ease }}
          className="relative flex justify-center md:justify-end"
        >
          {/* Floating code tags around the card, like the reference heroes */}
          <motion.span
            aria-hidden="true"
            animate={{ y: reduced ? 0 : [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="glass absolute -top-6 left-0 hidden rounded-lg px-3 py-1.5 font-mono text-xs text-accent md:block"
          >
            {"<playwright />"}
          </motion.span>
          <motion.span
            aria-hidden="true"
            animate={{ y: reduced ? 0 : [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="glass absolute -bottom-5 right-2 hidden rounded-lg px-3 py-1.5 font-mono text-xs text-primary md:block"
          >
            {"{ cypress: 'green' }"}
          </motion.span>
          <ReleaseCheck />
        </motion.div>
      </div>

      <motion.a
        href="#about"
        aria-label="Scroll to about"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 font-mono text-xs text-muted-foreground md:flex"
      >
        scroll to explore
        <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" />
      </motion.a>
    </section>
  );
}

/** Stats row under the hero, in the bordered-row style of the reference sites. */
function Glance() {
  return (
    <section aria-label="At a glance" className="relative z-10 border-y">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y md:grid-cols-4 md:divide-y-0 md:px-8 lg:px-20">
        {facts.map((f, k) => (
          <motion.li
            key={f.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: k * 0.08, duration: 0.6, ease }}
            className="px-5 py-6 md:px-6 md:py-8"
          >
            {f.kind === "number" ? (
              <p className="font-hero text-5xl leading-none text-primary md:text-6xl">
                <Counter to={f.value} suffix={f.suffix} />
              </p>
            ) : (
              <p className="font-hero text-3xl leading-none text-primary md:text-4xl">{f.value}</p>
            )}
            <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {f.label}
            </p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

function Ticker() {
  const { scrollYProgress } = useScroll();
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  return (
    <div
      aria-hidden="true"
      className="my-20 -rotate-2 overflow-hidden border-y bg-gradient-to-r from-primary to-accent py-3 text-primary-foreground"
    >
      <motion.div style={{ x }}>
        <div className="marquee flex w-max gap-12 whitespace-nowrap font-hero text-2xl tracking-wider md:text-3xl">
          {[...tickerItems, ...tickerItems, ...tickerItems].map((t, k) => (
            <span key={k}>{t} ✦</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 md:px-8 lg:px-20"
    >
      <SectionHeader
        id="about"
        icon={User}
        eyebrow="Who I am"
        headingId="about-heading"
        title={
          <>
            Quality across <span className="text-gradient">manual and automated</span> testing.
          </>
        }
        sub="The cheapest defect is the one found in a requirements doc, not in production."
      />
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <Reveal>
          <Terminal />
        </Reveal>
        <div>
          <Reveal delay={0.1}>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Day to day that means Cypress, Playwright and Appium for automation, Postman for APIs,
              JMeter for load, and bug reports developers can act on without a follow-up question. I
              have tested blockchain and Web3 products, an e-commerce platform and IoT software, on
              web, mobile and the APIs underneath.
            </p>
          </Reveal>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {principles.map((p, k) => (
              <Reveal key={p.title} delay={0.15 + k * 0.08}>
                <li className="h-full border-l-2 border-primary/60 pl-4">
                  <h3 className="text-base font-bold">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map((h, k) => (
          <Reveal key={h.title} delay={k * 0.06}>
            <Tilt as="li" className="group h-full p-6">
              <p className="font-mono text-xs text-primary">#{String(k + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 text-lg font-bold transition-colors group-hover:text-primary">
                {h.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{h.description}</p>
            </Tilt>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

const manifesto =
  "I click it, script it, load it and break it on purpose, so the first person to find the bug is me and not your users.";
const manifestoHighlights = new Set(["break", "me"]);

function ManifestoWord({
  word,
  range,
  progress,
}: {
  word: string;
  range: [number, number];
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const bare = word.replace(/[^a-z]/gi, "").toLowerCase();
  return (
    <motion.span
      style={{ opacity }}
      className={manifestoHighlights.has(bare) ? "text-gradient" : undefined}
    >
      {word}{" "}
    </motion.span>
  );
}

/** A single statement that lights up word by word as it scrolls past. */
function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 50%"] });
  const words = manifesto.split(" ");
  return (
    <section
      aria-label="Approach"
      className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28 lg:px-20"
    >
      <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-primary">
        <span aria-hidden="true" className="h-px w-8 bg-primary" />
        The job, in one line
      </p>
      <p
        ref={ref}
        className="mt-6 font-display text-3xl font-bold leading-[1.15] tracking-tight md:text-5xl lg:text-6xl"
      >
        {reduced
          ? manifesto
          : words.map((w, k) => (
              <ManifestoWord
                key={k}
                word={w}
                range={[k / words.length, (k + 1) / words.length]}
                progress={scrollYProgress}
              />
            ))}
      </p>
    </section>
  );
}

const kineticRows = [
  { word: "Test", dir: -1, tone: "text-primary" },
  { word: "Break", dir: 1, tone: "text-outline" },
  { word: "Verify", dir: -1, tone: "text-accent" },
  { word: "Ship", dir: 1, tone: "text-outline" },
];

function KineticRow({
  word,
  dir,
  tone,
  progress,
}: (typeof kineticRows)[number] & { progress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const x = useTransform(progress, [0, 1], dir < 0 ? ["0%", "-30%"] : ["-30%", "0%"]);
  return (
    <motion.p
      style={{ x }}
      className={`whitespace-nowrap font-hero text-[clamp(5rem,19vw,17rem)] uppercase leading-[0.82] ${tone}`}
    >
      {Array.from({ length: 6 }, () => word).join(" · ")}
    </motion.p>
  );
}

/** Giant words sliding against each other as the section passes: the release loop. */
function Kinetic() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const pillScale = useTransform(scrollYProgress, [0.25, 0.5], [0.6, 1]);
  return (
    <section
      ref={ref}
      aria-label="Test, break, verify, ship"
      className="relative overflow-hidden py-10 select-none"
    >
      <div aria-hidden="true">
        {kineticRows.map((r) => (
          <KineticRow key={r.word} {...r} progress={scrollYProgress} />
        ))}
      </div>
      <motion.a
        href="#process"
        style={{ scale: pillScale }}
        className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-foreground px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-background shadow-2xl"
      >
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-pass" />
        The release loop · {workflow.length} gates
        <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" />
      </motion.a>
    </section>
  );
}

/** "How a release gets checked": a stepper that advances on its own until the reader takes over. */
function Process() {
  const [i, setI] = useState(0);
  const [manual, setManual] = useState(false);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion() ?? false;
  const total = workflow.length;
  const step = workflow[i] ?? workflow[0]!;
  const StepIcon = stepIcons[i] ?? ShieldCheck;

  useEffect(() => {
    if (reduced || manual || paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % total), 4500);
    return () => clearInterval(t);
  }, [reduced, manual, paused, total]);

  const pick = (k: number) => {
    setManual(true);
    setI(k);
  };

  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 md:px-8 lg:px-20"
    >
      <SectionHeader
        id="process"
        icon={WorkflowIcon}
        eyebrow="How I work"
        headingId="process-heading"
        title="How a release gets checked"
        sub={`${total} gates between a build and production. Pick a stage to see the work.`}
      />
      <div
        className="mt-12 grid gap-6 lg:grid-cols-[320px_1fr]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          role="tablist"
          aria-label="Process stages"
          className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
        >
          {workflow.map((s, k) => {
            const selected = k === i;
            return (
              <button
                key={s.short}
                role="tab"
                id={`process-tab-${k}`}
                aria-selected={selected}
                aria-controls="process-panel"
                onClick={() => pick(k)}
                className={`group relative flex shrink-0 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                  selected
                    ? "glass border-primary/50 text-foreground shadow-[var(--glow)]"
                    : "border-transparent text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <span
                  className={`font-mono text-xs ${selected ? "text-primary" : "text-muted-foreground/70"}`}
                >
                  {String(k + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-sm font-semibold">{s.short}</span>
                {selected && !reduced && !manual && (
                  <motion.span
                    aria-hidden="true"
                    key={`bar-${i}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 4.5, ease: "linear" }}
                    className="absolute inset-x-3 bottom-0 h-px origin-left bg-gradient-to-r from-primary to-accent"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id="process-panel"
          aria-labelledby={`process-tab-${i}`}
          className="glass relative min-h-[320px] overflow-hidden rounded-3xl p-6 md:p-10"
        >
          <span
            aria-hidden="true"
            className="watermark pointer-events-none absolute -right-2 -top-6 opacity-70"
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.45, ease }}
            className="relative"
          >
            <span className="icon-tile h-12 w-12">
              <StepIcon aria-hidden="true" className="h-5 w-5" />
            </span>
            <p className="mt-5 font-mono text-xs uppercase tracking-[0.3em] text-primary">
              Stage {String(i + 1).padStart(2, "0")} · {step.short}
            </p>
            <h3 className="mt-2 max-w-xl text-2xl font-bold md:text-3xl">{step.title}</h3>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              {step.body}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {step.tools.map((t, k) => (
                <Chip key={t} delay={k * 0.05}>
                  {t}
                </Chip>
              ))}
            </ul>
          </motion.div>
          <div className="mt-8 flex items-center justify-between border-t pt-4 font-mono text-xs text-muted-foreground">
            <span>
              {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => pick((i + 1) % total)}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              Next stage
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Starts a step counter when `ref` scrolls into view; `replay` restarts it. */
function useSequence(count: number, stepMs: number, startMs = 400) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion() ?? false;
  const [shown, setShown] = useState(reduced ? count : 0);
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setShown(count);
      return;
    }
    setShown(0);
    const timers = Array.from({ length: count }, (_, i) =>
      setTimeout(() => setShown(i + 1), startMs + i * stepMs),
    );
    return () => timers.forEach(clearTimeout);
  }, [inView, run, reduced, count, stepMs, startMs]);
  return { ref, shown, replay: () => setRun((r) => r + 1) };
}

/** Browser-style frame around a project demo, with a replay button. */
function DemoWindow({
  title,
  onReplay,
  children,
  footnote,
}: {
  title: string;
  onReplay: () => void;
  children: ReactNode;
  footnote: string;
}) {
  return (
    <div className="glass overflow-hidden rounded-2xl shadow-[var(--glow)]">
      <div className="flex items-center gap-2 border-b bg-secondary/60 px-4 py-2.5">
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-pass/80" />
        <span className="ml-2 truncate font-mono text-[11px] text-muted-foreground">{title}</span>
        <button
          type="button"
          onClick={onReplay}
          aria-label={`Replay demo: ${title}`}
          title="Replay"
          className="ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-primary"
        >
          <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>
      <div aria-hidden="true" className="min-h-[340px] p-5 md:p-6">
        {children}
      </div>
      <p className="border-t px-5 py-2 font-mono text-[10px] text-muted-foreground md:px-6">
        {footnote}
      </p>
    </div>
  );
}

const nexusStages = ["Checkout", "Diff", "Impact", "Generate", "Run + record", "Comment"];

function NexusDemo() {
  const { ref, shown, replay } = useSequence(nexusStages.length + 1, 450);
  const done = shown > nexusStages.length;
  return (
    <div ref={ref}>
      <DemoWindow
        title="github.com · pull/42"
        onReplay={replay}
        footnote="Example report from the Nexus case study"
      >
        <ol className="flex flex-wrap gap-2 font-mono text-[11px]">
          {nexusStages.map((s, i) => {
            const ok = i < shown;
            return (
              <li
                key={s}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 transition-colors ${
                  ok ? "border-pass/40 bg-pass/10 text-pass" : "text-muted-foreground"
                }`}
              >
                {ok ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                )}
                {s}
              </li>
            );
          })}
        </ol>
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease }}
              className="mt-5 rounded-xl border bg-card p-4 text-sm"
            >
              <p className="flex items-center gap-2 font-display font-bold">
                <span className="icon-tile h-7 w-7">
                  <Bot className="h-3.5 w-3.5" />
                </span>
                Nexus QA Report: PR #42 “Rename users to members”
              </p>
              <p className="mt-3 inline-flex items-center gap-2 rounded-md bg-pass/10 px-2.5 py-1 font-mono text-xs font-semibold text-pass">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                PASS · 3 modules affected · 2 tests generated, 1 updated
              </p>
              <p className="mt-3 font-mono text-xs text-muted-foreground">
                Results: <span className="text-pass">14 passed</span> · 0 failed · 0 flaky · signed
                in as admin, member
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5 font-mono text-[11px]">
                {["walkthrough.webm", "14 test recordings", "Playwright HTML report"].map((e) => (
                  <li key={e} className="rounded border bg-secondary/60 px-2 py-0.5">
                    {e}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </DemoWindow>
    </div>
  );
}

const craftCode = [
  "import loginPage from '../support/pages/LoginPage';",
  "",
  "describe('Login – All Scenarios', () => {",
  "  it('[Positive] logs in with valid credentials', () => {",
  "    cy.visit('/login');",
  "    loginPage.login('user@mail.com', 'Secret123');",
  "    cy.url().should('include', '/dashboard');",
  "  });",
  "  it('[Negative] rejects empty fields', () => { /* … */ });",
  "  it('[Boundary] rejects invalid email format', () => { /* … */ });",
  "  it('[Security] sanitises XSS / SQL injection input', () => { /* … */ });",
  "  [{ user: 'a@b.com' }, { user: 'x@y.io' }].forEach((row) => {",
  "    it(`[Data-driven] runs with ${row.user}`, () => { /* … */ });",
  "  });",
  "});",
];

const scenarioTone: Record<string, string> = {
  Positive: "text-pass",
  Negative: "text-destructive",
  Boundary: "text-amber-500",
  Security: "text-accent",
  "Data-driven": "text-primary",
};

/** Minimal highlighter for the generated spec: keywords, strings, scenario tags, comments. */
function CodeLine({ line }: { line: string }) {
  const parts = line.split(
    /('[^']*'|`[^`]*`|\/\*.*?\*\/|\b(?:import|from|describe|it|forEach|cy)\b)/g,
  );
  return (
    <>
      {parts.map((p, k) => {
        if (!p) return null;
        if (/^['`]/.test(p)) {
          const tag = /^['`]\[([\w-]+)\]/.exec(p);
          if (tag) {
            const rest = p.slice(tag[0].length);
            return (
              <span key={k} className="text-accent">
                {p[0]}
                <span className={`font-semibold ${scenarioTone[tag[1]!] ?? ""}`}>[{tag[1]}]</span>
                {rest}
              </span>
            );
          }
          return (
            <span key={k} className="text-accent">
              {p}
            </span>
          );
        }
        if (p.startsWith("/*"))
          return (
            <span key={k} className="text-muted-foreground/60">
              {p}
            </span>
          );
        if (/^(import|from|describe|it|forEach|cy)$/.test(p))
          return (
            <span key={k} className="text-primary">
              {p}
            </span>
          );
        return <span key={k}>{p}</span>;
      })}
    </>
  );
}

function CraftDemo() {
  const { ref, shown, replay } = useSequence(craftCode.length, 140);
  return (
    <div ref={ref}>
      <DemoWindow
        title="cypress/e2e/login.cy.js"
        onReplay={replay}
        footnote="Generated from one recorded login session · example from the project PDF"
      >
        <div className="-mt-1 mb-3 flex gap-1 font-mono text-[11px]">
          <span className="rounded-md px-2 py-1 text-muted-foreground">LoginPage.js</span>
          <span className="rounded-md bg-secondary px-2 py-1 text-foreground">login.cy.js</span>
        </div>
        <pre className="overflow-x-auto font-mono text-[11.5px] leading-relaxed md:text-xs">
          {craftCode.slice(0, shown).map((line, i) => (
            <div key={i} className="flex">
              <span className="w-7 shrink-0 select-none text-right text-muted-foreground/50">
                {i + 1}
              </span>
              <span className="whitespace-pre pl-4">
                <CodeLine line={line} />
              </span>
            </div>
          ))}
          {shown < craftCode.length && (
            <span className="ml-11 inline-block h-3.5 w-1.5 animate-pulse bg-primary align-middle" />
          )}
        </pre>
      </DemoWindow>
    </div>
  );
}

const trustRows = [
  { system: "Blockchain", value: "1,000 SUT", ok: true },
  { system: "Backend", value: "1,000 SUT", ok: true },
  { system: "Admin", value: "1,000 SUT", ok: true },
  { system: "Mobile App", value: "1,200 SUT", ok: false },
];

function TrustDemo() {
  const { ref, shown, replay } = useSequence(trustRows.length + 1, 600);
  const flagged = shown > trustRows.length;
  return (
    <div ref={ref}>
      <DemoWindow
        title="TrustQA · deposit verification"
        onReplay={replay}
        footnote="Example scenario from the TrustQA project overview"
      >
        <p className="font-mono text-[11px] text-muted-foreground">
          User → Mobile App → API → Admin review → Blockchain → Final balance
        </p>
        <p className="mt-3 text-sm">
          Expected deposit: <span className="font-mono font-semibold">1,000 SUT</span>
        </p>
        <ul className="mt-4 divide-y rounded-xl border bg-card">
          {trustRows.map((r, i) => {
            const seen = i < shown;
            return (
              <li key={r.system} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="w-28 font-medium">{r.system}</span>
                <span
                  className={`font-mono transition-opacity ${seen ? "opacity-100" : "opacity-0"}`}
                >
                  {r.value}
                </span>
                <span className="ml-auto font-mono text-[10px] uppercase tracking-wider">
                  {!seen ? (
                    <span className="text-muted-foreground/60">observing</span>
                  ) : r.ok ? (
                    <span className="text-pass">match</span>
                  ) : (
                    <span className="text-destructive">mismatch</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <AnimatePresence>
          {flagged && (
            <motion.p
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease }}
              className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm"
            >
              <span className="font-mono text-xs font-bold tracking-wider text-destructive">
                CROSS-SYSTEM INCONSISTENCY
              </span>
              <span className="mt-1 block text-muted-foreground">
                Observed values differ between systems and need investigation.
              </span>
            </motion.p>
          )}
        </AnimatePresence>
      </DemoWindow>
    </div>
  );
}

const projectDemos: Record<Project["slug"], ComponentType> = {
  nexus: NexusDemo,
  "cypress-craft": CraftDemo,
  trustqa: TrustDemo,
};

const caseStudyPdfs: Record<NonNullable<Project["caseStudy"]>, string> = {
  nexus: nexusPdf,
  "cypress-craft": cypressCraftPdf,
};

function ProjectRow({ p, index }: { p: Project; index: number }) {
  const Demo = projectDemos[p.slug];
  const flip = index % 2 === 1;
  return (
    <article
      id={`project-${p.slug}`}
      aria-labelledby={`project-${p.slug}-title`}
      className="grid scroll-mt-24 items-start gap-10 border-b py-14 last:border-b-0 lg:grid-cols-2 lg:gap-14"
    >
      <Reveal className={`lg:sticky lg:top-28 ${flip ? "lg:order-2" : ""}`}>
        <Demo />
      </Reveal>
      <Reveal delay={0.1}>
        <p className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">
          <span>
            {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </span>
          <span aria-hidden="true" className="h-px w-6 bg-primary" />
          <span className="text-muted-foreground">{p.kind}</span>
        </p>
        {p.status && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[11px] text-accent">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
            {p.status}
          </p>
        )}
        <h3
          id={`project-${p.slug}-title`}
          className="mt-4 font-wide text-3xl font-black leading-tight tracking-[-0.02em] md:text-4xl"
        >
          {p.title}
        </h3>
        <p className="mt-3 text-lg font-semibold text-gradient">{p.tagline}</p>
        <p className="mt-4 leading-relaxed text-muted-foreground">{p.summary}</p>

        <dl
          className={`mt-7 grid gap-px overflow-hidden rounded-xl border bg-border ${
            p.stats.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"
          }`}
        >
          {p.stats.map((s) => (
            <div key={s.label} className="bg-card px-4 py-3">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-hero text-3xl leading-none text-primary md:text-4xl">
                {s.value}
              </dd>
              <dd className="mt-1 text-xs leading-snug text-muted-foreground">{s.label}</dd>
            </div>
          ))}
        </dl>

        <h4 className="mt-7 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          How it works
        </h4>
        <ol className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-sm">
          {p.steps.map((s, k) => (
            <li key={s} className="inline-flex items-center gap-1.5">
              <span className="rounded-md border bg-secondary/60 px-2 py-1">
                <span className="mr-1.5 font-mono text-[10px] text-primary">{k + 1}</span>
                {s}
              </span>
              {k < p.steps.length - 1 && (
                <ArrowRight aria-hidden="true" className="h-3 w-3 text-muted-foreground/60" />
              )}
            </li>
          ))}
        </ol>

        <ul className="mt-7 grid gap-5 sm:grid-cols-2">
          {p.highlights.map((h) => (
            <li key={h.title} className="border-l-2 border-primary/50 pl-4">
              <h4 className="font-display text-sm font-bold">{h.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{h.body}</p>
            </li>
          ))}
        </ul>

        <h4 className="mt-7 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {p.stackLabel}
        </h4>
        <ul className="mt-3 flex flex-wrap gap-2">
          {p.stack.map((t, k) => (
            <Chip key={t} delay={k * 0.03}>
              {t}
            </Chip>
          ))}
        </ul>

        {p.caseStudy && (
          <a
            href={caseStudyPdfs[p.caseStudy]}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnGhost} mt-8`}
          >
            <FileText aria-hidden="true" className="h-4 w-4" />
            Read the full case study (PDF)
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </a>
        )}
      </Reveal>
    </article>
  );
}

function Work() {
  if (!hasWork) return null;
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 md:px-8 lg:px-20"
    >
      <SectionHeader
        id="work"
        icon={FolderKanban}
        eyebrow="Projects"
        headingId="work-heading"
        title="Selected work"
        sub="QA tools and platforms I've built and designed: AI-driven test generation, PR review and cross-system verification."
      />
      <div className="mt-6">
        {projects.map((p, k) => (
          <ProjectRow key={p.slug} p={p} index={k} />
        ))}
      </div>
    </section>
  );
}

function Experience() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const h = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 md:px-8 lg:px-20"
    >
      <SectionHeader
        id="experience"
        icon={Briefcase}
        eyebrow="Career"
        headingId="experience-heading"
        title="Where I've worked"
        sub="Three QA roles, one through-line: ownership of the release."
      />
      <ol ref={ref} className="relative mt-12">
        <span
          aria-hidden="true"
          className="absolute left-[7px] top-0 hidden h-full w-px bg-border md:block"
        />
        <motion.span
          aria-hidden="true"
          style={{ scaleY: h }}
          className="absolute left-[7px] top-0 hidden h-full w-px origin-top bg-gradient-to-b from-primary to-accent md:block"
        />
        {jobs.map((j, k) => {
          const current = /present/i.test(j.period);
          return (
            <li
              key={`${j.company}-${j.period}`}
              className="relative border-b py-10 last:border-b-0"
            >
              <motion.article
                aria-labelledby={`job-${k}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease }}
                className="grid gap-5 md:grid-cols-[240px_1fr] md:gap-10 md:pl-10"
              >
                <motion.span
                  aria-hidden="true"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{ type: "spring", stiffness: 300, damping: 14 }}
                  className={`absolute left-0 top-12 hidden h-[15px] w-[15px] rounded-full border-2 border-background md:block ${
                    current ? "bg-primary shadow-[var(--glow)]" : "bg-accent"
                  }`}
                />
                <div className="font-mono text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Calendar aria-hidden="true" className="h-3.5 w-3.5 text-primary" />
                    {j.period}
                  </p>
                  <p className="mt-2 flex items-center gap-2">
                    <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-primary" />
                    {j.mode}
                  </p>
                  {current && (
                    <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-pass/40 bg-pass/10 px-3 py-1 text-xs text-pass">
                      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-pass" />
                      Current
                    </p>
                  )}
                </div>
                <Tilt className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <span className="icon-tile h-11 w-11 shrink-0">
                      <Briefcase aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 id={`job-${k}`} className="text-2xl font-bold">
                        {j.role}
                      </h3>
                      <p className="mt-1 font-mono text-sm text-primary">{j.company}</p>
                    </div>
                  </div>
                  <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
                    {j.points.map((p) => (
                      <li key={p} className="flex gap-3">
                        <ArrowRight
                          aria-hidden="true"
                          className="mt-1 h-3.5 w-3.5 shrink-0 text-accent"
                        />
                        {p}
                      </li>
                    ))}
                  </ul>
                </Tilt>
              </motion.article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Skills() {
  return (
    <div className="invert-block relative my-24 md:my-32">
      <Wave />
      <section
        id="skills"
        aria-labelledby="skills-heading"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 md:px-8 md:py-20 lg:px-20"
      >
        <SectionHeader
          id="skills"
          icon={Layers}
          eyebrow="Skills"
          headingId="skills-heading"
          title="Toolkit"
          sub="What each tool does for me, and the testing I do with it."
        />

        {/* The toolbox: tool + the job it does */}
        <div className="mt-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            The toolbox
          </p>
          <ul className="mt-4 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {toolbox.map((t, k) => {
              const Icon = toolIcons[t.name] ?? Code;
              return (
                <motion.li
                  key={t.name}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: k * 0.05, duration: 0.5, ease }}
                  className="group flex items-center gap-4 bg-card p-5 transition-colors hover:bg-secondary/60"
                >
                  <span className="icon-tile h-10 w-10 shrink-0 transition-transform group-hover:-rotate-6 group-hover:scale-110">
                    <Icon aria-hidden="true" className="h-4.5 w-4.5" />
                  </span>
                  <span>
                    <span className="block font-display text-sm font-bold">{t.name}</span>
                    <span className="block text-xs text-muted-foreground">{t.use}</span>
                  </span>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* Skill categories */}
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {Object.entries(skills).map(([cat, list], ci) => {
            const Icon = categoryIcons[cat] ?? Wrench;
            return (
              <Reveal key={cat} delay={ci * 0.08}>
                <Tilt className="h-full p-7">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="icon-tile h-9 w-9">
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <h3 id={`skills-${ci}`} className="text-base font-bold">
                      {cat}
                    </h3>
                  </div>
                  <ul aria-labelledby={`skills-${ci}`} className="flex flex-wrap gap-2">
                    {list.map((s, k) => (
                      <Chip key={s} delay={k * 0.05}>
                        {s}
                      </Chip>
                    ))}
                  </ul>
                </Tilt>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-5 grid gap-5 md:grid-cols-2">
          <Tilt className="p-7">
            <div className="flex items-center gap-3">
              <span className="icon-tile h-9 w-9">
                <GraduationCap aria-hidden="true" className="h-4 w-4" />
              </span>
              <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                Education
              </h3>
            </div>
            <p className="mt-4 text-xl font-bold">{education.degree}</p>
            <p className="text-muted-foreground">
              {education.school} · {education.period}
            </p>
            {certifications.length > 0 && (
              <>
                <h3 className="mt-6 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Certifications
                </h3>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  {certifications.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </>
            )}
          </Tilt>
          <Tilt className="p-7">
            <div className="flex items-center gap-3">
              <span className="icon-tile h-9 w-9">
                <LanguagesIcon aria-hidden="true" className="h-4 w-4" />
              </span>
              <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                Languages
              </h3>
            </div>
            <p className="mt-4 text-xl font-bold">{languages.join(", ")}</p>
            <p className="text-muted-foreground">
              {person.timezone} · {person.workMode}
            </p>
          </Tilt>
        </Reveal>
      </section>
      <Wave flip />
    </div>
  );
}

function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative mx-auto max-w-7xl scroll-mt-24 px-5 py-16 md:px-8 lg:px-20"
    >
      <SectionHeader
        id="contact"
        icon={Mail}
        eyebrow="Contact"
        headingId="contact-heading"
        title={
          <>
            <SplitText text="Let's ship something" />
            <br />
            <span className="text-gradient">bug-free.</span>
          </>
        }
      />
      <Reveal className="mt-12">
        <div className="glass relative overflow-hidden rounded-3xl p-8 text-center md:p-14">
          <motion.div
            aria-hidden="true"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/25"
          />
          <motion.div
            aria-hidden="true"
            animate={{ rotate: -360 }}
            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dotted border-accent/20"
          />
          <div className="relative">
            <span className="icon-tile mx-auto h-14 w-14">
              <Send aria-hidden="true" className="h-6 w-6" />
            </span>
            <p className="mt-6 font-hero text-4xl tracking-wide md:text-6xl">
              Ready to collaborate?
            </p>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Hiring for QA or test automation, or need a release checked before it goes out? Send a
              message and I'll reply within a day.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Magnetic>
                <a href={`mailto:${person.email}`} className={btnPrimary}>
                  <Mail aria-hidden="true" className="h-4 w-4" />
                  Email me
                </a>
              </Magnetic>
              <Magnetic>
                <a href={resume} download className={btnGhost}>
                  Download CV
                  <Download aria-hidden="true" className="h-4 w-4" />
                </a>
              </Magnetic>
            </div>
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.15} className="mt-5 grid gap-4 font-mono text-sm md:grid-cols-3">
        {contactLinks.map((c) => {
          const Icon = contactIcons[c.icon];
          return (
            <Magnetic key={c.href} className="w-full">
              <a
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="glass card-glow flex items-center gap-3 rounded-2xl p-5 transition-colors hover:text-primary"
              >
                <span className="icon-tile h-9 w-9 shrink-0">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="truncate">{c.label}</span>
              </a>
            </Magnetic>
          );
        })}
      </Reveal>
    </section>
  );
}

function Footer({ year }: { year: number }) {
  return (
    <footer className="relative z-10 mt-16 border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-8 lg:px-20">
        <div>
          <p className="font-display text-lg font-bold">
            {person.name}
            <span className="text-primary">.</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {person.title} · {person.location}
          </p>
          {person.available && (
            <p className="mt-3 inline-flex items-center gap-2 font-mono text-xs text-pass">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-pass" />
              {person.openTo}
            </p>
          )}
        </div>
        <nav aria-label="Footer">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Pages
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {navItems.map(({ id, label }) => (
              <li key={id}>
                <a href={`#${id}`} className="transition-colors hover:text-primary">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Elsewhere
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {contactLinks.map((c) => (
              <li key={c.href}>
                <a
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                >
                  {c.short}
                  {c.external && <ArrowUpRight aria-hidden="true" className="h-3 w-3" />}
                </a>
              </li>
            ))}
            <li>
              <a href={resume} download className="transition-colors hover:text-primary">
                Resume (PDF)
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-5 py-5 font-mono text-xs text-muted-foreground md:px-8 lg:px-20">
          <span>
            © {year} {person.name} · {person.location}
          </span>
          <a href="#top" className="transition-colors hover:text-foreground">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function Index() {
  useSpotlight();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const year = new Date().getFullYear();
  // The splash is removed on a timer rather than by waiting on exit animations,
  // so a stalled animation frame can never leave it covering the page.
  const [splash, setSplash] = useState<"shown" | "leaving" | "gone">("shown");
  useEffect(() => {
    const wait = Math.max(0, SPLASH_LEAVE_MS - performance.now());
    const leave = setTimeout(() => setSplash("leaving"), wait);
    const gone = setTimeout(() => setSplash("gone"), wait + SPLASH_CLEAR_MS);
    return () => {
      clearTimeout(leave);
      clearTimeout(gone);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid-bg relative min-h-screen overflow-x-clip">
        <div
          aria-hidden="true"
          className="spotlight pointer-events-none fixed inset-0 z-0 hidden md:block"
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <motion.div
          aria-hidden="true"
          style={{ scaleX: progress }}
          className="fixed left-0 right-0 top-0 z-50 h-0.5 origin-left bg-gradient-to-r from-primary to-accent"
        />
        {splash !== "gone" && <Splash leaving={splash === "leaving"} />}
        <Header />
        <SideRails />
        <main id="main" className="relative z-10">
          <Hero />
          <Glance />
          <Ticker />
          <About />
          <Manifesto />
          <Kinetic />
          <Process />
          <Work />
          <Experience />
          <Skills />
          <Contact />
        </main>
        <Footer year={year} />
      </div>
    </MotionConfig>
  );
}
