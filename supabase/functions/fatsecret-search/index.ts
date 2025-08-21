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

  try {
    const { searchQuery } = await req.json();
    
    if (!searchQuery) {
      return new Response(JSON.stringify({ error: "Search query is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
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
      return new Response(JSON.stringify({ 
        error: "API configuration error",
        details: `Missing credentials: ${!clientId ? 'ClientID ' : ''}${!clientSecret ? 'ClientSecret' : ''}`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
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
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
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
      return new Response(JSON.stringify({ error: "Search failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const searchData = await searchResponse.json();
    console.log("Search results:", searchData);

    // Check for FatSecret API errors embedded in response
    if (searchData.error) {
      console.error("FatSecret API error:", searchData.error);
      
      if (searchData.error.code === 21) {
        // IP blocking error - try alternative approach
        return await tryAlternativeSearch(searchQuery, corsHeaders);
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
    return new Response(JSON.stringify({ error: "Unexpected error occurred" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Alternative search using fallback food database when FatSecret is blocked
async function tryAlternativeSearch(query: string, corsHeaders: any) {
  console.log("Trying alternative search for:", query);
  
  // Fallback to common foods database
  const commonFoods = getCommonFoods(query);
  
  if (commonFoods.length > 0) {
    console.log("Found", commonFoods.length, "foods in fallback database");
    return new Response(JSON.stringify({ 
      results: commonFoods,
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
    status: 200, // Changed to 200 to avoid frontend errors
  });
}

// Common foods database for fallback
function getCommonFoods(query: string) {
  const lowerQuery = query.toLowerCase();
  
  const commonFoods = [
    {
      id: "chicken_breast",
      name: "Pechuga de Pollo",
      description: "Per 100g - Calories: 165kcal | Fat: 3.6g | Carbs: 0g | Protein: 31g",
      brand: null,
      nutrition: {
        calories: 165,
        fat: 3.6,
        carbs: 0,
        protein: 31,
        serving_size: "100g"
      }
    },
    {
      id: "chicken_thigh",
      name: "Muslo de Pollo",
      description: "Per 100g - Calories: 209kcal | Fat: 10.9g | Carbs: 0g | Protein: 26g",
      brand: null,
      nutrition: {
        calories: 209,
        fat: 10.9,
        carbs: 0,
        protein: 26,
        serving_size: "100g"
      }
    },
    {
      id: "white_rice",
      name: "Arroz Blanco Cocido",
      description: "Per 100g - Calories: 130kcal | Fat: 0.3g | Carbs: 28g | Protein: 2.7g",
      brand: null,
      nutrition: {
        calories: 130,
        fat: 0.3,
        carbs: 28,
        protein: 2.7,
        serving_size: "100g"
      }
    },
    {
      id: "eggs",
      name: "Huevos Enteros",
      description: "Per 100g - Calories: 155kcal | Fat: 11g | Carbs: 1.1g | Protein: 13g",
      brand: null,
      nutrition: {
        calories: 155,
        fat: 11,
        carbs: 1.1,
        protein: 13,
        serving_size: "100g"
      }
    },
    {
      id: "salmon",
      name: "Salmón",
      description: "Per 100g - Calories: 208kcal | Fat: 12g | Carbs: 0g | Protein: 22g",
      brand: null,
      nutrition: {
        calories: 208,
        fat: 12,
        carbs: 0,
        protein: 22,
        serving_size: "100g"
      }
    },
    {
      id: "banana",
      name: "Plátano",
      description: "Per 100g - Calories: 89kcal | Fat: 0.3g | Carbs: 23g | Protein: 1.1g",
      brand: null,
      nutrition: {
        calories: 89,
        fat: 0.3,
        carbs: 23,
        protein: 1.1,
        serving_size: "100g"
      }
    },
    {
      id: "oats",
      name: "Avena",
      description: "Per 100g - Calories: 389kcal | Fat: 6.9g | Carbs: 66g | Protein: 17g",
      brand: null,
      nutrition: {
        calories: 389,
        fat: 6.9,
        carbs: 66,
        protein: 17,
        serving_size: "100g"
      }
    }
  ];
  
  return commonFoods.filter(food => 
    food.name.toLowerCase().includes(lowerQuery) ||
    (lowerQuery.includes('pollo') && food.id.includes('chicken')) ||
    (lowerQuery.includes('arroz') && food.id.includes('rice')) ||
    (lowerQuery.includes('huevo') && food.id.includes('eggs')) ||
    (lowerQuery.includes('salmon') && food.id.includes('salmon')) ||
    (lowerQuery.includes('platano') && food.id.includes('banana')) ||
    (lowerQuery.includes('avena') && food.id.includes('oats'))
  );
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