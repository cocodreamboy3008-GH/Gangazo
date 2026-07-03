import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import AuctionRoom from "./AuctionRoom";

export const dynamic = "force-dynamic";

export default async function AuctionPage({ params }: { params: { id: string } }) {
  const exists = await prisma.auction.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!exists) notFound();
  return <AuctionRoom id={params.id} />;
}
