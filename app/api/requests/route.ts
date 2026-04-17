import { NextResponse } from "next/server";
import { createPaymentRequest } from "@/lib/kv";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, description, recipient } = body;

    if (!amount || !recipient) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = uuidv4();
    const request = await createPaymentRequest({
      id,
      amount,
      description,
      recipient,
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}
