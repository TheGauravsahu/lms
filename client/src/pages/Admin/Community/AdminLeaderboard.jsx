import { studentApi } from "@/api/studentApi";
import { authApi } from "@/api/authApi";
import { Trophy, Crown, Medal, Star, Search, Award, Zap } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const BADGE_COLORS = {
  "Code Explorer": "bg-orange-500/15 text-orange-400 border-orange-500/25",
  "Web Creator": "bg-blue-500/15 text-blue-400 border-blue-500/25",
  "Quiz Champion": "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  "Quiz Taker": "bg-green-500/15 text-green-400 border-green-500/25",
  "Course Reviewer": "bg-purple-500/15 text-purple-400 border-purple-500/25",
  default: "bg-muted text-muted-foreground border-border",
};

const getRankIcon = (rank) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">#{rank}</span>;
};

const AdminLeaderboard = () => {
  const [search, setSearch] = useState("");
  const { data: leaderboard = [], isLoading } = studentApi.useGetLeaderboard();

  const filtered = leaderboard.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const topThree = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Top 10 students ranked by XP. Updates every 5 minutes (Redis cached).</p>
        </div>
        <span className="px-3 py-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-sm font-bold">
          {filtered.length} leaders
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..." className="pl-9 bg-card border-border/60" />
      </div>

      {/* Top 3 Podium */}
      {!isLoading && topThree.length >= 1 && (
        <div className="grid grid-cols-3 gap-4">
          {/* 2nd place */}
          {topThree[1] && (
            <div className="bg-card border border-border/50 rounded-2xl p-5 flex flex-col items-center gap-3 mt-8 order-1">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-xl font-bold uppercase">
                  {topThree[1].name?.[0]}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-400 flex items-center justify-center text-white text-xs font-black">2</div>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm text-foreground">{topThree[1].name}</p>
                <p className="text-xs text-muted-foreground">{topThree[1].email}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-400/10 border border-slate-400/20 rounded-full px-3 py-1">
                <Zap className="w-3 h-3 text-slate-300" />
                <span className="text-sm font-black text-slate-300">{topThree[1].xp} XP</span>
              </div>
              <div className="flex flex-wrap gap-1 justify-center">
                {topThree[1].badges?.slice(0, 2).map((b) => (
                  <span key={b} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${BADGE_COLORS[b] || BADGE_COLORS.default}`}>{b}</span>
                ))}
              </div>
            </div>
          )}

          {/* 1st place */}
          {topThree[0] && (
            <div className="bg-gradient-to-b from-yellow-500/10 to-amber-500/5 border border-yellow-500/30 rounded-2xl p-5 flex flex-col items-center gap-3 order-2 shadow-lg shadow-yellow-500/10">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-2xl font-bold uppercase ring-2 ring-yellow-400/40">
                  {topThree[0].name?.[0]}
                </div>
                <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 text-yellow-400" />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-white text-xs font-black">1</div>
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground">{topThree[0].name}</p>
                <p className="text-xs text-muted-foreground">{topThree[0].email}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3 py-1">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-sm font-black text-yellow-400">{topThree[0].xp} XP</span>
              </div>
              <div className="flex flex-wrap gap-1 justify-center">
                {topThree[0].badges?.slice(0, 3).map((b) => (
                  <span key={b} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${BADGE_COLORS[b] || BADGE_COLORS.default}`}>{b}</span>
                ))}
              </div>
            </div>
          )}

          {/* 3rd place */}
          {topThree[2] && (
            <div className="bg-card border border-border/50 rounded-2xl p-5 flex flex-col items-center gap-3 mt-12 order-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white text-lg font-bold uppercase">
                  {topThree[2].name?.[0]}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-black">3</div>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm text-foreground">{topThree[2].name}</p>
                <p className="text-xs text-muted-foreground">{topThree[2].email}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-600/10 border border-amber-600/20 rounded-full px-3 py-1">
                <Zap className="w-3 h-3 text-amber-600" />
                <span className="text-sm font-black text-amber-600">{topThree[2].xp} XP</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rest of leaderboard table */}
      {rest.length > 0 && (
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">Rank</th>
                  <th className="text-left text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">Student</th>
                  <th className="text-left text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">Badges</th>
                  <th className="text-right text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">XP</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((user, index) => (
                  <tr key={user._id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">{getRankIcon(index + 4)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-[10px] font-bold uppercase">
                          {user.name?.[0] || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-foreground">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.badges?.slice(0, 3).map((b) => (
                          <span key={b} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${BADGE_COLORS[b] || BADGE_COLORS.default}`}>{b}</span>
                        ))}
                        {user.badges?.length > 3 && (
                          <span className="text-[9px] text-muted-foreground">+{user.badges.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Zap className="w-3 h-3 text-orange-400" />
                        <span className="font-bold text-orange-400">{user.xp}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No students on the leaderboard yet.</div>
      )}
    </div>
  );
};

export default AdminLeaderboard;
