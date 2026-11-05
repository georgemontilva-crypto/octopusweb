import { useEffect } from "react";

export function useSeo(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (description) {
      const m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute("content", description);
    }
  }, [title, description]);
}
