import { Loader } from "@/components/ui/loader";

export default function DashboardLoading() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader size="lg" />
    </div>
  );
}
