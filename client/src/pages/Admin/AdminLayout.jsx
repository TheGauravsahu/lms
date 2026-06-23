import AdminSidebar from "@/components/admin-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ProfileDropdown from "@/components/profile-dropdown";
import { Outlet } from "react-router";
import AdminCommandMenu from "@/components/admin/admin-command-menu";
import ThemeToggle from "@/components/ThemeToggle";

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className="w-full">
        <nav className="w-full flex items-center justify-between px-4 sticky top-0 right-0 bg-background z-9">
          <SidebarTrigger />
          <div className="flex items-center gap-4">
            <AdminCommandMenu />
            <ThemeToggle />
            <ProfileDropdown />
          </div>
        </nav>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default AdminLayout;
