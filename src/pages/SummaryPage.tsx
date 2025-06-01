
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Save, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import LogoImage from '@/components/LogoImage';

const SummaryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const estimateData = location.state?.estimateData;
  
  // If no estimate data, redirect back
  React.useEffect(() => {
    if (!estimateData) {
      navigate('/create-estimate');
    }
  }, [estimateData, navigate]);
  
  const handleSave = () => {
    // Save estimate logic here
    toast({
      title: "Estimate Saved",
      description: "Your estimate has been saved successfully.",
    });
  };
  
  const handleDownload = () => {
    // Download PDF logic here
    toast({
      title: "Download Started",
      description: "Your estimate PDF is being generated.",
    });
  };
  
  const handleShare = () => {
    // Share logic here
    toast({
      title: "Share Link Generated",
      description: "Share link has been copied to clipboard.",
    });
  };
  
  if (!estimateData) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-mistryblue-500 dark:bg-mistryblue-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/create-estimate')}
              className="text-white hover:bg-white/10 mr-3 p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <LogoImage size="small" />
          </div>
          <div className="text-sm">
            Estimate Summary
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto">
        <Card className="dark:bg-gray-800 dark:border-gray-700 mb-4">
          <CardHeader>
            <CardTitle className="dark:text-white">Estimate Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-b pb-4 dark:border-gray-600">
              <h3 className="font-medium dark:text-white">Project Details</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Type: {estimateData.type}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Date: {new Date().toLocaleDateString()}
              </p>
            </div>
            
            <div className="border-b pb-4 dark:border-gray-600">
              <h3 className="font-medium dark:text-white">Materials & Labor</h3>
              {estimateData.items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm mt-2">
                  <span className="dark:text-gray-300">{item.name}</span>
                  <span className="dark:text-gray-300">${item.total}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between text-lg font-bold dark:text-white">
              <span>Total Estimate:</span>
              <span>${estimateData.total || '0.00'}</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Button
            onClick={handleSave}
            className="bg-mistryblue-500 hover:bg-mistryblue-600 dark:bg-mistryblue-600 dark:hover:bg-mistryblue-700"
          >
            <Save size={16} className="mr-2" />
            Save
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="dark:border-gray-600 dark:text-white"
          >
            <Download size={16} className="mr-2" />
            PDF
          </Button>
        </div>
        
        <Button
          onClick={handleShare}
          variant="outline"
          className="w-full dark:border-gray-600 dark:text-white"
        >
          <Share size={16} className="mr-2" />
          Share Estimate
        </Button>
      </main>
      
      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
};

export default SummaryPage;
