"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Loader2, Plus, X } from "lucide-react";
import { projectSchema } from "@/lib/validators/validateProjectInput";
import ProjectCardType from "@/lib/interfaces/ProjectCardType";

type FormType = z.infer<typeof projectSchema>;

export default function CreateProjectDialog({
  setAcceptedProjects,
}: {
  setAcceptedProjects: React.Dispatch<React.SetStateAction<ProjectCardType[]>>;
}) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<string[]>([]);
  const [memberInput, setMemberInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormType>({
    resolver: zodResolver(projectSchema),
    defaultValues: { members: [] },
  });

  const addMember = () => {
    if (!memberInput.trim()) return;

    try {
      // Validate email before adding
      z.string().email().parse(memberInput);
      setMembers((prev) => [...prev, memberInput.trim()]);
      setMemberInput("");
    } catch {
      toast.error("Invalid email", {
        description: "Please enter a valid email",
      });
    }
  };

  const onSubmit = async (values: FormType) => {
    try {
      toast("Creating project...", {
        description: "Please wait",
        duration: 1500,
      });

      const res = await fetch("/api/projects", {
        method: "POST",
        body: JSON.stringify({
          ...values,
          members,
        }),
      });

      const data = await res.json();
      console.log("data", data);

      if (!res.ok) {
        toast.error("Failed to create project", {
          description: data.message || "Unexpected error occurred",
        });
        return;
      }

      toast.success("Project created 🎉", {
        description: "Your project is ready!",
      });

      //   Add current project to the UI
      setAcceptedProjects((prev) => [
        ...prev,
        { ...data.data, role: "LEADER" },
      ]);

      reset();
      setMembers([]);
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong", {
        description: "Unable to create project",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] bg-[#10121c] text-white border border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-indigo-300">
            Create New Project
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Set up a new project and invite your team
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Name */}
          <div>
            <Label>Project Name</Label>
            <Input
              className="bg-white/5 border-white/10 text-white"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-400 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea
              className="bg-white/5 border-white/10 text-white"
              {...register("description")}
            />
          </div>

          {/* GitHub Repo */}
          <div>
            <Label>GitHub Repository URL</Label>
            <Input
              className="bg-white/5 border-white/10 text-white"
              {...register("githubRepo")}
            />
            {errors.githubRepo && (
              <p className="text-red-400 text-sm">
                {errors.githubRepo.message}
              </p>
            )}
          </div>

          {/* Members */}
          <div>
            <Label>Invite Team Members</Label>
            <div className="flex gap-2">
              <Input
                className="bg-white/5 border-white/10 text-white"
                placeholder="Email"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
              />
              <Button
                type="button"
                className="bg-indigo-600"
                onClick={addMember}
              >
                Add
              </Button>
            </div>

            {/* Members list */}
            {members.length > 0 && (
              <div className="mt-3 space-y-2">
                <ul className="space-y-2">
                  {members.map((m, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 transition-all"
                    >
                      <span className="truncate">{m}</span>

                      <button
                        type="button"
                        onClick={() =>
                          setMembers((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-red-300 hover:text-red-200 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="border-white/20 text-white"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-linear-to-r from-indigo-500 to-purple-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
