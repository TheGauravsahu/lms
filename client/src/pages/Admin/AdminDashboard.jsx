import { adminApi } from "@/api/adminApi";
import { Loader2, Users, BookOpen, ShoppingCart, TrendingUp, ArrowUpRight } from "lucide-react";

// Simple SVG Area Chart component
const AreaChart = ({ data, width = 600, height = 160 }) => {
  if (!data || data.length === 0) return null;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const maxSales = Math.max(...data.map((d) => d.sales), 1);

  const toX = (i) => (i / (data.length - 1)) * width;
  const toYRevenue = (v) => height - (v / maxRevenue) * (height - 20) - 10;
  const toYSales = (v) => height - (v / maxSales) * (height - 20) - 10;

  const revenuePoints = data.map((d, i) => `${toX(i)},${toYRevenue(d.revenue)}`).join(" ");
  const salesPoints = data.map((d, i) => `${toX(i)},${toYSales(d.sales)}`).join(" ");

  const revenueArea = `${toX(0)},${height} ${revenuePoints} ${toX(data.length - 1)},${height}`;
  const salesArea = `${toX(0)},${height} ${salesPoints} ${toX(data.length - 1)},${height}`;

  const shortMonth = (key) => {
    const [y, m] = key.split("-");
    return new Date(Number(y), Number(m) - 1).toLocaleString("default", { month: "short" });
  };

  return (
    <svg viewBox={`0 0 ${width} ${height + 24}`} className="w-full">
      <defs>
        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Revenue Area */}
      <polygon points={revenueArea} fill="url(#revenueGrad)" />
      <polyline points={revenuePoints} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* Sales Area */}
      <polygon points={salesArea} fill="url(#salesGrad)" />
      <polyline points={salesPoints} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="6 3" />
      {/* Month labels */}
      {data.map((d, i) => (
        i % 2 === 0 && (
          <text key={d.month} x={toX(i)} y={height + 18} textAnchor="middle" fontSize="10" fill="#888">
            {shortMonth(d.month)}
          </text>
        )
      ))}
      {/* Data points */}
      {data.map((d, i) => (
        <circle key={`rev-${i}`} cx={toX(i)} cy={toYRevenue(d.revenue)} r="3" fill="#f97316" />
      ))}
    </svg>
  );
};

const AdminDashboard = () => {
  const { data, isPending } = adminApi.useGetDashboardStats();

  const statCards = data
    ? [
        {
          label: "Total Students",
          value: data.stats.totalStudents,
          icon: Users,
          color: "text-blue-500",
          bg: "bg-blue-50 dark:bg-blue-950/30",
          change: "+12%",
        },
        {
          label: "Total Courses",
          value: data.stats.totalCourses,
          icon: BookOpen,
          color: "text-orange-500",
          bg: "bg-orange-50 dark:bg-orange-950/30",
          change: "+3%",
        },
        {
          label: "Total Sales",
          value: data.stats.totalPurchases,
          icon: ShoppingCart,
          color: "text-green-500",
          bg: "bg-green-50 dark:bg-green-950/30",
          change: "+8%",
        },
        {
          label: "Total Revenue",
          value: `₹${data.stats.totalRevenue.toLocaleString("en-IN")}`,
          icon: TrendingUp,
          color: "text-purple-500",
          bg: "bg-purple-50 dark:bg-purple-950/30",
          change: "+15%",
        },
      ]
    : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your LMS platform activity and metrics.
        </p>
      </div>

      {/* Stats Cards */}
      {isPending ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border rounded-xl p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="bg-card border rounded-xl p-5 shadow-xs hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-lg ${card.bg}`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <span className="text-xs text-green-600 font-semibold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {card.change}
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-extrabold">{card.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart & Recent Purchases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-card border rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-lg">Revenue & Sales Trend</h2>
              <p className="text-xs text-muted-foreground">Last 12 months</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-orange-500 rounded-full" />
                Revenue
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-red-500 rounded-full" style={{ borderTop: "2px dashed #ef4444", background: "none" }} />
                Sales
              </div>
            </div>
          </div>
          {isPending ? (
            <div className="h-44 animate-pulse bg-muted rounded-lg" />
          ) : (
            <AreaChart data={data?.monthlyChart} />
          )}
        </div>

        {/* Recent Purchases */}
        <div className="bg-card border rounded-xl p-6 shadow-xs">
          <h2 className="font-bold text-lg mb-4">Recent Purchases</h2>
          {isPending ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 animate-pulse bg-muted rounded-lg" />
              ))}
            </div>
          ) : data?.recentPurchases?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No purchases yet.</p>
          ) : (
            <div className="space-y-3">
              {data?.recentPurchases?.map((p) => (
                <div key={p._id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{p.account_id?.name || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground truncate">{p.course_id?.title || "Course"}</div>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <div className="text-sm font-bold text-green-600">₹{p.total_price}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
