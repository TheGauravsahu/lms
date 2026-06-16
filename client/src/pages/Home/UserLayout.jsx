import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router";
import UserDropdown from "@/components/auth/user-dropdown";
import CommandMenu from "@/components/home/command-menu";
import UserSidebar from "@/components/home/user-sidebar";
import { useAuthStore } from "@/store/auth";
import LoginModal from "@/components/auth/login-modal";
import { Button } from "@/components/ui/button";

const UserLayout = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <SidebarProvider>
      <UserSidebar />
      <main className="w-full">
        <nav className="w-full flex items-center justify-between px-4 sticky top-0 right-0 bg-background z-9">
          <SidebarTrigger />
          <div className="flex items-center gap-4">
            <CommandMenu />

            {user ? (
              <UserDropdown user={user} />
            ) : (
              <LoginModal>
                <Button className="bg-linear-to-b from-orange-300 to-red-500 cursor-pointer rounded-sm">
                  Login/Register
                </Button>
              </LoginModal>
            )}
          </div>
        </nav>
        <div className="p-8 pr-2">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default UserLayout;
