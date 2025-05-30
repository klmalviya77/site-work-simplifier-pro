
import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Material {
  name: string;
  category: string;
  rate: number;
  unit: string;
}

interface MaterialSelectorProps {
  materials: Material[];
  selectedMaterial: string;
  onMaterialSelect: (material: Material) => void;
  estimateType: 'electrical' | 'plumbing';
}

const MaterialSelector = ({ 
  materials, 
  selectedMaterial, 
  onMaterialSelect,
  estimateType
}: MaterialSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>(materials);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Update filtered materials when search query changes
    if (searchQuery.trim() === '') {
      setFilteredMaterials(materials);
    } else {
      const filtered = materials.filter(
        material => material.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMaterials(filtered);
    }
  }, [searchQuery, materials]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsDropdownOpen(true);
  };

  const handleInputClick = () => {
    setIsDropdownOpen(true);
    setFilteredMaterials(materials);
  };

  const handleMaterialClick = (material: Material) => {
    onMaterialSelect(material);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  return (
    <div className="mb-6" ref={dropdownRef}>
      <label htmlFor="material" className="block text-base font-medium mb-2 dark:text-white">
        Material
      </label>
      <div className="relative">
        <div className="relative">
          <Input 
            id="material"
            value={searchQuery || selectedMaterial}
            onClick={handleInputClick}
            onChange={handleInputChange}
            placeholder="Select or search material"
            className="w-full pr-10 border-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ArrowDown size={18} className="text-gray-500 dark:text-gray-300" />
          </div>
        </div>
        
        {isDropdownOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredMaterials.length > 0 ? (
              filteredMaterials.map((material, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between"
                  onClick={() => handleMaterialClick(material)}
                >
                  <span className="dark:text-white">{material.name}</span>
                  <span className="text-gray-500 dark:text-gray-300">
                    ₹{material.rate !== null && material.rate !== undefined ? material.rate : 0}/{material.unit}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 dark:text-gray-300">No materials found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialSelector;
