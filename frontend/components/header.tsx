"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Clock, Key, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { PrivateKeyModal } from "./private-key-modal";
import { useToast } from "@/components/ui/use-toast";
import { graphiteService } from "@/lib/graphite";

export function Header() {
  const [reputation, setReputation] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSDKConnected, setIsSDKConnected] = useState(false);
  const [isAccountActivated, setIsAccountActivated] = useState(false);

  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const connectWallet = async () => {
    try {
      await connect({ connector: injected() });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const disconnectWallet = () => {
    disconnect();
    setReputation(0);
    setCooldownTime(0);
    setIsSDKConnected(false);
    setIsAccountActivated(false);
  };

  const handleSDKConnect = async (privateKey: string) => {
    try {
      await graphiteService.connect(privateKey);
      setIsSDKConnected(true);
      setIsModalOpen(false);
      toast({
        title: "Success",
        description: "SDK Connected Successfully",
      });
      // Check if account is activated
      checkAccountStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect SDK",
        variant: "destructive",
      });
    }
  };

  const checkAccountStatus = async () => {
    try {
      const isActivated = await graphiteService.isAccountActivated();
      setIsAccountActivated(isActivated);
      if (isActivated) {
        const rep = await graphiteService.getReputation();
        setReputation(rep);
      }
    } catch (error) {
      console.error("Failed to check account status:", error);
      toast({
        title: "Error",
        description: "Failed to check account status",
        variant: "destructive",
      });
    }
  };

  const activateAccount = async () => {
    try {
      await graphiteService.activateAccount();
      setIsAccountActivated(true);
      const rep = await graphiteService.getReputation();
      setReputation(rep);
      toast({
        title: "Success",
        description: "Account activated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate account",
        variant: "destructive",
      });
    }
  };

  // Check SDK connection status when wallet connects
  useEffect(() => {
    if (isConnected && !isSDKConnected) {
      setIsModalOpen(true); // Automatically open SDK connection modal when wallet connects
    }
  }, [isConnected, isSDKConnected]);

  // Check account status periodically when SDK is connected
  useEffect(() => {
    if (isSDKConnected) {
      checkAccountStatus();
      const interval = setInterval(checkAccountStatus, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isSDKConnected]);

  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16 gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">CrediNews</h1>
          {isSDKConnected && (
            <Badge variant="outline" className="gap-1">
              <Key className="w-3 h-3" />
              SDK Connected
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isConnected ? (
            <>
              {isSDKConnected ? (
                <>
                  {isAccountActivated ? (
                    <Badge variant="secondary" className="gap-1">
                      <Award className="w-3 h-3" />
                      {reputation} Rep
                    </Badge>
                  ) : (
                    <Button size="sm" onClick={activateAccount}>
                      Activate Account
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Reconnect SDK
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setIsModalOpen(true)}>
                  Connect SDK
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectWallet}
                className="gap-2"
              >
                <Wallet className="w-4 h-4" />
                {formatAddress(address)}
              </Button>
            </>
          ) : (
            <Button onClick={connectWallet} className="gap-2">
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      <PrivateKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSDKConnect}
      />
    </header>
  );
}
