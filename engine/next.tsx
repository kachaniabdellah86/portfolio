"use client";
// Next.js App Router adapter. Render <Engine setup={…} /> once, as the LAST child of <body>.
// Internal links (plain <a> or next/link) get the leave → push → enter transition.
// Opt out with data-no-transition. Back/forward re-inits the page without the curtain.
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { boot, cleanup, enter, leave, onPage, setPendingHash, type PageFn } from "./index";

export function Engine({ setup }: { setup?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const mode = useRef<"idle" | "push" | "pop">("idle");
  const first = useRef(true);

  // Boots once; `setup` is a stable module-level function.
  useEffect(() => {
    boot(setup);
  }, [setup]);

  useEffect(() => {
    const onClick = async (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download") || a.hasAttribute("data-no-transition")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      // A different first segment (the locale) swaps the root layout, which remounts this adapter
      // mid-transition and leaves the new page uninitialised: let the browser load it fully.
      if (url.pathname.split("/")[1] !== location.pathname.split("/")[1]) return;
      e.preventDefault();
      if (mode.current !== "idle") return;
      mode.current = "push";
      const href = url.pathname + url.search + url.hash;
      setPendingHash(url.hash, url.pathname);
      router.prefetch(href);
      await leave();
      cleanup();
      router.push(href, { scroll: false });
    };
    const onPop = () => {
      mode.current = "pop";
      cleanup();
    };
    document.addEventListener("click", onClick, true);
    addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, true);
      removeEventListener("popstate", onPop);
    };
  }, [router]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const pop = mode.current === "pop";
    mode.current = "idle";
    enter({ transition: !pop, scrollTop: !pop });
  }, [pathname]);

  return null;
}

/** Component-level page code: runs when the page is ready (after the loader), reverted on leave. */
export function usePage(fn: PageFn) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => onPage(fn), []);
}
