import { Progress } from "@/components/ui/progress";
import { Brain, Loader2 } from "lucide-react";

interface ModelLoadingProgressProps {
  modelName: string;
  progress: number;
  isLoading: boolean;
}

const ModelLoadingProgress = ({ modelName, progress, isLoading }: ModelLoadingProgressProps) => {
  if (!isLoading) return null;

  return (
    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 animate-fade-up">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Brain className="w-4 h-4 text-primary animate-pulse" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Loading {modelName}</p>
          <p className="text-xs text-muted-foreground">
            Downloading model weights for local inference...
          </p>
        </div>
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground mt-2 text-right">{progress}%</p>
    </div>
  );
};

export default ModelLoadingProgress;
