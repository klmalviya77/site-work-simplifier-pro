
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Book, BookOpen, Shield, Lightbulb } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';

const MaterialGuidePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('electrical');

  const electricalGuides = [
    {
      title: 'Wiring Safety Standards',
      category: 'Safety',
      icon: Shield,
      content: 'Always follow proper safety protocols when working with electrical systems. Ensure power is off before starting any work.'
    },
    {
      title: 'Wire Gauge Selection',
      category: 'Wiring',
      icon: Book,
      content: 'Use appropriate wire gauge based on the current load. 14 AWG for 15A, 12 AWG for 20A, and 10 AWG for 30A circuits.'
    },
    {
      title: 'Outlet Installation Guide',
      category: 'Installation',
      icon: BookOpen,
      content: 'Proper outlet installation requires careful attention to wiring polarity and secure connections.'
    },
    {
      title: 'LED vs Traditional Lighting',
      category: 'Lighting',
      icon: Lightbulb,
      content: 'LED lighting offers significant energy savings compared to traditional incandescent bulbs, with up to 75% less energy usage.'
    }
  ];

  const plumbingGuides = [
    {
      title: 'Pipe Material Selection',
      category: 'Materials',
      icon: Book,
      content: 'Choose appropriate pipe materials based on usage: PVC for wastewater, CPVC for hot water, PEX for flexible water supply.'
    },
    {
      title: 'Leak Detection Tips',
      category: 'Maintenance',
      icon: Shield,
      content: 'Regular inspection of pipes and connections can help identify leaks early before they cause significant damage.'
    },
    {
      title: 'Water Pressure Standards',
      category: 'Technical',
      icon: BookOpen,
      content: 'Residential water pressure should typically be between 40-60 PSI for optimal performance and appliance safety.'
    },
    {
      title: 'Fixture Installation Guide',
      category: 'Installation',
      icon: BookOpen,
      content: 'Proper sealing and securing of fixtures prevents leaks and ensures long-term performance.'
    }
  ];

  const guides = activeTab === 'electrical' ? electricalGuides : plumbingGuides;

  const filteredGuides = searchQuery.trim() === '' 
    ? guides 
    : guides.filter(guide => 
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        guide.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-mistryblue-500 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Material Guide</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search guides..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs 
          defaultValue="electrical" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="electrical">Electrical</TabsTrigger>
            <TabsTrigger value="plumbing">Plumbing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="electrical" className="mt-0">
            <div className="space-y-4">
              {filteredGuides.map((guide, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{guide.title}</CardTitle>
                        <CardDescription>{guide.category}</CardDescription>
                      </div>
                      <guide.icon className="h-5 w-5 text-mistryblue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{guide.content}</p>
                  </CardContent>
                </Card>
              ))}
              
              {filteredGuides.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No guides found</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="plumbing" className="mt-0">
            <div className="space-y-4">
              {filteredGuides.map((guide, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{guide.title}</CardTitle>
                        <CardDescription>{guide.category}</CardDescription>
                      </div>
                      <guide.icon className="h-5 w-5 text-mistryyellow-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{guide.content}</p>
                  </CardContent>
                </Card>
              ))}
              
              {filteredGuides.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No guides found</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
};

export default MaterialGuidePage;
