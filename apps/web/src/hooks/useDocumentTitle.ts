import { useEffect } from "react";

/**
 * Manages document title, meta description, and canonical tags for public and dashboard pages.
 */
export function useDocumentTitle(title: string, description?: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | HireLoop` : "HireLoop — Production-Ready Job Platform";

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", description);
    }

    return () => {
      document.title = previousTitle;
    };
  }, [title, description]);
}

