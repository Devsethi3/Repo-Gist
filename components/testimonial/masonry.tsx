import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { gsap } from "gsap";

/**
 * Custom hook to get responsive column count based on media queries
 * Uses useSyncExternalStore for proper SSR support and avoiding setState in effects
 */
const useMedia = (
  queries: string[],
  values: number[],
  defaultValue: number,
): number => {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === "undefined") return () => {};

      const mediaQueryLists = queries.map((q) => window.matchMedia(q));
      mediaQueryLists.forEach((mql) =>
        mql.addEventListener("change", callback),
      );

      return () => {
        mediaQueryLists.forEach((mql) =>
          mql.removeEventListener("change", callback),
        );
      };
    },
    [queries],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return defaultValue;
    const index = queries.findIndex((q) => window.matchMedia(q).matches);
    return values[index] ?? defaultValue;
  }, [queries, values, defaultValue]);

  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

/**
 * Custom hook to measure element dimensions using ResizeObserver
 */
const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((prev) => {
        if (prev.width === width && prev.height === height) return prev;
        return { width, height };
      });
    });

    ro.observe(element);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
};

interface MasonryItem {
  id: string;
}

interface GridItem<T> extends MasonryItem {
  x: number;
  y: number;
  w: number;
  h: number;
  data: T;
}

interface MasonryProps<T extends MasonryItem> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  getItemHeight?: (item: T, columnWidth: number) => number;
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: "bottom" | "top" | "left" | "right" | "center" | "random";
  blurToFocus?: boolean;
  gap?: number;
}

function Masonry<T extends MasonryItem>({
  items,
  renderItem,
  getItemHeight,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.05,
  animateFrom = "bottom",
  blurToFocus = true,
  gap = 16,
}: MasonryProps<T>) {
  const columns = useMedia(
    ["(min-width:1000px)", "(min-width:600px)", "(min-width:400px)"],
    [3, 2, 2],
    1,
  );

  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const itemHeightsRef = useRef<Map<string, number>>(new Map());
  const [measurementVersion, setMeasurementVersion] = useState(0);
  const pendingMeasurement = useRef(false);

  // Calculate column width
  const columnWidth = useMemo(() => {
    if (!width) return 0;
    const totalGaps = (columns - 1) * gap;
    return (width - totalGaps) / columns;
  }, [width, columns, gap]);

  // Callback ref for measuring items
  const setItemRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      itemRefs.current.set(id, el);
    } else {
      itemRefs.current.delete(id);
    }
  }, []);

  // Schedule measurement after render using requestAnimationFrame
  // This avoids calling setState synchronously in an effect
  useLayoutEffect(() => {
    if (pendingMeasurement.current) return;

    pendingMeasurement.current = true;

    const rafId = requestAnimationFrame(() => {
      pendingMeasurement.current = false;
      let hasChanges = false;

      itemRefs.current.forEach((el, id) => {
        if (el) {
          const height = el.offsetHeight;
          const prevHeight = itemHeightsRef.current.get(id);

          if (prevHeight !== height) {
            itemHeightsRef.current.set(id, height);
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        setMeasurementVersion((v) => v + 1);
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
      pendingMeasurement.current = false;
    };
  }, [items, width, columns]);

  // Get initial position for animation
  const getInitialPosition = useCallback(
    (item: GridItem<T>, containerWidth: number) => {
      let direction = animateFrom;
      if (animateFrom === "random") {
        const dirs = ["top", "bottom", "left", "right"] as const;
        direction = dirs[Math.floor(Math.random() * dirs.length)];
      }

      switch (direction) {
        case "top":
          return { x: item.x, y: -200 };
        case "bottom":
          return { x: item.x, y: window.innerHeight + 200 };
        case "left":
          return { x: -200, y: item.y };
        case "right":
          return { x: window.innerWidth + 200, y: item.y };
        case "center":
          return {
            x: containerWidth / 2 - item.w / 2,
            y: 300,
          };
        default:
          return { x: item.x, y: item.y + 100 };
      }
    },
    [animateFrom],
  );

  // Calculate grid layout
  const grid = useMemo<GridItem<T>[]>(() => {
    if (!width || !columnWidth) return [];

    const colHeights = new Array(columns).fill(0);

    return items.map((item) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = col * (columnWidth + gap);

      const height = getItemHeight
        ? getItemHeight(item, columnWidth)
        : itemHeightsRef.current.get(item.id) || 150;

      const y = colHeights[col];
      colHeights[col] += height + gap;

      return { ...item, x, y, w: columnWidth, h: height, data: item };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    columns,
    items,
    width,
    gap,
    columnWidth,
    getItemHeight,
    measurementVersion,
  ]);

  // Calculate container height
  const containerHeight = useMemo(() => {
    if (grid.length === 0) return 0;
    return Math.max(...grid.map((item) => item.y + item.h));
  }, [grid]);

  // Track if component has mounted for animation
  const hasMounted = useRef(false);

  // Animate grid items
  useLayoutEffect(() => {
    if (grid.length === 0) return;

    grid.forEach((item, index) => {
      const selector = `[data-masonry-key="${item.id}"]`;
      const animProps = { x: item.x, y: item.y, width: item.w };

      if (!hasMounted.current) {
        const start = getInitialPosition(item, width);
        gsap.fromTo(
          selector,
          {
            opacity: 0,
            x: start.x,
            y: start.y,
            width: item.w,
            ...(blurToFocus && { filter: "blur(10px)" }),
          },
          {
            opacity: 1,
            ...animProps,
            ...(blurToFocus && { filter: "blur(0px)" }),
            duration: 0.8,
            ease: "power3.out",
            delay: index * stagger,
          },
        );
      } else {
        gsap.to(selector, {
          ...animProps,
          duration,
          ease,
          overwrite: "auto",
        });
      }
    });

    hasMounted.current = true;
  }, [grid, stagger, blurToFocus, duration, ease, getInitialPosition, width]);

  // Hidden measurement container
  const measurementItems = useMemo(() => {
    if (!columnWidth) return null;

    return (
      <div
        className="absolute opacity-0 pointer-events-none"
        style={{ width: columnWidth, top: 0, left: 0, zIndex: -1 }}
        aria-hidden="true"
      >
        {items.map((item) => (
          <div
            key={`measure-${item.id}`}
            ref={(el) => setItemRef(item.id, el)}
            style={{ width: columnWidth }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    );
  }, [items, columnWidth, renderItem, setItemRef]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: containerHeight }}
    >
      {measurementItems}
      {grid.map((item) => (
        <div
          key={item.id}
          data-masonry-key={item.id}
          className="absolute"
          style={{
            willChange: "transform, width, opacity",
            width: item.w,
          }}
        >
          {renderItem(item.data)}
        </div>
      ))}
    </div>
  );
}

export default Masonry;
