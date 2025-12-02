import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Brain, ArrowLeft, Send, Loader2 } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";
import EmotionResults from "@/components/EmotionResults";
import { supabase } from "@/integrations/supabase/client";

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

const TextAnalysis = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<EmotionData | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-emotion", {
        body: { type: "text", text: text.trim() },
      });

      if (error) throw error;

      setResults(data);
      toast({
        title: "Analysis complete",
        description: `Detected primary emotion: ${data.dominant_emotion}`,
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      <FloatingShapes />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center glow-effect">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">
              Text Analysis
            </span>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:block">
            {user?.email}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-fade-up">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              <span className="gradient-text">Text Emotion</span> Analysis
            </h1>
            <p className="text-lg text-muted-foreground">
              Enter text below to detect emotions, sentiment, and emotional tone
            </p>
          </div>

          {/* Input Section */}
          <div
            className="p-6 rounded-2xl bg-card border border-border/50 card-shadow mb-8 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            <Textarea
              placeholder="Enter your text here... (e.g., 'I'm so excited about this new opportunity! Although I'm a bit nervous too.')"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[160px] bg-background/50 border-border/50 resize-none mb-4"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {text.length} characters
              </span>
              <Button
                variant="gradient"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !text.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Analyze Emotions
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Results Section */}
          {results && (
            <EmotionResults
              emotions={results.emotions}
              dominantEmotion={results.dominant_emotion}
              mixedEmotions={results.mixed_emotions}
              confidence={results.confidence}
              analysisSummary={results.analysis_summary}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default TextAnalysis;
