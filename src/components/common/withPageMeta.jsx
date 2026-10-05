import { useEffect } from "react";

const DEFAULT_TITLE = "All India Car Dealers Association";

function upsertMeta({ name, property, content }) {
  const attr = property ? "property" : "name";
  const key = property || name;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  const created = !el;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  const previous = el.getAttribute("content");
  el.setAttribute("content", content);
  return () => {
    if (created) el.remove();
    else if (previous !== null) el.setAttribute("content", previous);
  };
}

// Applies a route's <title>/<meta> tags while the page is mounted and restores
// the defaults from index.html on unmount (replaces TanStack's route `head()`).
function usePageMeta(meta) {
  useEffect(() => {
    const restorers = [];
    const previousTitle = document.title;
    for (const entry of meta) {
      if (entry.title) document.title = entry.title;
      else restorers.push(upsertMeta(entry));
    }
    return () => {
      document.title = previousTitle || DEFAULT_TITLE;
      restorers.forEach((restore) => restore());
    };
  }, [meta]);
}

export function withPageMeta(Component, meta) {
  function PageWithMeta(props) {
    usePageMeta(meta);
    return <Component {...props} />;
  }
  PageWithMeta.displayName = `withPageMeta(${Component.displayName || Component.name || "Page"})`;
  return PageWithMeta;
}
