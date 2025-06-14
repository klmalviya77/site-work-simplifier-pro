import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Json } from "@/integrations/supabase/types";
import React from 'react';

// Properly generate a valid UUID v4
const generateUUID = (): string => {
  return crypto.randomUUID();
};

// Type definitions
export interface EstimateItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  rate: number;
  total: number;
}

export interface Estimate {
  id: string;
  type: 'electrical' | 'plumbing';
  items: EstimateItem[];
  total: number;
  date: string;
  title?: string;
  clientName?: string;
  isFinal?: boolean;
  syncStatus?: 'synced' | 'pending' | 'failed';
}

/**
 * Saves an estimate to both Supabase and local storage
 */
export const saveEstimate = async (estimate: Estimate, userId?: string): Promise<boolean> => {
  // Make sure estimate has a valid UUID
  if (!estimate.id || !isValidUUID(estimate.id)) {
    console.log("Fixing invalid UUID format for estimate");
    estimate.id = generateUUID();
  }
  
  // Always save to local storage first
  saveEstimateToLocalStorage(estimate);
  
  // If user is logged in and online, save to Supabase
  if (userId && navigator.onLine) {
    try {
      console.log("Saving estimate to Supabase with user ID:", userId);
      console.log("Estimate data:", JSON.stringify(estimate));
      
      const { error } = await supabase
        .from('estimates')
        .upsert({
          id: estimate.id,
          user_id: userId,
          title: estimate.title || null,
          client_name: estimate.clientName || null,
          type: estimate.type,
          total: estimate.total,
          items: estimate.items as unknown as Json, // Type assertion for Json compatibility
          date: estimate.date
        });
      
      if (error) {
        console.error("Error saving estimate to Supabase:", error);
        markEstimateForSync(estimate.id);
        return false;
      }
      
      console.log("Estimate successfully saved to Supabase");
      // Update the estimate in local storage with synced status
      const updatedEstimate = { ...estimate, syncStatus: 'synced' as const };
      saveEstimateToLocalStorage(updatedEstimate);
      return true;
    } catch (error) {
      console.error("Failed to save estimate to Supabase:", error);
      markEstimateForSync(estimate.id);
      return false;
    }
  } else if (userId) {
    // User is logged in but offline, mark for later sync
    markEstimateForSync(estimate.id);
  }
  
  return true; // Return true for local storage success even if Supabase fails
};

// Helper function to check if a string is a valid UUID
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Retrieves all estimates for a user, combining local and Supabase data
 */
export const getEstimates = async (userId?: string): Promise<Estimate[]> => {
  // Always get estimates from local storage first to ensure UI isn't blocked
  const localEstimates = getEstimatesFromLocalStorage();
  const deletedEstimateIds = getDeletedEstimateIds();
  
  // If user is not logged in or offline, return only local estimates (excluding deleted ones)
  if (!userId || !navigator.onLine) {
    return localEstimates.filter(estimate => !deletedEstimateIds.includes(estimate.id));
  }
  
  try {
    // Fetch estimates from Supabase with a timeout to prevent infinite waiting
    const fetchPromise = supabase
      .from('estimates')
      .select('*')
      .eq('user_id', userId);
      
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Supabase fetch timed out')), 5000);
    });
    
    // Race the fetch against a timeout
    const { data, error } = await Promise.race([
      fetchPromise,
      timeoutPromise.then(() => {
        throw new Error('Supabase fetch timed out');
      })
    ]) as any;
    
    if (error) {
      console.error("Error fetching estimates from Supabase:", error);
      return localEstimates.filter(estimate => !deletedEstimateIds.includes(estimate.id));
    }
    
    if (!data) {
      console.warn("No data returned from Supabase");
      return localEstimates.filter(estimate => !deletedEstimateIds.includes(estimate.id));
    }
    
    // Transform Supabase estimates to match our format
    const supabaseEstimates = data.map((item: any) => ({
      id: item.id,
      type: item.type as 'electrical' | 'plumbing',
      items: item.items as unknown as EstimateItem[], // Type assertion for proper conversion
      total: item.total,
      date: item.date,
      title: item.title || undefined,
      clientName: item.client_name || undefined,
      isFinal: true,
      syncStatus: 'synced' as const
    }));
    
    // Merge estimates, prioritizing Supabase data but excluding deleted ones
    const estimateMap = new Map<string, Estimate>();
    
    // Add local estimates first (excluding deleted ones)
    localEstimates.forEach(estimate => {
      if (!deletedEstimateIds.includes(estimate.id)) {
        estimateMap.set(estimate.id, estimate);
      }
    });
    
    // Override with Supabase estimates (excluding deleted ones)
    supabaseEstimates.forEach(estimate => {
      if (!deletedEstimateIds.includes(estimate.id)) {
        estimateMap.set(estimate.id, estimate);
      }
    });
    
    return Array.from(estimateMap.values());
  } catch (error) {
    console.error("Failed to fetch estimates from Supabase:", error);
    return localEstimates.filter(estimate => !deletedEstimateIds.includes(estimate.id)); // Fallback to local estimates
  }
};

