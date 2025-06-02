
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MaterialGuide, getMaterialGuideById } from '@/services/materialGuideService';
import { useToast } from '@/hooks/use-toast';

const MaterialGuideDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [guide, setGuide] = useState<MaterialGuide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuide = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const guideData = await getMaterialGuideById(id);
        setGuide(guideData);
      } catch (error) {
        console.error('Failed to fetch guide:', error);
        toast({
          title: "Error",
          description: "Failed to load the guide. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGuide();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-mistryblue-500 text-white p-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/guide')} 
              className="text-white p-2 mr-2 hover:bg-mistryblue-600"
            >
              <ArrowLeft size={20} />
            </Button>
            <Skeleton className="h-6 w-32 bg-mistryblue-400" />
          </div>
        </header>
        
        <main className="p-4 max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-6" />
              <Skeleton className="h-48 w-full mb-6" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-mistryblue-500 text-white p-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/guide')} 
              className="text-white p-2 mr-2 hover:bg-mistryblue-600"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold">Guide Not Found</h1>
          </div>
        </header>
        
        <main className="p-4 max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">The guide you're looking for was not found.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-mistryblue-500 text-white p-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/guide')} 
            className="text-white p-2 mr-2 hover:bg-mistryblue-600"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold">Material Guide</h1>
        </div>
      </header>
      
      <main className="p-4 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            {/* Guide Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{guide.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="bg-mistryblue-100 text-mistryblue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {guide.category}
                </span>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium capitalize">
                  {guide.type}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {guide.author && (
                  <div className="flex items-center gap-1">
                    <User size={16} />
                    <span>{guide.author}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>{formatDate(guide.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Guide Image */}
            {guide.img_url && (
              <div className="mb-6">
                <img
                  src={guide.img_url}
                  alt={guide.title}
                  className="w-full h-64 object-cover rounded-lg border"
                />
              </div>
            )}

            {/* Guide Content */}
            <div className="prose max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {guide.content}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MaterialGuideDetailPage;
