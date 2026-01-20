'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { syncManager } from '@/lib/onedrive/sync-manager';
import type { ServerActionResult } from '@/types/pallet';

/**
 * Gets the authenticated user's session
 */
async function getAuthenticatedSession() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    throw new Error('Not authenticated. Please sign in to access OneDrive.');
  }

  // Initialize sync manager with access token
  syncManager.initialize(session.accessToken);

  return session;
}

/**
 * Server Action to get all pallet data from OneDrive
 */
export async function getPalletData() {
  try {
    await getAuthenticatedSession();
    const data = await syncManager.getPalletData();
    return data;
  } catch (error) {
    console.error('Failed to read pallet data:', error);
    throw new Error('Failed to load pallet data from OneDrive.');
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
    await getAuthenticatedSession();

    const newStatus = !currentStatus;
    console.log('[togglePalletStatus] Writing new status:', newStatus);

    await syncManager.updatePalletMade(palletId, newStatus);
    const data = await syncManager.getPalletData();
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
    await getAuthenticatedSession();

    await syncManager.bulkUpdatePalletsMade(palletIds, makeStatus);
    const data = await syncManager.getPalletData();

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
 * Server Action to force sync with OneDrive
 */
export async function forceSyncWithOneDrive(): Promise<ServerActionResult> {
  try {
    await getAuthenticatedSession();

    await syncManager.forceSync();
    const data = await syncManager.getPalletData();

    revalidatePath('/');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Failed to sync with OneDrive:', error);

    return {
      success: false,
      error: 'unknown',
      message: error instanceof Error ? error.message : 'Failed to sync with OneDrive',
    };
  }
}
