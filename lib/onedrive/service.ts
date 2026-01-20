import ExcelJS from "exceljs";
import { Client } from "@microsoft/microsoft-graph-client";
import type { PalletTask, PalletData } from "@/types/pallet";
import {
  createGraphClient,
  getOneDriveFilePath,
  getFileIdByPath,
  downloadFile,
  uploadFile,
  getFileMetadata,
} from "./client";
import { createHash } from "crypto";

const SHEET_NAME = "PalletTracker";

/**
 * Parses Excel workbook to extract pallet data
 */
function parseWorkbookToPallets(workbook: ExcelJS.Workbook): PalletTask[] {
  const worksheet = workbook.getWorksheet(SHEET_NAME);
  if (!worksheet) {
    const availableSheets = workbook.worksheets.map((ws) => ws.name).join(", ");
    throw new Error(
      `Sheet "${SHEET_NAME}" not found in workbook. Available sheets: ${availableSheets}`
    );
  }

  const pallets: PalletTask[] = [];

  // Iterate through rows (skip header row 1)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header row

    const jobNumber = row.getCell(1).text.trim();
    const releaseNumber = row.getCell(2).text.trim();
    const palletNumber = row.getCell(3).text.trim();

    // Skip rows without essential data
    if (!jobNumber || !releaseNumber || !palletNumber) return;

    const size = row.getCell(4).text.trim();
    const elevation = row.getCell(5).text.trim();
    const madeValue = row.getCell(6).text.trim().toUpperCase();
    const made = madeValue === "X";
    const accList = row.getCell(7).text.trim();
    const shippedDate = row.getCell(8).text.trim();
    const notes = row.getCell(9).text.trim();

    pallets.push({
      id: `${jobNumber}::${releaseNumber}::${palletNumber}`,
      jobNumber,
      releaseNumber,
      palletNumber,
      size,
      elevation,
      made,
      accList,
      shippedDate,
      notes,
      status: made ? "completed" : "pending",
    });
  });

  return pallets;
}

/**
 * Computes SHA-256 hash of content for version tracking
 */
function computeContentHash(content: ArrayBuffer): string {
  const hash = createHash("sha256");
  hash.update(Buffer.from(content));
  return hash.digest("hex");
}

/**
 * Reads pallet data from OneDrive Excel file
 */
export async function readPalletDataFromOneDrive(
  accessToken: string
): Promise<PalletData> {
  console.log("[readPalletDataFromOneDrive] Starting...");

  try {
    const client = createGraphClient(accessToken);
    const filePath = getOneDriveFilePath();

    console.log("[readPalletDataFromOneDrive] File path:", filePath);

    // Get file ID and metadata
    const fileId = await getFileIdByPath(client, filePath);
    const metadata = await getFileMetadata(client, fileId);

    console.log(
      "[readPalletDataFromOneDrive] File last modified:",
      metadata.lastModifiedDateTime
    );

    // Download file content
    const fileContent = await downloadFile(client, fileId);
    console.log(
      "[readPalletDataFromOneDrive] Downloaded file size:",
      fileContent.byteLength,
      "bytes"
    );

    // Parse Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileContent);

    const pallets = parseWorkbookToPallets(workbook);
    console.log("[readPalletDataFromOneDrive] Loaded", pallets.length, "pallets");

    // Compute content hash for version tracking
    const contentHash = computeContentHash(fileContent);

    return {
      pallets,
      metadata: {
        mtime: new Date(metadata.lastModifiedDateTime).getTime(),
        version: contentHash,
        readOnly: false,
      },
    };
  } catch (error) {
    console.error("[readPalletDataFromOneDrive] ERROR:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to read Excel file from OneDrive: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Updates pallet data in OneDrive Excel file
 */
export async function writePalletDataToOneDrive(
  accessToken: string,
  pallets: PalletTask[]
): Promise<void> {
  console.log("[writePalletDataToOneDrive] Starting...");
  console.log("[writePalletDataToOneDrive] Updating", pallets.length, "pallets");

  try {
    const client = createGraphClient(accessToken);
    const filePath = getOneDriveFilePath();

    // Download current file to preserve formatting
    const fileId = await getFileIdByPath(client, filePath);
    const fileContent = await downloadFile(client, fileId);

    // Load existing workbook
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileContent);

    const worksheet = workbook.getWorksheet(SHEET_NAME);
    if (!worksheet) {
      throw new Error(`Sheet "${SHEET_NAME}" not found in workbook`);
    }

    // Create a map of pallets by ID for quick lookup
    const palletMap = new Map(pallets.map((p) => [p.id, p]));

    // Update existing rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const jobNumber = row.getCell(1).text.trim();
      const releaseNumber = row.getCell(2).text.trim();
      const palletNumber = row.getCell(3).text.trim();

      if (!jobNumber || !releaseNumber || !palletNumber) return;

      const palletId = `${jobNumber}::${releaseNumber}::${palletNumber}`;
      const pallet = palletMap.get(palletId);

      if (pallet) {
        // Update the "Made" column (column 6)
        row.getCell(6).value = pallet.made ? "X" : "";
      }
    });

    // Write back to OneDrive
    const buffer = await workbook.xlsx.writeBuffer();
    await uploadFile(client, filePath, buffer);

    console.log("[writePalletDataToOneDrive] Successfully updated file on OneDrive");
  } catch (error) {
    console.error("[writePalletDataToOneDrive] ERROR:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to write Excel file to OneDrive: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Updates a single pallet's "Made" status in OneDrive
 */
export async function updatePalletMadeOnOneDrive(
  accessToken: string,
  palletId: string,
  made: boolean
): Promise<void> {
  console.log("[updatePalletMadeOnOneDrive] Updating pallet:", palletId, "to", made);

  try {
    // Read current data
    const palletData = await readPalletDataFromOneDrive(accessToken);

    // Update the specific pallet
    const updatedPallets = palletData.pallets.map((p) =>
      p.id === palletId ? { ...p, made, status: made ? ("completed" as const) : ("pending" as const) } : p
    );

    // Write back
    await writePalletDataToOneDrive(accessToken, updatedPallets);
  } catch (error) {
    console.error("[updatePalletMadeOnOneDrive] ERROR:", error);
    throw error;
  }
}

/**
 * Bulk updates multiple pallets' "Made" status in OneDrive
 */
export async function bulkUpdatePalletsMadeOnOneDrive(
  accessToken: string,
  palletIds: string[],
  made: boolean
): Promise<void> {
  console.log(
    "[bulkUpdatePalletsMadeOnOneDrive] Updating",
    palletIds.length,
    "pallets to",
    made
  );

  try {
    // Read current data
    const palletData = await readPalletDataFromOneDrive(accessToken);

    // Create a Set for faster lookup
    const idsToUpdate = new Set(palletIds);

    // Update the specific pallets
    const updatedPallets = palletData.pallets.map((p) =>
      idsToUpdate.has(p.id)
        ? { ...p, made, status: made ? ("completed" as const) : ("pending" as const) }
        : p
    );

    // Write back
    await writePalletDataToOneDrive(accessToken, updatedPallets);
  } catch (error) {
    console.error("[bulkUpdatePalletsMadeOnOneDrive] ERROR:", error);
    throw error;
  }
}
