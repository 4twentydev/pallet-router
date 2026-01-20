import type { PalletData, PalletTask } from "@/types/pallet";
import {
  readPalletDataFromOneDrive,
  writePalletDataToOneDrive,
} from "./service";

/**
 * In-memory cache for pallet data
 */
interface CacheEntry {
  data: PalletData;
  lastSyncTime: number;
  pendingChanges: PalletTask[];
  isDirty: boolean;
}

class OneDriveSyncManager {
  private cache: CacheEntry | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private accessToken: string | null = null;
  private readonly SYNC_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

  /**
   * Initializes the sync manager with an access token
   */
  initialize(accessToken: string) {
    this.accessToken = accessToken;
    this.startPeriodicSync();
  }

  /**
   * Stops the periodic sync
   */
  shutdown() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Gets the current access token
   */
  private getAccessToken(): string {
    if (!this.accessToken) {
      throw new Error("Sync manager not initialized. Please sign in.");
    }
    return this.accessToken;
  }

  /**
   * Starts periodic syncing with OneDrive
   */
  private startPeriodicSync() {
    // Clear existing interval if any
    this.shutdown();

    // Sync immediately on start
    this.syncWithOneDrive().catch((error) => {
      console.error("[SyncManager] Initial sync failed:", error);
    });

    // Set up periodic sync
    this.syncInterval = setInterval(() => {
      this.syncWithOneDrive().catch((error) => {
        console.error("[SyncManager] Periodic sync failed:", error);
      });
    }, this.SYNC_INTERVAL_MS);

    console.log(
      `[SyncManager] Periodic sync started (every ${this.SYNC_INTERVAL_MS / 1000}s)`
    );
  }

  /**
   * Syncs local cache with OneDrive
   */
  private async syncWithOneDrive(): Promise<void> {
    console.log("[SyncManager] Starting sync...");

    try {
      const accessToken = this.getAccessToken();

      // If there are pending changes, write them first
      if (this.cache?.isDirty && this.cache.pendingChanges.length > 0) {
        console.log(
          "[SyncManager] Writing",
          this.cache.pendingChanges.length,
          "pending changes to OneDrive"
        );
        await writePalletDataToOneDrive(accessToken, this.cache.pendingChanges);
      }

      // Read latest data from OneDrive
      const data = await readPalletDataFromOneDrive(accessToken);

      // Update cache
      this.cache = {
        data,
        lastSyncTime: Date.now(),
        pendingChanges: data.pallets,
        isDirty: false,
      };

      console.log(
        "[SyncManager] Sync completed. Loaded",
        data.pallets.length,
        "pallets"
      );
    } catch (error) {
      console.error("[SyncManager] Sync error:", error);
      throw error;
    }
  }

  /**
   * Gets pallet data (from cache or OneDrive)
   */
  async getPalletData(): Promise<PalletData> {
    // If cache is empty or too old, sync first
    if (!this.cache || Date.now() - this.cache.lastSyncTime > this.SYNC_INTERVAL_MS) {
      await this.syncWithOneDrive();
    }

    if (!this.cache) {
      throw new Error("Failed to load pallet data");
    }

    return this.cache.data;
  }

  /**
   * Updates a single pallet's "Made" status
   */
  async updatePalletMade(palletId: string, made: boolean): Promise<void> {
    if (!this.cache) {
      await this.syncWithOneDrive();
    }

    if (!this.cache) {
      throw new Error("Failed to load pallet data");
    }

    // Update in cache
    const updatedPallets = this.cache.pendingChanges.map((p) =>
      p.id === palletId
        ? { ...p, made, status: made ? ("completed" as const) : ("pending" as const) }
        : p
    );

    this.cache = {
      ...this.cache,
      pendingChanges: updatedPallets,
      isDirty: true,
    };

    console.log("[SyncManager] Pallet", palletId, "updated in cache");
  }

  /**
   * Bulk updates multiple pallets' "Made" status
   */
  async bulkUpdatePalletsMade(palletIds: string[], made: boolean): Promise<void> {
    if (!this.cache) {
      await this.syncWithOneDrive();
    }

    if (!this.cache) {
      throw new Error("Failed to load pallet data");
    }

    // Create a Set for faster lookup
    const idsToUpdate = new Set(palletIds);

    // Update in cache
    const updatedPallets = this.cache.pendingChanges.map((p) =>
      idsToUpdate.has(p.id)
        ? { ...p, made, status: made ? ("completed" as const) : ("pending" as const) }
        : p
    );

    this.cache = {
      ...this.cache,
      pendingChanges: updatedPallets,
      isDirty: true,
    };

    console.log("[SyncManager]", palletIds.length, "pallets updated in cache");
  }

  /**
   * Forces an immediate sync with OneDrive
   */
  async forceSync(): Promise<void> {
    await this.syncWithOneDrive();
  }

  /**
   * Gets the last sync time
   */
  getLastSyncTime(): number | null {
    return this.cache?.lastSyncTime || null;
  }

  /**
   * Checks if there are pending changes
   */
  hasPendingChanges(): boolean {
    return this.cache?.isDirty || false;
  }
}

// Singleton instance
export const syncManager = new OneDriveSyncManager();
