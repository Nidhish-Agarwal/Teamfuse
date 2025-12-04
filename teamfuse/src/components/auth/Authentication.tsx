"use client";
import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Github } from "lucide-react";
import { logout } from "@/lib/auth/logout";
import { useSearchParams } from "next/navigation";

function Authentication() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const handleLogin = () => {
    setIsLoading(true);
    try {
      signIn("github", {
        callbackUrl: from,
        prompt: "login",
      });
    } catch (error) {
      console.error("Error during sign in:", error);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
  };

  const LoadingSpinner = (
    <div className="flex items-center gap-2">
      <div className="h-4 w-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
      <span className="text-white/90">Please wait...</span>
    </div>
  );

  return (
    <Button
      onClick={session ? handleLogout : handleLogin}
      disabled={isLoading}
      className="
        w-full 
        h-12 
        text-base 
        rounded-xl
        transition-all 
        flex items-center justify-center gap-3 
        font-semibold
        shadow-lg shadow-indigo-500/20
        bg-linear-to-r from-indigo-600 to-purple-600
        hover:from-indigo-500 hover:to-purple-500 
        hover:shadow-indigo-500/40
        disabled:opacity-50 disabled:cursor-not-allowed
      "
      size="lg"
    >
      {isLoading ? (
        LoadingSpinner
      ) : (
        <>
          <Github className="h-5 w-5 text-white" />
          <span className="text-white">
            {session ? "Sign Out" : "Continue with GitHub"}
          </span>
        </>
      )}
    </Button>
  );
}

export default Authentication;
