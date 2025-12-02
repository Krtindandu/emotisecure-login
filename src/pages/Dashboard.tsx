import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Brain, MessageSquare, Video, LogOut, Loader2 } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

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

          <div className="grid md:grid-cols-2 gap-6">
            {/* Text Analysis Card */}
            <div 
              className="group p-8 rounded-2xl bg-card border border-border/50 card-shadow hover:border-primary/50 transition-all duration-300 cursor-pointer animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                Text Emotion Analysis
              </h2>
              <p className="text-muted-foreground mb-6">
                Analyze emotions from text inputs using advanced NLP. Detect sentiment, mood, and emotional tone in written content.
              </p>
              <Button variant="gradient" className="w-full">
                Start Text Analysis
              </Button>
            </div>

            {/* Video Analysis Card */}
            <div 
              className="group p-8 rounded-2xl bg-card border border-border/50 card-shadow hover:border-primary/50 transition-all duration-300 cursor-pointer animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Video className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                Video Emotion Detection
              </h2>
              <p className="text-muted-foreground mb-6">
                Real-time facial emotion recognition from video. Detect expressions and emotions through your camera feed.
              </p>
              <Button variant="gradient" className="w-full">
                Start Video Analysis
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div 
            className="mt-12 p-6 rounded-2xl bg-card/50 border border-border/50 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">
              Your Analysis History
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold gradient-text">0</p>
                <p className="text-sm text-muted-foreground">Text Analyses</p>
              </div>
              <div>
                <p className="text-2xl font-bold gradient-text">0</p>
                <p className="text-sm text-muted-foreground">Video Sessions</p>
              </div>
              <div>
                <p className="text-2xl font-bold gradient-text">0</p>
                <p className="text-sm text-muted-foreground">Total Detections</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
