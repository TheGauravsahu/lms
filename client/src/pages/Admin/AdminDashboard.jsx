import AdminSidebar from "@/components/admin-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ProfileDropdown from "@/components/profile-dropdown";
import MyCourses from "./MyCourses";

const AdminDashboard = () => {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className="w-full">
        <nav className="w-full flex items-center justify-between px-4 sticky top-0 right-0 bg-background">
          <SidebarTrigger />
         <ProfileDropdown />
        </nav>

        <MyCourses />
      </main>
    </SidebarProvider>
  );
};

export default AdminDashboard;
