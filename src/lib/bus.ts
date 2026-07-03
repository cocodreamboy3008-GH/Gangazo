import { EventEmitter } from "events";

const g = globalThis as unknown as { __bus?: EventEmitter };
export function bus() {
  if (!g.__bus) {
    g.__bus = new EventEmitter();
    g.__bus.setMaxListeners(1000);
  }
  return g.__bus;
}

export type AuctionEvent = {
  type: "start" | "bid" | "end";
  auctionId: string;
  status: string;
  priceCents: number;
  totalBids: number;
  timerEndsAt: string | null;
  now: number;
  leader: string | null;
  leaderIsBot: boolean;
  finalCents?: number | null;
  winnerName?: string | null;
};

export const emitAuction = (e: AuctionEvent) => bus().emit(`a:${e.auctionId}`, e);
