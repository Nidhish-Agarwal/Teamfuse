"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ProjectCardType from "@/lib/interfaces/ProjectCardType";
import { Loader2, Clock, Mail, Github, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function PendingInviteCard({
  project,
  setInvites,
  setAcceptedProjects,
}: {
  project: ProjectCardType;
  setInvites: React.Dispatch<React.SetStateAction<ProjectCardType[]>>;
  setAcceptedProjects: React.Dispatch<React.SetStateAction<ProjectCardType[]>>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const respondToInvite = async (accept: boolean) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${project.id}/invite/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: accept ? "ACCEPT" : "DECLINE" }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Invite API error:", data);
        toast.error("Unable to respond to invite", {
          description: data.message || "Something went wrong.",
        });
        return;
      }
      setInvites((prev) => prev.filter((p) => p.id !== project.id));
      if (accept) {
        setAcceptedProjects((prev) => [...prev, project]);
        toast.success("Invitation accepted!", {
          description: `You have joined ${project.name}.`,
        });
      } else {
        toast.success("Invitation declined.", {
          description: `You have declined the invitation to join ${project.name}.`,
        });
      }
    } catch (err) {
      console.error("Error responding to invite:", err);
      toast.error("Network Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Enhanced Card */}
      <Card
        className="group cursor-pointer bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 hover:border-indigo-400/40 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02]"
        onClick={() => setOpen(true)}
      >
        {/* Glowing effect on top */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <CardHeader className="relative">
          {/* Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full">
            <Sparkles className="h-3 w-3 text-indigo-300" />
            <span className="text-xs font-medium text-indigo-200">Pending</span>
          </div>

          <div className="flex items-start gap-4 pr-24">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-indigo-400/40 shadow-lg shadow-indigo-500/20">
                <AvatarImage
                  src={
                    project?.createdBy?.avatarUrl ||
                    "https://github.com/shadcn.png"
                  }
                />
                <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                  {project?.createdBy?.name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-indigo-500 rounded-full border-2 border-[#0f111a]" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg text-white font-semibold mb-1 truncate">
                {project.name}
              </CardTitle>
              <p className="text-white/60 text-sm mb-2">
                Invited by{" "}
                <span className="text-indigo-300 font-medium">
                  {project?.createdBy?.name}
                </span>
              </p>
              {project.description && (
                <p className="text-white/50 text-xs line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Quick Action Hint */}
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-white/40 flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Click to view details
            </span>
            <div className="flex gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <div className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse delay-75" />
              <div className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-pulse delay-150" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Popup */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl bg-[#0f111a]/95 border border-white/10 backdrop-blur-xl rounded-xl shadow-2xl shadow-indigo-500/10">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <DialogTitle className="text-2xl text-white font-bold">
                Project Invitation
              </DialogTitle>
            </div>
            <DialogDescription className="text-white/60">
              Review the project details and decide whether to join
            </DialogDescription>
          </DialogHeader>

          {/* Project Details */}
          <div className="space-y-5 mt-6">
            {/* Project Name with gradient */}
            <div className="p-4 bg-linear-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wide mb-1">
                Project Name
              </p>
              <p className="text-white font-semibold text-xl">{project.name}</p>
            </div>

            {/* Inviter Info */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wide mb-3">
                Invited By
              </p>
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 border-2 border-indigo-400/40 shadow-lg shadow-indigo-500/20">
                  <AvatarImage
                    src={
                      project?.createdBy?.avatarUrl ||
                      "https://github.com/shadcn.png"
                    }
                  />
                  <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white font-semibold text-lg">
                    {project?.createdBy?.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-white font-semibold text-base">
                    {project?.createdBy?.name}
                  </p>
                  <p className="text-white/60 text-sm flex items-center gap-1.5 mt-0.5">
                    <Mail className="h-3.5 w-3.5" />
                    {project.createdBy?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Repository */}
            {project.githubRepo && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-white/60 text-xs font-medium uppercase tracking-wide mb-2">
                  Repository
                </p>
                <a
                  href={project.githubRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-indigo-300 hover:text-indigo-200 transition-colors group/link"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github className="h-4 w-4" />
                  <span className="underline underline-offset-2 group-hover/link:underline-offset-4 transition-all">
                    {project.githubRepo.replace("https://", "")}
                  </span>
                </a>
              </div>
            )}

            {/* Description */}
            {project.description && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-white/60 text-xs font-medium uppercase tracking-wide mb-2">
                  Description
                </p>
                <p className="text-white/80 text-sm leading-relaxed">
                  {project.description}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <DialogFooter className="flex gap-3 mt-8">
            <Button
              variant="outline"
              className="flex-1 bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400/50 hover:text-red-300 transition-all"
              disabled={loading}
              onClick={async () => {
                await respondToInvite(false);
                setOpen(false);
              }}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Decline"
              )}
            </Button>

            <Button
              className="flex-1 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/40"
              disabled={loading}
              onClick={async () => {
                await respondToInvite(true);
                setOpen(false);
              }}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Accept Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
