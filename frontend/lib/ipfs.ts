import axios from "axios";

interface IPFSContent {
  name: string;
  description: string;
  tags: string[];
  postedBy: string;
  timestamp: string;
}

class IPFSService {
  private gateway: string;
  private apiKey: string;
  private apiSecret: string;
  private pinataBaseUrl: string;

  constructor() {
    this.gateway = "https://gateway.pinata.cloud/ipfs";
    this.pinataBaseUrl = "https://api.pinata.cloud";
    this.apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || "";
    this.apiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET || "";
    console.log("IPFS API Key:", this.apiKey);
    console.log("IPFS API Secret:", this.apiSecret);
  }

  private getHeaders() {
    return {
      headers: {
        pinata_api_key: this.apiKey,
        pinata_secret_api_key: this.apiSecret,
        "Content-Type": "application/json",
      },
    };
  }

  async uploadContent(content: Omit<IPFSContent, "id">): Promise<string> {
    try {
      console.log("Uploading to IPFS with headers:", {
        apiKey: this.apiKey ? "Set" : "Not set",
        apiSecret: this.apiSecret ? "Set" : "Not set",
      });

      const response = await axios.post(
        `${this.pinataBaseUrl}/pinning/pinJSONToIPFS`,
        content,
        this.getHeaders()
      );

      console.log("IPFS upload response:", response.data);
      return response.data.IpfsHash;
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Pinata API error details:", {
          status: error.response.status,
          data: error.response.data,
        });
        if (error.response.status === 401) {
          throw new Error(
            "Failed to authenticate with Pinata. Please check your API keys."
          );
        }
      }
      throw error;
    }
  }

  async getContent(hash: string): Promise<IPFSContent> {
    try {
      const response = await axios.get(`${this.gateway}/${hash}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching from IPFS:", error);
      throw error;
    }
  }

  async unpinContent(hash: string): Promise<void> {
    try {
      await axios.delete(
        `${this.pinataBaseUrl}/pinning/unpin/${hash}`,
        this.getHeaders()
      );
    } catch (error) {
      console.error("Error unpinning from IPFS:", error);
      throw error;
    }
  }
}

export const ipfsService = new IPFSService();
export type { IPFSContent };
