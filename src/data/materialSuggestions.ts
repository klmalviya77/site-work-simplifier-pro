
// This file is kept for backward compatibility but now uses Supabase data
// The actual materials are now stored in the Supabase 'materials' table

export interface Material {
  id?: string;
  name: string;
  category: string;
  rate: number;
  unit: string;
  type?: 'electrical' | 'plumbing';
}

export interface MaterialSuggestions {
  electrical: Material[];
  plumbing: Material[];
}

// Legacy empty structure for backward compatibility
// All materials are now fetched from Supabase
const materialSuggestions: MaterialSuggestions = {
  electrical: [],
  plumbing: []
};

export default materialSuggestions;
export type { Material, MaterialSuggestions };
