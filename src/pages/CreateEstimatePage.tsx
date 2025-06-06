
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import EstimateForm from '@/components/estimate/EstimateForm';
import AppHeader from '@/components/app/AppHeader';
import SwipeableCard from '@/components/app/SwipeableCard';
import OfflineIndicator from '@/components/app/OfflineIndicator';
import LoadingSpinner from '@/components/app/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useAppBehavior } from '@/hooks/useAppBehavior';
import { saveEstimate } from '@/services/estimateService';
import type { EstimateItem } from '@/services/estimateService';
import { Trash2 } from 'lucide-react';

const TEMP_ITEMS_KEY = 'mistryMate_tempEstimateItems';
const TEMP_TYPE_KEY = 'mistryMate_tempEstimateType';

const CreateEstimatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isOnline, triggerHaptic } = useAppBehavior();
  
  const [estimateType, setEstimateType] = useState<'electrical' | 'plumbing'>('electrical');
  const [materialName, setMaterialName] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [rate, setRate] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load temporary items and estimate type from localStorage on component mount
  useEffect(() => {
    const savedItems = localStorage.getItem(TEMP_ITEMS_KEY);
    const savedType = localStorage.getItem(TEMP_TYPE_KEY);
    
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems);
        setItems(parsedItems);
        console.log('Restored temp items from localStorage:', parsedItems);
      } catch (error) {
        console.error('Failed to parse saved items:', error);
        localStorage.removeItem(TEMP_ITEMS_KEY);
      }
    }
    
    if (savedType && (savedType === 'electrical' || savedType === 'plumbing')) {
      setEstimateType(savedType);
      console.log('Restored estimate type from localStorage:', savedType);
    }
  }, []);

  // Auto-save items to localStorage whenever items change
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(TEMP_ITEMS_KEY, JSON.stringify(items));
      console.log('Auto-saved items to localStorage:', items);
    } else {
      localStorage.removeItem(TEMP_ITEMS_KEY);
    }
  }, [items]);

  // Auto-save estimate type to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(TEMP_TYPE_KEY, estimateType);
    console.log('Auto-saved estimate type to localStorage:', estimateType);
  }, [estimateType]);

  const handleAddItem = async () => {
    if (!materialName.trim() || quantity <= 0 || rate <= 0) return;

    setIsAdding(true);
    triggerHaptic('medium');
    
    try {
      const newItem: EstimateItem = {
        id: crypto.randomUUID(),
        name: materialName.trim(),
        category: estimateType, // Use estimate type as category
        quantity,
        unit: 'pcs', // Default unit, could be made configurable later
        rate,
        total: quantity * rate,
      };

      setItems(prev => [...prev, newItem]);
      
      // Reset form
      setMaterialName('');
      setQuantity(1);
      setRate(0);
      setNote('');
      
      toast({
        title: "Item added",
        description: `${materialName} has been added to your estimate`,
      });
    } catch (error) {
      console.error('Failed to add item:', error);
      toast({
        title: "Error",
        description: "Failed to add item to estimate",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveItem = (id: string) => {
    triggerHaptic('heavy');
    setItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Item removed",
      description: "Item has been removed from your estimate",
    });
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSaveEstimate = async () => {
    if (items.length === 0) {
      toast({
        title: "No items",
        description: "Please add at least one item to create an estimate",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    triggerHaptic('light');

    try {
      const estimate = {
        id: crypto.randomUUID(),
        type: estimateType,
        items,
        total: calculateTotal(),
        date: new Date().toISOString(),
        isFinal: false,
      };

      // Save estimate
      if (user && !user.isGuest) {
        await saveEstimate(estimate, user.id);
      } else {
        await saveEstimate(estimate);
      }

      // Clear temporary data after successful save
      localStorage.removeItem(TEMP_ITEMS_KEY);
      localStorage.removeItem(TEMP_TYPE_KEY);

      // Navigate to summary page
      navigate('/summary', { state: { estimate } });
    } catch (error) {
      console.error('Failed to save estimate:', error);
      toast({
        title: "Error",
        description: "Failed to save estimate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearAllItems = () => {
    triggerHaptic('heavy');
    setItems([]);
    localStorage.removeItem(TEMP_ITEMS_KEY);
    localStorage.removeItem(TEMP_TYPE_KEY);
    toast({
      title: "All items cleared",
      description: "All items have been removed from your estimate",
    });
  };

  if (isSaving) {
    return <LoadingSpinner fullScreen text="Saving estimate..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <OfflineIndicator isOnline={isOnline} />
      
      <AppHeader 
        title="Create Estimate" 
        showBack 
        onBack={() => navigate('/')}
      />
      
      <main className="p-4 max-w-lg mx-auto">
        <Card className="mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="dark:text-white">Estimate Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={estimateType} 
              onValueChange={(value: 'electrical' | 'plumbing') => {
                triggerHaptic('light');
                setEstimateType(value);
              }}
            >
              <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electrical">Electrical Work</SelectItem>
                <SelectItem value="plumbing">Plumbing Work</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="dark:text-white">Add Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <EstimateForm
              materialName={materialName}
              quantity={quantity}
              rate={rate}
              note={note}
              onMaterialNameChange={setMaterialName}
              onQuantityChange={setQuantity}
              onRateChange={setRate}
              onNoteChange={setNote}
              onAddItem={handleAddItem}
              isAdding={isAdding}
            />
          </CardContent>
        </Card>

        {/* Enhanced items list with individual delete buttons */}
        {items.length > 0 && (
          <Card className="mb-6 animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="dark:text-white">
                Items ({items.length})
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAllItems}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Clear All
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y dark:divide-gray-700">
                {items.map((item) => (
                  <SwipeableCard 
                    key={item.id}
                    onDelete={() => handleRemoveItem(item.id)}
                    className="p-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium dark:text-white">{item.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.quantity} {item.unit} × ₹{item.rate.toFixed(2)}
                        </p>
                        {note && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Note: {note}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-lg dark:text-white">₹{item.total.toFixed(2)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </SwipeableCard>
                ))}
                
                <div className="p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span className="dark:text-white">Total</span>
                    <span className="dark:text-white">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <Button 
                  className="w-full bg-mistryblue-500 hover:bg-mistryblue-600 dark:bg-mistryblue-600 dark:hover:bg-mistryblue-700 transform transition-all duration-200 active:scale-95"
                  onClick={handleSaveEstimate}
                  disabled={isSaving}
                >
                  {isSaving ? <LoadingSpinner size="sm" /> : 'Create Estimate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      
      <Navigation />
    </div>
  );
};

export default CreateEstimatePage;
