import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";

import { Skeleton } from "./skeleton";

import "virtual:dotaf.css";

import { sameColor } from "../../test/browser/contrast";
import { emulateMedia, pageColor, setTheme } from "../../test/browser/test-utils";

/** The parts of a skeleton that paint a fill: its lines, or the skeleton itself. */
function shapes(root: Element): Element[] {
  return [root, ...root.querySelectorAll("*")].filter(
    (part) => !sameColor(getComputedStyle(part).backgroundColor, "rgba(0, 0, 0, 0)"),
  );
}

/** The shimmer running on a shape's ::after, if there is one. */
function shimmer(shape: Element): Animation | undefined {
  return document
    .getAnimations()
    .find(
      (animation) =>
        animation.effect instanceof KeyframeEffect &&
        animation.effect.target === shape &&
        animation.effect.pseudoElement === "::after",
    );
}

async function renderSkeleton(ui: React.ReactNode): Promise<Element> {
  const { container } = await render(<div data-testid="host">{ui}</div>);
  const root = container.querySelector("[data-testid='host']")?.firstElementChild;
  if (!root) throw new Error("the skeleton rendered nothing");
  return root;
}

describe("Skeleton", () => {
  // It stands in for content that isn't there yet; the loading region says so with
  // aria-busy, and a pile of empty shapes would only be noise to a screen reader.
  test("screen readers skip it", async () => {
    const root = await renderSkeleton(<Skeleton />);

    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  test("text takes the height of the lines it stands for, with a shorter last line", async () => {
    const { container } = await render(
      <div style={{ fontSize: "16px", lineHeight: "24px", width: "300px" }}>
        <Skeleton lines={3} />
      </div>,
    );
    const root = container.querySelector("[aria-hidden='true']");
    if (!root) throw new Error("no skeleton");

    expect(root.getBoundingClientRect().height).toBe(72);
    const lines = shapes(root);
    expect(lines).toHaveLength(3);
    const width = (index: number) => lines[index]?.getBoundingClientRect().width ?? 0;
    expect(width(0)).toBe(300);
    expect(width(2)).toBeLessThan(width(0));
  });

  test("a single text line runs the full width", async () => {
    const { container } = await render(
      <div style={{ width: "300px" }}>
        <Skeleton />
      </div>,
    );
    const root = container.querySelector("[aria-hidden='true']");
    if (!root) throw new Error("no skeleton");

    expect(shapes(root)[0]?.getBoundingClientRect().width).toBe(300);
  });

  test("a circle is round and grows with size", async () => {
    const { container } = await render(
      <>
        <Skeleton variant="circle" size="sm" />
        <Skeleton variant="circle" size="md" />
        <Skeleton variant="circle" size="lg" />
      </>,
    );
    const boxes = [...container.querySelectorAll("[aria-hidden='true']")].map((circle) => ({
      box: circle.getBoundingClientRect(),
      radius: getComputedStyle(circle).borderTopLeftRadius,
    }));

    expect(boxes).toHaveLength(3);
    for (const { box, radius } of boxes) {
      expect(box.width).toBeGreaterThan(0);
      expect(box.width).toBe(box.height);
      expect(parseFloat(radius)).toBeGreaterThanOrEqual(box.width / 2);
    }
    expect(boxes[0]?.box.width).toBeLessThan(boxes[1]?.box.width ?? 0);
    expect(boxes[1]?.box.width).toBeLessThan(boxes[2]?.box.width ?? 0);
  });

  test("a block fills the box it is put in", async () => {
    const { container } = await render(
      <div style={{ width: "240px", height: "135px" }}>
        <Skeleton variant="block" />
      </div>,
    );
    const root = container.querySelector("[aria-hidden='true']");
    if (!root) throw new Error("no skeleton");

    const box = root.getBoundingClientRect();
    expect([box.width, box.height]).toEqual([240, 135]);
  });

  test.each(["light", "dark"] as const)(
    "the fill stands out from the page in %s mode",
    async (theme) => {
      setTheme(theme);
      const root = await renderSkeleton(<Skeleton variant="block" />);

      // A transparent fill differs from the page too, so first make sure there is one.
      expect(shapes(root)).toEqual([root]);
      expect(sameColor(getComputedStyle(root).backgroundColor, pageColor())).toBe(false);
    },
  );

  // Moving only translate keeps the sweep on the compositor: no layout, no repaint per frame.
  test("a light sweeps across every shape, moving only translate", async () => {
    const { container } = await render(
      <>
        <Skeleton lines={2} />
        <Skeleton variant="circle" />
        <Skeleton variant="block" />
      </>,
    );

    const filled = [...container.querySelectorAll("[aria-hidden='true']")].flatMap((root) =>
      shapes(root),
    );
    expect(filled).toHaveLength(4);
    for (const shape of filled) {
      const sweep = shimmer(shape);
      expect(sweep).toBeDefined();
      const animated = new Set(
        (sweep?.effect as KeyframeEffect).getKeyframes().flatMap((frame) => Object.keys(frame)),
      );
      for (const key of ["offset", "computedOffset", "easing", "composite"]) animated.delete(key);
      expect([...animated]).toEqual(["translate"]);
    }
  });

  test("the sweep follows the reading direction", async () => {
    const { container } = await render(
      <>
        <div dir="ltr" style={{ width: "200px", height: "20px" }}>
          <Skeleton variant="block" />
        </div>
        <div dir="rtl" style={{ width: "200px", height: "20px" }}>
          <Skeleton variant="block" />
        </div>
      </>,
    );
    const [ltr, rtl] = [...container.querySelectorAll("[aria-hidden='true']")];

    /** How far the sweep travels between 40% and 60% of its cycle; positive is rightward. */
    function travel(shape: Element | undefined): number {
      const sweep = shape ? shimmer(shape) : undefined;
      if (!shape || !sweep) throw new Error("no shimmer");
      sweep.pause();
      const duration = Number(sweep.effect?.getComputedTiming().duration);
      const at = (progress: number) => {
        sweep.currentTime = duration * progress;
        return parseFloat(getComputedStyle(shape, "::after").translate);
      };
      return at(0.6) - at(0.4);
    }

    expect(travel(ltr)).toBeGreaterThan(0);
    expect(travel(rtl)).toBeLessThan(0);
  });

  test("reduced motion holds the sweep still", async () => {
    const root = await renderSkeleton(<Skeleton variant="block" />);
    const duration = () => getComputedStyle(root, "::after").animationDuration;
    expect(getComputedStyle(root, "::after").animationName).not.toBe("none");
    expect(duration()).not.toBe("0s");

    await emulateMedia("prefers-reduced-motion", "reduce");

    await expect.poll(duration).toBe("0s");
  });

  // High Contrast mode drops the fill; an outline keeps the shape on screen. An outline, not
  // a border: it takes no room and leaves the inside to the fill and the sweep.
  test("every shape keeps an outline in forced colors (Windows High Contrast)", async () => {
    await emulateMedia("forced-colors", "active");
    const { container } = await render(
      <>
        <Skeleton lines={2} />
        <Skeleton variant="circle" />
        <Skeleton variant="block" />
      </>,
    );

    const filled = [...container.querySelectorAll("[aria-hidden='true']")].flatMap((root) =>
      root.children.length > 0 ? [...root.children] : [root],
    );
    expect(filled).toHaveLength(4);
    for (const shape of filled) {
      expect(getComputedStyle(shape).outlineStyle).toBe("solid");
      expect(getComputedStyle(shape).outlineWidth).toBe("1px");
    }
  });
});