/**
 * Saves an estimate to local storage
 */
export const saveEstimateToLocalStorage = (estimate: Estimate): void => {
  try {
    const estimates = getEstimatesFromLocalStorage();
    const index = estimates.findIndex(e => e.id === estimate.id);
    
    if (index >= 0) {
      estimates[index] = estimate;
    } else {
      estimates.push(estimate);
    }
    
    localStorage.setItem('mistryMateEstimates', JSON.stringify(estimates));
  } catch (error) {
    console.error("Failed to save estimate to local storage:", error);
  }
};

/**
 * Gets all estimates from local storage
 */
export const getEstimatesFromLocalStorage = (): Estimate[] => {
  try {
    const data = localStorage.getItem('mistryMateEstimates');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to read estimates from local storage:", error);
    return [];
  }
};

/**
 * Marks an estimate as deleted in local storage
 */
export const markEstimateAsDeleted = (estimateId: string): void => {
  try {
    const deletedIds = getDeletedEstimateIds();
    if (!deletedIds.includes(estimateId)) {
      deletedIds.push(estimateId);
      localStorage.setItem('mistryMateDeletedEstimates', JSON.stringify(deletedIds));
    }
  } catch (error) {
    console.error("Failed to mark estimate as deleted:", error);
  }
};

/**
 * Gets list of deleted estimate IDs
 */
export const getDeletedEstimateIds = (): string[] => {
  try {
    const data = localStorage.getItem('mistryMateDeletedEstimates');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get deleted estimate IDs:", error);
    return [];
  }
};

/**
 * Removes an estimate from the deleted list (used when permanently deleting from Supabase)
 */
export const removeFromDeletedList = (estimateId: string): void => {
  try {
    const deletedIds = getDeletedEstimateIds();
    const updatedIds = deletedIds.filter(id => id !== estimateId);
    localStorage.setItem('mistryMateDeletedEstimates', JSON.stringify(updatedIds));
  } catch (error) {
    console.error("Failed to remove from deleted list:", error);
  }
};

/**
 * Mark an estimate for future synchronization
 */
export const markEstimateForSync = (estimateId: string): void => {
  try {
    const pendingSyncs = getPendingSyncs();
    if (!pendingSyncs.includes(estimateId)) {
      pendingSyncs.push(estimateId);
      localStorage.setItem('mistryMatePendingSyncs', JSON.stringify(pendingSyncs));
    }
  } catch (error) {
    console.error("Failed to mark estimate for sync:", error);
  }
};

/**
 * Get estimates that need to be synced
 */
export const getPendingSyncs = (): string[] => {
  try {
    const data = localStorage.getItem('mistryMatePendingSyncs');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get pending syncs:", error);
    return [];
  }
};

/**
 * Synchronize pending estimates
 */
export const syncPendingEstimates = async (userId: string): Promise<void> => {
  if (!navigator.onLine || !userId) return;
  
  try {
    const pendingSyncs = getPendingSyncs();
    if (pendingSyncs.length === 0) return;
    
    const estimates = getEstimatesFromLocalStorage();
    const pendingEstimates = estimates.filter(e => pendingSyncs.includes(e.id));
    
    for (const estimate of pendingEstimates) {
      try {
        console.log(`Syncing estimate ${estimate.id} for user ${userId}`);
        const { error } = await supabase
          .from('estimates')
          .upsert({
            id: estimate.id,
            user_id: userId,
            title: estimate.title || null,
            client_name: estimate.clientName || null,
            type: estimate.type,
            total: estimate.total,
            items: estimate.items as unknown as Json, // Type assertion for Json compatibility
            date: estimate.date
          });
        
        if (!error) {
          console.log(`Successfully synced estimate ${estimate.id}`);
          // Remove from pending syncs
          const updatedPendingSyncs = getPendingSyncs().filter(id => id !== estimate.id);
          localStorage.setItem('mistryMatePendingSyncs', JSON.stringify(updatedPendingSyncs));
          
          // Update estimate sync status
          const updatedEstimate = { ...estimate, syncStatus: 'synced' as const };
          saveEstimateToLocalStorage(updatedEstimate);
        } else {
          console.error(`Failed to sync estimate ${estimate.id}:`, error);
        }
      } catch (error) {
        console.error(`Failed to sync estimate ${estimate.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Failed to sync pending estimates:", error);
  }
};

/**
 * Hook to handle background syncing and online/offline status
 */
export const useEstimateSync = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = React.useState<boolean>(navigator.onLine);
  
  React.useEffect(() => {
    if (!user || user.isGuest) return;
    
    // Sync on initial load if online
    if (navigator.onLine) {
      syncPendingEstimates(user.id);
    }
    
    // Update online status when it changes
    const handleOnline = () => {
      setIsOnline(true);
      if (user) syncPendingEstimates(user.id);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);
  
  return {
    isOnline,
    syncPendingEstimates: user && !user.isGuest ? () => syncPendingEstimates(user.id) : () => Promise.resolve()
  };
};
