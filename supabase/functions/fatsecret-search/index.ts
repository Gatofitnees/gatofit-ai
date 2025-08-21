import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  let searchQuery = "";
  let categoryId = null;
  
  try {
    const requestBody = await req.json();
    searchQuery = requestBody.searchQuery || "";
    categoryId = requestBody.categoryId || null;
    
    console.log("🔍 Searching foods:", { query: searchQuery, categoryId });
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      return new Response(JSON.stringify({ 
        error: "Configuración del servicio no disponible",
        details: "Intenta de nuevo más tarde"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Search in Supabase database
    const results = await searchFoodsInDatabase(searchQuery, supabase, categoryId);
    
    return new Response(JSON.stringify({ 
      results: results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ 
      error: "Error interno del servidor",
      details: "Intenta de nuevo más tarde"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});

// Function to search foods in the database
async function searchFoodsInDatabase(query: string, supabase: any, categoryId?: number | null) {
  try {
    console.log('Searching in database for:', query, 'Category:', categoryId);
    
    // Build query with category support and synonyms
    let queryBuilder = supabase
      .from('food_items')
      .select(`
        *,
        food_categories(name, icon_name, color_class)
      `)
      .eq('is_verified_by_admin', true);

    // If no query and no category, load 15 random foods
    if ((!query || !query.trim()) && !categoryId) {
      const { data, error } = await queryBuilder
        .order('name')
        .limit(15);

      if (error) {
        console.error('Database default load error:', error);
        return [];
      }

      return transformResults(data || []);
    }

    // If category filter is applied
    if (categoryId) {
      queryBuilder = queryBuilder.eq('category_id', categoryId);
    }

    // If there's a search query
    if (query && query.trim()) {
      // First, check for synonyms
      const { data: synonyms } = await supabase
        .from('food_search_synonyms')
        .select('target_foods')
        .ilike('search_term', `%${query}%`);

      let searchTerms = [query];
      if (synonyms && synonyms.length > 0) {
        // Add synonym targets to search terms
        synonyms.forEach((synonym: any) => {
          searchTerms = [...searchTerms, ...synonym.target_foods];
        });
      }

      // Search for foods using all search terms
      let orConditions: string[] = [];
      searchTerms.forEach(term => {
        orConditions.push(`name.ilike.%${term}%`);
        orConditions.push(`brand_name.ilike.%${term}%`);
        orConditions.push(`description.ilike.%${term}%`);
        orConditions.push(`subcategory.ilike.%${term}%`);
      });

      queryBuilder = queryBuilder.or(orConditions.join(','));
    }

    const { data, error } = await queryBuilder
      .order('name')
      .limit(20);

    if (error) {
      console.error('Database search error:', error);
      return [];
    }

    return transformResults(data || []);
    
  } catch (error) {
    console.error('Database search exception:', error);
    return [];
  }
}

function transformResults(data: any[]) {
  return data.map((item: any) => ({
    id: `db-${item.id}`,
    name: item.name,
    description: item.description || `${item.name}${item.brand_name ? ` - ${item.brand_name}` : ''}`,
    brand: item.brand_name || null,
    category: item.food_categories?.name,
    subcategory: item.subcategory,
    categoryIcon: item.food_categories?.icon_name,
    categoryColor: item.food_categories?.color_class,
    nutrition: {
      calories: item.calories_per_serving,
      protein: item.protein_g_per_serving,
      carbs: item.carbs_g_per_serving,
      fat: item.fat_g_per_serving,
      serving_size: `${item.serving_size_grams || 100}g`
    }
  }));
}