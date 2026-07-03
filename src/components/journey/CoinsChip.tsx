"use client";

import { useEffect, useRef, useState } from "react";
import { CoinIcon } from "../icons";

export function CoinsChip({ coins }: { coins: number }) {
  const prev = useRef(coins);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (coins !== prev.current) {
      prev.current = coins;
      setBump(true);
      const t = setTimeout(() => setBump(false), 450);
      return () => clearTimeout(t);
    }
  }, [coins]);

  return (
    <span
      className={`flex items-center gap-1.5 rounded-full bg-raised px-3 py-1 text-sm font-bold text-gold ${
        bump ? "animate-coin" : ""
      }`}
    >
      <CoinIcon className="h-4 w-4" />
      {coins}
    </span>
  );
}
