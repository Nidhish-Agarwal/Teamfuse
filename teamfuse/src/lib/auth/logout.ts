import { signOut } from "next-auth/react";
import { logoutFromGitHub } from "./logoutFromGithub";

export const logout = async () => {
  try {
    await logoutFromGitHub();
    await fetch("/api/auth/logout", { method: "POST" });
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  } catch (err) {
    console.error("user cancelled GitHub logout.", err);
  }
};
