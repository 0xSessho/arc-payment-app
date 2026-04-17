import { NextResponse } from "next/server";
import { getPaymentRequest, updatePaymentRequestStatus } from "@/lib/kv";

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

    await updatePaymentRequestStatus(id, "paid", txHash);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
