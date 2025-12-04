export const logoutFromGitHub = () => {
  return new Promise((resolve, reject) => {
    // Open GitHub logout page in a small popup
    const popup = window.open(
      "https://github.com/logout",
      "githubLogout",
      "width=600,height=700"
    );

    if (!popup) {
      reject("Popup blocked");
      return;
    }

    // Poll every 500ms to detect when the user finishes
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        resolve(true); // User finished logout
      }
    }, 500);
  });
};
