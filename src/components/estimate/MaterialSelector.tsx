
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';

interface Material {
  name: string;
  category: string;
  rate: number;
  unit: string;
}

interface MaterialSelectorProps {
  materials: Material[];
  selectedMaterial: Material | null;
  onMaterialSelect: (material: Material) => void;
}

const MaterialSelector = ({ 
  materials, 
  selectedMaterial, 
  onMaterialSelect
}: MaterialSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>(materials);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearchQuery.trim() === '') {
      setFilteredMaterials(materials);
    } else {
      const filtered = materials.filter(material =>
        material.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
      setFilteredMaterials(filtered);
    }
  }, [debouncedSearchQuery, materials]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="mb-6" ref={dropdownRef}>
      <label htmlFor="material" className="block text-base font-medium mb-2 dark:text-white">
        Material
      </label>
      <div className="relative">
        <Input 
          id="material"
          value={searchQuery || selectedMaterial?.name || ''}
          onClick={handleInputClick}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search material..."
          className="w-full border-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
        />
        
        {isDropdownOpen && (
          <div 
            className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-auto"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
            role="listbox"
          >
            {filteredMaterials.length > 0 ? (
              filteredMaterials.map((material, index) => (
                <div
                  key={`${material.name}-${index}`}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center"
                  onClick={() => handleMaterialClick(material)}
                  role="option"
                >
                  <span className="dark:text-white truncate flex-1 mr-2 text-sm">
                    {material.name}
                  </span>
                  <span className="text-gray-500 dark:text-gray-300 flex-shrink-0 text-xs">
                    ₹{material.rate ?? 0}/{material.unit}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 dark:text-gray-300">
                No materials found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialSelector;
