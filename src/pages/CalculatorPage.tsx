
import React, { useState } from 'react';
import { Calculator, Zap, Wrench, Square, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import LogoImage from '@/components/LogoImage';

const CalculatorPage = () => {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [diameter, setDiameter] = useState('');
  const [voltage, setVoltage] = useState('');
  const [current, setCurrent] = useState('');
  const [power, setPower] = useState('');
  
  // Area calculations
  const rectangularArea = length && width ? (parseFloat(length) * parseFloat(width)).toFixed(2) : '0';
  const circularArea = diameter ? (Math.PI * Math.pow(parseFloat(diameter) / 2, 2)).toFixed(2) : '0';
  
  // Volume calculation
  const volume = length && width && height ? (parseFloat(length) * parseFloat(width) * parseFloat(height)).toFixed(2) : '0';
  
  // Electrical calculations
  const calculatePower = () => {
    if (voltage && current) {
      return (parseFloat(voltage) * parseFloat(current)).toFixed(2);
    }
    return '0';
  };
  
  const calculateCurrent = () => {
    if (power && voltage) {
      return (parseFloat(power) / parseFloat(voltage)).toFixed(2);
    }
    return '0';
  };
  
  const calculateVoltage = () => {
    if (power && current) {
      return (parseFloat(power) / parseFloat(current)).toFixed(2);
    }
    return '0';
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-mistryblue-500 dark:bg-mistryblue-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <LogoImage size="small" />
          <div className="text-sm">
            Calculators
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 dark:text-white">Calculators</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Quick calculations for your projects
          </p>
        </div>
        
        <Tabs defaultValue="area" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="area" className="flex items-center">
              <Square size={14} className="mr-1" />
              Area
            </TabsTrigger>
            <TabsTrigger value="electrical" className="flex items-center">
              <Zap size={14} className="mr-1" />
              Electrical
            </TabsTrigger>
            <TabsTrigger value="plumbing" className="flex items-center">
              <Wrench size={14} className="mr-1" />
              Plumbing
            </TabsTrigger>
          </TabsList>
          
          {/* Area Calculator */}
          <TabsContent value="area" className="space-y-4">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center dark:text-white">
                  <Square size={20} className="mr-2" />
                  Rectangular Area
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="length" className="dark:text-white">Length (ft)</Label>
                    <Input
                      id="length"
                      type="number"
                      placeholder="0"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="width" className="dark:text-white">Width (ft)</Label>
                    <Input
                      id="width"
                      type="number"
                      placeholder="0"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                <div className="bg-mistryblue-50 dark:bg-mistryblue-900/30 p-3 rounded">
                  <p className="text-sm font-medium dark:text-white">Area: {rectangularArea} sq ft</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center dark:text-white">
                  <Circle size={20} className="mr-2" />
                  Circular Area
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="diameter" className="dark:text-white">Diameter (ft)</Label>
                  <Input
                    id="diameter"
                    type="number"
                    placeholder="0"
                    value={diameter}
                    onChange={(e) => setDiameter(e.target.value)}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="bg-mistryblue-50 dark:bg-mistryblue-900/30 p-3 rounded">
                  <p className="text-sm font-medium dark:text-white">Area: {circularArea} sq ft</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Volume</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="height" className="dark:text-white">Height (ft)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="0"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="bg-mistryblue-50 dark:bg-mistryblue-900/30 p-3 rounded">
                  <p className="text-sm font-medium dark:text-white">Volume: {volume} cubic ft</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Electrical Calculator */}
          <TabsContent value="electrical" className="space-y-4">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center dark:text-white">
                  <Zap size={20} className="mr-2" />
                  Electrical Calculations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="voltage" className="dark:text-white">Voltage (V)</Label>
                    <Input
                      id="voltage"
                      type="number"
                      placeholder="0"
                      value={voltage}
                      onChange={(e) => setVoltage(e.target.value)}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="current" className="dark:text-white">Current (A)</Label>
                    <Input
                      id="current"
                      type="number"
                      placeholder="0"
                      value={current}
                      onChange={(e) => setCurrent(e.target.value)}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="power" className="dark:text-white">Power (W)</Label>
                  <Input
                    id="power"
                    type="number"
                    placeholder="0"
                    value={power}
                    onChange={(e) => setPower(e.target.value)}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="bg-mistryblue-50 dark:bg-mistryblue-900/30 p-3 rounded">
                    <p className="text-sm font-medium dark:text-white">Calculated Power: {calculatePower()} W</p>
                  </div>
                  <div className="bg-mistryblue-50 dark:bg-mistryblue-900/30 p-3 rounded">
                    <p className="text-sm font-medium dark:text-white">Calculated Current: {calculateCurrent()} A</p>
                  </div>
                  <div className="bg-mistryblue-50 dark:bg-mistryblue-900/30 p-3 rounded">
                    <p className="text-sm font-medium dark:text-white">Calculated Voltage: {calculateVoltage()} V</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Plumbing Calculator */}
          <TabsContent value="plumbing" className="space-y-4">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center dark:text-white">
                  <Wrench size={20} className="mr-2" />
                  Pipe Volume Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Coming soon: Pipe volume, flow rate, and pressure calculations
                </p>
                <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded text-center">
                  <Calculator size={48} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">Under Development</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
};

export default CalculatorPage;
