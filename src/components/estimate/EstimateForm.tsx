
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface EstimateFormProps {
  materialName: string;
  quantity: number;
  rate: number;
  note: string;
  onMaterialNameChange: (name: string) => void;
  onQuantityChange: (quantity: number) => void;
  onRateChange: (rate: number) => void;
  onNoteChange: (note: string) => void;
  onAddItem: () => void;
  isAdding?: boolean; // Loading state ke liye
}

const EstimateForm = ({
  materialName,
  quantity,
  rate,
  note,
  onMaterialNameChange,
  onQuantityChange,
  onRateChange,
  onNoteChange,
  onAddItem,
  isAdding = false,
}: EstimateFormProps) => {
  const isDisabled = !materialName.trim() || quantity <= 0 || rate <= 0 || isAdding;

  return (
    <>
      {/* Material Name */}
      <div className="mb-6">
        <label htmlFor="materialName" className="block text-base font-medium mb-2">
          Material Name
        </label>
        <Input
          id="materialName"
          type="text"
          value={materialName}
          onChange={(e) => onMaterialNameChange(e.target.value)}
          placeholder="Enter material name"
          className="w-full border-2"
        />
      </div>

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

      {/* Note (Optional) */}
      <div className="mb-6">
        <label htmlFor="note" className="block text-base font-medium mb-2">
          Note (Optional)
        </label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Add any additional remarks..."
          className="w-full border-2 min-h-[80px]"
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
