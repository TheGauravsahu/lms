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
import {
  LogOut,
  User2,
  FolderOpen,
  LayoutDashboard,
  Settings,
  ShieldCheck,
} from "lucide-react";
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
          {user.role === "ADMIN" && (
            <DropdownMenuLabel
              onClick={() => navigate("/admin")}
              className="flex items-center gap-1 cursor-pointer text-orange-500 hover:bg-secondary hover:rounded-sm transition-all font-semibold text-sm"
            >
              <ShieldCheck className="w-4" />
              Admin Panel
            </DropdownMenuLabel>
          )}
          <DropdownMenuLabel
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 cursor-pointer hover:bg-secondary hover:rounded-sm transition-all font-medium text-sm"
          >
            <LayoutDashboard className="w-4" />
            Dashboard
          </DropdownMenuLabel>
          <DropdownMenuLabel
            onClick={() => navigate("/my-account")}
            className="flex items-center gap-2 cursor-pointer hover:bg-secondary hover:rounded-sm transition-all font-medium text-sm"
          >
            <User2 className="w-4" />
            My Account
          </DropdownMenuLabel>
          <DropdownMenuLabel
            onClick={() => navigate("/my-courses")}
            className="flex items-center gap-2 cursor-pointer hover:bg-secondary hover:rounded-sm transition-all font-medium text-sm"
          >
            <FolderOpen className="w-4" />
            My Courses
          </DropdownMenuLabel>
          <DropdownMenuLabel
            onClick={() => navigate("/setting")}
            className="flex items-center gap-2 cursor-pointer hover:bg-secondary hover:rounded-sm transition-all font-medium text-sm"
          >
            <Settings className="w-4" />
            Settings
          </DropdownMenuLabel>
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
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
