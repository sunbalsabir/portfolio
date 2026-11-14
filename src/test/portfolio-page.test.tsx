import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  contactLinks,
  facts,
  jobs,
  navItems,
  person,
  projects,
  releaseChecks,
  skills,
  workflow,
} from "@/data/profile";
import { Index } from "@/routes/index";

describe("Portfolio page", () => {
  it("introduces Sunbal with a single top-level heading", () => {
    render(<Index />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(person.name);
    expect(screen.getByText(/I break things/)).toHaveTextContent("so users don't.");
  });

  it("exposes header, main and footer landmarks plus a skip link", () => {
    render(<Index />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("id", "main");
    expect(screen.getByRole("contentinfo")).toHaveTextContent(person.location);
    expect(screen.getByRole("link", { name: /skip to content/i })).toHaveAttribute("href", "#main");
  });

  it("links every navigation item to a section that exists on the page", () => {
    const { container } = render(<Index />);
    const nav = screen.getByRole("navigation", { name: /sections/i });
    for (const { id, label } of navItems) {
      const link = within(nav).getByRole("link", { name: label });
      expect(link).toHaveAttribute("href", `#${id}`);
      expect(container.querySelector(`section#${id}`)).not.toBeNull();
    }
  });

  it("renders one h2 per content section in reading order", () => {
    render(<Index />);
    // SplitText renders words with non-breaking spaces; normalise before matching.
    const h2s = screen
      .getAllByRole("heading", { level: 2 })
      .map((h) => (h.textContent ?? "").replace(/\u00a0/g, " "));
    expect(h2s).toHaveLength(6);
    expect(h2s[0]).toMatch(/manual and automated/i);
    expect(h2s[1]).toMatch(/how a release gets checked/i);
    expect(h2s[2]).toMatch(/selected work/i);
    expect(h2s[3]).toMatch(/where i've worked/i);
    expect(h2s[4]).toMatch(/toolkit/i);
    expect(h2s[5]).toMatch(/let's ship something/i);
  });

  it("shows every role from the CV with its company, dates and bullet points", () => {
    render(<Index />);
    const experience = screen.getByRole("region", { name: /where i've worked/i });
    const articles = within(experience).getAllByRole("article");
    expect(articles).toHaveLength(jobs.length);
    jobs.forEach((job, i) => {
      const article = articles[i]!;
      expect(within(article).getByRole("heading", { level: 3 })).toHaveTextContent(job.role);
      expect(article).toHaveTextContent(job.company);
      expect(article).toHaveTextContent(job.period);
      expect(article).toHaveTextContent(job.mode);
      for (const point of job.points) expect(article).toHaveTextContent(point);
    });
  });

  it("lists every skill under its category", () => {
    render(<Index />);
    for (const [category, list] of Object.entries(skills)) {
      const ul = screen.getByRole("list", { name: category });
      const items = within(ul)
        .getAllByRole("listitem")
        .map((li) => li.textContent);
      expect(items).toEqual(list);
    }
  });

  it("renders the at-a-glance facts with their labels", () => {
    render(<Index />);
    const strip = screen.getByRole("region", { name: /at a glance/i });
    for (const f of facts) {
      expect(within(strip).getByText(f.label)).toBeInTheDocument();
      if (f.kind === "text") expect(within(strip).getByText(f.value)).toBeInTheDocument();
    }
  });

  it("presents each project with its details, stack and case study link", () => {
    render(<Index />);
    const section = screen.getByRole("region", { name: /selected work/i });
    const articles = within(section).getAllByRole("article");
    expect(articles).toHaveLength(projects.length);
    projects.forEach((p, i) => {
      const article = articles[i]!;
      expect(within(article).getByRole("heading", { level: 3 })).toHaveTextContent(p.title);
      expect(article).toHaveTextContent(p.tagline);
      expect(article).toHaveTextContent(p.summary);
      for (const s of p.stats) expect(article).toHaveTextContent(`${s.value}${s.label}`);
      for (const h of p.highlights) expect(article).toHaveTextContent(h.title);
      for (const t of p.stack) expect(article).toHaveTextContent(t);
      const pdf = within(article).queryByRole("link", { name: /full case study/i });
      if (p.caseStudy) expect(pdf).toHaveAttribute("href", expect.stringMatching(/\.pdf$/));
      else expect(pdf).toBeNull();
    });
  });

  it("labels designed-but-unbuilt work as such", () => {
    render(<Index />);
    for (const p of projects.filter((x) => x.status)) {
      const article = document.getElementById(`project-${p.slug}`)!;
      expect(article).toHaveTextContent(p.status!);
    }
  });

  it("introduces the candidate with the CV summary, not just a tool list", () => {
    render(<Index />);
    expect(screen.getByText(person.summary)).toBeInTheDocument();
  });

  it("offers the CV as a downloadable PDF", () => {
    render(<Index />);
    const links = screen.getAllByRole("link", { name: /download cv/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
    for (const link of links) {
      expect(link).toHaveAttribute("download");
      expect(link.getAttribute("href")).toMatch(/\.pdf$/);
    }
  });

  it("wires contact links correctly and only opens external ones in a new tab", () => {
    render(<Index />);
    for (const c of contactLinks) {
      const link = screen.getByRole("link", { name: c.label });
      expect(link).toHaveAttribute("href", c.href);
      if (c.external) {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link.getAttribute("rel")).toContain("noopener");
      } else {
        expect(link).not.toHaveAttribute("target");
      }
    }
  });

  it("toggles dark mode and remembers the choice", () => {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("theme");
    render(<Index />);
    const toggle = screen.getByRole("button", { name: /switch to dark theme/i });
    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(screen.getByRole("button", { name: /switch to light theme/i })).toBeInTheDocument();
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("theme");
  });

  it("opens a mobile menu with the same section links", () => {
    render(<Index />);
    expect(screen.queryByRole("navigation", { name: /mobile sections/i })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
    const menu = screen.getByRole("navigation", { name: /mobile sections/i });
    for (const { id, label } of navItems) {
      expect(within(menu).getByRole("link", { name: new RegExp(`^${label}`) })).toHaveAttribute(
        "href",
        `#${id}`,
      );
    }
    fireEvent.click(within(menu).getByRole("link", { name: /^About/ }));
    // The panel fades out, so assert on the trigger's state rather than DOM removal.
    expect(screen.getByRole("button", { name: /open menu/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("lets the reader step through the release process with real tabs", () => {
    render(<Index />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(workflow.length);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    fireEvent.click(tabs[2]!);
    expect(tabs[2]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("aria-selected", "false");
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAttribute("aria-labelledby", tabs[2]!.id);
    expect(within(panel).getByRole("heading", { level: 3 })).toHaveTextContent(workflow[2]!.title);
    for (const tool of workflow[2]!.tools) expect(panel).toHaveTextContent(tool);
  });

  it("falls back to the CSS hero when WebGL is unavailable", () => {
    render(<Index />);
    expect(screen.getByTestId("hero-scene")).toHaveAttribute("data-webgl", "off");
  });

  it("puts social links in a rail that mirrors the contact links", () => {
    render(<Index />);
    const rail = screen.getByRole("navigation", { name: /social links/i });
    for (const c of contactLinks) {
      expect(within(rail).getByRole("link", { name: c.short })).toHaveAttribute("href", c.href);
    }
  });

  it("shows the current year in the footer", () => {
    render(<Index />);
    expect(screen.getByRole("contentinfo")).toHaveTextContent(String(new Date().getFullYear()));
  });
});

describe("Release check card", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("ticks every gate green in turn and can be run again", () => {
    render(<Index />);
    const card = screen.getByRole("region", { name: /release check/i });
    const total = releaseChecks.length;
    for (const c of releaseChecks) expect(card).toHaveTextContent(c.title);
    expect(within(card).getByTestId("release-progress")).toHaveTextContent(`0 / ${total} checks`);

    // The first run waits for the splash screen to clear, then ticks each gate in turn.
    act(() => vi.advanceTimersByTime(10_000));
    expect(within(card).getByTestId("release-progress")).toHaveTextContent(
      `${total} / ${total} checks`,
    );
    expect(within(card).getAllByText("pass")).toHaveLength(total);

    fireEvent.click(within(card).getByRole("button", { name: /run again/i }));
    expect(within(card).getByTestId("release-progress")).toHaveTextContent(`0 / ${total} checks`);
    act(() => vi.advanceTimersByTime(800));
    expect(within(card).getByTestId("release-progress")).toHaveTextContent(`1 / ${total} checks`);
  });
});
