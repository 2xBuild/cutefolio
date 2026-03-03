"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MultiStepFormStep {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
}

interface MultiStepFormProps {
  steps: MultiStepFormStep[];
  className?: string;
}

export function MultiStepForm({ steps, className }: MultiStepFormProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const safeIndex = useMemo(() => {
    if (steps.length === 0) return 0;
    return Math.min(activeStepIndex, steps.length - 1);
  }, [activeStepIndex, steps.length]);

  if (steps.length === 0) return null;

  const activeStep = steps[safeIndex];
  const isFirstStep = safeIndex === 0;
  const isLastStep = safeIndex === steps.length - 1;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <Button
            key={step.id}
            type="button"
            size="sm"
            variant={index === safeIndex ? "flat" : "outline"}
            onClick={() => setActiveStepIndex(index)}
            className="gap-2"
          >
            <span className="text-xs text-muted-foreground">{index + 1}.</span>
            <span>{step.title}</span>
          </Button>
        ))}
      </div>

      {activeStep.description ? (
        <p className="text-sm text-muted-foreground">{activeStep.description}</p>
      ) : null}

      <div>{activeStep.content}</div>

      <div className="flex items-center justify-between border-t pt-4">
        <Button
          type="button"
          variant="flat"
          onClick={() => setActiveStepIndex((prev) => Math.max(prev - 1, 0))}
          disabled={isFirstStep}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <p className="text-xs text-muted-foreground">
          Step {safeIndex + 1} of {steps.length}
        </p>
        <Button
          type="button"
          variant="flat"
          onClick={() => setActiveStepIndex((prev) => Math.min(prev + 1, steps.length - 1))}
          disabled={isLastStep}
          className="gap-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
