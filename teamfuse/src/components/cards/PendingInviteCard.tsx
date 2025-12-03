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
import { Loader2 } from "lucide-react";
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
      // Update parent state to remove this invite from the list
      setInvites((prev) => prev.filter((p) => p.id !== project.id));
      // If accepted, add to accepted projects
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
      {/* The Card */}
      <Card
        className="cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl p-4"
        onClick={() => setOpen(true)}
      >
        <CardHeader>
          <CardTitle className="text-lg text-white font-semibold">
            {project.name}
          </CardTitle>
          <p className="text-gray-400 text-sm">You have been invited</p>
        </CardHeader>
      </Card>

      {/* Popup */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-black/80 border border-white/20 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              Project Invitation
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Review project details before you accept or decline.
            </DialogDescription>
          </DialogHeader>

          {/* --- Project Details --- */}
          <div className="space-y-4 mt-3">
            <div>
              <p className="text-gray-400 text-sm">Project Name</p>
              <p className="text-white font-medium">{project.name}</p>
            </div>

            {/* Repo Link */}
            {project.githubRepo && (
              <div>
                <p className="text-gray-400 text-sm">Repository</p>
                <a
                  href={project.githubRepo}
                  target="_blank"
                  className="text-indigo-300 underline"
                >
                  {project.githubRepo}
                </a>
              </div>
            )}

            {/* Inviter */}
            <div>
              <p className="text-gray-400 text-sm mb-1">Invited By</p>
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={project?.createdBy?.avatarUrl ?? undefined}
                  />
                  <AvatarFallback>{project?.createdBy?.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium">
                    {project?.createdBy?.name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {project.createdBy?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {project.description && (
              <div>
                <p className="text-gray-400 text-sm">Description</p>
                <p className="text-white/90 text-sm">{project.description}</p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <DialogFooter className="flex justify-between mt-6">
            <Button
              variant="destructive"
              className="w-1/2 mr-2"
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
              className="w-1/2 bg-indigo-500 hover:bg-indigo-600"
              disabled={loading}
              onClick={async () => {
                await respondToInvite(true);
                setOpen(false);
              }}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Accept"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
