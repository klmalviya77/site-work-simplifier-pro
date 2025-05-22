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

    // 59 materials from Excel
    { name: 'PVC Wire (1 sqmm to 4 sqmm)', category: 'Wiring & Cables', rate: 0, unit: 'pcs' },
    { name: 'Multi-core Cable', category: 'Wiring & Cables', rate: 0, unit: 'pcs' },
    { name: 'Armoured Cable', category: 'Wiring & Cables', rate: 0, unit: 'pcs' },
    { name: 'Coaxial Cable', category: 'Wiring & Cables', rate: 0, unit: 'pcs' },
    { name: 'LAN Cable (CAT5e, CAT6)', category: 'Wiring & Cables', rate: 0, unit: 'pcs' },
    { name: 'Telephone Cable', category: 'Wiring & Cables', rate: 0, unit: 'pcs' },
    { name: 'Switches (Modular / Non-modular)', category: 'Switches & Accessories', rate: 0, unit: 'pcs' },
    { name: 'Sockets (5A, 15A, etc.)', category: 'Switches & Accessories', rate: 0, unit: 'pcs' },
    { name: 'Fan Regulators', category: 'Switches & Accessories', rate: 0, unit: 'pcs' },
    { name: 'Switch Boxes (Plastic/Metal)', category: 'Switches & Accessories', rate: 0, unit: 'pcs' },
    { name: 'Modular Plates', category: 'Switches & Accessories', rate: 0, unit: 'pcs' },
    { name: 'Bulbs (LED/CFL)', category: 'Lighting', rate: 0, unit: 'pcs' },
    { name: 'Tube Lights (LED/CFL)', category: 'Lighting', rate: 0, unit: 'pcs' },
    { name: 'Panel Lights', category: 'Lighting', rate: 0, unit: 'pcs' },
    { name: 'Ceiling Lights', category: 'Lighting', rate: 0, unit: 'pcs' },
    { name: 'Flood Lights', category: 'Lighting', rate: 0, unit: 'pcs' },
    { name: 'Wall Lights', category: 'Lighting', rate: 0, unit: 'pcs' },
    { name: 'Street Lights', category: 'Lighting', rate: 0, unit: 'pcs' },
    { name: 'Holders (Bulb holders, Tube holders)', category: 'Lighting Accessories', rate: 0, unit: 'pcs' },
    { name: 'Concealed Box', category: 'Installation Materials', rate: 0, unit: 'pcs' },
    { name: 'PVC Casing & Caping', category: 'Installation Materials', rate: 0, unit: 'pcs' },
    { name: 'PVC/Metal Conduits', category: 'Installation Materials', rate: 0, unit: 'pcs' },
    { name: 'Bends & Couplers', category: 'Installation Materials', rate: 0, unit: 'pcs' },
    { name: 'Junction Boxes', category: 'Installation Materials', rate: 0, unit: 'pcs' },
    { name: 'Cable Trays', category: 'Installation Materials', rate: 0, unit: 'pcs' },
    { name: 'Distribution Boards (DBs)', category: 'Protection Devices', rate: 0, unit: 'pcs' },
    { name: 'MCBs (Miniature Circuit Breakers)', category: 'Protection Devices', rate: 0, unit: 'pcs' },
    { name: 'RCCBs (Residual Current Circuit Breakers)', category: 'Protection Devices', rate: 0, unit: 'pcs' },
    { name: 'Isolators', category: 'Protection Devices', rate: 0, unit: 'pcs' },
    { name: 'ELCBs (Earth Leakage Circuit Breakers)', category: 'Protection Devices', rate: 0, unit: 'pcs' },
    { name: 'Main Switches', category: 'Protection Devices', rate: 0, unit: 'pcs' },
    { name: 'MCB Box', category: 'Protection Devices', rate: 0, unit: 'pcs' },
    { name: 'Inverter', category: 'Power Backup', rate: 0, unit: 'pcs' },
    { name: 'Battery', category: 'Power Backup', rate: 0, unit: 'pcs' },
    { name: 'UPS', category: 'Power Backup', rate: 0, unit: 'pcs' },
    { name: 'Changeover Switches', category: 'Power Backup', rate: 0, unit: 'pcs' },
    { name: 'Fans (Ceiling/Table/Exhaust)', category: 'Appliances', rate: 0, unit: 'pcs' },
    { name: 'Geysers', category: 'Appliances', rate: 0, unit: 'pcs' },
    { name: 'Door Bells', category: 'Appliances', rate: 0, unit: 'pcs' },
    { name: 'Air Coolers', category: 'Appliances', rate: 0, unit: 'pcs' },
    { name: 'Washing Machines', category: 'Appliances', rate: 0, unit: 'pcs' },
    { name: 'TV Points', category: 'Appliances', rate: 0, unit: 'pcs' },
    { name: 'AC Points', category: 'Appliances', rate: 0, unit: 'pcs' },
    { name: 'Earthing Electrodes', category: 'Earthing Materials', rate: 0, unit: 'pcs' },
    { name: 'Earthing Wires', category: 'Earthing Materials', rate: 0, unit: 'pcs' },
    { name: 'Lightning Arrestors', category: 'Earthing Materials', rate: 0, unit: 'pcs' },
    { name: 'GI Pipe', category: 'Earthing Materials', rate: 0, unit: 'pcs' },
    { name: 'Service Wire', category: 'Service Connection Materials', rate: 0, unit: 'pcs' },
    { name: 'Energy Meter', category: 'Service Connection Materials', rate: 0, unit: 'pcs' },
    { name: 'Meter Box', category: 'Service Connection Materials', rate: 0, unit: 'pcs' },
    { name: 'CT/PT Units', category: 'Service Connection Materials', rate: 0, unit: 'pcs' },
    { name: 'Distribution Panel', category: 'Service Connection Materials', rate: 0, unit: 'pcs' },
    { name: 'Solar Panels', category: 'Renewable Energy', rate: 0, unit: 'pcs' },
    { name: 'Solar Inverter', category: 'Renewable Energy', rate: 0, unit: 'pcs' },
    { name: 'Charge Controllers', category: 'Renewable Energy', rate: 0, unit: 'pcs' },
    { name: 'DC Cable', category: 'Renewable Energy', rate: 0, unit: 'pcs' },
    { name: 'MC4 Connectors', category: 'Renewable Energy', rate: 0, unit: 'pcs' },
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
