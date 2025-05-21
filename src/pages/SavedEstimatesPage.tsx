
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';

interface EstimateItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  rate: number;
  total: number;
}

interface Estimate {
  id: string;
  type: 'electrical' | 'plumbing';
  items: EstimateItem[];
  total: number;
  date: string;
  title?: string;
  clientName?: string;
  isFinal?: boolean;
}

const SavedEstimatesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    // Load estimates from localStorage
    const savedEstimates = JSON.parse(localStorage.getItem('mistryMateEstimates') || '[]');
    setEstimates(savedEstimates);
  }, []);
  
  const handleDeleteEstimate = (id: string) => {
    // Remove from local state
    const newEstimates = estimates.filter(estimate => estimate.id !== id);
    setEstimates(newEstimates);
    
    // Update localStorage
    localStorage.setItem('mistryMateEstimates', JSON.stringify(newEstimates));
    
    toast({
      title: "Estimate deleted",
      description: "The estimate has been removed",
    });
  };
  
  const handleViewEstimate = (estimate: Estimate) => {
    // Navigate to summary page with estimate data
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
      {/* Header */}
      <header className="bg-mistryblue-500 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Saved Estimates</h1>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search estimates..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Estimates List */}
        {filteredEstimates.length > 0 ? (
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
                  <div className={`capitalize px-2 py-1 rounded text-xs ${estimate.type === 'electrical' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {estimate.type}
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
                    onClick={() => handleDeleteEstimate(estimate.id)}
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
      
      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
};

export default SavedEstimatesPage;
