'use server';

import { revalidatePath } from 'next/cache';
import { getPallets, updatePalletMade, bulkUpdatePalletsMade, insertPallet } from '@/lib/db/queries';
import type { ServerActionResult } from '@/types/pallet';
import type { NewPallet } from '@/lib/db';

/**
 * Server Action to get all pallet data from database
 */
export async function getPalletData() {
  try {
    const data = await getPallets();
    return data;
  } catch (error) {
    console.error('Failed to read pallet data:', error);
    throw new Error('Failed to load pallet data from database.');
  }
}

/**
 * Server Action to toggle a single pallet's "Made" status
 */
export async function togglePalletStatus(
  palletId: string,
  currentStatus: boolean,
  version: string
): Promise<ServerActionResult> {
  console.log('[togglePalletStatus] Starting:', { palletId, currentStatus, version });

  try {
    const newStatus = !currentStatus;
    console.log('[togglePalletStatus] Writing new status:', newStatus);

    const data = await updatePalletMade(palletId, newStatus, version);
    console.log('[togglePalletStatus] Update successful, pallets count:', data.pallets.length);

    revalidatePath('/');
    console.log('[togglePalletStatus] Path revalidated');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[togglePalletStatus] ERROR:', error);

    if (error instanceof Error) {
      console.error('[togglePalletStatus] Error message:', error.message);

      if (error.message.includes('not found')) {
        return {
          success: false,
          error: 'not_found',
          message: `Pallet ${palletId} could not be found.`,
        };
      }

      return {
        success: false,
        error: 'unknown',
        message: `Error: ${error.message}`,
      };
    }

    return {
      success: false,
      error: 'unknown',
      message: `Unknown error type: ${String(error)}`,
    };
  }
}

/**
 * Server Action to bulk update multiple pallets' "Made" status
 */
export async function bulkTogglePallets(
  palletIds: string[],
  makeStatus: boolean,
  version: string
): Promise<ServerActionResult> {
  try {
    const data = await bulkUpdatePalletsMade(palletIds, makeStatus, version);

    revalidatePath('/');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Failed to bulk update pallets:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return {
          success: false,
          error: 'not_found',
          message: error.message,
        };
      }
    }

    return {
      success: false,
      error: 'unknown',
      message: 'An unexpected error occurred while updating the pallets.',
    };
  }
}

/**
 * Server Action to add a new pallet manually
 */
export async function addPallet(
  palletData: Omit<NewPallet, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ServerActionResult> {
  console.log('[addPallet] Adding new pallet:', palletData);

  try {
    // Insert the new pallet
    await insertPallet({
      jobNumber: palletData.jobNumber,
      releaseNumber: palletData.releaseNumber,
      palletNumber: palletData.palletNumber,
      size: palletData.size || '',
      elevation: palletData.elevation || '',
      made: palletData.made || false,
      accList: palletData.accList || '',
      shippedDate: palletData.shippedDate || '',
      notes: palletData.notes || '',
    });

    console.log('[addPallet] Pallet added successfully');

    // Get fresh data
    const data = await getPallets();

    revalidatePath('/');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[addPallet] ERROR:', error);

    if (error instanceof Error) {
      return {
        success: false,
        error: 'unknown',
        message: `Error: ${error.message}`,
      };
    }

    return {
      success: false,
      error: 'unknown',
      message: 'An unexpected error occurred while adding the pallet.',
    };
  }
}
