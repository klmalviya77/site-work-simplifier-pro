
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, Search, CloudOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getEstimates, 
  saveEstimateToLocalStorage, 
  syncPendingEstimates,
  markEstimateAsDeleted,
  removeFromDeletedList,
  Estimate
} from '@/services/estimateService';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const SavedEstimatesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [estimateToDelete, setEstimateToDelete] = useState<string | null>(null);
  const realtimeSubscription = useRef<any>(null);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadEstimates = useCallback(async () => {
    setIsLoading(true);
    try {
      const loadedEstimates = await getEstimates(user?.id);
      setEstimates(loadedEstimates);
    } catch (error) {
      console.error("Failed to load estimates:", error);
      toast({
        title: "Error",
        description: "Failed to load estimates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  const setupRealtimeSubscription = useCallback(() => {
    if (realtimeSubscription.current) {
      supabase.removeChannel(realtimeSubscription.current);
    }
    
    if (user && !user.isGuest) {
      realtimeSubscription.current = supabase
        .channel('estimate-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'estimates',
          filter: `user_id=eq.${user.id}`
        }, async (payload) => {
          // Skip if this is our own delete operation
          if (payload.eventType === 'DELETE' && payload.old.id === estimateToDelete) {
            return;
          }
          await loadEstimates();
        })
        .subscribe();
    }
  }, [user, loadEstimates, estimateToDelete]);

  useEffect(() => {
    loadEstimates();
    setupRealtimeSubscription();
    
    return () => {
      if (realtimeSubscription.current) {
        supabase.removeChannel(realtimeSubscription.current);
      }
    };
  }, [loadEstimates, setupRealtimeSubscription]);

  const handleSyncEstimates = async () => {
    if (!user || user.isGuest || !isOnline) return;
    
    setIsSyncing(true);
    try {
      await syncPendingEstimates(user.id);
      await loadEstimates();
      toast({
        title: "Sync completed",
        description: "Your estimates have been synchronized",
      });
    } catch (error) {
      console.error("Sync failed:", error);
      toast({
        title: "Sync failed",
        description: "Could not synchronize estimates",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const confirmDelete = (id: string) => {
    setEstimateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteEstimate = async () => {
    if (!estimateToDelete) return;
    
    const id = estimateToDelete;
    setDeleteDialogOpen(false);
    
    try {
      // Temporarily unsubscribe from realtime updates
      if (realtimeSubscription.current) {
        supabase.removeChannel(realtimeSubscription.current);
      }
      
      // Optimistic update
      setEstimates(prev => prev.filter(estimate => estimate.id !== id));
      
      // Update localStorage
      const updatedEstimates = estimates.filter(estimate => estimate.id !== id);
      localStorage.setItem('mistryMateEstimates', JSON.stringify(updatedEstimates));
      
      // Mark as deleted locally
      markEstimateAsDeleted(id);
      
      // If authenticated and online, delete from Supabase
      if (user && !user.isGuest && isOnline) {
        const { error } = await supabase
          .from('estimates')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        // Successfully deleted from Supabase, remove from deleted tracking
        removeFromDeletedList(id);
      }
      
      toast({
        title: "Estimate deleted",
        description: "The estimate has been removed",
      });
    } catch (error) {
      console.error("Delete failed:", error);
      // Revert optimistic update if failed
      await loadEstimates();
      toast({
        title: "Delete failed",
        description: "Could not delete the estimate",
        variant: "destructive",
      });
    } finally {
      setEstimateToDelete(null);
      // Resubscribe to realtime updates
      if (user && !user.isGuest) {
        setupRealtimeSubscription();
      }
    }
  };

  const handleViewEstimate = (estimate: Estimate) => {
    navigate('/summary', { state: { estimate } });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredEstimates = searchQuery.trim() === ''
    ? estimates
    : estimates.filter(estimate => 
        (estimate.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         estimate.clientName?.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-mistryblue-500 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Saved Estimates</h1>
          {!isOnline && (
            <div className="flex items-center text-xs bg-amber-500 px-2 py-1 rounded">
              <CloudOff size={14} className="mr-1" /> Offline Mode
            </div>
          )}
          {isOnline && user && !user.isGuest && (
            <Button 
              size="sm" 
              variant="outline"
              className="bg-white text-mistryblue-500 border-white"
              onClick={handleSyncEstimates}
              disabled={isSyncing}
            >
              <RefreshCw size={14} className={`mr-1 ${isSyncing ? 'animate-spin' : ''}`} /> 
              Sync
            </Button>
          )}
        </div>
      </header>
      
      <main className="p-4 max-w-lg mx-auto">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search estimates..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-mistryblue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-500">Loading estimates...</p>
          </div>
        ) : filteredEstimates.length > 0 ? (
          <div className="space-y-3 mb-6">
            {filteredEstimates.map((estimate) => (
              <Card key={estimate.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">
                      {estimate.title || `${estimate.type.charAt(0).toUpperCase() + estimate.type.slice(1)} Estimate`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(estimate.date)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {estimate.syncStatus === 'pending' && (
                      <span className="mr-2 w-2 h-2 bg-amber-500 rounded-full" title="Pending sync"></span>
                    )}
                    <div className={`capitalize px-2 py-1 rounded text-xs ${estimate.type === 'electrical' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {estimate.type}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm mb-3">
                  <span>
                    {estimate.clientName ? (
                      <>Client: <span className="font-medium">{estimate.clientName}</span></>
                    ) : (
                      <span className="text-gray-500">No client specified</span>
                    )}
                  </span>
                  <span className="font-medium">₹{estimate.total}</span>
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-mistryblue-500 border-mistryblue-500"
                    onClick={() => handleViewEstimate(estimate)}
                  >
                    <FileText size={14} className="mr-1" /> View
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500"
                    onClick={() => confirmDelete(estimate.id)}
                  >
                    <Trash2 size={14} className="mr-1" /> Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-lg">
            <FileText className="mx-auto text-gray-400 h-12 w-12 mb-3" />
            <h3 className="font-medium text-gray-700 mb-1">No Saved Estimates</h3>
            <p className="text-sm text-gray-500 mb-4">
              Your saved estimates will appear here
            </p>
            <Button 
              className="bg-mistryblue-500 hover:bg-mistryblue-600"
              onClick={() => navigate('/')}
            >
              Create New Estimate
            </Button>
          </div>
        )}
      </main>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the estimate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteEstimate}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Navigation />
    </div>
  );
};

export default SavedEstimatesPage;
