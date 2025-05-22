
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  // Always save to local storage first
  saveEstimateToLocalStorage(estimate);
  
  // If user is logged in and online, save to Supabase
  if (userId && navigator.onLine) {
    try {
      const { error } = await supabase
        .from('estimates')
        .insert({
          id: estimate.id,
          user_id: userId,
          title: estimate.title || null,
          client_name: estimate.clientName || null,
          type: estimate.type,
          total: estimate.total,
          items: estimate.items,
          date: estimate.date
        });
      
      if (error) {
        console.error("Error saving estimate to Supabase:", error);
        markEstimateForSync(estimate.id);
        return false;
      }
      
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
  
  return false;
};

/**
 * Retrieves all estimates for a user, combining local and Supabase data
 */
export const getEstimates = async (userId?: string): Promise<Estimate[]> => {
  // Get estimates from local storage
  const localEstimates = getEstimatesFromLocalStorage();
  
  // If user is not logged in or offline, return only local estimates
  if (!userId || !navigator.onLine) {
    return localEstimates;
  }
  
  try {
    // Fetch estimates from Supabase
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error fetching estimates from Supabase:", error);
      return localEstimates;
    }
    
    // Transform Supabase estimates to match our format
    const supabaseEstimates = data.map(item => ({
      id: item.id,
      type: item.type as 'electrical' | 'plumbing',
      items: item.items as EstimateItem[],
      total: item.total,
      date: item.date,
      title: item.title || undefined,
      clientName: item.client_name || undefined,
      isFinal: true,
      syncStatus: 'synced' as const
    }));
    
    // Merge estimates, prioritizing Supabase data
    const estimateMap = new Map<string, Estimate>();
    
    // Add local estimates first
    localEstimates.forEach(estimate => {
      estimateMap.set(estimate.id, estimate);
    });
    
    // Override with Supabase estimates
    supabaseEstimates.forEach(estimate => {
      estimateMap.set(estimate.id, estimate);
    });
    
    return Array.from(estimateMap.values());
  } catch (error) {
    console.error("Failed to fetch estimates from Supabase:", error);
    return localEstimates;
  }
};

/**
 * Saves an estimate to local storage
 */
export const saveEstimateToLocalStorage = (estimate: Estimate): void => {
  const estimates = getEstimatesFromLocalStorage();
  const index = estimates.findIndex(e => e.id === estimate.id);
  
  if (index >= 0) {
    estimates[index] = estimate;
  } else {
    estimates.push(estimate);
  }
  
  localStorage.setItem('mistryMateEstimates', JSON.stringify(estimates));
};

/**
 * Gets all estimates from local storage
 */
export const getEstimatesFromLocalStorage = (): Estimate[] => {
  const data = localStorage.getItem('mistryMateEstimates');
  return data ? JSON.parse(data) : [];
};

/**
 * Mark an estimate for future synchronization
 */
export const markEstimateForSync = (estimateId: string): void => {
  const pendingSyncs = getPendingSyncs();
  if (!pendingSyncs.includes(estimateId)) {
    pendingSyncs.push(estimateId);
    localStorage.setItem('mistryMatePendingSyncs', JSON.stringify(pendingSyncs));
  }
};

/**
 * Get estimates that need to be synced
 */
export const getPendingSyncs = (): string[] => {
  const data = localStorage.getItem('mistryMatePendingSyncs');
  return data ? JSON.parse(data) : [];
};

/**
 * Synchronize pending estimates
 */
export const syncPendingEstimates = async (userId: string): Promise<void> => {
  if (!navigator.onLine || !userId) return;
  
  const pendingSyncs = getPendingSyncs();
  if (pendingSyncs.length === 0) return;
  
  const estimates = getEstimatesFromLocalStorage();
  const pendingEstimates = estimates.filter(e => pendingSyncs.includes(e.id));
  
  for (const estimate of pendingEstimates) {
    try {
      const { error } = await supabase
        .from('estimates')
        .upsert({
          id: estimate.id,
          user_id: userId,
          title: estimate.title || null,
          client_name: estimate.clientName || null,
          type: estimate.type,
          total: estimate.total,
          items: estimate.items,
          date: estimate.date
        });
      
      if (!error) {
        // Remove from pending syncs
        const updatedPendingSyncs = getPendingSyncs().filter(id => id !== estimate.id);
        localStorage.setItem('mistryMatePendingSyncs', JSON.stringify(updatedPendingSyncs));
        
        // Update estimate sync status
        const updatedEstimate = { ...estimate, syncStatus: 'synced' as const };
        saveEstimateToLocalStorage(updatedEstimate);
      }
    } catch (error) {
      console.error(`Failed to sync estimate ${estimate.id}:`, error);
    }
  }
};

/**
 * Hook to handle background syncing and online/offline status
 */
export const useEstimateSync = () => {
  const { user } = useAuth();
  
  React.useEffect(() => {
    if (!user || user.isGuest) return;
    
    // Sync on initial load if online
    if (navigator.onLine) {
      syncPendingEstimates(user.id);
    }
    
    // Add event listeners for online/offline status
    const handleOnline = () => {
      syncPendingEstimates(user.id);
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [user]);
  
  return {
    isOnline: navigator.onLine,
    syncPendingEstimates: user ? () => syncPendingEstimates(user.id) : () => {}
  };
};
