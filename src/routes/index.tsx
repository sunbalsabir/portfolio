import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValue, useInView, animate, AnimatePresence } from "motion/react";
import resume from "@/assets/resume.pdf?url";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sunbal Sabir — QA Engineer" },
      { name: "description", content: "QA Engineer with 4+ years in manual & automation testing across blockchain, Web3, e-commerce and IoT." },
      { property: "og:title", content: "Sunbal Sabir — QA Engineer" },
      { property: "og:description", content: "Manual & automation testing with Cypress, Playwright, Appium, Postman and JMeter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const roles = ["Automation Testing", "Manual Testing", "API Testing", "Load Testing", "Web3 QA"];

const stats = [
  { n: 4, s: "+", l: "Years Experience" },
  { n: 3, s: "", l: "Companies" },
  { n: 4, s: "", l: "Domains Tested" },
  { n: 5, s: "+", l: "Core Tools" },
];

const highlights = [
  { t: "Blockchain & Web3", d: "Automated suites for a blockchain app and its admin panel, covering core user and admin flows." },
  { t: "Performance Testing", d: "Load and stress tests in JMeter that surfaced e-commerce bottlenecks." },
  { t: "API Validation", d: "End-to-end API checks with Postman across release cycles." },
  { t: "Root-Cause Debugging", d: "Chrome DevTools investigations that trace bugs back to their source." },
  { t: "QA Processes", d: "Helped set up consistent testing and quality standards across teams." },
  { t: "Clear Bug Reports", d: "Defects with precise steps to reproduce, tracked through to resolution." },
];

const jobs = [
  {
    role: "QA Engineer (Admin Team)", co: "MSQUARE GLOBAL", when: "Feb 2025 – Present", mode: "Hybrid",
    pts: [
      "Built and maintained automated test suites for a blockchain-based app and admin web panel",
      "Designed load & stress tests in JMeter for an e-commerce website",
      "Manual functional, regression and exploratory testing on a Web3 project",
      "Validated APIs with Postman alongside developers and product teams",
    ],
  },
  {
    role: "QA Engineer", co: "Auton8", when: "2023 – Feb 2025", mode: "Remote",
    pts: [
      "Developed automated test suites to protect feature quality and accuracy",
      "Diagnosed issues with Chrome DevTools and other debugging tools",
      "Traced bugs to root causes, verified fixes and tracked reports to resolution",
    ],
  },
  {
    role: "QA Engineer", co: "IOT Solutions", when: "2021 – 2023", mode: "Remote",
    pts: [
      "Wrote and executed test plans and scripts to document defects",
      "Helped establish QA processes and quality standards across engineering",
    ],
  },
];

const skills: Record<string, string[]> = {
  Automation: ["Cypress", "Playwright", "Appium"],
  "API & Performance": ["Postman", "JMeter"],
  "Testing & QA": ["Functional", "Regression", "Smoke", "Exploratory", "Mobile", "Test Planning", "Test Case Design", "Bug Tracking", "Requirement Analysis"],
  Tools: ["Jira", "GitHub", "Notion", "Chrome DevTools"],
};


const ease = [0.22, 1, 0.36, 1] as const;

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease }}>{children}</motion.div>
  );
}

function SplitText({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className}>
      {text.split(" ").map((w, k) => (
        <span key={k} className="inline-block overflow-hidden pb-2 align-bottom">
          <motion.span className="inline-block" initial={{ y: "110%", rotate: 6 }} animate={{ y: 0, rotate: 0 }}
            transition={{ duration: 1, delay: delay + k * 0.08, ease }}>{w}&nbsp;</motion.span>
        </span>
      ))}
    </span>
  );
}

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.8, ease, onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref}>{v}{suffix}</span>;
}

