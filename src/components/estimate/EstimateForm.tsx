import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EstimateFormProps {
  selectedMaterial: string;
  quantity: number;
  rate: number;
  onQuantityChange: (quantity: number) => void;
  onRateChange: (rate: number) => void;
  onAddItem: () => void;
  isAdding?: boolean; // Loading state ke liye
}

const EstimateForm = ({
  selectedMaterial,
  quantity,
  rate,
  onQuantityChange,
  onRateChange,
  onAddItem,
  isAdding = false,
}: EstimateFormProps) => {
  const isDisabled = !selectedMaterial || quantity <= 0 || rate <= 0 || isAdding;

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
          value={quantity || ""}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 1) onQuantityChange(val);
          }}
          min="1"
          placeholder="Enter quantity"
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
          value={rate || ""}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val) && val >= 0) onRateChange(val);
          }}
          min="0"
          step="0.01"
          placeholder="Enter rate"
          className="w-full border-2"
        />
      </div>

      {/* Add Button */}
      <Button
        className={`w-full bg-blue-500 hover:bg-blue-600 py-6 text-base ${
          isDisabled ? "opacity-70 cursor-not-allowed" : ""
        }`}
        onClick={onAddItem}
        disabled={isDisabled}
      >
        {isAdding ? "Adding..." : "Add to Estimate"}
      </Button>
    </>
  );
};

export default EstimateForm;
