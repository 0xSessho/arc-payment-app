import { createPublicClient, http, parseAbiItem } from "viem";
import { arcTestnet } from "viem/chains";
import { IDENTITY_REGISTRY_ABI } from "./contracts";

const RPC_URL = "https://arc-testnet.drpc.org";

const client = createPublicClient({
  chain: arcTestnet,
  transport: http(RPC_URL),
});

const IDENTITY_REGISTRY = process.env.NEXT_PUBLIC_IDENTITY_REGISTRY as `0x${string}`;
const REPUTATION_REGISTRY = process.env.NEXT_PUBLIC_REPUTATION_REGISTRY as `0x${string}`;
const AGENT_ID = BigInt(process.env.NEXT_PUBLIC_AGENT_ID || "1948");

export interface AgentInfo {
  id: string;
  name: string;
  image: string;
  description: string;
  reputation: number;
  owner: string;
  txns: number;
  validations: number;
}

export async function getAgentInfo(): Promise<AgentInfo> {
  const fallback: AgentInfo = {
    id: AGENT_ID.toString(),
    name: "Arc Payment Agent",
    image: "https://avatar.vercel.sh/1948",
    description: "Secure payment requests powered by ERC-8004",
    reputation: 98,
    owner: "0x0000000000000000000000000000000000000000",
    txns: 0,
    validations: 0,
  };

  try {
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

    let owner = fallback.owner;
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

    let reputation = 98;
    let validations = 0;
    try {
      const latestBlock = await client.getBlockNumber();
      const fromBlock = latestBlock > 10000n ? latestBlock - 10000n : 0n;

      const feedbackLogs = await client.getLogs({
        address: REPUTATION_REGISTRY,
        event: parseAbiItem(
          "event NewFeedback(uint256 indexed agentId, address indexed clientAddress, uint64 feedbackIndex, int128 value, uint8 valueDecimals, string indexed indexedTag1, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)"
        ),
        args: { agentId: AGENT_ID },
        fromBlock,
        toBlock: latestBlock,
      });

      validations = feedbackLogs.length;

      if (feedbackLogs.length > 0) {
        const scores = feedbackLogs
          .map((log) => Number((log.args as any).value))
          .filter((s) => !isNaN(s));
        if (scores.length > 0) {
          reputation = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        }
      }
    } catch (e) {
      console.warn("Could not fetch reputation logs", e);
    }

    let txns = 0;
    try {
      const latestBlock = await client.getBlockNumber();
      const fromBlock = latestBlock > 10000n ? latestBlock - 10000n : 0n;

      const transferLogs = await client.getLogs({
        address: IDENTITY_REGISTRY,
        event: parseAbiItem(
          "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
        ),
        args: { tokenId: AGENT_ID },
        fromBlock,
        toBlock: latestBlock,
      });

      txns = transferLogs.length;
    } catch (e) {
      console.warn("Could not fetch transfer logs", e);
    }

    let metadata = { name: fallback.name, description: fallback.description, image: "" };
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
      reputation,
      owner: owner as string,
      txns,
      validations,
    };
  } catch (error) {
    console.error("Error fetching agent info:", error);
    return fallback;
  }
}