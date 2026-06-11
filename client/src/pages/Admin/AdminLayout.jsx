import AdminSidebar from "@/components/admin-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ProfileDropdown from "@/components/profile-dropdown";
import { Outlet } from "react-router";

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className="w-full">
        <nav className="w-full flex items-center justify-between px-4 sticky top-0 right-0 bg-background">
          <SidebarTrigger />
          <ProfileDropdown />
        </nav>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default AdminLayout;
