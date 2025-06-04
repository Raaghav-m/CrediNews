import Web3 from "web3";
import { GraphitePlugin } from "@atgraphite/web3-plugin";
import { getUserProfile } from "@/lib/contract";

class GraphiteService {
  private web3: Web3;
  private static instance: GraphiteService;

  private constructor() {
    // Initialize with a placeholder, will be properly set up when connecting
    this.web3 = new Web3("https://anon-entrypoint-test-1.atgraphite.com");
  }

  public static getInstance(): GraphiteService {
    if (!GraphiteService.instance) {
      GraphiteService.instance = new GraphiteService();
    }
    return GraphiteService.instance;
  }

  public async connect(privateKey: string): Promise<void> {
    try {
      // Initialize Web3 with the Graphite node
      this.web3 = new Web3("https://anon-entrypoint-test-1.atgraphite.com");

      // Add the account using the private key
      this.web3.eth.accounts.wallet.add(privateKey);

      // Register the Graphite plugin
      this.web3.registerPlugin(new GraphitePlugin(this.web3));

      // Verify connection
      const address = this.web3.eth.accounts.wallet[0].address;
      if (!address) {
        throw new Error("Failed to connect wallet");
      }
    } catch (error) {
      console.error("Error connecting to Graphite:", error);
      throw error;
    }
  }

  public async isAccountActivated(): Promise<boolean> {
    try {
      return await this.web3.graphite.isActivated();
    } catch (error) {
      console.error("Error checking account activation:", error);
      throw error;
    }
  }

  public async activateAccount(): Promise<void> {
    try {
      await this.web3.graphite.activateAccount();
    } catch (error) {
      console.error("Error activating account:", error);
      throw error;
    }
  }

  public async getReputation(address?: string): Promise<number> {
    try {
      // If no address provided, use the connected wallet address
      const targetAddress = address || this.getAddress();

      if (!targetAddress) {
        console.error("No address provided and no wallet connected");
        return 0;
      }

      // Use Graphite's native reputation system
      const reputation = await this.web3.graphite.getReputation(targetAddress);
      console.log(
        "Raw Graphite reputation for address",
        targetAddress,
        ":",
        reputation
      );

      // Convert to number for UI display
      const numericReputation = Number(reputation);
      console.log(
        "Converted reputation:",
        numericReputation,
        "Type:",
        typeof numericReputation
      );

      if (isNaN(numericReputation)) {
        console.error("Invalid reputation value from Graphite:", reputation);
        return 0;
      }

      return numericReputation;
    } catch (error) {
      console.error("Error fetching reputation from Graphite:", error);
      throw error;
    }
  }

  public getAddress(): string {
    return this.web3.eth.accounts.wallet[0]?.address || "";
  }
}

export const graphiteService = GraphiteService.getInstance();
