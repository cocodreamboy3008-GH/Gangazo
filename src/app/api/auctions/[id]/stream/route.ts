import { bus, AuctionEvent } from "@/lib/bus";

export const dynamic = "force-dynamic";

// Server-Sent Events: live price / timer / winner updates for one auction
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const enc = new TextEncoder();
  const channel = `a:${params.id}`;

  const stream = new ReadableStream({
    start(controller) {
      const send = (e: AuctionEvent) => {
        try {
          controller.enqueue(enc.encode(`data: ${JSON.stringify(e)}\n\n`));
        } catch { /* closed */ }
      };
      bus().on(channel, send);
      const ka = setInterval(() => {
        try { controller.enqueue(enc.encode(": ka\n\n")); } catch { /* closed */ }
      }, 15000);
      req.signal.addEventListener("abort", () => {
        bus().off(channel, send);
        clearInterval(ka);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
