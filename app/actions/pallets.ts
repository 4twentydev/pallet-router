'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, requireAdmin } from '@/lib/session';
import {
  getPallets,
  updatePalletMade,
  bulkUpdatePalletsMade,
  insertPallet,
  insertPallets,
  deleteAllPallets,
} from '@/lib/db/queries';
import type { ServerActionResult } from '@/types/pallet';
import type { NewPallet } from '@/lib/db/schema';

/**
 * Server Action to get all pallet data from database
 */
export async function getPalletData() {
  await requireAuth();
  return await getPallets();
}

/**
 * Server Action to toggle a single pallet's "Made" status
 */
export async function togglePalletStatus(
  palletId: string,
  currentStatus: boolean,
  version: string
): Promise<ServerActionResult> {
  try {
    await requireAuth();

    const data = await updatePalletMade(palletId, !currentStatus, version);

    revalidatePath('/');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[togglePalletStatus] ERROR:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('Not authenticated')) {
        return {
          success: false,
          error: 'not_found',
          message: error.message,
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
    await requireAuth();

    const data = await bulkUpdatePalletsMade(palletIds, makeStatus, version);

    revalidatePath('/');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Failed to bulk update pallets:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('Not authenticated')) {
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
 * Server Action to add a new pallet (admin only)
 */
export async function addPallet(pallet: NewPallet): Promise<ServerActionResult> {
  try {
    await requireAdmin();

    await insertPallet(pallet);
    const data = await getPallets();

    revalidatePath('/');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Failed to add pallet:', error);

    return {
      success: false,
      error: 'unknown',
      message: error instanceof Error ? error.message : 'Failed to add pallet',
    };
  }
}

/**
 * Server Action to import pallets from array (admin only)
 */
export async function importPallets(pallets: NewPallet[], replaceAll: boolean = false): Promise<ServerActionResult> {
  try {
    await requireAdmin();

    if (replaceAll) {
      await deleteAllPallets();
    }

    await insertPallets(pallets);
    const data = await getPallets();

    revalidatePath('/');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Failed to import pallets:', error);

    return {
      success: false,
      error: 'unknown',
      message: error instanceof Error ? error.message : 'Failed to import pallets',
    };
  }
}
