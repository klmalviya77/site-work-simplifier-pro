
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Book, BookOpen, Shield, Lightbulb, Calendar, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Navigation from '@/components/Navigation';
import { MaterialGuide, getMaterialGuides } from '@/services/materialGuideService';
import { useToast } from '@/hooks/use-toast';

const MaterialGuidePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('electrical');
  const [guides, setGuides] = useState<MaterialGuide[]>([]);
  const [loading, setLoading] = useState(true);

  const iconMap: { [key: string]: any } = {
    'Safety': Shield,
    'Wiring': Book,
    'Installation': BookOpen,
    'Lighting': Lightbulb,
    'Materials': Book,
    'Maintenance': Shield,
    'Technical': BookOpen,
  };

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setLoading(true);
        const guidesData = await getMaterialGuides(activeTab);
        setGuides(guidesData);
      } catch (error) {
        console.error('Failed to fetch guides:', error);
        toast({
          title: "Error",
          description: "Failed to load guides. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, [activeTab, toast]);

  const filteredGuides = searchQuery.trim() === '' 
    ? guides 
    : guides.filter(guide => 
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        guide.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleGuideClick = (guideId: string) => {
    navigate(`/guide/${guideId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderSkeletonCards = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center gap-2 mt-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
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
            {loading ? renderSkeletonCards() : (
              <div className="space-y-4">
                {filteredGuides.map((guide) => {
                  const IconComponent = iconMap[guide.category] || Book;
                  return (
                    <Card 
                      key={guide.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleGuideClick(guide.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{guide.title}</CardTitle>
                            <CardDescription>{guide.category}</CardDescription>
                          </div>
                          <IconComponent className="h-5 w-5 text-mistryblue-500" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">{guide.summary}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {guide.author && (
                            <div className="flex items-center gap-1">
                              <User size={12} />
                              <span>{guide.author}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>{formatDate(guide.created_at)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {!loading && filteredGuides.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No guides found</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="plumbing" className="mt-0">
            {loading ? renderSkeletonCards() : (
              <div className="space-y-4">
                {filteredGuides.map((guide) => {
                  const IconComponent = iconMap[guide.category] || Book;
                  return (
                    <Card 
                      key={guide.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleGuideClick(guide.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{guide.title}</CardTitle>
                            <CardDescription>{guide.category}</CardDescription>
                          </div>
                          <IconComponent className="h-5 w-5 text-mistryyellow-500" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">{guide.summary}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {guide.author && (
                            <div className="flex items-center gap-1">
                              <User size={12} />
                              <span>{guide.author}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>{formatDate(guide.created_at)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {!loading && filteredGuides.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No guides found</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
};

export default MaterialGuidePage;
