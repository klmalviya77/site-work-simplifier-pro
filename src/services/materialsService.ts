
import { supabase } from '@/integrations/supabase/client';

export interface Material {
  id: string;
  name: string;
  category: string;
  rate: number;
  unit: string;
  type: 'electrical' | 'plumbing';
  created_at: string;
  updated_at: string;
}

export const getMaterials = async (type?: string, searchQuery?: string): Promise<Material[]> => {
  let query = supabase
    .from('materials')
    .select('*')
    .order('name', { ascending: true });

  if (type) {
    query = query.eq('type', type);
  }

  if (searchQuery && searchQuery.trim()) {
    // Smart search: search in name and category with case-insensitive matching
    const searchTerm = searchQuery.trim().toLowerCase();
    query = query.or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching materials:', error);
    throw error;
  }

  // Type cast the data to ensure compatibility
  return (data || []).map(item => ({
    ...item,
    type: item.type as 'electrical' | 'plumbing'
  }));
};

export const searchMaterials = async (
  searchQuery: string, 
  type?: string
): Promise<Material[]> => {
  if (!searchQuery.trim()) {
    return getMaterials(type);
  }

  let query = supabase
    .from('materials')
    .select('*')
    .order('name', { ascending: true });

  if (type) {
    query = query.eq('type', type);
  }

  const searchTerm = searchQuery.trim().toLowerCase();
  
  // Advanced search: search in name, category with fuzzy matching
  query = query.or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);

  const { data, error } = await query;

  if (error) {
    console.error('Error searching materials:', error);
    throw error;
  }

  // Type cast the data to ensure compatibility
  return (data || []).map(item => ({
    ...item,
    type: item.type as 'electrical' | 'plumbing'
  }));
};
