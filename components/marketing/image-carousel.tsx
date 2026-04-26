"use client";

import Image from "next/image";
import { useState, useCallback, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CarouselImage = { src: string; alt: string };

export function ImageCarousel({
  images,
  aspectClassName = "aspect-square",
  autoPlay = false,
  autoPlayInterval = 3000,
}: {
  images: CarouselImage[];
  aspectClassName?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}) {
  if (images.length === 0) return null;

  const slides = [images[images.length - 1], ...images, images[0]];

  const [index, setIndex] = useState(1);
  const [animated, setAnimated] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const startTimer = useCallback(() => {
    if (!autoPlay) return;
    clearTimer();
    timerRef.current = setInterval(() => {
      setAnimated(true);
      setIndex((i) => i + 1);
    }, autoPlayInterval);
  }, [autoPlay, autoPlayInterval, clearTimer]);

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer]);

  const go = useCallback(
    (delta: 1 | -1) => {
      setAnimated(true);
      setIndex((i) => i + delta);
      startTimer(); // reset auto-play countdown on manual interaction
    },
    [startTimer],
  );

  const handleTransitionEnd = useCallback(() => {
    if (index === 0) {
      setAnimated(false);
      setIndex(images.length);
    } else if (index === slides.length - 1) {
      setAnimated(false);
      setIndex(1);
    }
  }, [index, images.length, slides.length]);

  useEffect(() => {
    if (!animated) {
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnimated(true)),
      );
      return () => cancelAnimationFrame(raf);
    }
  }, [animated]);

  const realIndex =
    index === 0
      ? images.length - 1
      : index === slides.length - 1
        ? 0
        : index - 1;

  return (
    <div
      className="group relative w-full overflow-hidden rounded-2xl"
      onMouseEnter={clearTimer}
      onMouseLeave={startTimer}
    >
      {/* Slides */}
      <div
        className={cn(
          "flex",
          animated && "transition-transform duration-500 ease-in-out",
        )}
        style={{ transform: `translateX(-${index * 100}%)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {slides.map((image, i) => (
          <div key={i} className={cn("relative min-w-full", aspectClassName)}>
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover p-5"
              priority={i === 1}
            />
          </div>
        ))}
      </div>

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 opacity-0 shadow-sm backdrop-blur-sm transition-opacity hover:bg-white group-hover:opacity-100"
          >
            <ArrowLeft className="h-4 w-4 text-brand-900" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next image"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 opacity-0 shadow-sm backdrop-blur-sm transition-opacity hover:bg-white group-hover:opacity-100"
          >
            <ArrowRight className="h-4 w-4 text-brand-900" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setAnimated(true);
                setIndex(i + 1);
                startTimer();
              }}
              aria-label={`Go to image ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === realIndex ? "w-5 bg-brand-700" : "w-1.5 bg-brand-700/40",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
