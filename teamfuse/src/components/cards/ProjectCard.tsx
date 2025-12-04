import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, GitCommit, ArrowRight, Calendar } from "lucide-react";
import ProjectCardType from "@/lib/interfaces/ProjectCardType";
import Link from "next/link";

interface ProjectCardProps {
  project: ProjectCardType;
}

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card
      key={project.id}
      className="
        group
        cursor-pointer 
        transition-all 
        duration-300
        backdrop-blur-xl 
        bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5
        border border-white/10 
        hover:border-indigo-400/40
        hover:bg-gradient-to-br hover:from-indigo-500/10 hover:via-purple-500/10 hover:to-pink-500/10
        rounded-xl 
        shadow-lg shadow-black/20
        hover:shadow-indigo-500/20
        hover:scale-[1.02]
        overflow-hidden
      "
    >
      {/* Subtle top glow effect */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-bold text-white drop-shadow-sm mb-2">
              {project.name}
            </CardTitle>

            {project.description && (
              <CardDescription className="text-white/60 text-sm leading-relaxed line-clamp-2 mb-3">
                {project.description}
              </CardDescription>
            )}

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="
                  text-xs 
                  px-2.5 
                  py-1
                  border-indigo-400/30 
                  text-indigo-300 
                  bg-indigo-500/20
                  font-medium
                "
              >
                {project.role}
              </Badge>

              <Badge
                variant="outline"
                className="
                  text-xs 
                  px-2.5 
                  py-1
                  border-purple-400/30 
                  text-purple-300 
                  bg-purple-500/20
                  font-medium
                "
              >
                {project.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Created Date */}
        {project.createdAt && (
          <div className="flex items-center gap-1.5 mt-3 text-white/40 text-xs">
            <Calendar className="h-3 w-3" />
            <span>
              Created {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <GitCommit className="h-4 w-4 text-indigo-300" />
            </div>
            <div>
              <p className="text-white/60 text-xs">Commits</p>
              <p className="text-white font-semibold">{project.commits || 0}</p>
            </div>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="flex items-center gap-2 text-sm">
            <div className="h-8 w-8 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-purple-300" />
            </div>
            <div>
              <p className="text-white/60 text-xs">Messages</p>
              <p className="text-white font-semibold">
                {project.totalMessages || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Last Active */}
        <div className="text-xs text-white/40 text-center">
          Last active:{" "}
          {project.lastActive
            ? new Date(project.lastActive).toLocaleString()
            : "N/A"}
        </div>

        {/* Open Project Button */}
        <Link href={`/project/${project.id}`}>
          <Button
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
              group/btn
            "
          >
            <span>Open Project</span>
            <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default ProjectCard;
