import { describe, expect, it } from "vitest";

import { contactLinks, facts, jobs, navItems, person, skills, tickerItems } from "@/data/profile";

/**
 * Guards against the portfolio drifting from the facts it displays.
 * The stat tiles are derived numbers, so these tests recompute them.
 */
describe("Profile data integrity", () => {
  it("counts tested domains from the domains shown in the ticker", () => {
    const domains = tickerItems.filter((t) =>
      ["Web3", "Blockchain", "E-commerce", "IoT"].includes(t),
    );
    const fact = facts.find((f) => f.label === "Domains tested");
    expect(fact?.kind).toBe("number");
    expect(fact?.value).toBe(domains.length);
  });

  it("states location, timezone and work mode for recruiters", () => {
    const labels = facts.map((f) => f.label);
    expect(labels).toContain(person.timezone);
    expect(labels).toContain("Work mode");
  });

  it("writes every experience bullet as an outcome, not a bare duty", () => {
    // Every bullet should say what it achieved or produced, not only what was done.
    const outcomeWords =
      /(cover|cut|identif|protect|find|found|diagnos|trace|verif|track|document|standard|report|release)/i;
    for (const job of jobs) for (const p of job.points) expect(p, p).toMatch(outcomeWords);
  });

  it("lists the current role first", () => {
    expect(jobs[0]?.period).toMatch(/present/i);
  });

  it("has no duplicate skills across categories", () => {
    const all = Object.values(skills).flat();
    expect(new Set(all).size).toBe(all.length);
  });

  it("uses unique navigation ids", () => {
    const ids = navItems.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps the phone link in sync with the displayed number", () => {
    expect(person.phoneHref).toBe(`tel:${person.phone.replace(/\s+/g, "")}`);
  });

  it("builds contact links from the person record", () => {
    const hrefs = contactLinks.map((c) => c.href);
    expect(hrefs).toContain(`mailto:${person.email}`);
    expect(hrefs).toContain(person.phoneHref);
    expect(hrefs).toContain(person.linkedin);
    expect(person.email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]+$/i);
    expect(person.linkedin).toMatch(/^https:\/\/(www\.)?linkedin\.com\/in\//);
  });
});
