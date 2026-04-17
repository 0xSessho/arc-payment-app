import { kv } from "@vercel/kv";

export interface PaymentRequest {
  id: string;
  amount: string;
  description: string;
  recipient: string;
  status: "pending" | "paid";
  createdAt: number;
  txHash?: string;
}

export async function createPaymentRequest(data: Omit<PaymentRequest, "status" | "createdAt">): Promise<PaymentRequest> {
  const request: PaymentRequest = {
    ...data,
    status: "pending",
    createdAt: Date.now(),
  };
  await kv.set(`request:${data.id}`, request);
  return request;
}

export async function getPaymentRequest(id: string): Promise<PaymentRequest | null> {
  return await kv.get<PaymentRequest>(`request:${id}`);
}

export async function updatePaymentRequestStatus(id: string, status: "paid", txHash: string): Promise<void> {
  const request = await getPaymentRequest(id);
  if (request) {
    request.status = status;
    request.txHash = txHash;
    await kv.set(`request:${id}`, request);
  }
}
