interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent";
  className?: string;
}

export function Badge({ children, variant = "primary", className = "" }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium uppercase tracking-wider";
  
  const variants = {
    primary: "bg-surface-2 text-text-2 border border-border",
    secondary: "bg-white/10 text-white backdrop-blur-sm",
    accent: "bg-accent text-white",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
