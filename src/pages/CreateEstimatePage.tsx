
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, ArrowUp, ArrowDown, Plug, HardHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardHeader, 
  CardTitle,
  CardContent 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';

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
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get estimate type from state or default to electrical
  const initialType = location.state?.estimateType || 'electrical';
  const [estimateType, setEstimateType] = useState<'electrical' | 'plumbing'>(initialType);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 1,
    unit: 'pcs',
    rate: 0,
  });
  
  // Mock material suggestions
  const materialSuggestions = {
    electrical: [
      { name: '2-Way Switch', category: 'Switches', rate: 120, unit: 'pcs' },
      { name: '3-Way Switch', category: 'Switches', rate: 180, unit: 'pcs' },
      { name: '6A Switch', category: 'Switches', rate: 100, unit: 'pcs' },
      { name: '16A Switch', category: 'Switches', rate: 150, unit: 'pcs' },
      { name: 'Power Socket', category: 'Sockets', rate: 150, unit: 'pcs' },
      { name: 'USB Socket', category: 'Sockets', rate: 350, unit: 'pcs' },
      { name: 'LED Bulb', category: 'Lighting', rate: 80, unit: 'pcs' },
      { name: 'MCB 6A', category: 'Protection', rate: 250, unit: 'pcs' },
      { name: 'Wire 1.5mm²', category: 'Wiring', rate: 18, unit: 'meter' },
    ],
    plumbing: [
      { name: 'PVC Pipe 1/2"', category: 'Pipes', rate: 35, unit: 'meter' },
      { name: 'Brass Tap', category: 'Fixtures', rate: 450, unit: 'pcs' },
      { name: 'Sink', category: 'Fixtures', rate: 1200, unit: 'pcs' },
      { name: 'Elbow Joint', category: 'Joints', rate: 25, unit: 'pcs' },
      { name: 'Water Tank', category: 'Storage', rate: 3500, unit: 'pcs' },
      { name: 'CPVC Pipe 3/4"', category: 'Pipes', rate: 65, unit: 'meter' },
    ]
  };
  
  const [filteredMaterials, setFilteredMaterials] = useState(materialSuggestions[estimateType]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [rate, setRate] = useState<number>(0);
  
  useEffect(() => {
    // Update filtered materials when search query or estimate type changes
    if (searchQuery.trim() === '') {
      setFilteredMaterials(materialSuggestions[estimateType]);
    } else {
      const filtered = materialSuggestions[estimateType].filter(
        material => material.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMaterials(filtered);
    }
  }, [searchQuery, estimateType]);
  
  const handleMaterialSelect = (material: typeof filteredMaterials[0]) => {
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
  
  const handleSaveEstimate = () => {
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
    
    // In a real app, save to backend
    // For now, save to localStorage
    const savedEstimates = JSON.parse(localStorage.getItem('mistryMateEstimates') || '[]');
    localStorage.setItem('mistryMateEstimates', JSON.stringify([...savedEstimates, estimate]));
    
    toast({
      title: "Estimate saved",
      description: `${estimateType} estimate with ${items.length} items saved`,
    });
    
    navigate('/summary', { state: { estimate } });
  };
  
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
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
        <div className="mb-6">
          <label htmlFor="material" className="block text-base font-medium mb-2">
            Material
          </label>
          <div className="relative">
            <div className="relative">
              <Input 
                id="material"
                value={selectedMaterial}
                onClick={() => {
                  // Set initial filtered materials
                  setFilteredMaterials(materialSuggestions[estimateType]);
                }}
                onChange={(e) => {
                  setSelectedMaterial(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                placeholder="Select or search material"
                className="w-full pr-10 border-2"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ArrowDown size={18} className="text-gray-500" />
              </div>
            </div>
            
            {searchQuery || selectedMaterial === '' ? (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredMaterials.length > 0 ? (
                  filteredMaterials.map((material, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                      onClick={() => {
                        handleMaterialSelect(material);
                        setSearchQuery('');
                      }}
                    >
                      <span>{material.name}</span>
                      <span className="text-gray-500">₹{material.rate}/{material.unit}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No materials found</div>
                )}
              </div>
            ) : null}
          </div>
        </div>
        
        {/* Quantity */}
        <div className="mb-6">
          <label htmlFor="quantity" className="block text-base font-medium mb-2">
            Quantity
          </label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            min="1"
            className="w-full border-2"
          />
        </div>
        
        {/* Rate */}
        <div className="mb-6">
          <label htmlFor="rate" className="block text-base font-medium mb-2">
            Rate (INR)
          </label>
          <Input
            id="rate"
            type="number"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            className="w-full border-2"
          />
        </div>
        
        {/* Add Button */}
        <Button
          className="w-full bg-mistryblue-500 hover:bg-mistryblue-600 py-6 text-base"
          onClick={handleAddItem}
          disabled={!selectedMaterial || quantity <= 0 || rate <= 0}
        >
          Add to Estimate
        </Button>
        
        {/* Added Items */}
        {items.length > 0 && (
          <div className="mt-8">
            <div className="grid grid-cols-5 gap-0 border text-center font-medium bg-gray-100">
              <div className="p-2 border-r">Material</div>
              <div className="p-2 border-r">Quantity</div>
              <div className="p-2 border-r">Rate</div>
              <div className="p-2 border-r">Total</div>
              <div className="p-2">Action</div>
            </div>
            
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-5 gap-0 border-b border-l border-r text-center">
                <div className="p-2 border-r truncate">{item.name}</div>
                <div className="p-2 border-r">{item.quantity}</div>
                <div className="p-2 border-r">₹{item.rate}</div>
                <div className="p-2 border-r">₹{item.total}</div>
                <div className="p-2 flex justify-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 h-8 w-8 p-0"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="flex justify-end items-center p-3 bg-white border border-t-0">
              <span className="font-bold mr-2">Grand Total:</span>
              <span className="font-bold">₹{calculateTotal()}</span>
            </div>
            
            <Button
              className="w-full mt-4 bg-mistryyellow-500 hover:bg-mistryyellow-600 text-black"
              onClick={handleSaveEstimate}
            >
              Continue to Summary
            </Button>
          </div>
        )}
      </main>
      
      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
};

export default CreateEstimatePage;
