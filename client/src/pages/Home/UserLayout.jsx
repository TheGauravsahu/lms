import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router";
import UserDropdown from "@/components/auth/user-dropdown";
import CommandMenu from "@/components/home/command-menu";
import UserSidebar from "@/components/home/user-sidebar";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/api/authApi";
import LoginModal from "@/components/auth/login-modal";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

const UserLayout = () => {
  const { token, user, login } = useAuthStore();
  
  // Fetch latest account details (triggers streak calculation) on mount / layout load
  const { data: latestUser } = authApi.useGetAccountDetails();

  useEffect(() => {
    if (latestUser && token) {
      login({ token, user: latestUser });
    }
  }, [latestUser, token, login]);

  return (
    <SidebarProvider>
      <UserSidebar />
      <main className="w-full">
        <nav className="w-full flex items-center justify-between px-4 sticky top-0 right-0 bg-background z-90">
          <SidebarTrigger />
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <CommandMenu />
            </div>
            <ThemeToggle />

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
        <div className="p-4 md:p-8 pr-2">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default UserLayout;
