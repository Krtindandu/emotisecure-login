import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert emotion detection AI. Analyze the provided input and detect emotions with high accuracy.

For TEXT analysis: Analyze the sentiment, tone, and emotional content.
For IMAGE analysis: Analyze facial expressions, body language, and visual cues.

Return ONLY a valid JSON object with this exact structure:
{
  "emotions": [
    {"name": "Happy", "score": 0.0, "intensity": "low|medium|high"},
    {"name": "Sad", "score": 0.0, "intensity": "low|medium|high"},
    {"name": "Angry", "score": 0.0, "intensity": "low|medium|high"},
    {"name": "Surprised", "score": 0.0, "intensity": "low|medium|high"},
    {"name": "Fearful", "score": 0.0, "intensity": "low|medium|high"},
    {"name": "Disgusted", "score": 0.0, "intensity": "low|medium|high"},
    {"name": "Neutral", "score": 0.0, "intensity": "low|medium|high"},
    {"name": "Contempt", "score": 0.0, "intensity": "low|medium|high"}
  ],
  "dominant_emotion": "string",
  "mixed_emotions": ["string"],
  "confidence": 0.0,
  "analysis_summary": "string"
}

Rules:
- Scores must be between 0 and 1, totaling approximately 1.0
- Intensity: low (0-0.33), medium (0.34-0.66), high (0.67-1.0)
- mixed_emotions: list emotions with score > 0.15
- confidence: overall confidence in analysis (0-1)
- analysis_summary: brief explanation of detected emotions`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, text, imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let messages: any[] = [
      { role: "system", content: SYSTEM_PROMPT }
    ];

    if (type === "text") {
      messages.push({
        role: "user",
        content: `Analyze the emotions in this text: "${text}"`
      });
    } else if (type === "image") {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: "Analyze the emotions shown in this image. Focus on facial expressions and body language." },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
        ]
      });
    } else {
      throw new Error("Invalid analysis type. Use 'text' or 'image'.");
    }

    console.log(`Processing ${type} emotion analysis request`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format");
    }

    const emotionData = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(emotionData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Emotion analysis error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
