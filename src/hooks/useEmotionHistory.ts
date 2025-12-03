import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface EmotionData {
  emotions: Array<{
    name: string;
    score: number;
    intensity: "low" | "medium" | "high";
  }>;
  dominant_emotion: string;
  mixed_emotions: string[];
  confidence: number;
  analysis_summary: string;
}

type AnalysisType = "text" | "video" | "combined";

export const useEmotionHistory = () => {
  const { user } = useAuth();

  const saveAnalysis = useCallback(
    async (
      analysisType: AnalysisType,
      emotionData: EmotionData,
      inputText?: string
    ) => {
      if (!user) return;

      try {
        const { error } = await supabase.from("emotion_analyses").insert({
          user_id: user.id,
          analysis_type: analysisType,
          input_text: inputText || null,
          dominant_emotion: emotionData.dominant_emotion,
          confidence: emotionData.confidence,
          emotions: emotionData.emotions,
          mixed_emotions: emotionData.mixed_emotions,
          summary: emotionData.analysis_summary,
        });

        if (error) {
          console.error("Failed to save analysis:", error);
        }
      } catch (error) {
        console.error("Failed to save analysis:", error);
      }
    },
    [user]
  );

  return { saveAnalysis };
};
