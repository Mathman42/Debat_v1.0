import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GeneratedTopic {
  title: string;
  description: string;
  category: string;
}

async function generateTopicsWithAI(count: number = 5): Promise<GeneratedTopic[]> {
  const apiKey = Deno.env.get('PERPLEXITY_API_KEY');

  if (!apiKey) {
    throw new Error('Perplexity API key not configured');
  }

  const prompt = `Genereer ${count} actuele debatonderwerpen die geschikt zijn voor Nederlandse middelbare scholieren (12-18 jaar).

Criteria:
- Actueel in het nieuws of relevant voor jongeren
- Geschikt voor VO-niveau (niet te complex, maar wel uitdagend)
- Twee duidelijke standpunten mogelijk (voor/tegen)
- Niet te controversieel of gevoelig
- Variatie in categorieën (technologie, milieu, onderwijs, maatschappij, gezondheid)

Formatteer je antwoord als een JSON array met deze structuur:
[
  {
    "title": "Korte titel van het onderwerp",
    "description": "Beschrijving van 1-2 zinnen die het debat introduceert",
    "category": "een van: technologie, milieu, onderwijs, maatschappij, gezondheid, sport"
  }
]

Geef ALLEEN de JSON array terug, geen extra tekst.`;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
        return_related_questions: false,
        return_images: false,
        return_citations: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No content returned from Perplexity API');
    }

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }

    const topics: GeneratedTopic[] = JSON.parse(jsonMatch[0]);

    return topics.filter(t => t.title && t.description && t.category);
  } catch (error) {
    console.error('Error generating topics with AI:', error);
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Database configuration missing' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { count } = await req.json().catch(() => ({ count: 5 }));
    const topicCount = Math.min(Math.max(count || 5, 1), 10);

    const generatedTopics = await generateTopicsWithAI(topicCount);

    const insertData = generatedTopics.map(topic => ({
      title: topic.title,
      description: topic.description,
      category: topic.category,
      is_sensitive: false,
    }));

    const { data: insertedTopics, error: insertError } = await supabase
      .from('debate_topics')
      .insert(insertData)
      .select();

    if (insertError) {
      console.error('Error inserting topics:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save topics to database' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        topics: insertedTopics,
        count: insertedTopics?.length || 0
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in generate-topics function:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate topics',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
