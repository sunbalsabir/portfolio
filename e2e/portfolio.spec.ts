import { expect, test, type Page } from "@playwright/test";

import { contactLinks, jobs, navItems, person, projects } from "../src/data/profile";

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "page should not scroll horizontally").toBeLessThanOrEqual(0);
}

test.describe("Portfolio", () => {
  test("loads without console errors or failed requests", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("requestfailed", (req) => errors.push(`${req.failure()?.errorText} ${req.url()}`));

    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(`${person.name} — ${person.title}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(person.name);
    expect(errors).toEqual([]);
  });

  test("publishes correct metadata for search and link previews", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /QA Engineer/,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      `${person.name} — ${person.title}`,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /og\.png$/);
    await expect(page.locator('meta[name="author"]')).toHaveAttribute("content", person.name);

    const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
    const schema = JSON.parse(ld ?? "{}");
    expect(schema["@type"]).toBe("Person");
    expect(schema.name).toBe(person.name);
    expect(schema.jobTitle).toBe(person.title);
  });

  test("serves the Open Graph image and the CV as real files", async ({ page, request }) => {
    await page.goto("/");
    const og = await request.get("/og.png");
    expect(og.status()).toBe(200);
    expect(og.headers()["content-type"]).toContain("image/png");

    const cvHref = await page
      .getByRole("link", { name: /download cv/i })
      .first()
      .getAttribute("href");
    expect(cvHref).toMatch(/\.pdf$/);
    const cv = await request.get(cvHref!);
    expect(cv.status()).toBe(200);
    expect(cv.headers()["content-type"]).toContain("application/pdf");
    expect((await cv.body()).subarray(0, 4).toString()).toBe("%PDF");
  });

  test("renders every job from the CV in order", async ({ page }) => {
    await page.goto("/");
    const articles = page.locator("#experience").getByRole("article");
    await expect(articles).toHaveCount(jobs.length);
    for (const [i, job] of jobs.entries()) {
      await articles.nth(i).scrollIntoViewIfNeeded();
      await expect(articles.nth(i)).toContainText(job.company);
      await expect(articles.nth(i)).toContainText(job.period);
    }
  });

  test("shows every project, and its case study PDFs are real files", async ({ page }) => {
    await page.goto("/");
    const work = page.locator("#work");
    await expect(work.getByRole("article")).toHaveCount(projects.length);
    for (const p of projects) {
      const article = page.locator(`#project-${p.slug}`);
      await article.scrollIntoViewIfNeeded();
      await expect(article.getByRole("heading", { level: 3 })).toHaveText(p.title);
      const link = article.getByRole("link", { name: /full case study/i });
      if (!p.caseStudy) {
        await expect(link).toHaveCount(0);
        continue;
      }
      await expect(link).toHaveAttribute("target", "_blank");
      const pdf = await page.request.get((await link.getAttribute("href"))!);
      expect(pdf.status()).toBe(200);
      expect(pdf.headers()["content-type"]).toContain("application/pdf");
    }
  });

  test("contact links point to the right destinations", async ({ page }) => {
    await page.goto("/");
    for (const c of contactLinks) {
      const link = page.getByRole("link", { name: c.label });
      await expect(link).toHaveAttribute("href", c.href);
      if (c.external) {
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", /noopener/);
      } else {
        await expect(link).not.toHaveAttribute("target", /.+/);
      }
    }
  });

  test("defaults to light, and the toggle switches to dark and persists", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    const toggle = page.getByTestId("theme-toggle");
    await expect(html).not.toHaveClass(/dark/);
    // The label is set once the toggle has hydrated and read the current theme.
    await expect(toggle).toHaveAttribute("aria-label", /dark/);
    await toggle.click();
    await expect(html).toHaveClass(/dark/);
    await page.reload();
    await expect(html).toHaveClass(/dark/);
    await expect(toggle).toHaveAttribute("aria-label", /light/);
    await toggle.click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test("shows the splash screen on load, then reveals the page", async ({ page }) => {
    await page.goto("/");
    const splash = page.getByTestId("splash");
    await expect(splash).toBeVisible();
    await expect(splash).toContainText(person.name.toUpperCase());
    // ~4s of intro once the page hydrates; hydration itself is slow under parallel mobile emulation.
    await expect(splash).toHaveCount(0, { timeout: 10_000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Scrolling is locked while the splash is up and must be restored afterwards.
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  });

  test("renders the WebGL hero scene when the browser supports it", async ({ page }) => {
    await page.goto("/");
    const scene = page.getByTestId("hero-scene");
    await expect(scene).toHaveAttribute("data-webgl", "on");
    await expect(scene.locator("canvas")).toHaveCount(1);
  });

  test("the release check card runs to completion", async ({ page }) => {
    await page.goto("/");
    const card = page.getByRole("region", { name: "Release check" });
    await expect(card.getByTestId("release-progress")).toHaveText(/5 \/ 5 checks/, {
      timeout: 10_000,
    });
    await card.getByRole("button", { name: /run again/i }).click();
    // The run restarts from zero and ticks forward again; the first gate passes within a second.
    await expect(card.getByTestId("release-progress")).toHaveText(/[0-3] \/ 5 checks/);
    await expect(card.getByTestId("release-progress")).toHaveText(/5 \/ 5 checks/, {
      timeout: 10_000,
    });
  });

  test("the process stepper responds to clicks", async ({ page }) => {
    await page.goto("/");
    await page.locator("#process").scrollIntoViewIfNeeded();
    const tabs = page.getByRole("tab");
    await tabs.nth(3).click();
    await expect(tabs.nth(3)).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel")).toContainText("Automate what repeats");
  });

  test("unknown routes return a 404 page with a way home", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /go home/i })).toHaveAttribute("href", "/");
  });
});

test.describe("Desktop navigation", () => {
  test.skip(({ isMobile }) => !!isMobile, "header nav is desktop-only");

  test("each nav link scrolls its section into view", async ({ page }) => {
    test.slow(); // five smooth scrolls through the whole page
    await page.goto("/");
    await expectNoHorizontalOverflow(page);
    const nav = page.getByRole("navigation", { name: "Sections" });
    for (const { id, label } of navItems) {
      await nav.getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`section#${id}`)).toBeInViewport();
    }
  });

  test("skip link is the first focusable element and jumps to main", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: /skip to content/i });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });
});

test.describe("Mobile layout", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile-only checks");

  test("fits the viewport and keeps the CV reachable from the header", async ({ page }) => {
    await page.goto("/");
    await expectNoHorizontalOverflow(page);
    await expect(page.getByRole("navigation", { name: "Sections" })).toBeHidden();
    const cv = page.getByRole("banner").getByRole("link", { name: /download cv/i });
    await expect(cv).toBeVisible();
    await expect(cv).toHaveAttribute("download", "");
  });

  test("hamburger menu opens, navigates to a section and closes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open menu/i }).click();
    const menu = page.getByRole("navigation", { name: "Mobile sections" });
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: /^Experience/ }).click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/#experience$/);
    await expect(page.locator("section#experience")).toBeInViewport();
    await expectNoHorizontalOverflow(page);
  });
});
