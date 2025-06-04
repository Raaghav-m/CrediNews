import { http, createConfig, injected } from "wagmi";
// import { type Chain } from "viem";
import { mainnet, sepolia, type Chain } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

export const GraphiteChain = {
  id: 54170,
  name: "Graphite",
  nativeCurrency: { name: "Graphite", symbol: "@G", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://anon-entrypoint-test-1.atgraphite.com"] },
  },
  blockExplorers: {
    default: { name: "Graphite Scan", url: "https://test.atgraphite.com" },
  },
} as const satisfies Chain;

export const config = createConfig({
  chains: [GraphiteChain],
  connectors: [metaMask()],
  transports: {
    [GraphiteChain.id]: http("https://anon-entrypoint-test-1.atgraphite.com"),
  },
});

// Define your custom chain
