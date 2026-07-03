import { requireUser, jsonError, AppError } from "@/lib/auth";
import { placeBid } from "@/lib/bidding";

// simple anti-spam: 1 bid / 500ms per user
const last = new Map<string, number>();

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const t = last.get(user.id) || 0;
    if (Date.now() - t < 500) throw new AppError("¡Tranquilo! Una puja a la vez.", 429);
    last.set(user.id, Date.now());

    const r = await placeBid(params.id, { userId: user.id, username: user.username });
    return Response.json({ ok: true, priceCents: r.priceCents, bidBalance: user.bidBalance - 1 });
  } catch (e) {
    return jsonError(e);
  }
}
