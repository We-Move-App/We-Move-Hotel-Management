import { useEffect } from "react";

export const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, callback]);
};
