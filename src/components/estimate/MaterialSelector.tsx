
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { useQuery } from '@tanstack/react-query';
import { getMaterials, searchMaterials, Material } from '@/services/materialsService';

interface MaterialSelectorProps {
  estimateType: 'electrical' | 'plumbing';
  selectedMaterial: Material | null;
  onMaterialSelect: (material: Material) => void;
}

const MaterialSelector = ({ 
  estimateType,
  selectedMaterial, 
  onMaterialSelect
}: MaterialSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch materials based on search query
  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['materials', estimateType, debouncedSearchQuery],
    queryFn: () => {
      if (debouncedSearchQuery.trim()) {
        return searchMaterials(debouncedSearchQuery, estimateType);
      }
      return getMaterials(estimateType);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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
          placeholder="Search material by name or category..."
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
            {isLoading ? (
              <div className="px-4 py-2 text-gray-500 dark:text-gray-300">
                Searching materials...
              </div>
            ) : materials.length > 0 ? (
              materials.map((material) => (
                <div
                  key={material.id}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center"
                  onClick={() => handleMaterialClick(material)}
                  role="option"
                >
                  <div className="flex flex-col flex-1 mr-2">
                    <span className="dark:text-white truncate text-sm font-medium">
                      {material.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {material.category}
                    </span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-300 flex-shrink-0 text-xs">
                    ₹{material.rate.toFixed(2)}/{material.unit}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 dark:text-gray-300">
                {searchQuery.trim() ? 'No materials found for your search' : 'No materials available'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialSelector;
