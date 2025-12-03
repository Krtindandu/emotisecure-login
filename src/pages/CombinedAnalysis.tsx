import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEmotionHistory } from "@/hooks/useEmotionHistory";
import { Brain, ArrowLeft, Play, Loader2, Camera, Video, VideoOff } from "lucide-react";
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

const CombinedAnalysis = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveAnalysis } = useEmotionHistory();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [textResults, setTextResults] = useState<EmotionData | null>(null);
  const [videoResults, setVideoResults] = useState<EmotionData | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        streamRef.current = mediaStream;
        setIsCameraOn(true);
      }
      toast({ title: "Camera started", description: "Camera is ready for capture." });
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to use video analysis.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
  };

  const handleCombinedAnalysis = async () => {
    if (!text.trim() && !isCameraOn) {
      toast({
        title: "No input",
        description: "Please enter text and/or enable camera for analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setTextResults(null);
    setVideoResults(null);

    const promises: Promise<void>[] = [];

    // Text analysis
    if (text.trim()) {
      promises.push(
        supabase.functions
          .invoke("analyze-emotion", { body: { type: "text", text: text.trim() } })
          .then(async ({ data, error }) => {
            if (error) throw error;
            setTextResults(data);
            await saveAnalysis("combined", data, text.trim());
          })
          .catch((error) => {
            console.error("Text analysis error:", error);
            toast({ title: "Text analysis failed", description: error.message, variant: "destructive" });
          })
      );
    }

    // Video analysis
    if (isCameraOn) {
      const imageBase64 = captureFrame();
      if (imageBase64) {
        promises.push(
          supabase.functions
            .invoke("analyze-emotion", { body: { type: "image", imageBase64 } })
            .then(async ({ data, error }) => {
              if (error) throw error;
              setVideoResults(data);
              await saveAnalysis("combined", data);
            })
            .catch((error) => {
              console.error("Video analysis error:", error);
              toast({ title: "Video analysis failed", description: error.message, variant: "destructive" });
            })
        );
      }
    }

    await Promise.all(promises);
    setIsAnalyzing(false);

    toast({ title: "Analysis complete", description: "Both analyses finished." });
  };

  return (
    <div className="min-h-screen bg-background dark">
      <FloatingShapes />
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center glow-effect">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">Combined Analysis</span>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 animate-fade-up">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              <span className="gradient-text">Combined</span> Emotion Analysis
            </h1>
            <p className="text-lg text-muted-foreground">
              Analyze text and facial expressions simultaneously for comprehensive results
            </p>
          </div>

          {/* Input Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Text Input */}
            <div className="p-6 rounded-2xl bg-card border border-border/50 card-shadow animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">📝</span>
                Text Input
              </h3>
              <Textarea
                placeholder="Enter your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] bg-background/50 border-border/50 resize-none"
              />
              <span className="text-sm text-muted-foreground mt-2 block">{text.length} characters</span>
            </div>

            {/* Video Input */}
            <div className="p-6 rounded-2xl bg-card border border-border/50 card-shadow animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </span>
                Video Input
              </h3>
              <div className="relative aspect-video bg-muted rounded-xl overflow-hidden mb-4">
                {!isCameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Camera off</p>
                    </div>
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isCameraOn ? "" : "hidden"}`}
                />
              </div>
              <Button variant={isCameraOn ? "destructive" : "secondary"} onClick={isCameraOn ? stopCamera : startCamera} className="w-full">
                {isCameraOn ? (
                  <>
                    <VideoOff className="mr-2 h-4 w-4" /> Stop Camera
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" /> Start Camera
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Analyze Button */}
          <div className="flex justify-center mb-8">
            <Button
              variant="gradient"
              size="lg"
              onClick={handleCombinedAnalysis}
              disabled={isAnalyzing || (!text.trim() && !isCameraOn)}
              className="px-8"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" /> Run Combined Analysis
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          {(textResults || videoResults) && (
            <div className="grid md:grid-cols-2 gap-6">
              {textResults && (
                <div className="animate-fade-up">
                  <h3 className="text-xl font-semibold text-foreground mb-4 text-center">Text Emotion Results</h3>
                  <EmotionResults
                    emotions={textResults.emotions}
                    dominantEmotion={textResults.dominant_emotion}
                    mixedEmotions={textResults.mixed_emotions}
                    confidence={textResults.confidence}
                    analysisSummary={textResults.analysis_summary}
                  />
                </div>
              )}
              {videoResults && (
                <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
                  <h3 className="text-xl font-semibold text-foreground mb-4 text-center">Video Emotion Results</h3>
                  <EmotionResults
                    emotions={videoResults.emotions}
                    dominantEmotion={videoResults.dominant_emotion}
                    mixedEmotions={videoResults.mixed_emotions}
                    confidence={videoResults.confidence}
                    analysisSummary={videoResults.analysis_summary}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CombinedAnalysis;
