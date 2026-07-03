"use client";

import { useEffect, useRef } from "react";
import { springPop } from "@/lib/spring";
import { CoinIcon } from "../icons";

export function CoinsChip({ coins }: { coins: number }) {
  const prev = useRef(coins);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (coins !== prev.current) {
      prev.current = coins;
      if (ref.current) springPop(ref.current);
    }
  }, [coins]);

  return (
    <span
      ref={ref}
      data-fx="coins"
      className="coin-chip flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold"
    >
      <CoinIcon className="h-4 w-4" />
      {coins}
    </span>
  );
}
