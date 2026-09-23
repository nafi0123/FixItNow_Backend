export const notifyNextCacheRevalidate = async (tags: string | string[]) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const tagList = Array.isArray(tags) ? tags : [tags];

    // Non-blocking fire-and-forget
    fetch(`${frontendUrl}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: tagList }),
    }).catch(() => {
      // Silently ignore if frontend is temporarily offline
    });
  } catch {
    // Silently ignore
  }
};
