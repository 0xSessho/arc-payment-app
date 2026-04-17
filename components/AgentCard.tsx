"use client";

import { useEffect, useState } from "react";
import { getAgentInfo, AgentInfo } from "@/lib/agent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Info } from "lucide-react";

export function AgentCard() {
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAgentInfo().then((info) => {
      setAgent(info);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto overflow-hidden border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <div className="h-48 bg-zinc-800 animate-pulse" />
        <CardContent className="pt-6">
          <Skeleton className="h-8 w-3/4 mb-4 bg-zinc-800" />
          <Skeleton className="h-4 w-full mb-2 bg-zinc-800" />
          <Skeleton className="h-4 w-5/6 bg-zinc-800" />
        </CardContent>
      </Card>
    );
  }

  if (!agent) return null;

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden border-zinc-800 bg-zinc-900/50 backdrop-blur-xl group hover:border-purple-500/50 transition-all duration-300 shadow-2xl shadow-purple-500/10">
      <div className="relative h-48 overflow-hidden">
        <img
          src={agent.image}
          alt={agent.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-60" />
        <Badge className="absolute top-4 right-4 bg-purple-600/90 text-white border-none backdrop-blur-md">
          <Shield className="w-3 h-3 mr-1" />
          ERC-8004 Certified
        </Badge>
      </div>
      <CardHeader className="relative -mt-12 pt-0">
        <div className="flex items-end justify-between">
          <div className="p-1 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl">
             <img src={agent.image} className="w-16 h-16 rounded-xl object-cover" />
          </div>
          <div className="flex flex-col items-end pb-2">
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Reputation</span>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              {agent.reputation}/100
            </span>
          </div>
        </div>
        <CardTitle className="mt-4 text-2xl font-bold text-zinc-100">{agent.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-zinc-400 text-sm leading-relaxed">
          {agent.description}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/50">
          <Info className="w-3 h-3" />
          ID: {agent.id} | Owner: {agent.owner.slice(0, 6)}...{agent.owner.slice(-4)}
        </div>
      </CardContent>
    </Card>
  );
}
