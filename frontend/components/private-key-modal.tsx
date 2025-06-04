"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PrivateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (privateKey: string) => void;
}

export function PrivateKeyModal({
  isOpen,
  onClose,
  onSubmit,
}: PrivateKeyModalProps) {
  const [privateKey, setPrivateKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(privateKey);
    setPrivateKey("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-background/80 backdrop-blur-sm" />
      <DialogContent className="sm:max-w-[425px] border-none bg-background/70 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle>Connect Graphite SDK</DialogTitle>
          <DialogDescription>
            Enter your private key to connect to the Graphite SDK. This is
            required for reputation features.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="privateKey">Private Key</Label>
              <Input
                id="privateKey"
                type="password"
                placeholder="Enter your private key"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                required
                className="bg-background/50 backdrop-blur-sm focus:bg-background/80"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Connect</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
