import { useEffect, useState } from "react";

const SLIDE_INTERVAL_MS = 4000;

// Fills its (relative, overflow-hidden) parent with the given images. Several
// images cross-fade one by one every 4 seconds and get navigation dots; a single
// image is just shown, with no timer and no dots.
export function BannerSlideshow({ images }) {
  const [current, setCurrent] = useState(0);
  const count = images.length;
  // Re-keyed on the list itself so a changed banner set restarts from the first image.
  const signature = images.join("|");

  useEffect(() => {
    setCurrent(0);
  }, [signature]);

  useEffect(() => {
    if (count <= 1) return undefined;

    const timer = setInterval(() => {
      setCurrent((index) => (index + 1) % count);
    }, SLIDE_INTERVAL_MS);

    // `current` is a dependency so a manual dot click also restarts the 4 s countdown.
    return () => clearInterval(timer);
  }, [count, signature, current]);

  const active = count ? current % count : 0;

  return (
    <>
      {images.map((src, index) => (
        <div
          key={src}
          aria-hidden="true"
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}

      {count > 1 && (
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`Go to banner ${index + 1}`}
              aria-current={index === active}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === active ? "w-7 bg-white" : "w-2 bg-white/60 hover:bg-white"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
