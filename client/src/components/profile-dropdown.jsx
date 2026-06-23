import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown, LogOut, LayoutDashboard, Folder, Settings } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/store/auth";

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore.getState().logout;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center justify-center gap-1 cursor-pointer">
          <Avatar>
            <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold">{user.name}</span>
          <ChevronDown className="w-4 ml-1" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mr-2 mt-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 cursor-pointer hover:bg-secondary hover:rounded-sm transition-all font-medium text-sm"
          >
            <LayoutDashboard className="w-4" />
            Dashboard
          </DropdownMenuLabel>
          <DropdownMenuLabel
            onClick={() => navigate("/admin/courses")}
            className="flex items-center gap-2 cursor-pointer hover:bg-secondary hover:rounded-sm transition-all font-medium text-sm"
          >
            <Folder className="w-4" />
            Courses
          </DropdownMenuLabel>
          <DropdownMenuLabel
            onClick={() => navigate("/admin/setting")}
            className="flex items-center gap-2 cursor-pointer hover:bg-secondary hover:rounded-sm transition-all font-medium text-sm"
          >
            <Settings className="w-4" />
            Settings
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="flex items-center gap-2 text-destructive cursor-pointer hover:bg-red-100 hover:rounded-sm transition-all font-medium text-sm"
        >
          <LogOut className="w-4" />
          Logout
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
