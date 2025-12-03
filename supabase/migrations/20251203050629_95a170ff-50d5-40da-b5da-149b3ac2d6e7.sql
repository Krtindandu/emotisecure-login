-- Create enum for analysis type
CREATE TYPE public.analysis_type AS ENUM ('text', 'video', 'combined');

-- Create table for emotion analysis history
CREATE TABLE public.emotion_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type analysis_type NOT NULL,
  input_text TEXT,
  dominant_emotion TEXT NOT NULL,
  confidence NUMERIC(5, 2) NOT NULL,
  emotions JSONB NOT NULL,
  mixed_emotions TEXT[],
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.emotion_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own analyses" 
ON public.emotion_analyses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses" 
ON public.emotion_analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses" 
ON public.emotion_analyses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_emotion_analyses_user_id ON public.emotion_analyses(user_id);
CREATE INDEX idx_emotion_analyses_created_at ON public.emotion_analyses(created_at DESC);