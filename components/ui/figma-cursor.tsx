"use client";

import { useCallback, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// External store for touch device detection
function subscribeTouchDevice(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const mediaQuery = window.matchMedia("(max-width: 768px)");
  const pointerQuery = window.matchMedia("(pointer: coarse)");

  mediaQuery.addEventListener("change", callback);
  pointerQuery.addEventListener("change", callback);

  return () => {
    mediaQuery.removeEventListener("change", callback);
    pointerQuery.removeEventListener("change", callback);
  };
}

function getIsTouchDevice(): boolean {
  if (typeof window === "undefined") return false;

  const hasTouchScreen =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  return hasTouchScreen || isSmallScreen || hasCoarsePointer;
}

function getServerSnapshot(): boolean {
  return true; // Assume touch device on server to avoid flash
}

// External store for cursor state
interface CursorState {
  position: { x: number; y: number };
  hidden: boolean;
  clicked: boolean;
  isPointer: boolean;
  isText: boolean;
}

const initialCursorState: CursorState = {
  position: { x: 0, y: 0 },
  hidden: false,
  clicked: false,
  isPointer: false,
  isText: false,
};

let cursorState: CursorState = { ...initialCursorState };
let cursorListeners: Array<() => void> = [];
let isSetup = false;

function notifyCursorListeners() {
  cursorListeners.forEach((listener) => listener());
}

function updateCursorState(updates: Partial<CursorState>) {
  cursorState = { ...cursorState, ...updates };
  notifyCursorListeners();
}

const textTags = new Set([
  "P",
  "SPAN",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "LABEL",
  "LI",
  "TD",
  "TH",
  "BLOCKQUOTE",
  "PRE",
  "CODE",
  "EM",
  "STRONG",
  "B",
  "I",
  "U",
  "S",
  "SMALL",
  "SUB",
  "SUP",
  "MARK",
  "DEL",
  "INS",
  "Q",
  "CITE",
  "DFN",
  "ABBR",
  "TIME",
  "VAR",
  "SAMP",
  "KBD",
]);

function isTextElement(element: HTMLElement): boolean {
  const computedStyle = window.getComputedStyle(element);
  if (
    element.tagName === "INPUT" ||
    element.tagName === "TEXTAREA" ||
    element.getAttribute("contenteditable") === "true" ||
    computedStyle.cursor === "text" ||
    computedStyle.cursor === "vertical-text"
  ) {
    return true;
  }

  if (textTags.has(element.tagName)) {
    const hasDirectText = Array.from(element.childNodes).some(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
    );
    if (hasDirectText) {
      return true;
    }
  }

  return false;
}

function isClickableElement(element: HTMLElement): boolean {
  if (
    element.tagName === "A" ||
    element.tagName === "BUTTON" ||
    element.closest("a") !== null ||
    element.closest("button") !== null ||
    element.classList.contains("cursor-pointer") ||
    element.closest(".cursor-pointer") !== null ||
    element.getAttribute("role") === "button" ||
    element.closest('[role="button"]') !== null ||
    element.onclick !== null ||
    element.getAttribute("onclick") !== null
  ) {
    return true;
  }

  const computedStyle = window.getComputedStyle(element);
  if (computedStyle.cursor === "pointer") {
    return true;
  }

  return false;
}

function setupCursorListeners() {
  if (typeof window === "undefined" || isSetup) return;
  isSetup = true;

  const onMouseMove = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const clickable = isClickableElement(target);
    const text = !clickable && isTextElement(target);

    updateCursorState({
      position: { x: e.clientX, y: e.clientY },
      isPointer: clickable,
      isText: text,
    });
  };

  const onMouseDown = () => {
    updateCursorState({ clicked: true });
  };

  const onMouseUp = () => {
    updateCursorState({ clicked: false });
  };

  const onMouseLeave = () => {
    updateCursorState({ hidden: true });
  };

  const onMouseEnter = () => {
    updateCursorState({ hidden: false });
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);
  document.body.addEventListener("mouseenter", onMouseEnter);
  document.body.addEventListener("mouseleave", onMouseLeave);

  document.body.style.cursor = "none";

  const style = document.createElement("style");
  style.innerHTML = `* { cursor: none !important; }`;
  style.id = "figma-cursor-style";
  document.head.appendChild(style);
}

function cleanupCursorListeners() {
  if (typeof window === "undefined" || !isSetup) return;

  document.body.style.cursor = "auto";
  const existingStyle = document.getElementById("figma-cursor-style");
  if (existingStyle) {
    existingStyle.remove();
  }
}

