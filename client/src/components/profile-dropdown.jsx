import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
// import { useNavigate } from "react-router";
import { useAuthStore } from "@/store/auth";
import { LogOut } from "lucide-react";
import { LayoutDashboard } from "lucide-react";
import { Folder } from "lucide-react";

const ProfileDropdown = () => {
  // const navigate = useNavigate();
  const user = useAuthStore.getState().user;
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
          <DropdownMenuLabel className="flex items-center gap-2  cursor-pointer  transition-all">
            <LayoutDashboard className="w-4" />
            Dashboard
          </DropdownMenuLabel>
          <DropdownMenuLabel className="flex items-center gap-2  cursor-pointer  transition-all">
            <Folder className="w-4" />
            Courses
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel
          onClick={() => logout()}
          className="flex items-center gap-2 text-destructive cursor-pointer  hover:bg-red-100 hover:rounded-sm transition-all"
        >
          <LogOut className="w-4" />
          Logout
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
