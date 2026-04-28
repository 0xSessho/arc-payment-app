import { NextResponse } from "next/server";
import { getPaymentRequest, updatePaymentRequestStatus } from "@/lib/kv";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { keccak256, toHex } from "viem";

const REPUTATION_REGISTRY = process.env.NEXT_PUBLIC_REPUTATION_REGISTRY!;
const VALIDATOR_WALLET = process.env.NEXT_PUBLIC_VALIDATOR_WALLET!;

const circleClient = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const request = await getPaymentRequest(id);
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    return NextResponse.json(request);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch request" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status, txHash } = await req.json();

    if (status !== "paid" || !txHash) {
      return NextResponse.json({ error: "Invalid status or missing txHash" }, { status: 400 });
    }

    // Guarda el pago en Redis
    await updatePaymentRequestStatus(id, "paid", txHash);

    // Registra feedback en el contrato de reputación (no bloqueante)
    try {
      const agentId = process.env.NEXT_PUBLIC_AGENT_ID || "1948";
      const tag = "payment_completed";
      const feedbackHash = keccak256(toHex(`${tag}_${txHash}`));

      await circleClient.createContractExecutionTransaction({
        walletAddress: VALIDATOR_WALLET,
        blockchain: "ARC-TESTNET",
        contractAddress: REPUTATION_REGISTRY,
        abiFunctionSignature: "giveFeedback(uint256,int128,uint8,string,string,string,string,bytes32)",
        abiParameters: [agentId, "95", "0", tag, "", "", "", feedbackHash],
        fee: { type: "level", config: { feeLevel: "MEDIUM" } },
      });

      console.log(`Reputation feedback recorded for payment ${txHash}`);
    } catch (reputationError) {
      // Si falla la reputación no bloqueamos el pago
      console.error("Failed to record reputation:", reputationError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}