function Tilt({ children, className = "" }: { children: ReactNode; className?: string }) {
  const rx = useSpring(0, { stiffness: 200, damping: 18 });
  const ry = useSpring(0, { stiffness: 200, damping: 18 });
  const [g, setG] = useState({ x: 50, y: 50 });
  const move = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 14); rx.set(-(py - 0.5) * 14); setG({ x: px * 100, y: py * 100 });
  };
  return (
    <motion.div onMouseMove={move} onMouseLeave={() => { rx.set(0); ry.set(0); }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900,
        backgroundImage: `radial-gradient(400px circle at ${g.x}% ${g.y}%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 60%)` }}
      className={`glass rounded-2xl ${className}`}>{children}</motion.div>
  );
}

function Magnetic({ children }: { children: ReactNode }) {
  const x = useSpring(0, { stiffness: 250, damping: 15 }), y = useSpring(0, { stiffness: 250, damping: 15 });
  return (
    <motion.div style={{ x, y }} className="inline-block"
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) * 0.35); y.set((e.clientY - r.top - r.height / 2) * 0.35); }}
      onMouseLeave={() => { x.set(0); y.set(0); }}>{children}</motion.div>
  );
}

function Cursor() {
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 300, damping: 28 }), sy = useSpring(y, { stiffness: 300, damping: 28 });
  useEffect(() => {
    const m = (e: globalThis.MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", m); return () => window.removeEventListener("mousemove", m);
  }, [x, y]);
  return (
    <>
      <motion.div style={{ x: sx, y: sy }} className="pointer-events-none fixed left-0 top-0 z-50 hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary mix-blend-difference md:block" />
      <motion.div style={{ x: sx, y: sy }} className="pointer-events-none fixed left-0 top-0 z-0 hidden h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl md:block" />
    </>
  );
}

function Typer() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => x + 1), 2200); return () => clearInterval(t); }, []);
  return (
    <span className="relative inline-flex h-[1.4em] overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span key={i} className="text-accent" initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }} transition={{ duration: 0.5, ease }}>{roles[i % roles.length]}</motion.span>
      </AnimatePresence>
    </span>
  );
}

function SectionTag({ n, label }: { n: string; label: string }) {
  return (
    <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
      <span className="text-primary">{n}</span><span className="h-px w-10 bg-primary" />{label}
    </p>
  );
}

function TestPanel() {
  const tests = ["loads experience", "validates skills", "checks API contracts", "survives load test", "reports bugs clearly"];
  const [done, setDone] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDone((d) => (d >= tests.length + 3 ? 0 : d + 1)), 650);
    return () => clearInterval(t);
  }, [tests.length]);
  return (
    <Tilt className="scanline p-6 font-mono text-sm">
      <div className="mb-4 flex gap-2"><span className="h-3 w-3 rounded-full bg-destructive" /><span className="h-3 w-3 rounded-full bg-primary" /><span className="h-3 w-3 rounded-full bg-pass" /></div>
      <p className="mb-4 text-muted-foreground">$ npx playwright test portfolio.spec</p>
      {tests.map((t, k) => (
        <p key={t} className="flex gap-3 py-1">
          <span className={k < done ? "text-pass" : "text-muted-foreground"}>{k < done ? "✓" : k === done ? "◌" : "·"}</span>
          <span className={k < done ? "" : "text-muted-foreground"}>{t}</span>
        </p>
      ))}
      <div className="mt-4 h-1 overflow-hidden rounded bg-muted">
        <motion.div className="h-full bg-pass" animate={{ width: `${Math.min(done / tests.length, 1) * 100}%` }} />
      </div>
      <p className="mt-3 text-pass">{Math.min(done, tests.length)} passed · 0 failed</p>
    </Tilt>
  );
}

function Experience() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 50%"] });
  const h = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });
  return (
    <ol ref={ref} className="relative mt-14 space-y-10 pl-10">
      <span className="absolute left-3 top-0 h-full w-px bg-border" />
      <motion.span style={{ scaleY: h }} className="absolute left-3 top-0 h-full w-px origin-top bg-gradient-to-b from-primary to-accent" />
      {jobs.map((j, k) => (
        <li key={j.co} className="relative">
          <motion.span initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true, margin: "-120px" }}
            className="absolute -left-[34px] top-7 h-4 w-4 rounded-full bg-primary shadow-[var(--glow)]" />
          <motion.div initial={{ opacity: 0, x: k % 2 ? 60 : -60 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease }}>
            <Tilt className="p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-2xl font-bold">{j.role}</h3>
                <span className="rounded-full border px-3 py-1 font-mono text-xs text-muted-foreground">{j.when} · {j.mode}</span>
              </div>
              <p className="mt-1 font-mono text-sm text-primary">@ {j.co}</p>
              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                {j.pts.map((p) => <li key={p} className="flex gap-3"><span className="text-accent">▹</span>{p}</li>)}
              </ul>
            </Tilt>
          </motion.div>
        </li>
      ))}
    </ol>
  );
}

