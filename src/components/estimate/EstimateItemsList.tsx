
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

// Utility function to generate UUID
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

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
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-5 gap-0 border text-center font-medium bg-gray-100">
        <div className="p-2 border-r">Material</div>
        <div className="p-2 border-r">Quantity</div>
        <div className="p-2 border-r">Rate</div>
        <div className="p-2 border-r">Total</div>
        <div className="p-2">Action</div>
      </div>
      
      {items.map((item) => (
        <div key={item.id} className="grid grid-cols-5 gap-0 border-b border-l border-r text-center">
          <div className="p-2 border-r truncate">{item.name}</div>
          <div className="p-2 border-r">{item.quantity}</div>
          <div className="p-2 border-r">₹{item.rate}</div>
          <div className="p-2 border-r">₹{item.total}</div>
          <div className="p-2 flex justify-center">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-red-500 h-8 w-8 p-0"
              onClick={() => onRemoveItem(item.id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      ))}
      
      <div className="flex justify-end items-center p-3 bg-white border border-t-0">
        <span className="font-bold mr-2">Grand Total:</span>
        <span className="font-bold">₹{calculateTotal()}</span>
      </div>
      
      <Button
        className="w-full mt-4 bg-mistryyellow-500 hover:bg-mistryyellow-600 text-black"
        onClick={onSaveEstimate}
      >
        Continue to Summary
      </Button>
    </div>
  );
};

export default EstimateItemsList;
