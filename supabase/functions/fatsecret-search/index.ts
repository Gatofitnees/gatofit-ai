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
  
  try {
    const requestBody = await req.json();
    searchQuery = requestBody.searchQuery || "";
    
    if (!searchQuery) {
      console.log("🔄 Using fallback database - no search query provided");
      return await tryAlternativeSearch("", corsHeaders);
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
      return await tryAlternativeSearch(searchQuery, corsHeaders);
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
      return await tryAlternativeSearch(searchQuery, corsHeaders);
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
      return await tryAlternativeSearch(searchQuery, corsHeaders);
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
    console.log("🔄 Using fallback database due to unexpected error");
    return await tryAlternativeSearch(searchQuery || "", corsHeaders);
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
    // Proteínas animales
    {
      id: "chicken_breast",
      name: "Pechuga de Pollo",
      description: "Per 100g - Calories: 165kcal | Fat: 3.6g | Carbs: 0g | Protein: 31g",
      brand: null,
      nutrition: { calories: 165, fat: 3.6, carbs: 0, protein: 31, serving_size: "100g" }
    },
    {
      id: "chicken_thigh",
      name: "Muslo de Pollo",
      description: "Per 100g - Calories: 209kcal | Fat: 10.9g | Carbs: 0g | Protein: 26g",
      brand: null,
      nutrition: { calories: 209, fat: 10.9, carbs: 0, protein: 26, serving_size: "100g" }
    },
    {
      id: "beef_steak",
      name: "Carne de Res (Bistec)",
      description: "Per 100g - Calories: 250kcal | Fat: 15g | Carbs: 0g | Protein: 26g",
      brand: null,
      nutrition: { calories: 250, fat: 15, carbs: 0, protein: 26, serving_size: "100g" }
    },
    {
      id: "pork_chop",
      name: "Chuleta de Cerdo",
      description: "Per 100g - Calories: 231kcal | Fat: 14g | Carbs: 0g | Protein: 25g",
      brand: null,
      nutrition: { calories: 231, fat: 14, carbs: 0, protein: 25, serving_size: "100g" }
    },
    {
      id: "eggs",
      name: "Huevos Enteros",
      description: "Per 100g - Calories: 155kcal | Fat: 11g | Carbs: 1.1g | Protein: 13g",
      brand: null,
      nutrition: { calories: 155, fat: 11, carbs: 1.1, protein: 13, serving_size: "100g" }
    },
    // Pescados y mariscos
    {
      id: "salmon",
      name: "Salmón",
      description: "Per 100g - Calories: 208kcal | Fat: 12g | Carbs: 0g | Protein: 22g",
      brand: null,
      nutrition: { calories: 208, fat: 12, carbs: 0, protein: 22, serving_size: "100g" }
    },
    {
      id: "tuna",
      name: "Atún",
      description: "Per 100g - Calories: 144kcal | Fat: 4.9g | Carbs: 0g | Protein: 23g",
      brand: null,
      nutrition: { calories: 144, fat: 4.9, carbs: 0, protein: 23, serving_size: "100g" }
    },
    {
      id: "white_fish",
      name: "Pescado Blanco (Tilapia)",
      description: "Per 100g - Calories: 128kcal | Fat: 2.7g | Carbs: 0g | Protein: 26g",
      brand: null,
      nutrition: { calories: 128, fat: 2.7, carbs: 0, protein: 26, serving_size: "100g" }
    },
    {
      id: "shrimp",
      name: "Camarones",
      description: "Per 100g - Calories: 99kcal | Fat: 0.3g | Carbs: 0.2g | Protein: 24g",
      brand: null,
      nutrition: { calories: 99, fat: 0.3, carbs: 0.2, protein: 24, serving_size: "100g" }
    },
    // Carbohidratos
    {
      id: "white_rice",
      name: "Arroz Blanco Cocido",
      description: "Per 100g - Calories: 130kcal | Fat: 0.3g | Carbs: 28g | Protein: 2.7g",
      brand: null,
      nutrition: { calories: 130, fat: 0.3, carbs: 28, protein: 2.7, serving_size: "100g" }
    },
    {
      id: "brown_rice",
      name: "Arroz Integral Cocido",
      description: "Per 100g - Calories: 112kcal | Fat: 0.9g | Carbs: 23g | Protein: 2.6g",
      brand: null,
      nutrition: { calories: 112, fat: 0.9, carbs: 23, protein: 2.6, serving_size: "100g" }
    },
    {
      id: "pasta",
      name: "Pasta Cocida",
      description: "Per 100g - Calories: 131kcal | Fat: 1.1g | Carbs: 25g | Protein: 5g",
      brand: null,
      nutrition: { calories: 131, fat: 1.1, carbs: 25, protein: 5, serving_size: "100g" }
    },
    {
      id: "bread",
      name: "Pan Integral",
      description: "Per 100g - Calories: 247kcal | Fat: 4.2g | Carbs: 41g | Protein: 13g",
      brand: null,
      nutrition: { calories: 247, fat: 4.2, carbs: 41, protein: 13, serving_size: "100g" }
    },
    {
      id: "potato",
      name: "Papa Cocida",
      description: "Per 100g - Calories: 87kcal | Fat: 0.1g | Carbs: 20g | Protein: 1.9g",
      brand: null,
      nutrition: { calories: 87, fat: 0.1, carbs: 20, protein: 1.9, serving_size: "100g" }
    },
    {
      id: "sweet_potato",
      name: "Camote",
      description: "Per 100g - Calories: 86kcal | Fat: 0.1g | Carbs: 20g | Protein: 1.6g",
      brand: null,
      nutrition: { calories: 86, fat: 0.1, carbs: 20, protein: 1.6, serving_size: "100g" }
    },
    {
      id: "oats",
      name: "Avena",
      description: "Per 100g - Calories: 389kcal | Fat: 6.9g | Carbs: 66g | Protein: 17g",
      brand: null,
      nutrition: { calories: 389, fat: 6.9, carbs: 66, protein: 17, serving_size: "100g" }
    },
    {
      id: "quinoa",
      name: "Quinoa Cocida",
      description: "Per 100g - Calories: 120kcal | Fat: 1.9g | Carbs: 22g | Protein: 4.4g",
      brand: null,
      nutrition: { calories: 120, fat: 1.9, carbs: 22, protein: 4.4, serving_size: "100g" }
    },
    // Frutas
    {
      id: "banana",
      name: "Plátano",
      description: "Per 100g - Calories: 89kcal | Fat: 0.3g | Carbs: 23g | Protein: 1.1g",
      brand: null,
      nutrition: { calories: 89, fat: 0.3, carbs: 23, protein: 1.1, serving_size: "100g" }
    },
    {
      id: "apple",
      name: "Manzana",
      description: "Per 100g - Calories: 52kcal | Fat: 0.2g | Carbs: 14g | Protein: 0.3g",
      brand: null,
      nutrition: { calories: 52, fat: 0.2, carbs: 14, protein: 0.3, serving_size: "100g" }
    },
    {
      id: "orange",
      name: "Naranja",
      description: "Per 100g - Calories: 47kcal | Fat: 0.1g | Carbs: 12g | Protein: 0.9g",
      brand: null,
      nutrition: { calories: 47, fat: 0.1, carbs: 12, protein: 0.9, serving_size: "100g" }
    },
    // Verduras
    {
      id: "broccoli",
      name: "Brócoli",
      description: "Per 100g - Calories: 25kcal | Fat: 0.3g | Carbs: 5g | Protein: 3g",
      brand: null,
      nutrition: { calories: 25, fat: 0.3, carbs: 5, protein: 3, serving_size: "100g" }
    },
    {
      id: "spinach",
      name: "Espinaca",
      description: "Per 100g - Calories: 23kcal | Fat: 0.4g | Carbs: 3.6g | Protein: 2.9g",
      brand: null,
      nutrition: { calories: 23, fat: 0.4, carbs: 3.6, protein: 2.9, serving_size: "100g" }
    },
    {
      id: "tomato",
      name: "Tomate",
      description: "Per 100g - Calories: 18kcal | Fat: 0.2g | Carbs: 3.9g | Protein: 0.9g",
      brand: null,
      nutrition: { calories: 18, fat: 0.2, carbs: 3.9, protein: 0.9, serving_size: "100g" }
    },
    // Frutos secos y semillas
    {
      id: "almonds",
      name: "Almendras",
      description: "Per 100g - Calories: 579kcal | Fat: 49g | Carbs: 22g | Protein: 21g",
      brand: null,
      nutrition: { calories: 579, fat: 49, carbs: 22, protein: 21, serving_size: "100g" }
    },
    {
      id: "peanuts",
      name: "Cacahuates",
      description: "Per 100g - Calories: 567kcal | Fat: 49g | Carbs: 16g | Protein: 26g",
      brand: null,
      nutrition: { calories: 567, fat: 49, carbs: 16, protein: 26, serving_size: "100g" }
    },
    // Lácteos
    {
      id: "milk",
      name: "Leche Entera",
      description: "Per 100g - Calories: 61kcal | Fat: 3.2g | Carbs: 4.8g | Protein: 3.2g",
      brand: null,
      nutrition: { calories: 61, fat: 3.2, carbs: 4.8, protein: 3.2, serving_size: "100g" }
    },
    {
      id: "yogurt",
      name: "Yogurt Natural",
      description: "Per 100g - Calories: 59kcal | Fat: 0.4g | Carbs: 3.6g | Protein: 10g",
      brand: null,
      nutrition: { calories: 59, fat: 0.4, carbs: 3.6, protein: 10, serving_size: "100g" }
    },
    {
      id: "cheese",
      name: "Queso",
      description: "Per 100g - Calories: 113kcal | Fat: 9g | Carbs: 1g | Protein: 7g",
      brand: null,
      nutrition: { calories: 113, fat: 9, carbs: 1, protein: 7, serving_size: "100g" }
    }
  ];
  
  // Función de búsqueda más flexible
  const searchResults = commonFoods.filter(food => {
    const foodName = food.name.toLowerCase();
    const foodId = food.id.toLowerCase();
    
    // Búsqueda directa en el nombre
    if (foodName.includes(lowerQuery)) return true;
    
    // Mapeo de términos de búsqueda a alimentos
    const searchMappings = {
      // Pollo
      'pollo': ['chicken'],
      'pechuga': ['chicken_breast'],
      'muslo': ['chicken_thigh'],
      
      // Pescado
      'pescado': ['salmon', 'tuna', 'white_fish'],
      'atun': ['tuna'],
      'salmon': ['salmon'],
      'tilapia': ['white_fish'],
      'camaron': ['shrimp'],
      'mariscos': ['shrimp'],
      
      // Carne
      'carne': ['beef_steak', 'pork_chop'],
      'res': ['beef_steak'],
      'bistec': ['beef_steak'],
      'cerdo': ['pork_chop'],
      'chuleta': ['pork_chop'],
      
      // Carbohidratos
      'arroz': ['white_rice', 'brown_rice'],
      'pasta': ['pasta'],
      'pan': ['bread'],
      'papa': ['potato'],
      'camote': ['sweet_potato'],
      'avena': ['oats'],
      'quinoa': ['quinoa'],
      
      // Huevos
      'huevo': ['eggs'],
      'huevos': ['eggs'],
      
      // Frutas
      'platano': ['banana'],
      'banano': ['banana'],
      'manzana': ['apple'],
      'naranja': ['orange'],
      
      // Verduras
      'brocoli': ['broccoli'],
      'espinaca': ['spinach'],
      'tomate': ['tomato'],
      'jitomate': ['tomato'],
      
      // Frutos secos
      'almendra': ['almonds'],
      'cacahuate': ['peanuts'],
      'mani': ['peanuts'],
      
      // Lácteos
      'leche': ['milk'],
      'yogurt': ['yogurt'],
      'queso': ['cheese']
    };
    
    // Verificar mapeos de búsqueda
    for (const [searchTerm, foodIds] of Object.entries(searchMappings)) {
      if (lowerQuery.includes(searchTerm)) {
        if (foodIds.some(id => foodId.includes(id))) {
          return true;
        }
      }
    }
    
    return false;
  });
  
  return searchResults;
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