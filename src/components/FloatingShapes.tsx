const FloatingShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top right glow */}
      <div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-30 animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, hsl(175 80% 50% / 0.4) 0%, transparent 70%)",
        }}
      />
      
      {/* Bottom left glow */}
      <div
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, hsl(190 85% 50% / 0.4) 0%, transparent 70%)",
          animationDelay: "1.5s",
        }}
      />

      {/* Floating elements */}
      <div
        className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-primary/40 animate-float"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full bg-accent/30 animate-float"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-primary/30 animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-1/3 left-1/3 w-4 h-4 rounded-full bg-accent/20 animate-float"
        style={{ animationDelay: "0.5s" }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
};

export default FloatingShapes;
