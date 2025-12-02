import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Scan, MessageSquare, Video } from "lucide-react";
import AuthForm from "@/components/AuthForm";
import FloatingShapes from "@/components/FloatingShapes";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex dark">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-background overflow-hidden">
        <FloatingShapes />
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center glow-effect">
                <Brain className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="text-2xl font-display font-bold text-foreground">
                EmotiSense
              </span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-display font-bold text-foreground leading-tight mb-4">
              Secure Emotion
              <br />
              <span className="gradient-text">Detection System</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-md">
              Advanced AI-powered emotion analysis through text and video inputs.
              Understand sentiments with precision and security.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <FeatureItem
              icon={<MessageSquare className="w-5 h-5" />}
              title="Text Analysis"
              description="Analyze emotions from text inputs with high accuracy"
            />
            <FeatureItem
              icon={<Video className="w-5 h-5" />}
              title="Video Detection"
              description="Real-time facial emotion recognition from video feeds"
            />
            <FeatureItem
              icon={<Scan className="w-5 h-5" />}
              title="Secure Processing"
              description="End-to-end encrypted analysis for your privacy"
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-card">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold text-foreground">
                EmotiSense
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Secure Emotion Detection System
            </p>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <AuthForm />
        </div>
      </div>
    </div>
  );
};

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureItem = ({ icon, title, description }: FeatureItemProps) => (
  <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default Auth;
