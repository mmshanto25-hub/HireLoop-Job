import { beforeEach, describe, expect, it } from "vitest";
import { applyThemeToDocument, resolveTheme } from "@/stores/theme";

describe("resolveTheme", () => {
  it("returns explicit preferences unchanged", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("follows the operating system when set to system", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
});

describe("applyThemeToDocument", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    document.documentElement.style.colorScheme = "";
  });

  it("adds the dark class and colour-scheme for dark mode", () => {
    applyThemeToDocument("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("removes the dark class for light mode", () => {
    document.documentElement.classList.add("dark");
    applyThemeToDocument("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });
});
