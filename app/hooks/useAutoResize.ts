import { useCallback, useEffect, useRef } from "react";

function resize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export function useAutoResize(value: string) {
  const elRef = useRef<HTMLTextAreaElement | null>(null);

  const ref = useCallback((el: HTMLTextAreaElement | null) => {
    elRef.current = el;
    if (el) resize(el);
  }, []);

  useEffect(() => {
    if (elRef.current) resize(elRef.current);
  }, [value]);

  function onInput(e: React.FormEvent<HTMLTextAreaElement>) {
    resize(e.currentTarget);
  }

  return { ref, onInput };
}
