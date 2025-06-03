
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useQuery } from '@tanstack/react-query';
import { getMaterials, searchMaterials, Material } from '@/services/materialsService';
import LoadingSpinner from '@/components/app/LoadingSpinner';
import { useAppBehavior } from '@/hooks/useAppBehavior';

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
  const { triggerHaptic } = useAppBehavior();
  
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
    triggerHaptic('light');
    setIsDropdownOpen(true);
  };

  const handleMaterialClick = (material: Material) => {
    triggerHaptic('medium');
    onMaterialSelect(material);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleClearSearch = () => {
    triggerHaptic('light');
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
          <Input 
            id="material"
            value={searchQuery || selectedMaterial?.name || ''}
            onClick={handleInputClick}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search material by name or category..."
            className="w-full pl-10 pr-10 border-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-all duration-200 focus:border-mistryblue-500"
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
          />
          {(searchQuery || selectedMaterial) && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        {isDropdownOpen && (
          <div 
            className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-auto animate-fade-in"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
            role="listbox"
          >
            {isLoading ? (
              <div className="px-4 py-6 text-center">
                <LoadingSpinner size="sm" text="Searching materials..." />
              </div>
            ) : materials.length > 0 ? (
              materials.map((material) => (
                <div
                  key={material.id}
                  className="px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center transition-colors duration-150 border-b border-gray-100 dark:border-gray-700 last:border-b-0 active:bg-gray-200 dark:active:bg-gray-600"
                  onClick={() => handleMaterialClick(material)}
                  role="option"
                >
                  <div className="flex flex-col flex-1 mr-2">
                    <span className="dark:text-white truncate text-sm font-medium">
                      {material.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {material.category}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-mistryblue-600 dark:text-mistryblue-400 font-medium text-sm">
                      ₹{material.rate.toFixed(2)}
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      per {material.unit}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-300">
                <Search size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {searchQuery.trim() ? 'No materials found for your search' : 'No materials available'}
                </p>
                {searchQuery.trim() && (
                  <p className="text-xs mt-1 opacity-75">
                    Try different keywords or check spelling
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialSelector;
