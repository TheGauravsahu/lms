import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Phone, Shield, Save, Loader2 } from "lucide-react";

const ProfileSettings = () => {
  const user = useAuthStore((state) => state.user);
  const editAccountMutation = authApi.useEditAccount();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    editAccountMutation.mutate({
      account_id: user._id,
      edit: {
        name: name.trim(),
        email: email.trim(),
      },
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account profile details and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Overview */}
        <div className="bg-card border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-xs">
          <Avatar className="w-24 h-24 border-2 border-orange-500/20 shadow-md">
            <AvatarFallback className="bg-linear-to-b from-orange-400 to-red-500 text-white text-3xl font-bold">
              {user.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-4 font-bold text-xl">{user.name}</h2>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            {user.role} Account
          </p>

          <div className="w-full border-t my-6" />

          <div className="w-full space-y-4 text-left text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className="w-4 h-4 text-orange-500" />
              <span>{user.mobile_no}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="w-4 h-4 text-orange-500" />
              <span className="truncate">{user.email || "No email set"}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2 bg-card border rounded-xl p-6 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="font-bold text-lg border-b pb-3">Edit Profile</h3>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-sm"
              />
            </div>

            {/* Read-only account information */}
            <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-lg border">
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Mobile Number
                </Label>
                <div className="text-sm font-semibold mt-1 text-muted-foreground">
                  {user.mobile_no}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Account Role
                </Label>
                <div className="text-sm font-semibold mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={editAccountMutation.isPending}
                className="bg-linear-to-b from-orange-400 to-red-500 text-white cursor-pointer hover:shadow-md transition-all rounded-sm flex items-center gap-2"
              >
                {editAccountMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
