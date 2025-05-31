import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Share, FileText, Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
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
  
  const estimate = location.state?.estimate as EstimateType | undefined;
  
  const [title, setTitle] = useState(estimate?.title || '');
  const [clientName, setClientName] = useState(estimate?.clientName || '');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Company logo URL - REPLACE WITH YOUR ACTUAL LOGO URL
  const companyLogoUrl = 'https://i.postimg.cc/pVggTwHz/file-000000006a5461f5a5e784f197571687.png';
  
  if (!estimate) {
    navigate('/');
    return null;
  }

  const calculateTotalQuantity = () => {
    return estimate.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleExportPdf = async () => {
    if (isGeneratingPdf) return;
    
    setIsGeneratingPdf(true);
    const loadingToastResult = toast({
      title: "Generating PDF",
      description: "Creating professional estimate...",
      duration: Infinity,
    });

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      
      let yPosition = margin;

      // Header with gradient background
      pdf.setFillColor(8, 47, 125);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      // Add company logo image
      try {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = companyLogoUrl;
        await new Promise((resolve) => {
          logoImg.onload = resolve;
          logoImg.onerror = resolve;
        });
        
        if (logoImg.width) {
          const logoHeight = Math.min(20, (20 * logoImg.height) / logoImg.width);
          pdf.addImage(logoImg.src, 'PNG', margin, 8, 20, logoHeight);
        }
      } catch (error) {
        console.log('Logo loading failed, using text fallback');
      }

      // Company name and title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MistryMate', pageWidth - margin, 15, { align: 'right' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Professional Construction Estimates', pageWidth - margin, 25, { align: 'right' });

      yPosition = 45;

      // Document title with accent line
      pdf.setTextColor(8, 47, 125);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PROFESSIONAL ESTIMATE', pageWidth / 2, yPosition, { align: 'center' });
      
      // Accent line
      pdf.setDrawColor(255, 204, 0);
      pdf.setLineWidth(2);
      pdf.line(pageWidth / 2 - 50, yPosition + 5, pageWidth / 2 + 50, yPosition + 5);
      
      yPosition += 20;

      // Estimate details box with proper color formatting
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, yPosition, contentWidth, 55, 'F');
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.5);
      pdf.rect(margin, yPosition, contentWidth, 55, 'S');

      // Project details - Left column
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      
      let detailY = yPosition + 12;
      pdf.text('Project Title:', margin + 8, detailY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(title || `${estimate.type.charAt(0).toUpperCase() + estimate.type.slice(1)} Estimate`, margin + 45, detailY);
      
      detailY += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Client Name:', margin + 8, detailY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(clientName || 'Not Specified', margin + 45, detailY);
      
      detailY += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Work Type:', margin + 8, detailY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${estimate.type.charAt(0).toUpperCase() + estimate.type.slice(1)} Work`, margin + 45, detailY);

      // Project details - Right column
      detailY = yPosition + 12;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Estimate Date:', margin + 105, detailY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formatDate(estimate.date), margin + 145, detailY);
      
      detailY += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Total Items:', margin + 105, detailY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${estimate.items.length} items`, margin + 145, detailY);
      
      detailY += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Estimate ID:', margin + 105, detailY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`#${estimate.id.slice(0, 8).toUpperCase()}`, margin + 145, detailY);

      yPosition += 65;

      // Items table header
      pdf.setFillColor(8, 47, 125);
      pdf.rect(margin, yPosition, contentWidth, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      
      pdf.text('ITEM DESCRIPTION', margin + 5, yPosition + 8);
      pdf.text('QTY', margin + 120, yPosition + 8);
      pdf.text('UNIT', margin + 140, yPosition + 8);
      pdf.text('RATE (₹)', margin + 160, yPosition + 8);
      pdf.text('AMOUNT (₹)', margin + 180, yPosition + 8, { align: 'right' });

      yPosition += 14;

      // Items list with alternating row colors
      pdf.setTextColor(40, 40, 40);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);

      estimate.items.forEach((item, index) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        // Alternating row background
        if (index % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(margin, yPosition, contentWidth, 10, 'F');
        }

        const itemName = item.name.length > 35 ? item.name.substring(0, 32) + '...' : item.name;
        pdf.text(itemName, margin + 5, yPosition + 7);
        pdf.text(item.quantity.toString(), margin + 120, yPosition + 7);
        pdf.text(item.unit, margin + 140, yPosition + 7);
        pdf.text(`₹${item.rate.toFixed(2)}`, margin + 160, yPosition + 7);
        pdf.text(`₹${item.total.toFixed(2)}`, margin + 180, yPosition + 7, { align: 'right' });

        yPosition += 10;
      });

      // Total section with enhanced styling
      yPosition += 8;
      pdf.setFillColor(8, 47, 125);
      pdf.rect(margin + 120, yPosition, 80, 15, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('TOTAL AMOUNT', margin + 125, yPosition + 10);
      pdf.setFontSize(14);
      pdf.text(`₹${estimate.total.toFixed(2)}`, margin + 180, yPosition + 10, { align: 'right' });

      // Footer
      const footerY = pageHeight - 25;
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('This estimate is valid for 30 days from the date of issue.', pageWidth / 2, footerY, { align: 'center' });
      pdf.text('Terms & Conditions apply. Contact us for any clarifications.', pageWidth / 2, footerY + 5, { align: 'center' });
      
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

      // Save PDF
      const filename = `Estimate_${(title || estimate.type).replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(filename);

      toast({
        title: "PDF Generated",
        description: "Professional estimate downloaded successfully",
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
      if (loadingToastResult?.dismiss) {
        loadingToastResult.dismiss();
      }
    }
  };

  const handleSaveFinal = async () => {
    setIsSaving(true);
    try {
      const finalEstimate: EstimateType = {
        ...estimate,
        title: title || `${estimate.type.charAt(0).toUpperCase() + estimate.type.slice(1)} Estimate`,
        clientName,
        isFinal: true,
      };
      
      if (user && !user.isGuest) {
        await saveEstimate(finalEstimate, user.id);
      } else {
        await saveEstimate(finalEstimate);
      }
      
      const savedEstimates = JSON.parse(localStorage.getItem('mistryMateEstimates') || '[]');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
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
                  <span className="dark:text-white">{estimate.items.length} ({calculateTotalQuantity()} units)</span>
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
                      <p className="font-medium dark:text-white">₹{item.total.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{item.quantity} {item.unit} × ₹{item.rate.toFixed(2)}</span>
                      <span>{item.category}</span>
                    </div>
                  </div>
                ))}
                
                <div className="py-4 font-bold text-lg flex justify-between">
                  <span className="dark:text-white">Grand Total</span>
                  <span className="dark:text-white">₹{estimate.total.toFixed(2)}</span>
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
      </main>
    </div>
  );
};

export default SummaryPage;
