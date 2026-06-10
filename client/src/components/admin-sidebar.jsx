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
import { BookCopy, CloudDownload, Users, LayoutPanelLeft,Settings } from "lucide-react";

const items = [
  {
    title: "Dashboard",
    icon: LayoutPanelLeft,
  },
  {
    title: "Courses",
    icon: BookCopy,
  },
  {
    title: "Students",
    icon: Users,
  },
  {
    title: "Upload",
    icon: CloudDownload,
  },
  {
    title: "Settings",
    icon: Settings,
  },
];

const AdminSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="p-0 px-4 pt-4">
        <div className="flex items-center gap-1">
          <div className="w-8 overflow-hidden">
            <img src="./icon.png" alt="icon" className="w-full h-full" />
          </div>
          <h1 className="tracking-tight font-semibold t">
            Gaurav <span className="text-muted-foreground">LMS</span>
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-1">
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
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

export default AdminSidebar;