function subscribeCursor(callback: () => void): () => void {
  cursorListeners.push(callback);
  setupCursorListeners();

  return () => {
    cursorListeners = cursorListeners.filter((l) => l !== callback);
    if (cursorListeners.length === 0) {
      cleanupCursorListeners();
      isSetup = false;
    }
  };
}

function getCursorSnapshot(): CursorState {
  return cursorState;
}

function getCursorServerSnapshot(): CursorState {
  return initialCursorState;
}

export const FigmaCursor = () => {
  const isTouchDevice = useSyncExternalStore(
    subscribeTouchDevice,
    getIsTouchDevice,
    getServerSnapshot
  );

  const { position, hidden, clicked, isPointer, isText } = useSyncExternalStore(
    subscribeCursor,
    getCursorSnapshot,
    getCursorServerSnapshot
  );

  if (isTouchDevice) {
    return null;
  }

  return (
    <motion.div
      className={cn(
        "pointer-events-none fixed left-0 top-0 z-9999 transition-opacity duration-300",
        hidden ? "opacity-0" : "opacity-100"
      )}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "tween", ease: "linear", duration: 0 }}
    >
      {isText ? (
        <motion.div
          key="text"
          animate={{
            scale: clicked ? 0.9 : 1,
            opacity: 1,
          }}
          className="relative -ml-2 -mt-3"
        >
          {/* I-Beam Text Cursor */}
          <svg
            width="16"
            height="24"
            viewBox="0 0 16 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* White Outline (Back) */}
            <path
              d="M8 2V22"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="square"
            />
            <path
              d="M4 2H12"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="square"
            />
            <path
              d="M4 22H12"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="square"
            />

            {/* Black Fill (Front) */}
            <path
              d="M8 2V22"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
            <path
              d="M5 2H11"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
            <path
              d="M5 22H11"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
          </svg>
        </motion.div>
      ) : isPointer ? (
        <motion.div
          key="hand"
          animate={{
            scale: clicked ? 0.8 : 1,
            opacity: 1,
            rotate: clicked ? -10 : 0,
          }}
          className="relative -ml-3.5 -mt-2"
        >
          <svg
            width="40"
            height="40"
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 24 24"
            enableBackground="new 0 0 24 24"
            xmlSpace="preserve"
          >
            <g>
              <defs>
                <rect id="SVGID_1_" width="24" height="24" />
              </defs>
              <clipPath id="SVGID_2_">
                <use xlinkHref="#SVGID_1_" overflow="visible" />
              </clipPath>
              <path
                clipPath="url(#SVGID_2_)"
                fill="#FFFFFF"
                d="M11.3,20.4c-0.3-0.4-0.6-1.1-1.2-2c-0.3-0.5-1.2-1.5-1.5-1.9
    c-0.2-0.4-0.2-0.6-0.1-1c0.1-0.6,0.7-1.1,1.4-1.1c0.5,0,1,0.4,1.4,0.7c0.2,0.2,0.5,0.6,0.7,0.8c0.2,0.2,0.2,0.3,0.4,0.5
    c0.2,0.3,0.3,0.5,0.2,0.1c-0.1-0.5-0.2-1.3-0.4-2.1c-0.1-0.6-0.2-0.7-0.3-1.1c-0.1-0.5-0.2-0.8-0.3-1.3c-0.1-0.3-0.2-1.1-0.3-1.5
    c-0.1-0.5-0.1-1.4,0.3-1.8c0.3-0.3,0.9-0.4,1.3-0.2c0.5,0.3,0.8,1,0.9,1.3c0.2,0.5,0.4,1.2,0.5,2c0.2,1,0.5,2.5,0.5,2.8
    c0-0.4-0.1-1.1,0-1.5c0.1-0.3,0.3-0.7,0.7-0.8c0.3-0.1,0.6-0.1,0.9-0.1c0.3,0.1,0.6,0.3,0.8,0.5c0.4,0.6,0.4,1.9,0.4,1.8
    c0.1-0.4,0.1-1.2,0.3-1.6c0.1-0.2,0.5-0.4,0.7-0.5c0.3-0.1,0.7-0.1,1,0c0.2,0,0.6,0.3,0.7,0.5c0.2,0.3,0.3,1.3,0.4,1.7
    c0,0.1,0.1-0.4,0.3-0.7c0.4-0.6,1.8-0.8,1.9,0.6c0,0.7,0,0.6,0,1.1c0,0.5,0,0.8,0,1.2c0,0.4-0.1,1.3-0.2,1.7
    c-0.1,0.3-0.4,1-0.7,1.4c0,0-1.1,1.2-1.2,1.8c-0.1,0.6-0.1,0.6-0.1,1c0,0.4,0.1,0.9,0.1,0.9s-0.8,0.1-1.2,0
    c-0.4-0.1-0.9-0.8-1-1.1c-0.2-0.3-0.5-0.3-0.7,0c-0.2,0.4-0.7,1.1-1.1,1.1c-0.7,0.1-2.1,0-3.1,0c0,0,0.2-1-0.2-1.4
    c-0.3-0.3-0.8-0.8-1.1-1.1L11.3,20.4z"
              />

              <path
                clipPath="url(#SVGID_2_)"
                fill="none"
                stroke="#000000"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="
    M11.3,20.4c-0.3-0.4-0.6-1.1-1.2-2c-0.3-0.5-1.2-1.5-1.5-1.9c-0.2-0.4-0.2-0.6-0.1-1c0.1-0.6,0.7-1.1,1.4-1.1c0.5,0,1,0.4,1.4,0.7
    c0.2,0.2,0.5,0.6,0.7,0.8c0.2,0.2,0.2,0.3,0.4,0.5c0.2,0.3,0.3,0.5,0.2,0.1c-0.1-0.5-0.2-1.3-0.4-2.1c-0.1-0.6-0.2-0.7-0.3-1.1
    c-0.1-0.5-0.2-0.8-0.3-1.3c-0.1-0.3-0.2-1.1-0.3-1.5c-0.1-0.5-0.1-1.4,0.3-1.8c0.3-0.3,0.9-0.4,1.3-0.2c0.5,0.3,0.8,1,0.9,1.3
    c0.2,0.5,0.4,1.2,0.5,2c0.2,1,0.5,2.5,0.5,2.8c0-0.4-0.1-1.1,0-1.5c0.1-0.3,0.3-0.7,0.7-0.8c0.3-0.1,0.6-0.1,0.9-0.1
    c0.3,0.1,0.6,0.3,0.8,0.5c0.4,0.6,0.4,1.9,0.4,1.8c0.1-0.4,0.1-1.2,0.3-1.6c0.1-0.2,0.5-0.4,0.7-0.5c0.3-0.1,0.7-0.1,1,0
    c0.2,0,0.6,0.3,0.7,0.5c0.2,0.3,0.3,1.3,0.4,1.7c0,0.1,0.1-0.4,0.3-0.7c0.4-0.6,1.8-0.8,1.9,0.6c0,0.7,0,0.6,0,1.1
    c0,0.5,0,0.8,0,1.2c0,0.4-0.1,1.3-0.2,1.7c-0.1,0.3-0.4,1-0.7,1.4c0,0-1.1,1.2-1.2,1.8c-0.1,0.6-0.1,0.6-0.1,1
    c0,0.4,0.1,0.9,0.1,0.9s-0.8,0.1-1.2,0c-0.4-0.1-0.9-0.8-1-1.1c-0.2-0.3-0.5-0.3-0.7,0c-0.2,0.4-0.7,1.1-1.1,1.1
    c-0.7,0.1-2.1,0-3.1,0c0,0,0.2-1-0.2-1.4c-0.3-0.3-0.8-0.8-1.1-1.1L11.3,20.4z"
              />

              <line
                clipPath="url(#SVGID_2_)"
                fill="none"
                stroke="#000000"
                strokeWidth="0.75"
                strokeLinecap="round"
                x1="19.6"
                y1="20.7"
                x2="19.6"
                y2="17.3"
              />

              <line
                clipPath="url(#SVGID_2_)"
                fill="none"
                stroke="#000000"
                strokeWidth="0.75"
                strokeLinecap="round"
                x1="17.6"
                y1="20.7"
                x2="17.5"
                y2="17.3"
              />

              <line
                clipPath="url(#SVGID_2_)"
                fill="none"
                stroke="#000000"
                strokeWidth="0.75"
                strokeLinecap="round"
                x1="15.6"
                y1="17.3"
                x2="15.6"
                y2="20.7"
              />
            </g>
          </svg>
        </motion.div>
      ) : (
        <motion.div
          key="arrow"
          animate={{
            scale: clicked ? 0.85 : 1,
            opacity: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className="relative"
        >
          {/* Figma-style Arrow Cursor */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))",
            }}
          >
            {/* White outer stroke for visibility on dark backgrounds */}
            <path
              d="M5.5 3.21V20.8L10.12 16.18L12.78 22.8H15.18L12.38 15.79H19.29L5.5 3.21Z"
              fill="white"
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Black fill - the main cursor shape */}
            <path
              d="M5.5 3.21V20.8L10.12 16.18L12.78 22.8H15.18L12.38 15.79H19.29L5.5 3.21Z"
              fill="black"
              stroke="black"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
};
