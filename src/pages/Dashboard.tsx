import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Brain, MessageSquare, Video, LogOut, Loader2, Layers, History, Trash2 } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface AnalysisRecord {
  id: string;
  analysis_type: "text" | "video" | "combined";
  dominant_emotion: string;
  confidence: number;
  created_at: string;
  input_text: string | null;
}

interface AnalysisCounts {
  text: number;
  video: number;
  combined: number;
  total: number;
}

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [counts, setCounts] = useState<AnalysisCounts>({ text: 0, video: 0, combined: 0, total: 0 });
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("emotion_analyses")
        .select("id, analysis_type, dominant_emotion, confidence, created_at, input_text")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      setHistory(data || []);

      // Calculate counts
      const { data: allData, error: countError } = await supabase
        .from("emotion_analyses")
        .select("analysis_type");

      if (!countError && allData) {
        const textCount = allData.filter(r => r.analysis_type === "text").length;
        const videoCount = allData.filter(r => r.analysis_type === "video").length;
        const combinedCount = allData.filter(r => r.analysis_type === "combined").length;
        setCounts({
          text: textCount,
          video: videoCount,
          combined: combinedCount,
          total: allData.length,
        });
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const deleteAnalysis = async (id: string) => {
    try {
      const { error } = await supabase.from("emotion_analyses").delete().eq("id", id);
      if (error) throw error;
      fetchHistory();
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text": return <MessageSquare className="w-4 h-4" />;
      case "video": return <Video className="w-4 h-4" />;
      case "combined": return <Layers className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      <FloatingShapes />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center glow-effect">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">
              EmotiSense
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-up">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Welcome to <span className="gradient-text">EmotiSense</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose an emotion detection method to get started
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Text Analysis Card */}
            <div 
              className="group p-8 rounded-2xl bg-card border border-border/50 card-shadow hover:border-primary/50 transition-all duration-300 cursor-pointer animate-fade-up"
              style={{ animationDelay: "0.1s" }}
              onClick={() => navigate("/text-analysis")}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                Text Analysis
              </h2>
              <p className="text-muted-foreground mb-6 text-sm">
                Analyze emotions from text using advanced AI sentiment detection.
              </p>
              <Button variant="gradient" className="w-full">
                Start
              </Button>
            </div>

            {/* Video Analysis Card */}
            <div 
              className="group p-8 rounded-2xl bg-card border border-border/50 card-shadow hover:border-primary/50 transition-all duration-300 cursor-pointer animate-fade-up"
              style={{ animationDelay: "0.2s" }}
              onClick={() => navigate("/video-analysis")}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Video className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                Video Analysis
              </h2>
              <p className="text-muted-foreground mb-6 text-sm">
                Real-time facial emotion recognition through your camera.
              </p>
              <Button variant="gradient" className="w-full">
                Start
              </Button>
            </div>

            {/* Combined Analysis Card */}
            <div 
              className="group p-8 rounded-2xl bg-card border border-border/50 card-shadow hover:border-primary/50 transition-all duration-300 cursor-pointer animate-fade-up"
              style={{ animationDelay: "0.3s" }}
              onClick={() => navigate("/combined-analysis")}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                Combined Analysis
              </h2>
              <p className="text-muted-foreground mb-6 text-sm">
                Run text and video emotion analysis simultaneously.
              </p>
              <Button variant="gradient" className="w-full">
                Start
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div 
            className="mt-12 p-6 rounded-2xl bg-card/50 border border-border/50 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">
              Your Analysis Summary
            </h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold gradient-text">{counts.text}</p>
                <p className="text-sm text-muted-foreground">Text</p>
              </div>
              <div>
                <p className="text-2xl font-bold gradient-text">{counts.video}</p>
                <p className="text-sm text-muted-foreground">Video</p>
              </div>
              <div>
                <p className="text-2xl font-bold gradient-text">{counts.combined}</p>
                <p className="text-sm text-muted-foreground">Combined</p>
              </div>
              <div>
                <p className="text-2xl font-bold gradient-text">{counts.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </div>

          {/* History Section */}
          <div 
            className="mt-8 p-6 rounded-2xl bg-card/50 border border-border/50 animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <History className="w-5 h-5" />
              Recent Analysis History
            </h3>
            
            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No analyses yet. Start analyzing to see your history here.
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {getTypeIcon(record.analysis_type)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground capitalize">
                          {record.dominant_emotion}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {record.analysis_type} • {Math.round(record.confidence)}% confidence
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(record.created_at), "MMM d, h:mm a")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteAnalysis(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
