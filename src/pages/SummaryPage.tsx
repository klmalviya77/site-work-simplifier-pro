import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Share, FileText, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import LogoImage from '@/components/LogoImage';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
  const contentRef = useRef<HTMLDivElement>(null);
  
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
    if (navigator.share) {
      const shareData = {
        title: title || `${estimate.type.charAt(0).toUpperCase() + estimate.type.slice(1)} Estimate`,
        text: `MistryMate Estimate: ${title || estimate.type} for ${clientName || 'Client'} - Total: ₹${estimate.total}`,
        url: window.location.href,
      };
      
      navigator.share(shareData)
        .then(() => {
          toast({
            title: "Shared successfully",
            description: "Estimate has been shared",
          });
        })
        .catch((error) => {
          console.error('Error sharing:', error);
          toast({
            title: "Sharing failed",
            description: "Could not share the estimate",
            variant: "destructive",
          });
        });
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(
        `MistryMate Estimate: ${title || estimate.type} for ${clientName || 'Client'} - Total: ₹${estimate.total}`
      )
        .then(() => {
          toast({
            title: "Copied to clipboard",
            description: "Estimate details copied to clipboard",
          });
        })
        .catch(() => {
          toast({
            title: "Copy failed",
            description: "Could not copy to clipboard",
            variant: "destructive",
          });
        });
    }
  };
  
  const handleExportPdf = async () => {
    if (!contentRef.current) return;
    
    try {
      toast({
        title: "Generating PDF",
        description: "Please wait...",
      });
      
      const content = contentRef.current;
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const filename = `${title || estimate.type}_estimate_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
      pdf.save(filename);
      
      toast({
        title: "PDF exported",
        description: "Your estimate has been downloaded as PDF",
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: "PDF generation failed",
        description: "Could not generate PDF",
        variant: "destructive",
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
      {/* Header */}
      <header className="bg-mistryblue-500 dark:bg-mistryblue-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Estimate Summary</h1>
          <Button variant="ghost" onClick={() => navigate('/')} className="text-white p-2">
            <Home size={20} />
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto">
        <div ref={contentRef}>
          <Card className="mb-4 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Estimate Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estimate Title
                  </label>
                  <Input
                    id="title"
                    placeholder={`${estimate.type.charAt(0).toUpperCase() + estimate.type.slice(1)} Estimate`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Client Name (Optional)
                  </label>
                  <Input
                    id="clientName"
                    placeholder="Enter client name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Date:</span>
                  <span className="dark:text-white">{formatDate(estimate.date)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Estimate Type:</span>
                  <span className="capitalize dark:text-white">{estimate.type}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Total Items:</span>
                  <span className="dark:text-white">{estimate.items.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Items ({estimate.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y dark:divide-gray-700">
                {estimate.items.map((item) => (
                  <div key={item.id} className="py-3">
                    <div className="flex justify-between">
                      <p className="font-medium dark:text-white">{item.name}</p>
                      <p className="font-medium dark:text-white">₹{item.total}</p>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{item.quantity} {item.unit} × ₹{item.rate}</span>
                      <span>{item.category}</span>
                    </div>
                  </div>
                ))}
                
                <div className="py-4 font-bold text-lg flex justify-between">
                  <span className="dark:text-white">Grand Total</span>
                  <span className="dark:text-white">₹{estimate.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            className="bg-mistryblue-500 hover:bg-mistryblue-600 dark:bg-mistryblue-600 dark:hover:bg-mistryblue-700"
            onClick={handleSaveFinal}
          >
            Save Estimate
          </Button>
          
          <Button
            variant="outline"
            className="border-mistryblue-500 text-mistryblue-500 dark:border-mistryblue-400 dark:text-mistryblue-400 dark:hover:bg-gray-700"
            onClick={handleShare}
          >
            <Share size={16} className="mr-1" /> Share
          </Button>
          
          <Button 
            variant="outline"
            className="border-gray-300 col-span-2 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
            onClick={handleExportPdf}
          >
            <FileText size={16} className="mr-1" /> Export PDF
          </Button>
        </div>
        
        <div className="mb-4 text-center">
          <LogoImage size="small" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">MistryMate - Simplify Your Site Work</p>
        </div>
      </main>
    </div>
  );
};

export default SummaryPage;
