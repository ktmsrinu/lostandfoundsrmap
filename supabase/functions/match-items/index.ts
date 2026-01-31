import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MatchResult {
  lostItemId: string;
  foundItemId: string;
  confidence: number;
  reasoning: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { itemId, itemType } = await req.json();

    if (!itemId || !itemType) {
      return new Response(
        JSON.stringify({ error: "Missing itemId or itemType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the newly posted item
    const { data: newItem, error: newItemError } = await supabase
      .from("items")
      .select("*")
      .eq("id", itemId)
      .single();

    if (newItemError || !newItem) {
      return new Response(
        JSON.stringify({ error: "Item not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get opposite type items to compare
    const oppositeType = itemType === "lost" ? "found" : "lost";
    const { data: compareItems, error: compareError } = await supabase
      .from("items")
      .select("*")
      .eq("type", oppositeType)
      .eq("status", "active")
      .eq("category", newItem.category)
      .limit(20);

    if (compareError || !compareItems || compareItems.length === 0) {
      return new Response(
        JSON.stringify({ matches: [], message: "No items to compare" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use AI to analyze potential matches
    const matchPromises = compareItems.map(async (compareItem) => {
      try {
        const prompt = `You are an AI assistant helping to match lost and found items.

Analyze these two items and determine if they might be the same item:

**${itemType.toUpperCase()} ITEM:**
- Title: ${newItem.title}
- Category: ${newItem.category}
- Description: ${newItem.description}
- Location: ${newItem.location}
- Date: ${newItem.item_date}
- Image URL: ${newItem.image_url}

**${oppositeType.toUpperCase()} ITEM:**
- Title: ${compareItem.title}
- Category: ${compareItem.category}
- Description: ${compareItem.description}
- Location: ${compareItem.location}
- Date: ${compareItem.item_date}
- Image URL: ${compareItem.image_url}

Based on the descriptions, locations, dates, and any visual similarities you can infer, estimate the probability (0-100) that these are the same item.

Respond in JSON format only:
{
  "confidence": <number between 0-100>,
  "reasoning": "<brief explanation of your assessment>"
}`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${lovableApiKey}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          console.error("AI API error:", await response.text());
          return null;
        }

        const aiResult = await response.json();
        const content = aiResult.choices?.[0]?.message?.content || "";
        
        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            lostItemId: itemType === "lost" ? newItem.id : compareItem.id,
            foundItemId: itemType === "found" ? newItem.id : compareItem.id,
            confidence: parsed.confidence,
            reasoning: parsed.reasoning,
          } as MatchResult;
        }
        return null;
      } catch (error) {
        console.error("Error analyzing match:", error);
        return null;
      }
    });

    const results = await Promise.all(matchPromises);
    const validMatches = results
      .filter((r): r is MatchResult => r !== null && r.confidence >= 60)
      .sort((a, b) => b.confidence - a.confidence);

    // Store high-confidence matches in the database
    for (const match of validMatches) {
      if (match.confidence >= 70) {
        // Check if match already exists
        const { data: existingMatch } = await supabase
          .from("matches")
          .select("id")
          .eq("lost_item_id", match.lostItemId)
          .eq("found_item_id", match.foundItemId)
          .single();

        if (!existingMatch) {
          await supabase.from("matches").insert({
            lost_item_id: match.lostItemId,
            found_item_id: match.foundItemId,
            confidence_score: match.confidence,
            status: "pending",
          });

          // Update item statuses
          await supabase
            .from("items")
            .update({ status: "matched" })
            .in("id", [match.lostItemId, match.foundItemId]);

          // Get user IDs for notifications
          const { data: itemUsers } = await supabase
            .from("items")
            .select("id, user_id, title")
            .in("id", [match.lostItemId, match.foundItemId]);

          if (itemUsers) {
            for (const item of itemUsers) {
              await supabase.from("notifications").insert({
                user_id: item.user_id,
                title: "Potential Match Found!",
                message: `Your item "${item.title}" has a potential match with ${match.confidence}% confidence.`,
              });
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        matches: validMatches,
        message: validMatches.length > 0 
          ? `Found ${validMatches.length} potential matches` 
          : "No strong matches found"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in match-items function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
