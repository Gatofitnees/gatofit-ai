
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FoodAnalysis {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  ingredients: string[];
  servingSize: number;
  servingUnit: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    // For now, return mock data - you can integrate with OpenAI Vision API later
    const mockAnalysis: FoodAnalysis = {
      name: "Alimento detectado",
      calories: Math.floor(Math.random() * 300) + 100,
      protein: Math.floor(Math.random() * 20) + 5,
      carbs: Math.floor(Math.random() * 40) + 10,
      fat: Math.floor(Math.random() * 15) + 2,
      healthScore: Math.floor(Math.random() * 6) + 4,
      ingredients: [
        "Ingrediente principal",
        "Ingrediente secundario"
      ],
      servingSize: 1,
      servingUnit: "porción"
    };

    console.log('Food analysis completed:', mockAnalysis);

    return new Response(
      JSON.stringify(mockAnalysis),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error analyzing food:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze food', 
        details: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    );
  }
});
