import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useAuthStore } from "@/store/auth";
import { LogOut } from "lucide-react";
import { User2 } from "lucide-react";
import { FolderOpen } from "lucide-react";
import { useNavigate } from "react-router";

const UserDropdown = ({ user }) => {
  const navigate = useNavigate();
  const logout = useAuthStore.getState().logout;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mr-6 mt-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel
            onClick={() => navigate("/my-account")}
            className="flex items-center gap-2 cursor-pointer hover:bg-secondary hover:rounded-sm transition-all"
          >
            <User2 className="w-4" />
            My Account
          </DropdownMenuLabel>
          <DropdownMenuLabel
            onClick={() => navigate("/my-courses")}
            className="flex items-center gap-2 cursor-pointer  hover:bg-secondary hover:rounded-sm transition-all"
          >
            <FolderOpen className="w-4" />
            My Courses
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel
            onClick={() => logout()}
            className="flex items-center gap-2 text-destructive cursor-pointer  hover:bg-red-100 hover:rounded-sm transition-all"
          >
            <LogOut className="w-4" />
            Logout
          </DropdownMenuLabel>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
