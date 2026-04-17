"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Link as LinkIcon, Copy, Check } from "lucide-react";

export function CreateRequestForm() {
  const [loading, setLoading] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      amount: formData.get("amount"),
      description: formData.get("description"),
      recipient: formData.get("recipient"),
    };

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create request");

      const request = await res.json();
      setCreatedRequest(request);
      toast.success("Payment request created!");
    } catch (error) {
      toast.error("Error creating request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/pay/${createdRequest?.id}` : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (createdRequest) {
    return (
      <Card className="w-full max-w-md mx-auto border-zinc-800 bg-zinc-900/50 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
        <CardHeader>
          <CardTitle>Request Created!</CardTitle>
          <CardDescription>Share this link with the payer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
            <LinkIcon className="w-4 h-4 text-zinc-500 shrink-0" />
            <span className="text-xs text-zinc-300 truncate">{shareUrl}</span>
            <Button size="icon" variant="ghost" className="h-8 w-8 ml-auto" onClick={copyToClipboard}>
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
            </Button>
          </div>
          <Button className="w-full bg-zinc-100 text-zinc-950 hover:bg-white" onClick={() => setCreatedRequest(null)}>
            Create Another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>New Payment Request</CardTitle>
        <CardDescription>Request USDC on Arc Testnet.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USDC)</Label>
            <Input id="amount" name="amount" type="number" step="0.000001" placeholder="0.00" required className="bg-zinc-950 border-zinc-800 focus:ring-purple-500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input id="recipient" name="recipient" placeholder="0x..." required className="bg-zinc-950 border-zinc-800 focus:ring-purple-500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input id="description" name="description" placeholder="For the AI service..." className="bg-zinc-950 border-zinc-800 focus:ring-purple-500" />
          </div>
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Generate Payment Link
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
