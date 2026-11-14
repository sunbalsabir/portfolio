/**
 * Single source of truth for everything the portfolio says about Sunbal.
 * The page renders from this file and the test suites assert against it,
 * so content changes here propagate everywhere and stay verifiable.
 */

export const person = {
  name: "Sunbal Sabir",
  firstName: "Sunbal",
  title: "QA Engineer",
  tagline: "Manual & Automation Testing | Blockchain, Web3 & E-commerce",
  location: "Karachi, Pakistan",
  timezone: "PKT · UTC+5",
  /** How you want to work. Edit freely. */
  workMode: "Remote or hybrid",
  /** Shown in the hero badge. Keep it to a few words. */
  openTo: "Open to QA & automation roles",
  email: "sunbalsabir129@gmail.com",
  phone: "+92 341 8719793",
  phoneHref: "tel:+923418719793",
  linkedin: "https://linkedin.com/in/sunbal-sabir-45446232b",
  summary:
    "QA Engineer with 4+ years in manual and automation testing across web, mobile and API products in blockchain, Web3, e-commerce and IoT.",
  available: true,
} as const;

export const roles = [
  "Automation Testing",
  "Manual Testing",
  "API Testing",
  "Load Testing",
  "Web3 QA",
] as const;

export type Fact =
  | { kind: "number"; value: number; suffix: string; label: string }
  | { kind: "text"; value: string; label: string };

/** The "at a glance" strip under the hero: what a recruiter checks first. */
export const facts: Fact[] = [
  { kind: "number", value: 4, suffix: "+", label: "Years in QA" },
  { kind: "number", value: 4, suffix: "", label: "Domains tested" },
  { kind: "text", value: "Karachi", label: person.timezone },
  { kind: "text", value: person.workMode, label: "Work mode" },
];

export type Highlight = { title: string; description: string };

export const highlights: Highlight[] = [
  {
    title: "Blockchain & Web3",
    description:
      "Automated suites for a blockchain app and its admin panel, covering core user and admin flows.",
  },
  {
    title: "Performance Testing",
    description: "Load and stress tests in JMeter that surfaced e-commerce bottlenecks.",
  },
  {
    title: "API Validation",
    description: "End-to-end API checks with Postman across release cycles.",
  },
  {
    title: "Root-Cause Debugging",
    description: "Chrome DevTools investigations that trace bugs back to their source.",
  },
  {
    title: "QA Processes",
    description: "Helped set up consistent testing and quality standards across teams.",
  },
  {
    title: "Clear Bug Reports",
    description: "Defects with precise steps to reproduce, tracked through to resolution.",
  },
];

export type Job = {
  role: string;
  company: string;
  period: string;
  mode: "Hybrid" | "Remote" | "On-site";
  points: string[];
};

export const jobs: Job[] = [
  {
    role: "QA Engineer (Admin Team)",
    company: "MSQUARE GLOBAL",
    period: "Feb 2025 – Present",
    mode: "Hybrid",
    points: [
      "Built and maintain automated suites for a blockchain app and its admin panel, covering core user and admin flows and cutting regression time",
      "Designed and ran JMeter load and stress tests for an e-commerce site, identified performance bottlenecks and handed findings to developers",
      "Manual functional, regression and exploratory testing on a Web3 project, reporting defects with clear steps to reproduce",
      "Validated APIs with Postman and worked with developers and product across release cycles",
    ],
  },
  {
    role: "QA Engineer",
    company: "Auton8",
    period: "2023 – Feb 2025",
    mode: "Remote",
    points: [
      "Developed automated test suites that protected the quality and accuracy of shipped features",
      "Used Chrome DevTools and other debugging tools to find and diagnose issues before release",
      "Worked with developers to trace bugs to root cause, verified fixes and tracked reports through to resolution",
    ],
  },
  {
    role: "QA Engineer",
    company: "IOT Solutions",
    period: "2021 – 2023",
    mode: "Remote",
    points: [
      "Wrote and executed test plans and test scripts to find and document software defects",
      "Helped set up QA processes and consistent quality standards across engineering teams",
    ],
  },
];