function Index() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -160]);
  const heroO = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const marqX = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const nav = [["about", "About"], ["experience", "Experience"], ["skills", "Skills"], ["contact", "Contact"]];
  const tickerItems = ["Cypress", "Playwright", "Appium", "Postman", "JMeter", "Jira", "Web3", "Blockchain", "E-commerce", "IoT"];

  return (
    <div className="grain relative min-h-screen overflow-x-hidden">
      <Cursor />
      <motion.div style={{ scaleX: progress }} className="fixed left-0 right-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-primary to-accent" />

      <motion.header initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease }}
        className="fixed left-1/2 top-4 z-40 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2">
        <div className="glass flex items-center justify-between rounded-full px-6 py-3">
          <a href="#top" className="font-mono text-sm font-bold">sunbal<span className="text-primary">.test()</span></a>
          <nav className="hidden gap-7 font-mono text-xs uppercase sm:flex">
            {nav.map(([id, l]) => (
              <a key={id} href={`#${id}`} className="group relative">{l}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all group-hover:w-full" /></a>
            ))}
          </nav>
        </div>
      </motion.header>

      {/* Hero */}
      <section id="top" className="relative flex min-h-screen items-center">
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 40, 0] }} transition={{ duration: 18, repeat: Infinity }}
          className="absolute -right-40 top-20 h-[520px] w-[520px] rounded-full bg-primary/20 blur-[120px]" />
        <motion.div animate={{ scale: [1.2, 1, 1.2] }} transition={{ duration: 14, repeat: Infinity }}
          className="absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full bg-accent/15 blur-[120px]" />
        <motion.div style={{ y: heroY, opacity: heroO }} className="relative mx-auto grid max-w-6xl gap-14 px-6 pt-28 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pass" /><span className="relative h-2 w-2 rounded-full bg-pass" /></span>
              Open to opportunities
            </motion.p>
            <h1 className="text-5xl font-bold leading-[1] tracking-tight md:text-7xl">
              <SplitText text="Hi, I'm Sunbal." />
              <br /><SplitText text="I break things" delay={0.3} />
              <br /><SplitText text="so users don't." delay={0.6} className="text-gradient italic" />
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-8 font-mono text-lg">
              QA Engineer · <Typer />
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }} className="mt-10 flex flex-wrap gap-4">
              <Magnetic><a href="#contact" className="block rounded-full bg-primary px-7 py-3.5 font-mono text-sm font-bold text-primary-foreground shadow-[var(--glow)] transition-transform hover:scale-105">Get in touch →</a></Magnetic>
              <Magnetic><a href={resume} download className="glass block rounded-full px-7 py-3.5 font-mono text-sm transition-colors hover:border-primary">Download CV ↓</a></Magnetic>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.85, rotate: 4 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 0.6, duration: 1, ease }}>
            <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}><TestPanel /></motion.div>
          </motion.div>
        </motion.div>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs text-muted-foreground">scroll ↓</motion.div>
      </section>

      {/* Stats */}
      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 md:grid-cols-4">
        {stats.map((s, k) => (
          <Reveal key={s.l} delay={k * 0.1}>
            <Tilt className="p-7"><p className="text-5xl font-bold text-gradient"><Counter to={s.n} suffix={s.s} /></p>
              <p className="mt-2 font-mono text-xs uppercase text-muted-foreground">{s.l}</p></Tilt>
          </Reveal>
        ))}
      </section>

      {/* Ticker */}
      <div className="my-24 -rotate-2 overflow-hidden border-y bg-primary py-5 text-primary-foreground">
        <motion.div style={{ x: marqX }}>
          <div className="marquee flex w-max gap-12 whitespace-nowrap text-3xl font-bold uppercase">
            {[...tickerItems, ...tickerItems, ...tickerItems].map((t, k) => <span key={k}>{t} ✦</span>)}
          </div>
        </motion.div>
      </div>

      {/* About */}
      <section id="about" className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <SectionTag n="01" label="About" />
          <h2 className="mt-4 max-w-3xl text-4xl font-bold md:text-6xl">Quality across <span className="text-gradient">manual & automated</span> testing.</h2>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">I work with Cypress, Playwright, Appium, Postman and JMeter. I write clear bug reports and work closely with developers to get fixes shipped.</p>
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((h, k) => (
            <Reveal key={h.t} delay={k * 0.08}>
              <Tilt className="group h-full p-7">
                <p className="font-mono text-xs text-primary">#{String(k + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-xl font-bold transition-colors group-hover:text-accent">{h.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{h.d}</p>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="mx-auto max-w-4xl px-6 py-28">
        <Reveal><SectionTag n="02" label="Experience" /><h2 className="mt-4 text-4xl font-bold md:text-6xl">Test run history</h2></Reveal>
        <Experience />
      </section>

      {/* Skills */}
      <section id="skills" className="mx-auto max-w-6xl px-6 py-16">
        <Reveal><SectionTag n="03" label="Skills" /><h2 className="mt-4 text-4xl font-bold md:text-6xl">Toolkit</h2></Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {Object.entries(skills).map(([cat, list], ci) => (
            <Reveal key={cat} delay={ci * 0.1}>
              <Tilt className="h-full p-7">
                <p className="mb-5 font-mono text-sm uppercase text-primary">{cat}</p>
                <div className="flex flex-wrap gap-2">
                  {list.map((s, k) => (
                    <motion.span key={s} initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                      transition={{ delay: k * 0.05, type: "spring", stiffness: 300 }} whileHover={{ y: -4, scale: 1.08 }}
                      className="cursor-default rounded-full border bg-muted px-4 py-1.5 font-mono text-xs transition-colors hover:border-accent hover:text-accent">{s}</motion.span>
                  ))}
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 grid gap-5 md:grid-cols-2">
          <Tilt className="p-7"><p className="font-mono text-xs uppercase text-muted-foreground">Education</p>
            <p className="mt-2 text-xl font-bold">Bachelor of Computer Science</p><p className="text-muted-foreground">Karachi University · 2020 – 2022</p></Tilt>
          <Tilt className="p-7"><p className="font-mono text-xs uppercase text-muted-foreground">Languages</p><p className="mt-2 text-xl font-bold">English, Urdu</p></Tilt>
        </Reveal>
      </section>

      {/* Contact */}
      <section id="contact" className="relative mt-24 overflow-hidden py-32">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/30" />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <Reveal><SectionTag n="04" label="Contact" /></Reveal>
          <h2 className="mt-6 text-5xl font-bold md:text-8xl"><SplitText text="Let's ship something" /><br /><span className="text-gradient italic">bug-free.</span></h2>
          <Reveal delay={0.2} className="mt-14 grid gap-4 font-mono text-sm md:grid-cols-3">
            {[["mailto:sunbalsabir129@gmail.com", "✉ sunbalsabir129@gmail.com"], ["tel:+923418719793", "☏ +92 341 8719793"], ["https://linkedin.com/in/sunbal-sabir-45446232b", "in / sunbal-sabir"]].map(([h, l]) => (
              <Magnetic key={h}><a href={h} target="_blank" rel="noreferrer" className="glass block rounded-2xl p-5 transition-colors hover:border-primary hover:text-primary">{l}</a></Magnetic>
            ))}
          </Reveal>
          <p className="mt-20 font-mono text-xs text-muted-foreground">© 2026 Sunbal Sabir · Karachi, Pakistan</p>
        </div>
      </section>
    </div>
  );
}
