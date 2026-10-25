import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";

describe("Button", () => {
  it("calls onClick when activated", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("defaults to type=button so it never submits a form by accident", () => {
    render(<Button>Inline</Button>);
    expect(screen.getByRole("button", { name: "Inline" })).toHaveAttribute("type", "button");
  });

  it("is disabled and marked busy while loading", () => {
    render(<Button loading>Saving</Button>);
    const button = screen.getByRole("button", { name: /saving/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});

describe("FormField", () => {
  it("links the label to the control", () => {
    render(
      <FormField label="Email" required>
        {(control) => <Input {...control} type="email" />}
      </FormField>,
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("associates an error message with the control and marks it invalid", () => {
    render(
      <FormField label="Email" error="Enter a valid email address.">
        {(control) => <Input {...control} />}
      </FormField>,
    );
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute("aria-invalid", "true");
    const describedBy = input.getAttribute("aria-describedby") ?? "";
    expect(describedBy).not.toBe("");
    expect(document.getElementById(describedBy.split(" ")[0]!)).toHaveTextContent(
      "Enter a valid email address.",
    );
  });
});