export const skills: Record<string, string[]> = {
  Automation: ["Cypress", "Playwright", "Appium"],
  "API & Performance": ["Postman", "JMeter"],
  "Testing & QA": [
    "Functional",
    "Regression",
    "Smoke",
    "Exploratory",
    "Mobile",
    "Test Planning",
    "Test Case Design",
    "Bug Tracking",
    "Requirement Analysis",
  ],
  Tools: ["Jira", "GitHub", "Notion", "Chrome DevTools"],
};

/**
 * Selected work. The "Selected work" section renders only when this list is
 * non-empty. Add real projects with concrete outcomes here, e.g.
 *   { title: "Admin panel regression suite", context: "MSQUARE GLOBAL · 2025",
 *     problem: "Manual regression took two days per release.",
 *     approach: "Playwright suite over 40 core flows, run in CI on every merge.",
 *     outcome: "Regression down to 20 minutes; 3 production-blocking bugs caught pre-release.",
 *     tools: ["Playwright", "GitHub Actions"], link: "https://github.com/…" }
 */
export type Project = {
  /** Anchor id and key for the project's visual. */
  slug: "nexus" | "cypress-craft" | "trustqa";
  title: string;
  /** Short category line shown above the title. */
  kind: string;
  /** Set for work that is designed but not yet built. */
  status?: string;
  tagline: string;
  summary: string;
  stats: { value: string; label: string }[];
  steps: string[];
  highlights: { title: string; body: string }[];
  /** Tech stack, or focus areas where the source names no specific tech. */
  stack: string[];
  stackLabel: "Tech stack" | "Focus";
  /** Set when the full case study PDF can be shared publicly. */
  caseStudy?: "nexus" | "cypress-craft";
};

