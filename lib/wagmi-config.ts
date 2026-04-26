import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { defineChain } from 'viem';

const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Network Testnet',
  network: 'arc-testnet', // 👈 importante

  nativeCurrency: {
    decimals: 18,
    name: 'ARC',
    symbol: 'ARC',
  },

  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
    public: { http: ['https://rpc.testnet.arc.network'] }, // 👈 agrega esto también
  },

  blockExplorers: {
    default: { name: 'Archiescan', url: 'https://archiescan.io' },
  },
});

export const config = createConfig({
  chains: [arcTestnet],
  connectors: [injected()],
  transports: {
    [arcTestnet.id]: http(),
  },
});