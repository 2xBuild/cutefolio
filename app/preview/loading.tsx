import { Loader } from "@/components/ui/loader";

export default function PreviewLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader size="lg" />
    </div>
  );
}
