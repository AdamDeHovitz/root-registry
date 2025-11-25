import { supabase } from "./client";

const BUCKET_NAME = "root-game-screenshots";

/**
 * Upload a game screenshot to Supabase Storage
 * @param file - The image file to upload
 * @param gameId - The game ID to namespace the file
 * @returns The public URL of the uploaded file
 */
export async function uploadGameScreenshot(
  file: File,
  gameId: string
): Promise<{ url: string; path: string } | { error: string }> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${gameId}-${Date.now()}.${fileExt}`;
    const filePath = `${gameId}/${fileName}`;

    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      console.error("Upload error:", error);
      return { error: error.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error("Upload exception:", error);
    return { error: "Failed to upload screenshot" };
  }
}

/**
 * Delete a game screenshot from Supabase Storage
 * @param path - The storage path of the file to delete
 */
export async function deleteGameScreenshot(path: string): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      console.error("Delete error:", error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete exception:", error);
    return { success: false };
  }
}

/**
 * Get a signed URL for temporary access to a screenshot
 * @param path - The storage path of the file
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 */
export async function getSignedScreenshotUrl(
  path: string,
  expiresIn: number = 3600
): Promise<{ url: string } | { error: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error("Signed URL error:", error);
      return { error: error.message };
    }

    return { url: data.signedUrl };
  } catch (error) {
    console.error("Signed URL exception:", error);
    return { error: "Failed to generate signed URL" };
  }
}