/** Taken from the project PDFs: Nexus case study, Cypress Automation Craft AI, SUT TrustQA overview. */
export const projects: Project[] = [
  {
    slug: "nexus",
    title: "Nexus",
    kind: "AI agent · Full-stack SaaS",
    tagline: "An AI QA engineer for every pull request.",
    summary:
      "Nexus reads a pull request and its diff, works out what the change affects, writes and runs the Playwright tests for those areas with the browser recorded, and posts an evidence-backed QA report straight onto the PR.",
    stats: [
      { value: "~26k", label: "lines of TypeScript" },
      { value: "9", label: "specialised AI agents" },
      { value: "3", label: "ways to trigger a review" },
    ],
    steps: [
      "Understands the change",
      "Maps the impact",
      "Writes & runs tests",
      "Reports with evidence",
    ],
    highlights: [
      {
        title: "Impact-aware test selection",
        body: "Each changed file is traced through components to the routes, rules and tests it reaches. Full regression runs only for cross-cutting changes.",
      },
      {
        title: "Guardrails on generated code",
        body: "Generated Playwright code is parsed and linted before it runs. Hard waits, force: true, un-awaited actions and test.only are rejected.",
      },
      {
        title: "Honest verdicts",
        body: "Failures are classified (application bug, locator changed, environment failure) with confidence and evidence. Zero executed tests is never a pass.",
      },
      {
        title: "Safe with untrusted code",
        body: "Signed webhooks, credential stripping, a production guard and prompt-injection-aware handling of PR text.",
      },
    ],
    stack: [
      "TypeScript",
      "Node.js 22",
      "Express",
      "Playwright",
      "Google Gemini",
      "Zod",
      "Next.js 15",
      "React 19",
      "SQLite / PostgreSQL",
      "GitHub Actions",
      "Docker",
      "Vercel",
      "Railway",
    ],
    stackLabel: "Tech stack",
    caseStudy: "nexus",
  },
  {
    slug: "cypress-craft",
    title: "Cypress Automation Craft AI",
    kind: "Chrome extension · Manifest V3",
    tagline: "Record a flow once, get maintainable Cypress tests.",
    summary:
      "A browser extension that records what you do on a web page and turns it into Cypress test code: Page Object Model classes, spec files and multi-scenario test suites, exported as a ready-to-run project. Selector healing and assertion synthesis are AI-assisted.",
    stats: [
      { value: "9", label: "tier selector strategy" },
      { value: "5", label: "auto-generated test scenarios" },
      { value: "3", label: "AI providers, incl. offline" },
      { value: "~2.7k", label: "lines of vanilla JS" },
    ],
    steps: ["Record", "Capture", "Locate", "Generate", "Enhance & export"],
    highlights: [
      {
        title: "Stable selectors",
        body: "A 9-tier ladder from data-cy attributes down to XPath, with dynamic-ID detection and a uniqueness check for every locator.",
      },
      {
        title: "Page Object Model output",
        body: "Steps are grouped by page into classes, and composite flows such as login(user, pass) are detected automatically. JavaScript or TypeScript.",
      },
      {
        title: "Wider coverage from one recording",
        body: "Positive, negative, boundary, security (XSS/SQLi) and data-driven scenarios, plus a BDD Gherkin spec of the flow.",
      },
      {
        title: "Private and offline-first",
        body: "A built-in rule engine needs no API key. Gemini and OpenAI are opt-in with graceful fallback, and the ZIP exporter is hand-written with zero dependencies.",
      },
    ],
    stack: [
      "JavaScript (ES2020)",
      "Chrome Extensions MV3",
      "Service Worker",
      "Side Panel API",
      "Cypress",
      "Page Object Model",
      "TypeScript output",
      "Gemini API",
      "OpenAI API",
    ],
    stackLabel: "Tech stack",
    caseStudy: "cypress-craft",
  },
  {
    slug: "trustqa",
    title: "SUT TrustQA",
    kind: "Continuous quality & reliability platform",
    status: "Platform design · Oct 2026",
    tagline: "Did the transaction stay correct across the whole system?",
    summary:
      "A continuous quality and reliability platform designed around the SUT transaction ecosystem. Instead of testing only a web app, TrustQA executes a critical transaction, observes it in the mobile app, backend/API, web admin and on-chain, compares every system against expected behaviour, and turns the result into reproducible evidence.",
    stats: [
      { value: "4", label: "systems verified per transaction" },
      { value: "9", label: "core platform modules" },
      { value: "6", label: "result types, from PASS to BLOCKED" },
    ],
    steps: [
      "Define",
      "Model",
      "Execute",
      "Observe",
      "Compare",
      "Detect",
      "Collect evidence",
      "Report",
      "Reverify",
    ],
    highlights: [
      {
        title: "Cross-system transaction verification",
        body: "A deposit is followed from the mobile app through the API, admin approval and blockchain to the final balance, and every system's value is compared.",
      },
      {
        title: "Independent calculation checks",
        body: "Expected results are calculated separately and compared with the system's own. A mismatch is reported as an anomaly, not labelled a vulnerability.",
      },
      {
        title: "Transaction state machines",
        body: "Deposits and withdrawals are modelled as configurable state machines, so unexpected transitions are caught.",
      },
      {
        title: "Evidence, not simulated passes",
        body: "Every run has a unique ID and step-level evidence: screenshots, traces, API data and transaction hashes.",
      },
    ],
    stack: [
      "QA engineering",
      "Web3 reliability",
      "Cross-system verification",
      "Mobile, web & API adapters",
      "Blockchain verification",
    ],
    stackLabel: "Focus",
  },
];

/** e.g. "ISTQB Certified Tester – Foundation Level (2024)". Shown when non-empty. */
export const certifications: string[] = [];

