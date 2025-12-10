import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEmotionHistory } from "@/hooks/useEmotionHistory";
import { useImageEmotionModel } from "@/hooks/useImageEmotionModel";
import { Brain, ArrowLeft, Camera, CameraOff, Loader2, RefreshCw, Download } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";
import EmotionResults from "@/components/EmotionResults";
import ModelLoadingProgress from "@/components/ModelLoadingProgress";

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

const VideoAnalysis = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveAnalysis } = useEmotionHistory();
  const { loadModel, analyzeImage, isLoading: isModelLoading, modelReady, loadingProgress } = useImageEmotionModel();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<EmotionData | null>(null);

  // Load model on mount
  useEffect(() => {
    loadModel().catch(error => {
      console.error("Failed to preload model:", error);
    });
  }, [loadModel]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOn(true);
        setHasPermission(true);
      }
    } catch (error: any) {
      console.error("Camera error:", error);
      setHasPermission(false);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to use video emotion detection.",
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

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsAnalyzing(true);
    setResults(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Could not get canvas context");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Use the canvas directly for analysis
      const data = await analyzeImage(canvas);

      setResults(data);
      await saveAnalysis("video", data);
      toast({
        title: "Analysis complete",
        description: `Detected primary emotion: ${data.dominant_emotion}`,
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [analyzeImage, saveAnalysis, toast]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

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
              Video Analysis
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
              <span className="gradient-text">Video Emotion</span> Detection
            </h1>
            <p className="text-lg text-muted-foreground">
              Powered by Vision Transformer (ViT) - runs locally in your browser
            </p>
          </div>

          {/* Model Loading Progress */}
          {isModelLoading && (
            <div className="mb-6">
              <ModelLoadingProgress 
                modelName="Vision Transformer (ViT)" 
                progress={loadingProgress} 
                isLoading={isModelLoading} 
              />
            </div>
          )}

          {/* Model Status */}
          {!isModelLoading && (
            <div className="mb-6 p-4 rounded-xl bg-card border border-border/50 animate-fade-up">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${modelReady ? "bg-green-500" : "bg-yellow-500"} animate-pulse`} />
                <span className="text-sm text-muted-foreground">
                  {modelReady 
                    ? "Vision Transformer model loaded - Ready for local inference" 
                    : "Model not loaded - Click analyze to load"}
                </span>
                {!modelReady && (
                  <Button variant="outline" size="sm" onClick={() => loadModel()}>
                    <Download className="w-4 h-4 mr-2" />
                    Load Model
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Camera Section */}
          <div
            className="p-6 rounded-2xl bg-card border border-border/50 card-shadow mb-8 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            {/* Video Feed */}
            <div className="relative aspect-video bg-background/50 rounded-xl overflow-hidden mb-4">
              {!isCameraOn ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <Camera className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg">Camera is off</p>
                  <p className="text-sm mt-2">
                    {hasPermission === false
                      ? "Camera access was denied. Please enable it in your browser settings."
                      : "Click 'Start Camera' to begin"}
                  </p>
                </div>
              ) : null}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraOn ? "" : "hidden"}`}
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-foreground">Analyzing emotions...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 justify-center">
              {!isCameraOn ? (
                <Button variant="gradient" onClick={startCamera}>
                  <Camera className="mr-2 h-4 w-4" />
                  Start Camera
                </Button>
              ) : (
                <>
                  <Button variant="secondary" onClick={stopCamera}>
                    <CameraOff className="mr-2 h-4 w-4" />
                    Stop Camera
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={captureAndAnalyze}
                    disabled={isAnalyzing || isModelLoading}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Capture & Analyze
                      </>
                    )}
                  </Button>
                </>
              )}
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

export default VideoAnalysis;
