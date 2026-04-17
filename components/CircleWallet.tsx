"use client";

import { useEffect, useState, useRef } from "react";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";

interface CircleWalletProps {
  amount: string;
  recipient: string;
  onSuccess: (txHash: string) => void;
}

export function CircleWallet({ amount, recipient, onSuccess }: CircleWalletProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp" | "ready">("email");
  const [userToken, setUserToken] = useState<string | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const sdkRef = useRef<W3SSdk | null>(null);

  useEffect(() => {
    const onLoginComplete = (error: any, result: any) => {
      if (error) {
        toast.error(error.message || "OTP verification failed");
        setLoading(false);
        return;
      }
      setUserToken(result.userToken);
      setEncryptionKey(result.encryptionKey);
      setStep("ready");
      setLoading(false);
      toast.success("Email verified!");
    };

    const s = new W3SSdk({ appSettings: { appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID! } }, onLoginComplete);
    sdkRef.current = s;
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const deviceId = await sdkRef.current?.getDeviceId();
      const res = await fetch("/api/circle/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, deviceId }),
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      sdkRef.current?.updateConfigs({
        appSettings: { appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID! },
        loginConfigs: {
          deviceToken: data.deviceToken,
          deviceEncryptionKey: data.deviceEncryptionKey,
          otpToken: data.otpToken,
        },
      });

      setStep("otp");
      toast.info("OTP sent to your email!");
    } catch (error: any) {
      toast.error(error.message || "Failed to request OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    setLoading(true);
    sdkRef.current?.verifyOtp();
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      if (!sdkRef.current || !userToken || !encryptionKey) return;

      sdkRef.current.setAuthentication({ userToken, encryptionKey });

      const res = await fetch("/api/circle/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken, amount, recipient }),
      });
      
      const { challengeId, type } = await res.json();
      
      sdkRef.current.execute(challengeId, (error, result: any) => {
        if (error) {
          toast.error(error.message || "Challenge failed");
        } else {
          onSuccess(result?.txHash || "pending");
        }
        setLoading(false);
      });
    } catch (error: any) {
      toast.error(error.message || "Payment initiation failed");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {step === "email" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-zinc-950 border-zinc-800"
                required
              />
            </div>
          </div>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleRequestOtp}
            disabled={loading || !email}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
            Send Login OTP
          </Button>
        </>
      )}

      {step === "otp" && (
        <div className="text-center space-y-4">
          <div className="p-4 bg-blue-500/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-zinc-400 text-sm">We've sent a code to <span className="text-white font-medium">{email}</span></p>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-bold"
            onClick={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Verify OTP Code"}
          </Button>
          <Button variant="link" className="text-zinc-500" onClick={() => setStep("email")}>Change Email</Button>
        </div>
      )}

      {step === "ready" && (
        <div className="text-center space-y-4">
           <div className="p-4 bg-green-500/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <Mail className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-zinc-400 text-sm">Authenticated as <span className="text-white font-medium">{email}</span></p>
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg font-bold"
            onClick={handleFinalize}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : `Pay ${amount} USDC`}
          </Button>
        </div>
      )}
    </div>
  );
}
