import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";

/**
 * Creates a Microsoft Graph client with the provided access token
 */
export function createGraphClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

/**
 * Gets the OneDrive file path from environment variable or uses default
 */
export function getOneDriveFilePath(): string {
  return process.env.ONEDRIVE_FILE_PATH || "/Release-CheckList.xlsx";
}

/**
 * Gets the file ID by path from OneDrive
 */
export async function getFileIdByPath(
  client: Client,
  filePath: string
): Promise<string> {
  try {
    const file = await client
      .api(`/me/drive/root:${filePath}`)
      .select("id,name,size,lastModifiedDateTime")
      .get();
    return file.id;
  } catch (error) {
    console.error("Error getting file by path:", error);
    throw new Error(`File not found at path: ${filePath}`);
  }
}

/**
 * Downloads Excel file content from OneDrive
 */
export async function downloadFile(
  client: Client,
  fileId: string
): Promise<ArrayBuffer> {
  try {
    const fileStream = await client
      .api(`/me/drive/items/${fileId}/content`)
      .get();
    return fileStream;
  } catch (error) {
    console.error("Error downloading file:", error);
    throw new Error("Failed to download file from OneDrive");
  }
}

/**
 * Uploads Excel file content to OneDrive
 */
export async function uploadFile(
  client: Client,
  filePath: string,
  content: ArrayBuffer
): Promise<void> {
  try {
    await client
      .api(`/me/drive/root:${filePath}:/content`)
      .put(content);
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Failed to upload file to OneDrive");
  }
}

/**
 * Gets file metadata from OneDrive
 */
export async function getFileMetadata(
  client: Client,
  fileId: string
): Promise<{ lastModifiedDateTime: string; size: number }> {
  try {
    const metadata = await client
      .api(`/me/drive/items/${fileId}`)
      .select("lastModifiedDateTime,size")
      .get();
    return {
      lastModifiedDateTime: metadata.lastModifiedDateTime,
      size: metadata.size,
    };
  } catch (error) {
    console.error("Error getting file metadata:", error);
    throw new Error("Failed to get file metadata from OneDrive");
  }
}
