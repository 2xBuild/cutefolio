import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Loader({ className, size = "md" }: LoaderProps) {
  const sizeMap = {
    sm: "h-4 w-4 border-[1.5px]",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-[2.5px]",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-none border-muted-foreground/25 border-t-foreground",
        sizeMap[size],
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
