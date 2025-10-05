import { SidebarProvider } from "@/components/ui/sidebar"
import { cookies } from "next/headers";
import Header from "@/components/header";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "false" ? false : true

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      {/**<AppSidebar /> */}      
      <main className="w-full">
        <Header />
        {/**<SidebarTrigger /> */}
        <div className="p-6 w-full sm:pt-28 pt-40 flex flex-col gap-4">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}