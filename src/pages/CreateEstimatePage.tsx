
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import EstimateForm from '@/components/estimate/EstimateForm';
import Navigation from '@/components/Navigation';
import LogoImage from '@/components/LogoImage';

const CreateEstimatePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const estimateType = location.state?.estimateType || 'electrical';
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-mistryblue-500 dark:bg-mistryblue-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-white hover:bg-white/10 mr-3 p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <LogoImage size="small" />
          </div>
          <div className="text-sm">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="capitalize dark:text-white">
              {estimateType} Estimate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EstimateForm 
              estimateType={estimateType}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              totalSteps={totalSteps}
            />
          </CardContent>
        </Card>
      </main>
      
      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
};

export default CreateEstimatePage;
