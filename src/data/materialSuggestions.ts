
interface Material {
  name: string;
  category: string;
  rate: number;
  unit: string;
}

interface MaterialSuggestions {
  electrical: Material[];
  plumbing: Material[];
}

// Mock material suggestions data
const materialSuggestions: MaterialSuggestions = {
  electrical: [
    { name: '2-Way Switch', category: 'Switches', rate: 120, unit: 'pcs' },
    { name: '3-Way Switch', category: 'Switches', rate: 180, unit: 'pcs' },
    { name: '6A Switch', category: 'Switches', rate: 100, unit: 'pcs' },
    { name: '16A Switch', category: 'Switches', rate: 150, unit: 'pcs' },
    { name: 'Power Socket', category: 'Sockets', rate: 150, unit: 'pcs' },
    { name: 'USB Socket', category: 'Sockets', rate: 350, unit: 'pcs' },
    { name: 'LED Bulb', category: 'Lighting', rate: 80, unit: 'pcs' },
    { name: 'MCB 6A', category: 'Protection', rate: 250, unit: 'pcs' },
    { name: 'Wire 1.5mm²', category: 'Wiring', rate: 18, unit: 'meter' },
  ],
  plumbing: [
    { name: 'PVC Pipe 1/2"', category: 'Pipes', rate: 35, unit: 'meter' },
    { name: 'Brass Tap', category: 'Fixtures', rate: 450, unit: 'pcs' },
    { name: 'Sink', category: 'Fixtures', rate: 1200, unit: 'pcs' },
    { name: 'Elbow Joint', category: 'Joints', rate: 25, unit: 'pcs' },
    { name: 'Water Tank', category: 'Storage', rate: 3500, unit: 'pcs' },
    { name: 'CPVC Pipe 3/4"', category: 'Pipes', rate: 65, unit: 'meter' },
  ]
};

export default materialSuggestions;
export type { Material, MaterialSuggestions };
