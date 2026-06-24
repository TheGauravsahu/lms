import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BookCopy,
  CloudDownload,
  Users,
  LayoutPanelLeft,
  Settings,
  Brain,
  MessageSquare,
  UsersRound,
  Code2,
  Trophy,
  Megaphone,
  Briefcase,
  Layers,
  History,
} from "lucide-react";
import { useNavigate } from "react-router";

const mainItems = [
  { title: "Dashboard", icon: LayoutPanelLeft, href: "/admin" },
  { title: "Courses", icon: BookCopy, href: "/admin/courses" },
  { title: "Students", icon: Users, href: "/admin/students" },
  { title: "Quizzes", icon: Brain, href: "/admin/quizzes" },
  { title: "Announcements", icon: Megaphone, href: "/admin/announcements" },
  { title: "Upload", icon: CloudDownload, href: "/admin/uploads" },
  { title: "Settings", icon: Settings, href: "/admin/setting" },
];

const communityItems = [
  { title: "Forums", icon: MessageSquare, href: "/admin/community/forums" },
  { title: "Study Groups", icon: UsersRound, href: "/admin/community/study-groups" },
  { title: "Peer Reviews", icon: Code2, href: "/admin/community/peer-reviews" },
];

const gamificationItems = [
  { title: "Leaderboard", icon: Trophy, href: "/admin/leaderboard" },
];

const careerItems = [
  { title: "Manage Jobs", icon: Briefcase, href: "/admin/jobs" },
  { title: "Flashcard Decks", icon: Layers, href: "/admin/flashcards" },
  { title: "Mock Interviews", icon: History, href: "/admin/interviews" },
];

const AdminSidebar = () => {
  const navigate = useNavigate();

  const renderItems = (items) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title} onClick={() => navigate(item.href)}>
        <SidebarMenuButton className="cursor-pointer gap-4 text-muted-foreground">
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar>
      <SidebarHeader className="p-0 px-4 pt-4">
        <div className="flex items-center gap-1">
          <div className="w-8 overflow-hidden">
            <img src="/icon.png" alt="lms_icon" className="w-full h-full" />
          </div>
          <h1 className="tracking-tight font-semibold">
            Gaurav <span className="text-muted-foreground">LMS</span>
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-1">
        <SidebarGroup>
          <SidebarMenu>{renderItems(mainItems)}</SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2 pb-1">
            Community
          </SidebarGroupLabel>
          <SidebarMenu>{renderItems(communityItems)}</SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2 pb-1">
            Gamification
          </SidebarGroupLabel>
          <SidebarMenu>{renderItems(gamificationItems)}</SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2 pb-1">
            Career & Productivity
          </SidebarGroupLabel>
          <SidebarMenu>{renderItems(careerItems)}</SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};

export default AdminSidebar;
