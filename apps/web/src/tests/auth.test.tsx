import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { LoginPage } from "@/pages/auth/LoginPage";
import { readCsrfToken } from "@/lib/api";
import { safeNext } from "@/features/auth/form-utils";

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function renderWith(ui: React.ReactElement, route: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  document.cookie = "hl_csrf=; Max-Age=0; path=/";
});

describe("safeNext", () => {
  it("keeps internal paths", () => {
    expect(safeNext("/jobs?page=2")).toBe("/jobs?page=2");
  });
  it.each([null, "https://evil.example", "//evil.example", "/\\evil.example", "jobs"])(
    "falls back to /dashboard for %j",
    (value) => {
      expect(safeNext(value)).toBe("/dashboard");
    },
  );
});

describe("readCsrfToken", () => {
  it("reads the hl_csrf cookie", () => {
    document.cookie = "hl_csrf=abc123; path=/";
    expect(readCsrfToken()).toBe("abc123");
  });
  it("returns an empty string when the cookie is absent", () => {
    expect(readCsrfToken()).toBe("");
  });
});

describe("RequireAuth", () => {
  it("sends a signed-out visitor to login and keeps the destination", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(401, { success: false, error: { code: "UNAUTHENTICATED", message: "No" } }),
    );
    renderWith(
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<p>Secret dashboard</p>} />
        </Route>
        <Route path="/login" element={<p>Login screen</p>} />
      </Routes>,
      "/dashboard",
    );
    expect(await screen.findByText("Login screen")).toBeInTheDocument();
    expect(screen.queryByText("Secret dashboard")).not.toBeInTheDocument();
  });
});

describe("LoginPage", () => {
  it("shows field errors without calling the API when the form is empty", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderWith(<LoginPage />, "/login");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Enter your email address")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("toggles password visibility", async () => {
    renderWith(<LoginPage />, "/login");
    const input = screen.getByLabelText(/^Password/);
    expect(input).toHaveAttribute("type", "password");
    await userEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");
  });

  it("shows the server's generic message for bad credentials", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(401, {
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." },
      }),
    );
    renderWith(<LoginPage />, "/login");
    await userEvent.type(screen.getByLabelText(/^Email/), "ada@example.com");
    await userEvent.type(screen.getByLabelText(/^Password/), "wrongpass9");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password."),
    );
  });
});
