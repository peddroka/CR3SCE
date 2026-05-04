import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/logo";

describe("<Logo />", () => {
  it("renders the SVG logo image", () => {
    render(<Logo />);
    const img = screen.getByAltText("CR3SCE");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", expect.stringContaining("logo.svg"));
  });

  it("renders the CR3SCE text alongside the image", () => {
    render(<Logo />);
    // Text "CR3SCE" is split into nodes (CR + 3 + SCE), so use the inline check
    const container = screen.getByAltText("CR3SCE").closest("span");
    expect(container?.textContent).toContain("CR3SCE");
  });

  it("highlights the '3' in lime color", () => {
    const { container } = render(<Logo />);
    const three = Array.from(container.querySelectorAll("span")).find(
      (s) => s.textContent === "3",
    );
    expect(three).toBeDefined();
    expect(three?.className).toContain("text-[#C8F135]");
  });

  it("applies different text size for each `size` prop", () => {
    const { container: sm } = render(<Logo size="sm" />);
    const { container: lg } = render(<Logo size="lg" />);

    // The text wrapper is the first <span> inside the outer wrapper that contains "CR3SCE"
    const smText = sm.querySelector("span > span");
    const lgText = lg.querySelector("span > span");

    expect(smText?.className).toContain("text-2xl");
    expect(lgText?.className).toContain("text-5xl");
  });

  it("forwards custom className to the wrapper", () => {
    const { container } = render(<Logo className="custom-class" />);
    const wrapper = container.querySelector("span");
    expect(wrapper?.className).toContain("custom-class");
  });
});
