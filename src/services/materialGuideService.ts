
import { supabase } from '@/integrations/supabase/client';

export interface MaterialGuide {
  id: string;
  title: string;
  category: string;
  content: string;
  summary: string;
  img_url: string | null;
  author: string | null;
  type: string;
  created_at: string;
  updated_at: string;
}

export const getMaterialGuides = async (type?: string): Promise<MaterialGuide[]> => {
  let query = supabase
    .from('material_guides')
    .select('*')
    .order('created_at', { ascending: false });

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching material guides:', error);
    throw error;
  }

  return data || [];
};

export const getMaterialGuideById = async (id: string): Promise<MaterialGuide | null> => {
  const { data, error } = await supabase
    .from('material_guides')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching material guide:', error);
    throw error;
  }

  return data;
};