/** In-page navigation. Each id must match a section id rendered on the page. */
export const navItems: { id: string; label: string }[] = [
  { id: "about", label: "About" },
  { id: "process", label: "Process" },
  ...(projects.length > 0 ? [{ id: "work", label: "Projects" }] : []),
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

export const education = {
  degree: "Bachelor of Computer Science",
  school: "Karachi University",
  period: "2020 – 2022",
} as const;

export const languages = ["English", "Urdu"] as const;

export const tickerItems = [
  "Cypress",
  "Playwright",
  "Appium",
  "Postman",
  "JMeter",
  "Jira",
  "Web3",
  "Blockchain",
  "E-commerce",
  "IoT",
] as const;

export type ContactLink = {
  href: string;
  label: string;
  /** Short name used by the social rail and footer. */
  short: string;
  icon: "mail" | "phone" | "linkedin";
  external: boolean;
};

export const contactLinks: ContactLink[] = [
  {
    href: `mailto:${person.email}`,
    label: `✉ ${person.email}`,
    short: "Email",
    icon: "mail",
    external: false,
  },
  {
    href: person.phoneHref,
    label: `☏ ${person.phone}`,
    short: "Phone",
    icon: "phone",
    external: false,
  },
  {
    href: person.linkedin,
    label: "in / sunbal-sabir",
    short: "LinkedIn",
    icon: "linkedin",
    external: true,
  },
];

/* ------------------------------------------------------------------ */
/* Process and presentation data. Descriptive, not metrics: everything   */
/* below restates what the CV already says about how Sunbal works.      */
/* ------------------------------------------------------------------ */

/** The hero "Release check" card: the gates a build passes before it ships. */
export type ReleaseCheck = { title: string; detail: string };

export const releaseChecks: ReleaseCheck[] = [
  { title: "Smoke and sanity", detail: "Build is stable enough to test" },
  { title: "Functional and regression", detail: "Core user and admin flows still work" },
  { title: "API validation", detail: "Payloads, status codes, response logic" },
  { title: "Load and stress", detail: "JMeter run, bottlenecks logged" },
  { title: "Release verification", detail: "Post-deploy smoke run on production" },
];

/** Three working principles shown in the About section. */
export type Principle = { title: string; body: string };

export const principles: Principle[] = [
  {
    title: "Find it early",
    body: "The cheapest bug is the one caught in a requirements review, not in production.",
  },
  {
    title: "Test the risk",
    body: "Cover the flows that move money and data, not only the happy path.",
  },
  {
    title: "Report so it gets fixed",
    body: "Exact steps, expected versus actual, and the root cause when I can trace it.",
  },
];

/** "How a release gets checked": the step-by-step process section. */
export type Step = { title: string; short: string; body: string; tools: string[] };

export const workflow: Step[] = [
  {
    title: "Read the requirements before the build",
    short: "Requirements",
    body: "Requirement analysis starts before the first commit. Ambiguous specs become questions for product, not defects in production.",
    tools: ["Requirement Analysis", "Jira", "Notion"],
  },
  {
    title: "Design the tests around the risk",
    short: "Test design",
    body: "Test plans and test cases that cover the core flows, the edge cases and the regressions that bit the team last time.",
    tools: ["Test Planning", "Test Case Design"],
  },
  {
    title: "Test by hand first",
    short: "Manual pass",
    body: "Functional, regression, smoke and exploratory passes on web and mobile, because the bugs that matter rarely sit on the happy path.",
    tools: ["Functional", "Regression", "Exploratory", "Mobile"],
  },
  {
    title: "Automate what repeats",
    short: "Automation",
    body: "Cypress, Playwright and Appium suites for user and admin flows, so every release gets the same coverage and regression time drops.",
    tools: ["Cypress", "Playwright", "Appium"],
  },
  {
    title: "Check the APIs and the load",
    short: "API & load",
    body: "Postman for payloads, status codes and logic. JMeter load and stress runs that show where a site slows down before customers do.",
    tools: ["Postman", "JMeter"],
  },
  {
    title: "Report, verify, close",
    short: "Release",
    body: "Defects with exact steps to reproduce, root cause traced in DevTools, fixes verified and tracked through to resolution.",
    tools: ["Jira", "Chrome DevTools", "Bug Tracking"],
  },
];

/** "The toolbox": each tool with the job it does for Sunbal. */
export type Tool = { name: string; use: string };

export const toolbox: Tool[] = [
  { name: "Cypress", use: "End-to-end web automation" },
  { name: "Playwright", use: "Cross-browser automation" },
  { name: "Appium", use: "Mobile app automation" },
  { name: "Postman", use: "REST API validation" },
  { name: "JMeter", use: "Load and stress testing" },
  { name: "Jira", use: "Defects, boards, releases" },
  { name: "GitHub", use: "Version control and CI" },
  { name: "Chrome DevTools", use: "Root-cause debugging" },
];

/** Lines typed into the decorative terminal card in the About section. */
export type TerminalLine = { cmd: string; out: string[] };

export const terminalLines: TerminalLine[] = [
  { cmd: "whoami", out: [`${person.firstName.toLowerCase()} · ${person.title} · Karachi, PKT`] },
  { cmd: "cat stack.txt", out: ["Cypress  Playwright  Appium", "Postman  JMeter  Jira"] },
  {
    cmd: "npm run release-check",
    out: [
      "✓ smoke",
      "✓ regression",
      "✓ api",
      "✓ load",
      "✓ release verification",
      "all green · ready to ship",
    ],
  },
];
