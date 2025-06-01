
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import LogoImage from '@/components/LogoImage';

const SavedEstimatesPage = () => {
  const navigate = useNavigate();
  
  // Mock data for saved estimates
  const savedEstimates = [
    {
      id: 1,
      title: 'Kitchen Electrical Work',
      type: 'electrical',
      date: '2024-05-15',
      total: 1250.00,
      status: 'draft'
    },
    {
      id: 2,
      title: 'Bathroom Plumbing',
      type: 'plumbing',
      date: '2024-05-12',
      total: 890.50,
      status: 'sent'
    },
    {
      id: 3,
      title: 'Office Lighting Upgrade',
      type: 'electrical',
      date: '2024-05-10',
      total: 2100.75,
      status: 'approved'
    }
  ];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'sent': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'approved': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-mistryblue-500 dark:bg-mistryblue-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <LogoImage size="small" />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/create-estimate')}
            className="bg-white text-mistryblue-500 hover:bg-gray-100"
          >
            <Plus size={16} className="mr-1" />
            New
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 dark:text-white">Saved Estimates</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your saved estimates and proposals
          </p>
        </div>
        
        {savedEstimates.length === 0 ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2 dark:text-white">No Estimates Yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Create your first estimate to get started
              </p>
              <Button
                onClick={() => navigate('/create-estimate')}
                className="bg-mistryblue-500 hover:bg-mistryblue-600 dark:bg-mistryblue-600 dark:hover:bg-mistryblue-700"
              >
                <Plus size={16} className="mr-2" />
                Create Estimate
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {savedEstimates.map((estimate) => (
              <Card 
                key={estimate.id} 
                className="cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700"
                onClick={() => navigate(`/estimate/${estimate.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg dark:text-white">
                      {estimate.title}
                    </CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(estimate.status)}`}>
                      {estimate.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {new Date(estimate.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center font-medium">
                      <DollarSign size={14} className="mr-1" />
                      {estimate.total.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
};

export default SavedEstimatesPage;
