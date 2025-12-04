"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  UserPlus,
  X,
  Mail,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface ManageProjectClientProps {
  projectId: string;
  projectName: string;
}

export default function ManageProjectClient({
  projectId,
  projectName,
}: ManageProjectClientProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [completeLoading, setCompleteLoading] = useState(false);

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Add email to list
  const handleAddEmail = () => {
    const trimmedEmail = currentEmail.trim().toLowerCase();

    if (!trimmedEmail) {
      toast.error("Please enter an email address");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (emails.includes(trimmedEmail)) {
      toast.error("This email is already in the list");
      return;
    }

    setEmails([...emails, trimmedEmail]);
    setCurrentEmail("");
    toast.success("Email added to invite list");
  };

  // Remove email from list
  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  // Handle key press in input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  // Send invitations
  const handleSendInvites = async () => {
    if (emails.length === 0) {
      toast.error("Please add at least one email address");
      return;
    }

    try {
      setInviteLoading(true);
      const response = await fetch(`/api/projects/${projectId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send invitations");
      }

      toast.success("Invitations sent successfully!", {
        description: `Sent ${emails.length} invitation${emails.length > 1 ? "s" : ""}`,
      });
      setEmails([]);
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Failed to send invitations", {
          description: error.message,
        });
      } else {
        toast.error("Failed to send invitations", {
          description: "Unexpected Error Occured",
        });
      }
    } finally {
      setInviteLoading(false);
    }
  };

  // Mark project as completed
  const handleMarkComplete = async () => {
    if (confirmText !== "COMPLETED") {
      toast.error("Please type COMPLETED to confirm");
      return;
    }

    try {
      setCompleteLoading(true);
      const response = await fetch(`/api/projects/${projectId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark project as completed");
      }

      toast.success("Project marked as completed!", {
        description: "This action cannot be undone",
      });

      setShowCompleteDialog(false);
      setConfirmText("");

      // Redirect or refresh after completion
      window.location.reload();
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Failed to send invitations", {
          description: error.message,
        });
      } else {
        toast.error("Failed to send invitations", {
          description: "Unexpected Error Occured",
        });
      }
    } finally {
      setCompleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Manage Project
        </h1>
        <p className="text-white/60">
          Invite team members and manage project settings
        </p>
      </div>

      {/* Invite Members Section */}
      <Card className="bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 border border-white/10 rounded-xl overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">
                Invite Team Members
              </CardTitle>
              <CardDescription className="text-white/60">
                Add members to collaborate on this project
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Email Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
              <Input
                type="email"
                placeholder="Enter email address..."
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="
                  pl-10
                  bg-white/5 
                  border border-white/10 
                  text-white 
                  placeholder:text-white/40
                  focus:border-indigo-400/50
                  focus:bg-white/10
                  transition-all
                  h-11
                  rounded-xl
                "
              />
            </div>
            <Button
              onClick={handleAddEmail}
              className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 hover:bg-indigo-500/30 hover:border-indigo-400/50 px-6"
            >
              Add
            </Button>
          </div>

          {/* Email List */}
          {emails.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-white/60 font-medium">
                {emails.length} email{emails.length > 1 ? "s" : ""} to invite:
              </p>
              <div className="flex flex-wrap gap-2">
                {emails.map((email) => (
                  <Badge
                    key={email}
                    variant="outline"
                    className="
                      pl-3 pr-2 py-1.5
                      bg-indigo-500/20 
                      border-indigo-400/30 
                      text-indigo-200
                      flex items-center gap-2
                    "
                  >
                    <span className="text-sm">{email}</span>
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className="hover:bg-indigo-400/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Send Invites Button */}
          <Button
            onClick={handleSendInvites}
            disabled={emails.length === 0 || inviteLoading}
            className="
              w-full 
              bg-gradient-to-r 
              from-indigo-500 
              to-purple-600 
              hover:from-indigo-600 
              hover:to-purple-700
              text-white 
              font-semibold
              shadow-lg 
              shadow-indigo-500/30
              hover:shadow-indigo-500/40
              transition-all
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {inviteLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Invitations...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Send {emails.length > 0 ? `${emails.length} ` : ""}Invitation
                {emails.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-gradient-to-br from-red-500/5 to-orange-500/5 border border-red-500/20 rounded-xl overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Danger Zone</CardTitle>
              <CardDescription className="text-white/60">
                Irreversible actions for this project
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">
                  Mark Project as Completed
                </h3>
                <p className="text-white/60 text-sm">
                  Once you mark this project as completed, it cannot be
                  reopened. All active features will be locked.
                </p>
              </div>
              <Button
                onClick={() => setShowCompleteDialog(true)}
                variant="outline"
                className="
                  border-red-500/30 
                  text-red-400 
                  hover:bg-red-500/10 
                  hover:border-red-400/50 
                  hover:text-red-300
                  whitespace-nowrap
                "
              >
                Mark Complete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="max-w-md bg-[#0f111a]/95 border border-red-500/30 backdrop-blur-xl rounded-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <DialogTitle className="text-2xl text-white font-bold">
                Mark as Completed?
              </DialogTitle>
            </div>
            <DialogDescription className="text-white/60">
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-white/80 text-sm leading-relaxed">
                Completing{" "}
                <span className="font-semibold text-white">{projectName}</span>{" "}
                will:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>Archive all project data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>Lock all editing capabilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>Mark the project status as completed</span>
                </li>
              </ul>
            </div>

            <div>
              <label className="text-white/60 text-sm mb-2 block">
                Type{" "}
                <span className="font-mono font-bold text-red-400">
                  COMPLETED
                </span>{" "}
                to confirm:
              </label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="COMPLETED"
                className="
                  bg-white/5 
                  border border-white/10 
                  text-white 
                  placeholder:text-white/40
                  focus:border-red-400/50
                  h-11
                  rounded-xl
                  font-mono
                "
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowCompleteDialog(false);
                setConfirmText("");
              }}
              disabled={completeLoading}
              className="flex-1 bg-transparent border-white/10 text-white/80 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMarkComplete}
              disabled={confirmText !== "COMPLETED" || completeLoading}
              className="
                flex-1 
                bg-gradient-to-r 
                from-red-500 
                to-orange-600 
                hover:from-red-600 
                hover:to-orange-700
                text-white 
                font-semibold
                shadow-lg 
                shadow-red-500/30
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {completeLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
