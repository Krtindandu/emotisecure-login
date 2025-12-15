import { Progress } from "@/components/ui/progress";

interface Emotion {
  name: string;
  score: number;
  intensity: "low" | "medium" | "high";
}

interface EmotionResultsProps {
  emotions: Emotion[];
  dominantEmotion: string;
  mixedEmotions: string[];
  confidence: number;
  analysisSummary: string;
}

const emotionColors: Record<string, string> = {
  Happy: "bg-yellow-500",
  Sad: "bg-blue-500",
  Angry: "bg-red-500",
  Surprised: "bg-purple-500",
  Disgusted: "bg-green-600",
  Neutral: "bg-gray-500",
};

const intensityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const EmotionResults = ({
  emotions,
  dominantEmotion,
  mixedEmotions,
  confidence,
  analysisSummary,
}: EmotionResultsProps) => {
  const sortedEmotions = [...emotions].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Dominant Emotion */}
      <div className="p-6 rounded-2xl bg-card border border-border/50 card-shadow">
        <h3 className="text-lg font-display font-semibold text-foreground mb-2">
          Dominant Emotion
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold gradient-text">{dominantEmotion}</span>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
            {Math.round(confidence * 100)}% confident
          </span>
        </div>
      </div>

      {/* Emotion Breakdown */}
      <div className="p-6 rounded-2xl bg-card border border-border/50 card-shadow">
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">
          Emotion Breakdown
        </h3>
        <div className="space-y-4">
          {sortedEmotions.map((emotion) => (
            <div key={emotion.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      emotionColors[emotion.name] || "bg-gray-400"
                    }`}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {emotion.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                    {intensityLabels[emotion.intensity]}
                  </span>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {Math.round(emotion.score * 100)}%
                  </span>
                </div>
              </div>
              <Progress
                value={emotion.score * 100}
                className="h-2"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mixed Emotions */}
      {mixedEmotions.length > 0 && (
        <div className="p-6 rounded-2xl bg-card border border-border/50 card-shadow">
          <h3 className="text-lg font-display font-semibold text-foreground mb-3">
            Mixed Emotions Detected
          </h3>
          <div className="flex flex-wrap gap-2">
            {mixedEmotions.map((emotion) => (
              <span
                key={emotion}
                className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
              >
                {emotion}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Summary */}
      <div className="p-6 rounded-2xl bg-card border border-border/50 card-shadow">
        <h3 className="text-lg font-display font-semibold text-foreground mb-3">
          Analysis Summary
        </h3>
        <p className="text-muted-foreground leading-relaxed">{analysisSummary}</p>
      </div>
    </div>
  );
};

export default EmotionResults;
