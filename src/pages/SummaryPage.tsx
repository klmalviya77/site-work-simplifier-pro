import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Share, FileText, Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import LogoImage from '@/components/LogoImage';
import { jsPDF } from 'jspdf';
import { useAuth } from '@/contexts/AuthContext';
import { saveEstimate, Estimate as EstimateType } from '@/services/estimateService';

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
  const { user } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Get estimate data from location state or redirect to home
  const estimate = location.state?.estimate as EstimateType | undefined;
  
  const [title, setTitle] = useState(estimate?.title || '');
  const [clientName, setClientName] = useState(estimate?.clientName || '');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  if (!estimate) {
    // Redirect to home if no estimate data
    navigate('/');
    return null;
  }
  
  const handleSaveFinal = async () => {
    setIsSaving(true);
    try {
      // Create the final estimate object with updated title and client name
      const finalEstimate: EstimateType = {
        ...estimate,
        title: title || `${estimate.type.charAt(0).toUpperCase() + estimate.type.slice(1)} Estimate`,
        clientName,
        isFinal: true,
      };
      
      // Save to Supabase if user is logged in
      if (user && !user.isGuest) {
        await saveEstimate(finalEstimate, user.id);
      } else {
        // Save to local storage only
        await saveEstimate(finalEstimate);
      }
      
      // For backward compatibility, also save to the legacy localStorage format
      const savedEstimates = JSON.parse(localStorage.getItem('mistryMateEstimates') || '[]');
      
      // Find and replace if exists, otherwise add
      const existingIndex = savedEstimates.findIndex((e: EstimateType) => e.id === estimate.id);
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
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Could not save estimate",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
    if (isGeneratingPdf) return;
    
    setIsGeneratingPdf(true);
    const loadingToast = toast({
      title: "Generating PDF",
      description: "Creating professional estimate...",
      duration: Infinity,
    });

    try {
      // Create PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
      });

      // Add header with logo and company info
      pdf.setFontSize(20);
      pdf.setTextColor(0, 105, 208); // Blue color
      pdf.text('MistryMate', 105, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100); // Gray color
      pdf.text('Professional Site Work Estimates', 105, 27, { align: 'center' });
      
      // Add horizontal line
      pdf.setDrawColor(0, 105, 208);
      pdf.setLineWidth(0.5);
      pdf.line(20, 32, 190, 32);

      // Add estimate title section
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('ESTIMATE SUMMARY', 105, 42, { align: 'center' });

      // Add estimate details
      pdf.setFontSize(12);
      pdf.text(`Estimate Title: ${title || 'Untitled Estimate'}`, 20, 52);
      pdf.text(`Client Name: ${clientName || 'Not specified'}`, 20, 58);
      pdf.text(`Date: ${formatDate(estimate.date)}`, 20, 64);
      pdf.text(`Estimate Type: ${estimate.type.charAt(0).toUpperCase() + estimate.type.slice(1)}`, 20, 70);
      
      // Add items table header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, 80, 170, 10, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Item', 25, 87);
      pdf.text('Qty', 120, 87);
      pdf.text('Rate', 140, 87);
      pdf.text('Amount', 170, 87, { align: 'right' });

      // Add items
      pdf.setFont('helvetica', 'normal');
      let yPosition = 90;
      estimate.items.forEach((item, index) => {
        yPosition += 10;
        if (yPosition > 270) { // Add new page if running out of space
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.text(item.name, 25, yPosition);
        pdf.text(`${item.quantity} ${item.unit}`, 120, yPosition);
        pdf.text(`₹${item.rate}`, 140, yPosition);
        pdf.text(`₹${item.total}`, 170, yPosition, { align: 'right' });
        
        // Add light gray line between items
        if (index < estimate.items.length - 1) {
          pdf.setDrawColor(220, 220, 220);
          pdf.line(20, yPosition + 5, 190, yPosition + 5);
        }
      });

      // Add total
      pdf.setFont('helvetica', 'bold');
      pdf.setDrawColor(0, 105, 208);
      pdf.line(140, yPosition + 15, 190, yPosition + 15);
      pdf.text('Total:', 140, yPosition + 25);
      pdf.text(`₹${estimate.total}`, 170, yPosition + 25, { align: 'right' });

      // Add footer
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Thank you for choosing MistryMate', 105, 280, { align: 'center' });
      pdf.text('Contact: support@mistrymate.com | Phone: +91 9876543210', 105, 285, { align: 'center' });

      // Save PDF
      pdf.save(`${title || estimate.type}_estimate_${new Date().toISOString().slice(0, 10)}.pdf`);

      toast({
        title: "PDF Generated",
        description: "Professional estimate downloaded",
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Could not create PDF",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
      toast.dismiss(loadingToast.id);
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
      <header className="bg-blue-600 dark:bg-blue-800 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Estimate Summary</h1>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="text-white p-2 hover:bg-blue-700 dark:hover:bg-blue-900"
          >
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <Button
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            onClick={handleSaveFinal}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Save Estimate
          </Button>
          
          <Button
            variant="outline"
            className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700"
            onClick={handleShare}
          >
            <Share size={16} className="mr-2" /> 
            Share
          </Button>
          
          <Button 
            variant="outline"
            className="border-gray-300 col-span-1 sm:col-span-2 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
            onClick={handleExportPdf}
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Export PDF
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
