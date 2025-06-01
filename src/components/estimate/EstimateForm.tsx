
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EstimateFormProps {
  estimateType: string;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
}

const EstimateForm = ({
  estimateType,
  currentStep,
  setCurrentStep,
  totalSteps,
}: EstimateFormProps) => {
  // For now, this is a placeholder form
  // You can expand this with actual form logic based on estimateType and steps
  
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">
          Step {currentStep}: {estimateType} Details
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Please provide the required information for your {estimateType} estimate.
        </p>
      </div>

      {/* Form content based on current step */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="project-name" className="block text-base font-medium mb-2">
              Project Name
            </label>
            <Input
              id="project-name"
              type="text"
              placeholder="Enter project name"
              className="w-full border-2"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-base font-medium mb-2">
              Location
            </label>
            <Input
              id="location"
              type="text"
              placeholder="Enter project location"
              className="w-full border-2"
            />
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="material" className="block text-base font-medium mb-2">
              Material Type
            </label>
            <Input
              id="material"
              type="text"
              placeholder="Enter material type"
              className="w-full border-2"
            />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-base font-medium mb-2">
              Quantity
            </label>
            <Input
              id="quantity"
              type="number"
              placeholder="Enter quantity"
              className="w-full border-2"
            />
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="rate" className="block text-base font-medium mb-2">
              Rate (INR)
            </label>
            <Input
              id="rate"
              type="number"
              placeholder="Enter rate"
              className="w-full border-2"
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-base font-medium mb-2">
              Additional Notes
            </label>
            <Input
              id="notes"
              type="text"
              placeholder="Any additional notes"
              className="w-full border-2"
            />
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        {currentStep > 1 && (
          <Button
            onClick={handlePrevious}
            variant="outline"
            className="px-6"
          >
            Previous
          </Button>
        )}
        
        <div className="ml-auto">
          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              className="bg-blue-500 hover:bg-blue-600 px-6"
            >
              Next
            </Button>
          ) : (
            <Button
              className="bg-green-500 hover:bg-green-600 px-6"
              onClick={() => {
                // Handle form submission here
                console.log('Form submitted');
              }}
            >
              Create Estimate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstimateForm;
