
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
  
  const handleAddItem = (material?: typeof filteredMaterials[0]) => {
    const itemToAdd = material || newItem;
    
    const newEstimateItem: EstimateItem = {
      id: Date.now().toString(),
      name: itemToAdd.name,
      category: itemToAdd.category,
      quantity: newItem.quantity || 1,
      unit: itemToAdd.unit,
      rate: itemToAdd.rate,
      total: (newItem.quantity || 1) * itemToAdd.rate,
    };
    
    setItems([...items, newEstimateItem]);
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
          <h1 className="text-xl font-bold">Create Estimate</h1>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto">
        <Tabs 
          value={estimateType} 
          onValueChange={(value) => setEstimateType(value as 'electrical' | 'plumbing')}
        >
          <TabsList className="grid grid-cols-2 mb-4 w-full">
            <TabsTrigger value="electrical" className="flex items-center gap-2">
              <Plug size={16} /> Electrical
            </TabsTrigger>
            <TabsTrigger value="plumbing" className="flex items-center gap-2">
              <HardHat size={16} /> Plumbing
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="electrical">
            <Card>
              <CardHeader>
                <CardTitle>Electrical Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search materials..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                  {filteredMaterials.map((material, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-white border rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAddItem(material)}
                    >
                      <div>
                        <p className="font-medium">{material.name}</p>
                        <p className="text-xs text-gray-500">{material.category}</p>
                      </div>
                      <div className="text-right">
                        <p>₹{material.rate}</p>
                        <p className="text-xs text-gray-500">per {material.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h3 className="font-medium">Add Custom Item</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Item name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    />
                    <Input
                      placeholder="Category"
                      value={newItem.category}
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                    />
                    <Input
                      placeholder="Unit"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                    />
                    <Input
                      type="number"
                      placeholder="Rate"
                      value={newItem.rate}
                      onChange={(e) => setNewItem({...newItem, rate: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleAddItem()}
                    disabled={!newItem.name || newItem.rate <= 0}
                  >
                    <Plus size={16} className="mr-1" /> Add Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="plumbing">
            <Card>
              <CardHeader>
                <CardTitle>Plumbing Materials</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Same structure as electrical tab */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search materials..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                  {filteredMaterials.map((material, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-white border rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAddItem(material)}
                    >
                      <div>
                        <p className="font-medium">{material.name}</p>
                        <p className="text-xs text-gray-500">{material.category}</p>
                      </div>
                      <div className="text-right">
                        <p>₹{material.rate}</p>
                        <p className="text-xs text-gray-500">per {material.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h3 className="font-medium">Add Custom Item</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Item name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    />
                    <Input
                      placeholder="Category"
                      value={newItem.category}
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                    />
                    <Input
                      placeholder="Unit"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                    />
                    <Input
                      type="number"
                      placeholder="Rate"
                      value={newItem.rate}
                      onChange={(e) => setNewItem({...newItem, rate: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleAddItem()}
                    disabled={!newItem.name || newItem.rate <= 0}
                  >
                    <Plus size={16} className="mr-1" /> Add Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Added Items */}
        <section className="mt-6">
          <h2 className="text-xl font-bold mb-3">Items Added ({items.length})</h2>
          
          {items.length > 0 ? (
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-white border rounded"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{item.quantity} {item.unit}</span>
                      <span className="mx-1">×</span>
                      <span>₹{item.rate}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p className="font-medium mr-3">₹{item.total}</p>
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
              
              <div className="flex justify-between items-center p-3 bg-mistryblue-50 border border-mistryblue-200 rounded font-medium">
                <span>Total</span>
                <span>₹{calculateTotal()}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No items added yet</p>
              <p className="text-sm text-gray-400">Search or add custom items above</p>
            </div>
          )}
          
          <Button
            className="w-full bg-mistryyellow-500 hover:bg-mistryyellow-600 text-black"
            onClick={handleSaveEstimate}
            disabled={items.length === 0}
          >
            Continue to Summary
          </Button>
        </section>
      </main>
      
      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
};

export default CreateEstimatePage;
