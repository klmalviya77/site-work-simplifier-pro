
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
      // Create PDF document in A4 format
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      let yPosition = margin;

      // Company Header with Logo and Branding
      pdf.setFillColor(0, 105, 208); // Blue background
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Company Name
      pdf.setTextColor(255, 255, 255); // White text
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MistryMate', margin, 20);
      
      // Tagline
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Professional Site Work Estimates', margin, 28);
      
      // Contact info in header
      pdf.setFontSize(10);
      pdf.text('support@mistrymate.com | +91 9876543210', pageWidth - margin, 20, { align: 'right' });
      pdf.text('www.mistrymate.com', pageWidth - margin, 28, { align: 'right' });

      yPosition = 50;

      // Document Title
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ESTIMATE SUMMARY', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;

      // Estimate Information Box
      pdf.setFillColor(248, 249, 250); // Light gray background
      pdf.rect(margin, yPosition, contentWidth, 40, 'F');
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(margin, yPosition, contentWidth, 40, 'S');

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      
      // Left column
      pdf.text('Estimate Details:', margin + 5, yPosition + 8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Title: ${title || 'Untitled Estimate'}`, margin + 5, yPosition + 16);
      pdf.text(`Client: ${clientName || 'Not specified'}`, margin + 5, yPosition + 24);
      pdf.text(`Type: ${estimate.type.charAt(0).toUpperCase() + estimate.type.slice(1)}`, margin + 5, yPosition + 32);
      
      // Right column
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Date: ${formatDate(estimate.date)}`, margin + 100, yPosition + 16);
      pdf.text(`Total Items: ${estimate.items.length}`, margin + 100, yPosition + 24);
      pdf.text(`Estimate ID: ${estimate.id.slice(0, 8)}`, margin + 100, yPosition + 32);

      yPosition += 55;

      // Items Table Header
      pdf.setFillColor(0, 105, 208);
      pdf.rect(margin, yPosition, contentWidth, 12, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      
      // Table headers
      pdf.text('Item Description', margin + 3, yPosition + 8);
      pdf.text('Qty', margin + 100, yPosition + 8);
      pdf.text('Unit', margin + 120, yPosition + 8);
      pdf.text('Rate (₹)', margin + 140, yPosition + 8);
      pdf.text('Amount (₹)', margin + 165, yPosition + 8);

      yPosition += 12;

      // Items Data
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      estimate.items.forEach((item, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = margin;
          
          // Repeat header on new page
          pdf.setFillColor(0, 105, 208);
          pdf.rect(margin, yPosition, contentWidth, 12, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(11);
          pdf.text('Item Description', margin + 3, yPosition + 8);
          pdf.text('Qty', margin + 100, yPosition + 8);
          pdf.text('Unit', margin + 120, yPosition + 8);
          pdf.text('Rate (₹)', margin + 140, yPosition + 8);
          pdf.text('Amount (₹)', margin + 165, yPosition + 8);
          yPosition += 12;
          
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
        }

        // Alternate row colors
        if (index % 2 === 1) {
          pdf.setFillColor(248, 249, 250);
          pdf.rect(margin, yPosition, contentWidth, 10, 'F');
        }

        // Draw borders
        pdf.setDrawColor(220, 220, 220);
        pdf.rect(margin, yPosition, contentWidth, 10, 'S');

        // Item data
        const itemName = item.name.length > 35 ? item.name.substring(0, 32) + '...' : item.name;
        pdf.text(itemName, margin + 3, yPosition + 7);
        pdf.text(item.quantity.toString(), margin + 100, yPosition + 7);
        pdf.text(item.unit, margin + 120, yPosition + 7);
        pdf.text(item.rate.toLocaleString('en-IN'), margin + 140, yPosition + 7);
        pdf.text(item.total.toLocaleString('en-IN'), margin + 165, yPosition + 7);

        yPosition += 10;
      });

      // Total Section
      yPosition += 10;
      pdf.setFillColor(0, 105, 208);
      pdf.rect(margin + 120, yPosition, 70, 15, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('GRAND TOTAL:', margin + 125, yPosition + 7);
      pdf.text(`₹${estimate.total.toLocaleString('en-IN')}`, margin + 125, yPosition + 12);

      // Footer section
      yPosition = pageHeight - 40;
      
      // Footer line
      pdf.setDrawColor(0, 105, 208);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      
      yPosition += 10;
      
      // Footer text
      pdf.setTextColor(100, 100, 100);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('Thank you for choosing MistryMate for your site work estimates.', pageWidth / 2, yPosition, { align: 'center' });
      pdf.text('This is a digitally generated estimate. For any queries, contact us at support@mistrymate.com', pageWidth / 2, yPosition + 8, { align: 'center' });
      
      // Generate filename
      const filename = `${(title || estimate.type).replace(/[^a-zA-Z0-9]/g, '_')}_estimate_${new Date().toISOString().slice(0, 10)}.pdf`;
      
      // Save PDF
      pdf.save(filename);

      toast({
        title: "PDF Generated Successfully",
        description: "Professional estimate downloaded",
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Could not create PDF. Please try again.",
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
