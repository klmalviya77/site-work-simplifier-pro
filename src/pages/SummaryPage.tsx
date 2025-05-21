
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Share, FileText, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import LogoImage from '@/components/LogoImage';

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
}

const SummaryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get estimate data from location state or redirect to home
  const estimate = location.state?.estimate as Estimate | undefined;
  
  const [title, setTitle] = useState(estimate?.title || '');
  const [clientName, setClientName] = useState(estimate?.clientName || '');
  
  if (!estimate) {
    // Redirect to home if no estimate data
    navigate('/');
    return null;
  }
  
  const handleSaveFinal = () => {
    // In a real app, this would save to a database
    const finalEstimate = {
      ...estimate,
      title: title || `${estimate.type.charAt(0).toUpperCase() + estimate.type.slice(1)} Estimate`,
      clientName,
      isFinal: true,
    };
    
    // Save to localStorage
    const savedEstimates = JSON.parse(localStorage.getItem('mistryMateEstimates') || '[]');
    
    // Find and replace if exists, otherwise add
    const existingIndex = savedEstimates.findIndex((e: Estimate) => e.id === estimate.id);
    if (existingIndex >= 0) {
      savedEstimates[existingIndex] = finalEstimate;
    } else {
      savedEstimates.push(finalEstimate);
    }
    
    localStorage.setItem('mistryMateEstimates', JSON.stringify(savedEstimates));
    
    toast({
      title: "Estimate finalized",
      description: "Your estimate has been saved",
    });
    
    navigate('/saved');
  };
  
  const handleShare = () => {
    toast({
      title: "Share feature",
      description: "This feature will be available soon",
    });
  };
  
  const handleExportPdf = () => {
    toast({
      title: "PDF export",
      description: "This feature will be available soon",
    });
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <header className="bg-mistryblue-500 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Estimate Summary</h1>
          <Button variant="ghost" onClick={() => navigate('/')} className="text-white p-2">
            <Home size={20} />
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Estimate Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Estimate Title
                </label>
                <Input
                  id="title"
                  placeholder={`${estimate.type.charAt(0).toUpperCase() + estimate.type.slice(1)} Estimate`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name (Optional)
                </label>
                <Input
                  id="clientName"
                  placeholder="Enter client name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date:</span>
                <span>{formatDate(estimate.date)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Estimate Type:</span>
                <span className="capitalize">{estimate.type}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Items:</span>
                <span>{estimate.items.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Items ({estimate.items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {estimate.items.map((item) => (
                <div key={item.id} className="py-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{item.name}</p>
                    <p className="font-medium">₹{item.total}</p>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{item.quantity} {item.unit} × ₹{item.rate}</span>
                    <span>{item.category}</span>
                  </div>
                </div>
              ))}
              
              <div className="py-4 font-bold text-lg flex justify-between">
                <span>Grand Total</span>
                <span>₹{estimate.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            className="bg-mistryblue-500 hover:bg-mistryblue-600"
            onClick={handleSaveFinal}
          >
            Save Estimate
          </Button>
          
          <Button
            variant="outline"
            className="border-mistryblue-500 text-mistryblue-500"
            onClick={handleShare}
          >
            <Share size={16} className="mr-1" /> Share
          </Button>
          
          <Button 
            variant="outline"
            className="border-gray-300 col-span-2"
            onClick={handleExportPdf}
          >
            <FileText size={16} className="mr-1" /> Export PDF
          </Button>
        </div>
        
        <div className="mb-4 text-center">
          <LogoImage size="small" />
          <p className="text-sm text-gray-500 mt-1">MistryMate - Simplify Your Site Work</p>
        </div>
      </main>
    </div>
  );
};

export default SummaryPage;
