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
    
    if (!searchQuery && !categoryId) {
      console.log("🔄 Using fallback database - no search query or category provided");
      return await tryAlternativeSearch("", null, corsHeaders);
    }

    const clientId = Deno.env.get("FATSECRET_CLIENT_ID");
    const clientSecret = Deno.env.get("FATSECRET_CLIENT_SECRET");

    console.log("FatSecret credentials check:", {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      clientIdLength: clientId?.length || 0
    });

    if (!clientId || !clientSecret) {
      console.error("Missing FatSecret credentials - ClientID:", !!clientId, "ClientSecret:", !!clientSecret);
      console.log("🔄 Using fallback database due to missing credentials");
      return await tryAlternativeSearch(searchQuery, categoryId, corsHeaders);
    }

    console.log("Searching for:", searchQuery);

    // Get OAuth token
    const tokenResponse = await fetch("https://oauth.fatsecret.com/connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: "grant_type=client_credentials&scope=basic",
    });

    if (!tokenResponse.ok) {
      console.error("Failed to get OAuth token:", await tokenResponse.text());
      console.log("🔄 Using fallback database due to OAuth failure");
      return await tryAlternativeSearch(searchQuery, categoryId, corsHeaders);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Search for foods
    const searchUrl = `https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${encodeURIComponent(searchQuery)}&format=json`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!searchResponse.ok) {
      console.error("Search request failed:", await searchResponse.text());
      console.log("🔄 Using fallback database due to search failure");
      return await tryAlternativeSearch(searchQuery, categoryId, corsHeaders);
    }

    const searchData = await searchResponse.json();
    console.log("Search results:", searchData);

    // Check for FatSecret API errors embedded in response
    if (searchData.error) {
      console.error("FatSecret API error:", searchData.error);
      
      if (searchData.error.code === 21) {
        // IP blocking error - try alternative approach
        return await tryAlternativeSearch(searchQuery, categoryId, corsHeaders);
      }
      
      return new Response(JSON.stringify({ 
        error: "El servicio de búsqueda no está disponible temporalmente",
        details: "Intenta de nuevo más tarde o usa términos más comunes como 'pollo', 'arroz', 'huevos'",
        fallback_available: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Changed to 200 to avoid frontend errors
      });
    }

    // Process and format the results
    const foods = searchData.foods?.food || [];
    const formattedFoods = Array.isArray(foods) ? foods : [foods];

    const results = formattedFoods.map((food: any) => ({
      id: food.food_id,
      name: food.food_name,
      description: food.food_description,
      brand: food.brand_name || null,
      // Parse nutrition info from description if available
      nutrition: parseNutritionFromDescription(food.food_description),
    }));

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Unexpected error:", error);
    console.log("🔄 Using fallback database due to unexpected error");
    return await tryAlternativeSearch(searchQuery || "", categoryId, corsHeaders);
  }
});

// Alternative search using Supabase database when FatSecret is blocked
async function tryAlternativeSearch(query: string, categoryId: number | null, corsHeaders: any) {
  console.log("Trying alternative search for:", query);
  
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    return new Response(JSON.stringify({ 
      error: "Configuración del servicio no disponible",
      details: "Intenta de nuevo más tarde",
      no_results: true
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Search in Supabase database
  const databaseResults = await searchFoodsInDatabase(query, supabase, categoryId);
  
  if (databaseResults.length > 0) {
    console.log("Found", databaseResults.length, "foods in database");
    return new Response(JSON.stringify({ 
      results: databaseResults,
      fallback: true,
      message: "Mostrando resultados de base de datos local"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
  
  return new Response(JSON.stringify({ 
    error: "No se encontraron alimentos",
    details: "El servicio de búsqueda no está disponible temporalmente. Intenta con términos más comunes como 'pollo', 'arroz', 'huevos', etc.",
    no_results: true
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

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

    if (!data || data.length === 0) {
      console.log('No foods found in database for query:', query);
      return [];
    }

    // Transform database results to expected format
    const transformedResults = data.map((item: any) => ({
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
        serving_size: `${item.serving_size_grams || 100}${item.serving_size_unit || 'g'}`
      }
    }));

    console.log(`Found ${transformedResults.length} foods in database`);
    return transformedResults;
    
  } catch (error) {
    console.error('Database search exception:', error);
    return [];
  }
}

function parseNutritionFromDescription(description: string) {
  if (!description) return null;

  // FatSecret description format: "Per 100g - Calories: 123kcal | Fat: 1.23g | Carbs: 12.34g | Protein: 1.23g"
  const calorieMatch = description.match(/Calories:\s*(\d+(?:\.\d+)?)kcal/i);
  const fatMatch = description.match(/Fat:\s*(\d+(?:\.\d+)?)g/i);
  const carbsMatch = description.match(/Carbs:\s*(\d+(?:\.\d+)?)g/i);
  const proteinMatch = description.match(/Protein:\s*(\d+(?:\.\d+)?)g/i);

  return {
    calories: calorieMatch ? parseFloat(calorieMatch[1]) : 0,
    fat: fatMatch ? parseFloat(fatMatch[1]) : 0,
    carbs: carbsMatch ? parseFloat(carbsMatch[1]) : 0,
    protein: proteinMatch ? parseFloat(proteinMatch[1]) : 0,
    serving_size: "100g", // FatSecret typically shows per 100g
  };
}