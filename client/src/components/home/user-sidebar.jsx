import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, Settings, Folder, LayoutDashboard, ShieldCheck, Brain, Trophy, Code2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/store/auth";

const items = [
  {
    title: "Home",
    icon: Home,
    href: "/",
  },
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "My Courses",
    icon: Folder,
    href: "/my-courses",
  },
  {
    title: "Quizzes",
    icon: Brain,
    href: "/quizzes",
  },
  {
    title: "Playground",
    icon: Code2,
    href: "/sandbox",
  },
  {
    title: "Leaderboard",
    icon: Trophy,
    href: "/leaderboard",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/setting",
  },
];

const UserSidebar = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const menuItems = [...items];
  if (user && user.role === "ADMIN") {
    menuItems.push({
      title: "Admin Panel",
      icon: ShieldCheck,
      href: "/admin",
    });
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-0 px-4 pt-4">
        <div className="flex items-center gap-1">
          <div className="w-8 overflow-hidden">
            <img src="/icon.png" alt="lms_icon" className="w-full h-full" />
          </div>
          <h1 className="tracking-tight font-semibold t">
            Gaurav <span className="text-muted-foreground">LMS</span>
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-1">
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem
                key={item.title}
                onClick={() => navigate(item.href)}
              >
                <SidebarMenuButton className="cursor-pointer gap-4 text-muted-foreground">
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};

export default UserSidebar;
