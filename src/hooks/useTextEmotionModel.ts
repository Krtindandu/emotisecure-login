import { useState, useRef, useCallback } from "react";
import { pipeline, TextClassificationPipeline } from "@huggingface/transformers";

interface EmotionResult {
  name: string;
  score: number;
  intensity: "low" | "medium" | "high";
}

interface EmotionData {
  emotions: EmotionResult[];
  dominant_emotion: string;
  mixed_emotions: string[];
  confidence: number;
  analysis_summary: string;
}

// Mapping from model labels to our emotion format
const EMOTION_MAP: Record<string, string> = {
  joy: "Happy",
  sadness: "Sad",
  anger: "Angry",
  surprise: "Surprised",
  disgust: "Disgusted",
  neutral: "Neutral",
};

const getIntensity = (score: number): "low" | "medium" | "high" => {
  if (score >= 0.67) return "high";
  if (score >= 0.34) return "medium";
  return "low";
};

export const useTextEmotionModel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const classifierRef = useRef<TextClassificationPipeline | null>(null);

  const loadModel = useCallback(async () => {
    if (classifierRef.current) {
      setModelReady(true);
      return;
    }

    setIsLoading(true);
    setLoadingProgress(0);

    try {
      // Use DistilRoBERTa fine-tuned for emotion detection
      const classifier = await pipeline(
        "text-classification",
        "j-hartmann/emotion-english-distilroberta-base",
        {
          device: "webgpu",
          progress_callback: (progress: any) => {
            if (progress.status === "progress" && progress.progress) {
              setLoadingProgress(Math.round(progress.progress));
            }
          },
        }
      );

      classifierRef.current = classifier as TextClassificationPipeline;
      setModelReady(true);
    } catch (error) {
      console.error("Failed to load text emotion model:", error);
      // Fallback to CPU if WebGPU not available
      try {
        const classifier = await pipeline(
          "text-classification",
          "j-hartmann/emotion-english-distilroberta-base",
          {
            progress_callback: (progress: any) => {
              if (progress.status === "progress" && progress.progress) {
                setLoadingProgress(Math.round(progress.progress));
              }
            },
          }
        );
        classifierRef.current = classifier as TextClassificationPipeline;
        setModelReady(true);
      } catch (fallbackError) {
        console.error("Failed to load model on CPU:", fallbackError);
        throw fallbackError;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeText = useCallback(async (text: string): Promise<EmotionData> => {
    if (!classifierRef.current) {
      await loadModel();
    }

    if (!classifierRef.current) {
      throw new Error("Model not loaded");
    }

    // Get predictions with top_k to get all emotions
    const results = await classifierRef.current(text, { top_k: 7 });
    
    // Process results into our format
    const allEmotions = ["Happy", "Sad", "Angry", "Surprised", "Disgusted", "Neutral"];
    const emotionScores: Record<string, number> = {};
    
    // Initialize all emotions with 0
    allEmotions.forEach(e => emotionScores[e] = 0);
    
    // Map model outputs to our emotions
    if (Array.isArray(results)) {
      results.forEach((r: any) => {
        const mappedEmotion = EMOTION_MAP[r.label.toLowerCase()];
        if (mappedEmotion) {
          emotionScores[mappedEmotion] = r.score;
        }
      });
    }

    // Normalize scores to sum to ~1
    const totalScore = Object.values(emotionScores).reduce((a, b) => a + b, 0);
    if (totalScore > 0) {
      Object.keys(emotionScores).forEach(key => {
        emotionScores[key] = emotionScores[key] / totalScore;
      });
    }

    const emotions: EmotionResult[] = allEmotions.map(name => ({
      name,
      score: emotionScores[name] || 0,
      intensity: getIntensity(emotionScores[name] || 0),
    }));

    // Sort by score descending
    emotions.sort((a, b) => b.score - a.score);

    const dominantEmotion = emotions[0]?.name || "Neutral";
    const mixedEmotions = emotions.filter(e => e.score > 0.15).map(e => e.name);
    const confidence = emotions[0]?.score || 0;

    const analysis_summary = `The text primarily expresses ${dominantEmotion.toLowerCase()} emotions${
      mixedEmotions.length > 1 
        ? `, with hints of ${mixedEmotions.slice(1).join(", ").toLowerCase()}` 
        : ""
    }. Analysis performed using DistilRoBERTa emotion model.`;

    return {
      emotions,
      dominant_emotion: dominantEmotion,
      mixed_emotions: mixedEmotions,
      confidence,
      analysis_summary,
    };
  }, [loadModel]);

  return {
    loadModel,
    analyzeText,
    isLoading,
    modelReady,
    loadingProgress,
  };
};
