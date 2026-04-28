import { useState, useCallback, useEffect } from "react";

export default function useLightbox(images) {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const openLightbox = useCallback((idx = 0) => {
    setIndex(idx);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "";
  }, []);

  const next = useCallback(() => {
    if (!images?.length) return;
    setIndex((i) => (i + 1) % images.length);
  }, [images?.length]);

  const prev = useCallback(() => {
    if (!images?.length) return;
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images?.length]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, next, prev, closeLightbox]);

  return { isOpen, index, setIndex, openLightbox, closeLightbox, next, prev };
}
