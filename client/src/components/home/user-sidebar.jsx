import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Home, Settings, Folder, LayoutDashboard, ShieldCheck, Brain, Trophy, Code2, MessageSquare, UsersRound, GitPullRequest, Megaphone, Search, CalendarDays, Download, PlaySquare } from "lucide-react";
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
    title: "Announcements",
    icon: Megaphone,
    href: "/announcements",
  },
  {
    title: "Search Knowledge",
    icon: Search,
    href: "/search",
  },
];

const productivityItems = [
  { title: "Planner & Deadlines", icon: CalendarDays, href: "/productivity/calendar" },
  { title: "Download Handouts", icon: Download, href: "/productivity/resources" },
  { title: "Watch Queue", icon: PlaySquare, href: "/productivity/watch-later" },
];

const communityItems = [
  { title: "Forums", icon: MessageSquare, href: "/forums" },
  { title: "Study Groups", icon: UsersRound, href: "/study-groups" },
  { title: "Peer Reviews", icon: GitPullRequest, href: "/peer-reviews" },
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
        <div className="flex items-center justify-between w-full pr-2">
          <div className="flex items-center gap-1">
            <div className="w-8 overflow-hidden">
              <img src="/icon.png" alt="lms_icon" className="w-full h-full" />
            </div>
            <h1 className="tracking-tight font-semibold">
              Gaurav <span className="text-muted-foreground">LMS</span>
            </h1>
          </div>
          {user && user.currentStreak > 0 && (
            <span className="bg-orange-500/15 text-orange-600 border border-orange-500/20 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-0.5 animate-pulse" title={`${user.currentStreak} Days Streak!`}>
              🔥 {user.currentStreak}d
            </span>
          )}
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
        <SidebarGroup>
          <SidebarGroupLabel>Community</SidebarGroupLabel>
          <SidebarMenu>
            {communityItems.map((item) => (
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
        
        <SidebarGroup>
          <SidebarGroupLabel>Productivity</SidebarGroupLabel>
          <SidebarMenu>
            {productivityItems.map((item) => (
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
