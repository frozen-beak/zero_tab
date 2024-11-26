import { test, expect } from "@playwright/test";

test("Verify new tab UI elements", async ({ page }) => {
  await page.goto("zero_tab/src/index.html");

  const wallpaper = page.locator("img.wallpaper");
  const blur = page.locator("img.blur");
  const searchHolder = page.locator("#search-holder");
  const searchDiv = page.locator("#search-div");
  const logo = page.locator("#search-div img");
  const searchInput = page.locator("#search-input");

  // Core UI Elements
  await expect(logo).toBeVisible();
  await expect(wallpaper).toBeVisible();
  await expect(blur).toBeVisible();
  await expect(searchHolder).toBeVisible();
  await expect(searchDiv).toBeVisible();

  // Logo
  await expect(logo).toHaveAttribute("alt", "ZeroTab");
  await expect(logo).toHaveAttribute("src", "../assets/logo.png");

  // Search Input
  await expect(searchInput).toBeVisible();
  await expect(searchInput).toHaveAttribute("type", "text");

  // Settings button
  const settingsButton = page.locator("#settings");
  await expect(settingsButton).toBeVisible();
  await expect(settingsButton).toHaveClass(/icon/);
});
