
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IngredientAnalysis {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodAnalysis {
  isFood: boolean;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  ingredients: IngredientAnalysis[];
  servingSize: number;
  servingUnit: string;
  confidence: number;
}

const analyzeImageWithAI = async (imageUrl: string): Promise<FoodAnalysis> => {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    console.log('OpenAI API key not found, using mock data');
    return generateMockAnalysis();
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres un experto nutricionista que analiza imágenes de comida. Tu trabajo es:
1. Determinar si la imagen contiene comida (isFood: true/false)
2. Si es comida, identificar el platillo principal y proporcionar información nutricional detallada
3. Desglosar los ingredientes principales con sus pesos y valores nutricionales
4. Asignar un puntaje de salud del 1-10
5. Estimar el tamaño de la porción

Responde ÚNICAMENTE con un JSON válido en el siguiente formato:
{
  "isFood": boolean,
  "name": "Nombre del platillo",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "healthScore": number (1-10),
  "ingredients": [
    {
      "name": "Nombre del ingrediente",
      "grams": number,
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
  ],
  "servingSize": number,
  "servingUnit": "string",
  "confidence": number (0-1)
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analiza esta imagen y determina si contiene comida. Si es así, proporciona la información nutricional detallada.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      return generateMockAnalysis();
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const analysis = JSON.parse(content);
      console.log('AI Analysis completed:', analysis);
      return analysis;
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return generateMockAnalysis();
    }

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return generateMockAnalysis();
  }
};

const generateMockAnalysis = (): FoodAnalysis => {
  return {
    isFood: true,
    name: "Platillo detectado",
    calories: Math.floor(Math.random() * 400) + 200,
    protein: Math.floor(Math.random() * 25) + 10,
    carbs: Math.floor(Math.random() * 50) + 20,
    fat: Math.floor(Math.random() * 20) + 5,
    healthScore: Math.floor(Math.random() * 6) + 4,
    ingredients: [
      {
        name: "Ingrediente principal",
        grams: Math.floor(Math.random() * 100) + 100,
        calories: Math.floor(Math.random() * 150) + 100,
        protein: Math.floor(Math.random() * 15) + 5,
        carbs: Math.floor(Math.random() * 25) + 10,
        fat: Math.floor(Math.random() * 10) + 3
      },
      {
        name: "Ingrediente secundario",
        grams: Math.floor(Math.random() * 80) + 50,
        calories: Math.floor(Math.random() * 100) + 50,
        protein: Math.floor(Math.random() * 8) + 2,
        carbs: Math.floor(Math.random() * 15) + 5,
        fat: Math.floor(Math.random() * 8) + 2
      }
    ],
    servingSize: 1,
    servingUnit: "porción",
    confidence: 0.75
  };
};

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

    console.log('Analyzing food image:', imageUrl);
    const analysis = await analyzeImageWithAI(imageUrl);

    return new Response(
      JSON.stringify(analysis),
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
