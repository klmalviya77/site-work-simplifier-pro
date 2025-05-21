
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator as CalcIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';

const CalculatorPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [length, setLength] = useState<number | ''>('');
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [result, setResult] = useState<number | null>(null);

  const [wireLength, setWireLength] = useState<number | ''>('');
  const [wirePoints, setWirePoints] = useState<number | ''>('');
  const [wireResult, setWireResult] = useState<number | null>(null);

  const handleVolumeCalculation = () => {
    if (length && width && height) {
      const volumeResult = Number(length) * Number(width) * Number(height);
      setResult(volumeResult);
      toast({
        title: "Calculation Complete",
        description: `Volume calculated: ${volumeResult} cubic units`,
      });
    } else {
      toast({
        title: "Missing Values",
        description: "Please enter all dimensions",
        variant: "destructive",
      });
    }
  };

  const handleWireCalculation = () => {
    if (wireLength && wirePoints) {
      // Simple formula: length per point * number of points + 10% extra
      const wireNeeded = Number(wireLength) * Number(wirePoints) * 1.1;
      setWireResult(wireNeeded);
      toast({
        title: "Calculation Complete",
        description: `Wire needed: ${wireNeeded.toFixed(2)} meters`,
      });
    } else {
      toast({
        title: "Missing Values",
        description: "Please enter all required values",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-mistryblue-500 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Material Calculator</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalcIcon className="mr-2 h-5 w-5" />
              Room Paint Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <FormItem>
                <FormLabel>Length (meters)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    value={length} 
                    onChange={(e) => setLength(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Enter length"
                  />
                </FormControl>
              </FormItem>
              
              <FormItem>
                <FormLabel>Width (meters)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    value={width} 
                    onChange={(e) => setWidth(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Enter width"
                  />
                </FormControl>
              </FormItem>
              
              <FormItem>
                <FormLabel>Height (meters)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    value={height} 
                    onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Enter height"
                  />
                </FormControl>
              </FormItem>
              
              <Button 
                onClick={handleVolumeCalculation}
                className="bg-mistryblue-500 hover:bg-mistryblue-600"
              >
                Calculate Paint Needed
              </Button>
              
              {result !== null && (
                <div className="p-3 bg-mistryblue-50 border border-mistryblue-200 rounded-md mt-2">
                  <p className="font-medium">Result:</p>
                  <p>Paint needed: {(result / 10).toFixed(2)} liters</p>
                  <p className="text-xs text-gray-500 mt-1">(Based on 1L covering 10 cubic meters)</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalcIcon className="mr-2 h-5 w-5" />
              Wiring Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <FormItem>
                <FormLabel>Length per point (meters)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    value={wireLength} 
                    onChange={(e) => setWireLength(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Enter average length"
                  />
                </FormControl>
              </FormItem>
              
              <FormItem>
                <FormLabel>Number of points</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    value={wirePoints} 
                    onChange={(e) => setWirePoints(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Enter number of points"
                  />
                </FormControl>
              </FormItem>
              
              <Button 
                onClick={handleWireCalculation}
                className="bg-mistryblue-500 hover:bg-mistryblue-600"
              >
                Calculate Wire Length
              </Button>
              
              {wireResult !== null && (
                <div className="p-3 bg-mistryblue-50 border border-mistryblue-200 rounded-md mt-2">
                  <p className="font-medium">Result:</p>
                  <p>Wire needed: {wireResult.toFixed(2)} meters</p>
                  <p className="text-xs text-gray-500 mt-1">(Includes 10% extra for safety)</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
};

export default CalculatorPage;
