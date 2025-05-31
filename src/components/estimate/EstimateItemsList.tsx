
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export interface EstimateItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  rate: number;
  total: number;
}

interface EstimateItemsListProps {
  items: EstimateItem[];
  onRemoveItem: (id: string) => void;
  onSaveEstimate: () => void;
}

const EstimateItemsList = ({ items, onRemoveItem, onSaveEstimate }: EstimateItemsListProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  if (items.length === 0) {
    return (
      <div className="mt-8 text-center py-8 bg-gray-50 rounded-lg">
        <p>No items added yet</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-0 border font-medium bg-gray-100">
        <div className="p-2 border-r">Material</div>
        <div className="p-2 border-r">Quantity</div>
        <div className="p-2 border-r">Rate</div>
        <div className="p-2 border-r">Total</div>
        <div className="p-2">Action</div>
      </div>
      
      {/* Items List */}
      {items.map((item) => (
        <div 
          key={item.id} 
          className="grid grid-cols-1 md:grid-cols-5 gap-0 border-b hover:bg-gray-50"
        >
          <div className="p-2 border-r truncate">{item.name}</div>
          <div className="p-2 border-r">{item.quantity}</div>
          <div className="p-2 border-r">{formatCurrency(item.rate)}</div>
          <div className="p-2 border-r">{formatCurrency(item.total)}</div>
          <div className="p-2 flex justify-center">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-red-500 h-8 w-8 p-0 hover:bg-red-50"
              onClick={() => onRemoveItem(item.id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      ))}
      
      {/* Grand Total */}
      <div className="flex justify-end items-center p-3 bg-gray-50 border-b border-x">
        <span className="font-bold mr-2">Grand Total:</span>
        <span className="font-bold">{formatCurrency(calculateTotal())}</span>
      </div>
      
      {/* Save Button */}
      <Button
        className="w-full mt-4 bg-yellow-400 hover:bg-yellow-500 text-black"
        onClick={onSaveEstimate}
      >
        Continue to Summary
      </Button>
    </div>
  );
};

export default EstimateItemsList;
