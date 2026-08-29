import { useEffect } from "react";

// Lightweight replacement for TanStack Start's per-route `head()` config now
// that there's no SSR head management. Updates document.title and upserts
// meta tags on mount, restoring the previous title on unmount.
type PageMeta = {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
};

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function usePageMeta({ title, description, ogTitle, ogDescription }: PageMeta) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    if (description) upsertMeta("name", "description", description);
    if (ogTitle) upsertMeta("property", "og:title", ogTitle);
    if (ogDescription) upsertMeta("property", "og:description", ogDescription);
    return () => {
      document.title = previousTitle;
    };
  }, [title, description, ogTitle, ogDescription]);
}
