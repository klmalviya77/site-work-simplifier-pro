
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import MaterialSelector from '@/components/estimate/MaterialSelector';
import EstimateForm from '@/components/estimate/EstimateForm';
import EstimateItemsList from '@/components/estimate/EstimateItemsList';
import { useAuth } from '@/contexts/AuthContext';
import { saveEstimate } from '@/services/estimateService';
import { materialSuggestions } from '@/data/materialSuggestions';

interface Material {
  name: string;
  category: string;
  rate: number;
  unit: string;
}

interface EstimateItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  rate: number;
  total: number;
}

const CreateEstimatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [estimateType, setEstimateType] = useState<'electrical' | 'plumbing'>('electrical');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [rate, setRate] = useState<number>(0);
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Get materials based on selected type
  const materials = materialSuggestions[estimateType] || [];

  useEffect(() => {
    if (selectedMaterial) {
      setRate(selectedMaterial.rate);
    }
  }, [selectedMaterial]);

  const handleMaterialSelect = (material: Material) => {
    setSelectedMaterial(material);
    setRate(material.rate);
  };

  const handleAddItem = async () => {
    if (!selectedMaterial || quantity <= 0 || rate <= 0) return;

    setIsAdding(true);
    
    try {
      const newItem: EstimateItem = {
        id: crypto.randomUUID(),
        name: selectedMaterial.name,
        category: selectedMaterial.category,
        quantity,
        unit: selectedMaterial.unit,
        rate,
        total: quantity * rate,
      };

      setItems(prev => [...prev, newItem]);
      
      // Reset form
      setSelectedMaterial(null);
      setQuantity(1);
      setRate(0);
      
      toast({
        title: "Item added",
        description: `${selectedMaterial.name} has been added to your estimate`,
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

      // Navigate to summary page
      navigate('/summary', { state: { estimate } });
    } catch (error) {
      console.error('Failed to save estimate:', error);
      toast({
        title: "Error",
        description: "Failed to save estimate. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-mistryblue-500 text-white p-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="text-white p-2 mr-2 hover:bg-mistryblue-600"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold">Create Estimate</h1>
        </div>
      </header>
      
      <main className="p-4 max-w-lg mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Estimate Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={estimateType} 
              onValueChange={(value: 'electrical' | 'plumbing') => setEstimateType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electrical">Electrical Work</SelectItem>
                <SelectItem value="plumbing">Plumbing Work</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <MaterialSelector
              materials={materials}
              selectedMaterial={selectedMaterial}
              onMaterialSelect={handleMaterialSelect}
            />
            
            <EstimateForm
              selectedMaterial={selectedMaterial?.name || ''}
              quantity={quantity}
              rate={rate}
              onQuantityChange={setQuantity}
              onRateChange={setRate}
              onAddItem={handleAddItem}
              isAdding={isAdding}
            />
          </CardContent>
        </Card>

        <EstimateItemsList
          items={items}
          onRemoveItem={handleRemoveItem}
          onSaveEstimate={handleSaveEstimate}
        />
      </main>
      
      <Navigation />
    </div>
  );
};

export default CreateEstimatePage;
