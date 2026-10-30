const DRIVE_FOLDER_ID_PATTERN = /^[a-zA-Z0-9_-]{10,}$/;

export function extractGoogleDriveFolderId(value: string | null | undefined) {
  const input = value?.trim();
  if (!input) return null;
  if (DRIVE_FOLDER_ID_PATTERN.test(input)) return input;

  try {
    const url = new URL(input);
    if (url.hostname !== "drive.google.com" && url.hostname !== "docs.google.com") {
      return null;
    }

    const segments = url.pathname.split("/").filter(Boolean);
    const folderIndex = segments.findIndex((segment) => segment === "folders");
    const id = folderIndex >= 0 ? segments[folderIndex + 1] : url.searchParams.get("id");
    return id && DRIVE_FOLDER_ID_PATTERN.test(id) ? id : null;
  } catch {
    return null;
  }
}
