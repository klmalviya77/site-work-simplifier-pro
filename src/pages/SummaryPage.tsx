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
    const loadingToastResult = toast({
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

      // Professional Header with Gradient Background
      pdf.setFillColor(8, 47, 125); // Deep blue
      pdf.rect(0, 0, pageWidth, 50, 'F');
      
      // Add subtle pattern/texture effect
      pdf.setFillColor(16, 64, 158); // Slightly lighter blue
      pdf.rect(0, 25, pageWidth, 25, 'F');
      
      // Company Logo Area (placeholder for now)
      pdf.setFillColor(255, 255, 255); // White circle for logo
      pdf.circle(margin + 15, 25, 12, 'F');
      pdf.setTextColor(8, 47, 125);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MM', margin + 10, 29);
      
      // Company Name and Branding
      pdf.setTextColor(255, 255, 255); // White text
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MistryMate', margin + 35, 22);
      
      // Professional Tagline
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Professional Construction Estimates & Site Work Solutions', margin + 35, 30);
      
      // Contact Information - Right aligned
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Email: support@mistrymate.com', pageWidth - margin, 18, { align: 'right' });
      pdf.text('Phone: +91 9876 543 210', pageWidth - margin, 24, { align: 'right' });
      pdf.text('Web: www.mistrymate.com', pageWidth - margin, 30, { align: 'right' });
      
      // Professional border line
      pdf.setDrawColor(255, 204, 0); // Gold accent
      pdf.setLineWidth(2);
      pdf.line(0, 50, pageWidth, 50);

      yPosition = 65;

      // Document Title with Professional Styling
      pdf.setTextColor(8, 47, 125);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('COST ESTIMATE', pageWidth / 2, yPosition, { align: 'center' });
      
      // Decorative line under title
      pdf.setDrawColor(255, 204, 0);
      pdf.setLineWidth(1);
      pdf.line(pageWidth / 2 - 30, yPosition + 3, pageWidth / 2 + 30, yPosition + 3);
      
      yPosition += 20;

      // Professional Information Box with Shadow Effect
      // Shadow
      pdf.setFillColor(200, 200, 200);
      pdf.rect(margin + 2, yPosition + 2, contentWidth, 45, 'F');
      
      // Main box
      pdf.setFillColor(248, 250, 252); // Very light blue-gray
      pdf.rect(margin, yPosition, contentWidth, 45, 'F');
      
      // Border
      pdf.setDrawColor(8, 47, 125);
      pdf.setLineWidth(0.5);
      pdf.rect(margin, yPosition, contentWidth, 45, 'S');

      // Information Content with Better Typography
      pdf.setTextColor(8, 47, 125);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      
      // Left column headers
      pdf.text('ESTIMATE DETAILS', margin + 8, yPosition + 10);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      
      pdf.text(`Project Title:`, margin + 8, yPosition + 18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${title || 'Untitled Estimate'}`, margin + 35, yPosition + 18);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Client Name:`, margin + 8, yPosition + 26);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${clientName || 'Not Specified'}`, margin + 35, yPosition + 26);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Work Type:`, margin + 8, yPosition + 34);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${estimate.type.charAt(0).toUpperCase() + estimate.type.slice(1)} Work`, margin + 35, yPosition + 34);
      
      // Right column
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Estimate Date:`, margin + 105, yPosition + 18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${formatDate(estimate.date)}`, margin + 140, yPosition + 18);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Items:`, margin + 105, yPosition + 26);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${estimate.items.length}`, margin + 140, yPosition + 26);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Estimate ID:`, margin + 105, yPosition + 34);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`#${estimate.id.slice(0, 8).toUpperCase()}`, margin + 140, yPosition + 34);

      yPosition += 60;

      // Professional Table Header with Gradient
      pdf.setFillColor(8, 47, 125); // Dark blue header
      pdf.rect(margin, yPosition, contentWidth, 15, 'F');
      
      // Header shadow
      pdf.setFillColor(0, 0, 0, 0.1);
      pdf.rect(margin, yPosition + 15, contentWidth, 2, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      
      // Improved column headers with better spacing
      pdf.text('DESCRIPTION', margin + 5, yPosition + 10);
      pdf.text('QTY', margin + 85, yPosition + 10);
      pdf.text('UNIT', margin + 105, yPosition + 10);
      pdf.text('RATE (₹)', margin + 125, yPosition + 10);
      pdf.text('AMOUNT (₹)', margin + 155, yPosition + 10);

      yPosition += 17;

      // Items with Professional Styling
      pdf.setTextColor(60, 60, 60);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      estimate.items.forEach((item, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = margin;
          
          // Repeat professional header on new page
          pdf.setFillColor(8, 47, 125);
          pdf.rect(margin, yPosition, contentWidth, 15, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(11);
          pdf.text('DESCRIPTION', margin + 5, yPosition + 10);
          pdf.text('QTY', margin + 85, yPosition + 10);
          pdf.text('UNIT', margin + 105, yPosition + 10);
          pdf.text('RATE (₹)', margin + 125, yPosition + 10);
          pdf.text('AMOUNT (₹)', margin + 155, yPosition + 10);
          yPosition += 17;
          
          pdf.setTextColor(60, 60, 60);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
        }

        // Alternating row colors for better readability
        if (index % 2 === 0) {
          pdf.setFillColor(248, 250, 252); // Very light blue
        } else {
          pdf.setFillColor(255, 255, 255); // White
        }
        pdf.rect(margin, yPosition, contentWidth, 12, 'F');

        // Subtle borders
        pdf.setDrawColor(220, 225, 230);
        pdf.setLineWidth(0.3);
        pdf.rect(margin, yPosition, contentWidth, 12, 'S');

        // Item data with better formatting
        const itemName = item.name.length > 32 ? item.name.substring(0, 29) + '...' : item.name;
        pdf.setFont('helvetica', 'normal');
        pdf.text(itemName, margin + 5, yPosition + 8);
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.quantity.toString(), margin + 85, yPosition + 8, { align: 'center' });
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(item.unit, margin + 105, yPosition + 8, { align: 'center' });
        pdf.text(item.rate.toLocaleString('en-IN'), margin + 125, yPosition + 8, { align: 'center' });
        
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(8, 47, 125);
        pdf.text(`₹${item.total.toLocaleString('en-IN')}`, margin + 155, yPosition + 8, { align: 'center' });
        
        pdf.setTextColor(60, 60, 60);
        yPosition += 12;
      });

      // Professional Total Section
      yPosition += 8;
      
      // Total box with gradient
      pdf.setFillColor(8, 47, 125); // Dark blue
      pdf.rect(margin + 105, yPosition, 85, 20, 'F');
      
      // Gold accent border
      pdf.setDrawColor(255, 204, 0);
      pdf.setLineWidth(2);
      pdf.rect(margin + 105, yPosition, 85, 20, 'S');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('GRAND TOTAL', margin + 110, yPosition + 8);
      
      pdf.setFontSize(16);
      pdf.text(`₹${estimate.total.toLocaleString('en-IN')}`, margin + 110, yPosition + 16);

      // Professional Footer
      yPosition = pageHeight - 50;
      
      // Footer background
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, yPosition - 5, pageWidth, 50, 'F');
      
      // Gold line separator
      pdf.setDrawColor(255, 204, 0);
      pdf.setLineWidth(1);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      
      yPosition += 10;
      
      // Terms and conditions box
      pdf.setFillColor(255, 255, 255);
      pdf.rect(margin, yPosition, contentWidth, 25, 'F');
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(margin, yPosition, contentWidth, 25, 'S');
      
      pdf.setTextColor(8, 47, 125);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('TERMS & CONDITIONS', margin + 5, yPosition + 6);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(80, 80, 80);
      pdf.text('• This estimate is valid for 30 days from the date of issue.', margin + 5, yPosition + 12);
      pdf.text('• Prices are subject to change based on material availability and market conditions.', margin + 5, yPosition + 16);
      pdf.text('• Payment terms: 50% advance, 30% on material delivery, 20% on completion.', margin + 5, yPosition + 20);
      
      // Company footer
      yPosition += 30;
      pdf.setTextColor(100, 100, 100);
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(9);
      pdf.text('Thank you for choosing MistryMate - Your trusted partner for professional construction estimates.', pageWidth / 2, yPosition, { align: 'center' });
      
      // Generate filename
      const filename = `MistryMate_${(title || estimate.type).replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      
      // Save PDF
      pdf.save(filename);

      toast({
        title: "Professional PDF Generated",
        description: "Your estimate has been exported successfully",
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
      loadingToastResult.dismiss();
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
