"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

function SyncButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const handleSync = async () => {
    try {
      setLoading(true);
      toast("Syncing project...", {
        description: "Please wait",
        duration: 1500,
      });

      const res = await fetch(`/api/projects/${projectId}/sync-github`, {
        method: "POST",
      });

      const data = await res.json();
      console.log("data", data);

      if (!res.ok) {
        toast.error("Failed to sync project", {
          description: data.message || "Unexpected error occurred",
        });
        return;
      }

      toast.success("Syncing successfull 🎉", {
        description: "Your project is syncing",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to sync";

      toast.error("Something went wrong while syncing", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button onClick={handleSync} disabled={loading}>
      {loading ? "Syncing..." : "Sync Now"}
    </Button>
  );
}

export default SyncButton;
