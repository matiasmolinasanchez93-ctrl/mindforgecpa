"use client";
import { useEffect, useState, type CSSProperties } from "react";
export function SchoolConfetti() {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const timer = setTimeout(() => setVisible(false), 4800); return () => clearTimeout(timer); }, []);
  if (!visible) return null;
  return <div className="school-confetti" aria-hidden="true">
    {Array.from({ length: 54 }, (_, i) => <span key={i}
      className={i % 3 === 0 ? "confetti-piece confetti-ribbon" : "confetti-piece confetti-school"}
      style={{
        left: ((i * 37) % 100) + "%",
        "--drift": ((i * 19) % 180 - 90) + "px",
        "--spin": ((i % 2 ? 1 : -1) * (220 + i * 13)) + "deg",
        animationDelay: ((i % 9) * 0.09) + "s",
        animationDuration: (2.7 + (i % 7) * 0.16) + "s",
        backgroundColor: i % 3 === 0 ? ["#39318c", "#f5d334", "#b52822"][i % 7 % 3] : undefined,
      } as CSSProperties} />)}
  </div>;
}
