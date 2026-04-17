import { NextResponse } from "next/server";
import { initiateUserControlledWalletsClient, Blockchain, TokenBlockchain } from "@circle-fin/user-controlled-wallets";
import { v4 as uuidv4 } from "uuid";

const client = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { userToken, amount, recipient } = await req.json();

    // 1. Check if user has wallets
    const walletsResponse = await client.listWallets({ userToken });
    const wallets = walletsResponse.data?.wallets || [];

    if (wallets.length === 0) {
      // Initialize user with wallets (this creates the first wallet + PIN/Security questions)
      const response = await client.createUserPinWithWallets({
        userToken,
        blockchains: [Blockchain.ArcTestnet],
        accountType: "SCA",
      });
      return NextResponse.json({ challengeId: response.data?.challengeId, type: "create_wallet" });
    }

    // 2. Create transfer challenge using createTransaction
    const response = await client.createTransaction({
      idempotencyKey: uuidv4(),
      userToken,
      walletId: wallets[0].id,
      destinationAddress: recipient,
      blockchain: "ETH-ARC" as TokenBlockchain,
      tokenAddress: "0x3600000000000000000000000000000000000000", // USDC on Arc
      amounts: [amount],
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    });

    return NextResponse.json({ challengeId: response.data?.challengeId, type: "transfer" });
  } catch (error: any) {
    console.error("Circle Transfer Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
