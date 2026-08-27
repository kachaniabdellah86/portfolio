"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { scrollBus } from "../lenis-bridge";

interface ScrollVideoProps {
  src: string;
  fallbackSrc?: string;
  poster?: string;
  overlayOpacity?: number;
}

export default function ScrollVideo({
  src,
  fallbackSrc,
  poster,
  overlayOpacity = 0.55,
}: ScrollVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);

  /* Pause rendering when tab is hidden */
  useEffect(() => {
    const onVisibility = () => {
      pausedRef.current = document.hidden;
    };
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  /* Fetch as Blob & Draw Loop */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;

    let active = true;
    let objectUrl = "";
    const controller = new AbortController();
    
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    videoRef.current = video;

    const selectedSrc =
      src.endsWith(".webm") && !video.canPlayType("video/webm")
        ? (fallbackSrc ?? src)
        : src;

    // 1. Fetch video completely into memory (Blob) so it never buffers while scrubbing
    fetch(selectedSrc, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Video request failed with ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        video.src = objectUrl;
        video.load();
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Video fetch failed", error);
      });

    let frameDirty = true;
    const onLoaded = () => {
      if (video.duration > 0 && Number.isFinite(video.duration)) {
        frameDirty = true;
        setReady(true);
      }
    };
    const onSeeked = () => {
      frameDirty = true;
    };
    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("seeked", onSeeked);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });

    const draw = () => {
      if (pausedRef.current) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      if (!canvas || !ctx || !video || video.readyState < 2 || isNaN(video.duration)) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      // 2. 1:1 Scroll Sync
      const time = Math.max(0, Math.min(scrollBus.progress, 0.999)) * video.duration;

      // Seek only when the scroll target changes. The decoded frame marks itself dirty.
      if (!video.seeking && Math.abs(video.currentTime - time) > 0.01) {
        video.currentTime = time;
      }

      // 3. Size canvas to viewport
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      const resized = canvas.width !== w * dpr || canvas.height !== h * dpr;
      if (resized) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }

      if (!frameDirty && !resized) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      // 4. Object-fit: cover math
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const canvasAspect = w / h;
      const videoAspect = vw / vh;

      let sx = 0, sy = 0, sw = vw, sh = vh;
      if (videoAspect > canvasAspect) {
        sw = vh * canvasAspect;
        sx = (vw - sw) / 2;
      } else {
        sh = vw / canvasAspect;
        sy = (vh - sh) / 2;
      }

      // 5. ZOOM & SHIFT: Hide the watermark in the top-left
      const zoom = 1.15; // 15% zoom
      const cropW = sw / zoom;
      const cropH = sh / zoom;
      
      // Shift the capture window to the bottom-right to push the top-left out of frame
      sx = sx + (sw - cropW); // Shift max right
      sy = sy + (sh - cropH); // Shift max down

      ctx.drawImage(video, sx, sy, cropW, cropH, 0, 0, w * dpr, h * dpr);
      frameDirty = false;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      active = false;
      controller.abort();
      cancelAnimationFrame(rafRef.current);
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("seeked", onSeeked);
      video.src = "";
      videoRef.current = null;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fallbackSrc, src]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      {/* Poster fallback for instant paint while Blob fetches */}
      {poster && (
        <Image
          src={poster}
          alt=""
          fill
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: ready ? 0 : 1, transition: "opacity 0.8s ease" }}
        />
      )}

      {/* Canvas for frame-accurate video scrub */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ opacity: ready ? 1 : 0, transition: "opacity 0.6s ease" }}
      />

      {/* Dark gradient overlay for content readability */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              to bottom,
              rgba(14,14,12,${overlayOpacity * 0.7}) 0%,
              rgba(14,14,12,${overlayOpacity * 0.4}) 25%,
              rgba(14,14,12,${overlayOpacity * 0.5}) 50%,
              rgba(14,14,12,${overlayOpacity * 0.6}) 75%,
              rgba(14,14,12,${overlayOpacity * 0.9}) 100%
            )
          `,
        }}
      />
    </div>
  );
}
