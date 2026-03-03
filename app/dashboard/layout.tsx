import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background font-landing">
            {/* Sidebar — desktop only */}
            <div className="hidden h-full w-60 flex-shrink-0 flex-col border-r border-border md:flex">
                <DashboardSidebar />
            </div>

            {/* Main: header + content */}
            <div className="flex flex-1 flex-col min-w-0">
                <DashboardHeader user={session.user} />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
