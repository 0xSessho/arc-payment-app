import { NextResponse } from "next/server";
import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";

const client = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { deviceId, email } = await req.json();
    
    // Create device token for email login
    const response = await client.createDeviceTokenForEmailLogin({
      deviceId,
      email,
    });

    return NextResponse.json({
      deviceToken: response.data?.deviceToken,
      deviceEncryptionKey: response.data?.deviceEncryptionKey,
      otpToken: response.data?.otpToken,
    });
  } catch (error: any) {
    console.error("Circle Auth Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
