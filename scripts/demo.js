// Demo driver: seeds two study tracks, opens the app, and screenshots
// the Today screen, the Hebrew calendar, and a day modal.
// Run: node scripts/demo.js
const { chromium } = require("playwright");

const SETTINGS = {
  version: 2,
  tracks: [
    { id: "demo-mishna", trackType: "mishna", startDate: "2026-06-01", startUnitIndex: 1 },
    { id: "demo-daf", trackType: "bavliDaf", startDate: "2026-06-08", startUnitIndex: 1 },
  ],
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 860 } });

  page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") console.log("CONSOLE ERROR:", msg.text());
  });

  await page.addInitScript((settings) => {
    localStorage.setItem("@chavurat_shas:settings", JSON.stringify(settings));
    localStorage.setItem("@chavurat_shas:progress_v", "2");
  }, SETTINGS);

  console.log("loading app (first Metro bundle can take a while)...");
  await page.goto("http://localhost:8081", { waitUntil: "domcontentloaded", timeout: 120000 });

  // wait for the Today screen header (Hebrew date) to appear
  await page.getByText("הושלמו").first().waitFor({ timeout: 120000 });
  console.log("document.dir =", await page.evaluate(() => document.dir || document.documentElement.dir));
  await page.screenshot({ path: "scripts/demo-1-today.png" });
  console.log("today screen captured");

  // go to the calendar tab
  await page.getByText("לוח שנה", { exact: true }).last().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "scripts/demo-2-calendar.png" });
  console.log("calendar captured");

  // tap today's highlighted day: click the cell containing today's gematria.
  // Simpler: click the day modal by tapping today via text of today's Hebrew day (כ"ה for 2026-06-10)
  await page.getByText("כ״ה", { exact: true }).first().click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "scripts/demo-3-day-modal.png" });
  console.log("day modal captured");

  await browser.close();
  console.log("DONE");
})().catch((e) => {
  console.error("DEMO FAILED:", e.message);
  process.exit(1);
});
