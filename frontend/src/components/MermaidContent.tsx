"use client";

import { useEffect, useRef } from "react";

interface Props {
  chart: string;
}

export default function MermaidContent({ chart }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        fontFamily: "inherit",
      });
      if (cancelled || !ref.current) return;
      const id = `mermaid-${Math.random().toString(36).slice(2)}`;
      try {
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch {
        if (ref.current) ref.current.textContent = "Diagram render failed.";
      }
    };
    render();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  return <div ref={ref} className="w-full overflow-x-auto" />;
}
