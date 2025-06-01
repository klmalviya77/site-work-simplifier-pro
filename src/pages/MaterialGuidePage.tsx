
import React, { useState } from 'react';
import { Search, Filter, Zap, Wrench } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import LogoImage from '@/components/LogoImage';

const MaterialGuidePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Mock data for materials
  const materials = [
    {
      id: 1,
      name: 'THHN Wire 12 AWG',
      category: 'electrical',
      price: '$45.99',
      unit: 'per 100ft',
      description: 'Copper conductor wire for residential wiring',
      applications: ['Residential', 'Commercial'],
    },
    {
      id: 2,
      name: 'PVC Pipe 1/2"',
      category: 'plumbing',
      price: '$12.50',
      unit: 'per 10ft',
      description: 'Schedule 40 PVC pipe for water supply',
      applications: ['Water Supply', 'Irrigation'],
    },
    {
      id: 3,
      name: 'GFCI Outlet',
      category: 'electrical',
      price: '$18.75',
      unit: 'each',
      description: 'Ground fault circuit interrupter outlet',
      applications: ['Bathroom', 'Kitchen', 'Outdoor'],
    },
    {
      id: 4,
      name: 'Copper Fitting 1/2"',
      category: 'plumbing',
      price: '$3.25',
      unit: 'each',
      description: 'Copper elbow fitting for pipe connections',
      applications: ['Hot Water', 'Cold Water'],
    },
  ];
  
  const categories = [
    { id: 'all', name: 'All', icon: null },
    { id: 'electrical', name: 'Electrical', icon: Zap },
    { id: 'plumbing', name: 'Plumbing', icon: Wrench },
  ];
  
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-mistryblue-500 dark:bg-mistryblue-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <LogoImage size="small" />
          <div className="text-sm">
            Material Guide
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 dark:text-white">Material Guide</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Find materials, prices, and specifications
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        {/* Category Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center whitespace-nowrap ${
                  selectedCategory === category.id 
                    ? 'bg-mistryblue-500 hover:bg-mistryblue-600 dark:bg-mistryblue-600 dark:hover:bg-mistryblue-700' 
                    : 'dark:border-gray-600 dark:text-white'
                }`}
              >
                {Icon && <Icon size={14} className="mr-1" />}
                {category.name}
              </Button>
            );
          })}
        </div>
        
        {/* Materials List */}
        <div className="space-y-4">
          {filteredMaterials.length === 0 ? (
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No materials found matching your search.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredMaterials.map((material) => (
              <Card key={material.id} className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg dark:text-white">
                      {material.name}
                    </CardTitle>
                    <Badge variant="secondary" className="capitalize">
                      {material.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {material.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-mistryblue-600 dark:text-mistryblue-400">
                      {material.price}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {material.unit}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1 dark:text-white">Applications:</p>
                    <div className="flex flex-wrap gap-1">
                      {material.applications.map((app, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {app}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      
      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
};

export default MaterialGuidePage;
