import type { Variants, Transition } from "framer-motion";
import { useReducedMotion } from "framer-motion";

/**
 * Modern spring physics & easing curves for HireLoop.
 * Crafted for sleek, non-distracting SaaS micro-interactions.
 */
export const transitions = {
  springSmooth: {
    type: "spring",
    stiffness: 380,
    damping: 30,
  } satisfies Transition,

  springBouncy: {
    type: "spring",
    stiffness: 450,
    damping: 25,
  } satisfies Transition,

  springGentle: {
    type: "spring",
    stiffness: 220,
    damping: 24,
  } satisfies Transition,

  easeOutCubic: {
    duration: 0.35,
    ease: [0.215, 0.61, 0.355, 1],
  } satisfies Transition,

  fastFade: {
    duration: 0.2,
    ease: "easeInOut",
  } satisfies Transition,
};

/**
 * Standard Framer Motion variants for HireLoop pages and components.
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.springSmooth,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.springSmooth,
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.18 },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.springSmooth,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.springSmooth,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: 0.15 },
  },
};

export const drawerVariants: Variants = {
  hidden: { x: "100%", opacity: 0.5 },
  visible: {
    x: 0,
    opacity: 1,
    transition: transitions.springSmooth,
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.25, ease: "easeInOut" },
  },
};

export const bannerSlideVariants: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: transitions.springSmooth,
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.25, ease: "easeInOut" },
  },
};

export const accordionVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] },
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
  },
};

/** Stagger container for animating lists or grids of items */
export function createStaggerContainer(staggerChildren = 0.08, delayChildren = 0.04): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };
}

/** Hook to determine if user prefers reduced motion */
export function useReducedMotionSafe(): boolean {
  return Boolean(useReducedMotion());
}
