import { createPublicClient, http } from "viem";
import { arcTestnet } from "viem/chains";
import { IDENTITY_REGISTRY_ABI } from "./contracts";

const RPC_URL = process.env.NEXT_PUBLIC_ARC_RPC_URL || "https://rpc.testnet.arc.network";

const client = createPublicClient({
  chain: arcTestnet,
  transport: http(RPC_URL),
});

const IDENTITY_REGISTRY = process.env.NEXT_PUBLIC_IDENTITY_REGISTRY as `0x${string}`;
const AGENT_ID = BigInt(process.env.NEXT_PUBLIC_AGENT_ID || "1948");

export interface AgentInfo {
  id: string;
  name: string;
  image: string;
  description: string;
  reputation: number;
  owner: string;
}

export async function getAgentInfo(): Promise<AgentInfo> {
  // Default fallback
  const fallback: AgentInfo = {
    id: AGENT_ID.toString(),
    name: "Arc Payment Agent",
    image: "https://avatar.vercel.sh/1948",
    description: "Secure payment requests powered by ERC-8004",
    reputation: 98,
    owner: "0x0000000000000000000000000000000000000000",
  };

  try {
    // Try to fetch tokenURI
    let tokenURI = "";
    try {
      tokenURI = await client.readContract({
        address: IDENTITY_REGISTRY,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: "tokenURI",
        args: [AGENT_ID],
      });
    } catch (e) {
      console.warn("Could not fetch tokenURI", e);
    }

    // Try to fetch owner
    let owner = "0x0000000000000000000000000000000000000000";
    try {
      owner = await client.readContract({
        address: IDENTITY_REGISTRY,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: "ownerOf",
        args: [AGENT_ID],
      });
    } catch (e) {
      console.warn("Could not fetch ownerOf", e);
    }

    let metadata = { name: "Arc Agent", description: "Trustless AI Agent", image: "" };
    
    if (tokenURI) {
      try {
        const uri = tokenURI.startsWith("ipfs://") 
          ? `https://ipfs.io/ipfs/${tokenURI.slice(7)}` 
          : tokenURI;
        const res = await fetch(uri);
        metadata = await res.json();
      } catch (e) {
        console.warn("Could not fetch metadata from URI", e);
      }
    }

    return {
      id: AGENT_ID.toString(),
      name: metadata.name || fallback.name,
      image: metadata.image?.startsWith("ipfs://") 
        ? `https://ipfs.io/ipfs/${metadata.image.slice(7)}` 
        : metadata.image || fallback.image,
      description: metadata.description || fallback.description,
      reputation: 98,
      owner: owner as string,
    };
  } catch (error) {
    console.error("Error fetching agent info:", error);
    return fallback;
  }
}