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