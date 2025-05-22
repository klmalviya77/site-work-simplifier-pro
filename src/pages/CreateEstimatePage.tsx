import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plug, HardHat } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import MaterialSelector from '@/components/estimate/MaterialSelector';
import EstimateForm from '@/components/estimate/EstimateForm';
import EstimateItemsList, { EstimateItem } from '@/components/estimate/EstimateItemsList';
import materialSuggestions, { Material } from '@/data/materialSuggestions';
import { saveEstimate } from '@/services/estimateService';
import { useAuth } from '@/contexts/AuthContext';

const CreateEstimatePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get estimate type from state or default to electrical
  const initialType = location.state?.estimateType || 'electrical';
  const [estimateType, setEstimateType] = useState<'electrical' | 'plumbing'>(initialType);
  
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 1,
    unit: 'pcs',
    rate: 0,
  });
  
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [rate, setRate] = useState<number>(0);
  
  const handleMaterialSelect = (material: Material) => {
    setSelectedMaterial(material.name);
    setRate(material.rate);
    setNewItem({
      ...newItem,
      name: material.name,
      category: material.category,
      rate: material.rate,
      unit: material.unit
    });
  };
  
  const handleAddItem = () => {
    if (!selectedMaterial || quantity <= 0 || rate <= 0) {
      toast({
        title: "Invalid input",
        description: "Please select a material and provide valid quantity and rate",
        variant: "destructive",
      });
      return;
    }
    
    const newEstimateItem: EstimateItem = {
      id: Date.now().toString(),
      name: selectedMaterial,
      category: newItem.category,
      quantity: quantity,
      unit: newItem.unit,
      rate: rate,
      total: quantity * rate,
    };
    
    setItems([...items, newEstimateItem]);
    
    // Reset fields
    setSelectedMaterial('');
    setQuantity(1);
    setRate(0);
    setNewItem({
      name: '',
      category: '',
      quantity: 1,
      unit: 'pcs',
      rate: 0,
    });
    
    toast({
      title: "Item added",
      description: `${newEstimateItem.name} added to estimate`,
    });
  };
  
  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const handleSaveEstimate = async () => {
    // In a real app, this would save the estimate to a database
    if (items.length === 0) {
      toast({
        title: "Cannot save empty estimate",
        description: "Please add at least one item",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate total
    const total = items.reduce((sum, item) => sum + item.total, 0);
    
    // Create estimate object
    const estimate = {
      id: Date.now().toString(),
      type: estimateType,
      items,
      total,
      date: new Date().toISOString(),
    };
    
    // Save to Supabase if user is logged in, otherwise save to localStorage
    const savedToSupabase = user && !user.isGuest ? 
      await saveEstimate(estimate, user.id) : 
      await saveEstimate(estimate);

    // In a real app, save to backend
    // For now, save to localStorage (This is kept for backward compatibility)
    const savedEstimates = JSON.parse(localStorage.getItem('mistryMateEstimates') || '[]');
    localStorage.setItem('mistryMateEstimates', JSON.stringify([...savedEstimates, estimate]));
    
    toast({
      title: "Estimate saved",
      description: `${estimateType} estimate with ${items.length} items saved`,
    });
    
    navigate('/summary', { state: { estimate } });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-mistryblue-500 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">{estimateType.charAt(0).toUpperCase() + estimateType.slice(1)} Estimator</h1>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto">
        <Tabs 
          value={estimateType} 
          onValueChange={(value) => setEstimateType(value as 'electrical' | 'plumbing')}
          className="mb-6"
        >
          <TabsList className="grid grid-cols-2 mb-4 w-full">
            <TabsTrigger value="electrical" className="flex items-center gap-2">
              <Plug size={16} /> Electrical
            </TabsTrigger>
            <TabsTrigger value="plumbing" className="flex items-center gap-2">
              <HardHat size={16} /> Plumbing
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Material Selection */}
        <MaterialSelector
          materials={materialSuggestions[estimateType]}
          selectedMaterial={selectedMaterial}
          onMaterialSelect={handleMaterialSelect}
          estimateType={estimateType}
        />
        
        {/* Estimate Form (Quantity and Rate) */}
        <EstimateForm
          selectedMaterial={selectedMaterial}
          quantity={quantity}
          rate={rate}
          onQuantityChange={setQuantity}
          onRateChange={setRate}
          onAddItem={handleAddItem}
        />
        
        {/* Added Items List */}
        <EstimateItemsList
          items={items}
          onRemoveItem={handleRemoveItem}
          onSaveEstimate={handleSaveEstimate}
        />
      </main>
      
      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
};

export default CreateEstimatePage;
