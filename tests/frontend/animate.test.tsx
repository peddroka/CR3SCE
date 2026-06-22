import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AnimateOnScroll, AnimateOnLoad } from "@/components/ui/animate";

describe("<AnimateOnScroll />", () => {
  let capturedCallback: IntersectionObserverCallback | null = null;

  beforeEach(() => {
    capturedCallback = null;

    class IntersectionObserverSpy {
      callback: IntersectionObserverCallback;
      constructor(cb: IntersectionObserverCallback) {
        this.callback = cb;
        capturedCallback = cb;
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
      root = null;
      rootMargin = "";
      thresholds = [];
    }

    global.IntersectionObserver = IntersectionObserverSpy;
  });

  it("renders children inside the wrapper", () => {
    render(
      <AnimateOnScroll>
        <p>hello world</p>
      </AnimateOnScroll>,
    );
    expect(screen.getByText("hello world")).toBeInTheDocument();
  });

  it("starts hidden (opacity-0) and shows when intersected", async () => {
    const { container } = render(
      <AnimateOnScroll>
        <p>scroll me</p>
      </AnimateOnScroll>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("opacity-0");

    // Simulate the element entering the viewport
    await act(async () => {
      capturedCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(wrapper.className).toContain("opacity-100");
  });

  it("respects custom delay via inline style", () => {
    const { container } = render(
      <AnimateOnScroll delay={250}>
        <p>x</p>
      </AnimateOnScroll>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.transitionDelay).toBe("250ms");
  });

  it("forwards className", () => {
    const { container } = render(
      <AnimateOnScroll className="extra-class">
        <p>x</p>
      </AnimateOnScroll>,
    );
    expect((container.firstChild as HTMLElement).className).toContain(
      "extra-class",
    );
  });
});

describe("<AnimateOnLoad />", () => {
  it("renders children", () => {
    render(
      <AnimateOnLoad>
        <p>load me</p>
      </AnimateOnLoad>,
    );
    expect(screen.getByText("load me")).toBeInTheDocument();
  });

  it("transitions to mounted after first frame", async () => {
    const { container } = render(
      <AnimateOnLoad>
        <p>x</p>
      </AnimateOnLoad>,
    );

    // After requestAnimationFrame fires, should be visible
    await act(async () => {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    });

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("opacity-100");
  });
});
