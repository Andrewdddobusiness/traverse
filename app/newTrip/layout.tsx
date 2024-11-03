import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/appSidebar/appSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-col flex-1 min-h-[calc(100vh_-_theme(spacing.16))] w-full h-screen bg-muted">
        <SidebarTrigger className="m-4" />
        <div>{children}</div>
      </main>
    </SidebarProvider>
  );
}