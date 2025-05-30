
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Material } from '@/data/materialSuggestions';

interface EstimateFormProps {
  selectedMaterial: string;
  quantity: number;
  rate: number;
  onQuantityChange: (quantity: number) => void;
  onRateChange: (rate: number) => void;
  onAddItem: () => void;
}

const EstimateForm = ({
  selectedMaterial,
  quantity,
  rate,
  onQuantityChange,
  onRateChange,
  onAddItem
}: EstimateFormProps) => {
  return (
    <>
      {/* Quantity */}
      <div className="mb-6">
        <label htmlFor="quantity" className="block text-base font-medium mb-2">
          Quantity
        </label>
        <Input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
          min="1"
          className="w-full border-2"
        />
      </div>
      
      {/* Rate */}
      <div className="mb-6">
        <label htmlFor="rate" className="block text-base font-medium mb-2">
          Rate (INR)
        </label>
        <Input
          id="rate"
          type="number"
          value={rate}
          onChange={(e) => onRateChange(parseFloat(e.target.value) || 0)}
          min="0"
          step="0.01"
          className="w-full border-2"
        />
      </div>
      
      {/* Add Button */}
      <Button
        className="w-full bg-mistryblue-500 hover:bg-mistryblue-600 py-6 text-base"
        onClick={onAddItem}
        disabled={!selectedMaterial || quantity <= 0 || rate < 0}
      >
        Add to Estimate
      </Button>
    </>
  );
};

export default EstimateForm;
