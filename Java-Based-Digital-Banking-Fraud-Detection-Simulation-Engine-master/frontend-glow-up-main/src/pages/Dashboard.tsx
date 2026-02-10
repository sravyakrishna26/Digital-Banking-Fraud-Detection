import { useState, useEffect } from "react";
import StatCard from "@/components/StatCard";
import AppNavbar from "@/components/layout/AppNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Smartphone,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getDashboardSummary,
  getFraudTrends,
  getChannelWiseFraud,
  getLocationWiseFraud,
  type DashboardSummary as DashboardSummaryType,
  type FraudTrend,
  type ChannelWiseFraud,
  type LocationWiseFraud,
} from "@/services/transactionApi";

const Dashboard = () => {
  const [summary, setSummary] = useState<DashboardSummaryType | null>(null);
  const [fraudTrends, setFraudTrends] = useState<FraudTrend[]>([]);
  const [channelWiseData, setChannelWiseData] = useState<ChannelWiseFraud[]>([]);
  const [locationWiseData, setLocationWiseData] = useState<LocationWiseFraud[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [summaryResult, trendsResult, channelResult, locationResult] = await Promise.all([
        getDashboardSummary(),
        getFraudTrends(),
        getChannelWiseFraud(),
        getLocationWiseFraud(),
      ]);

      if (summaryResult.success && summaryResult.data) {
        setSummary(summaryResult.data);
      } else {
        setError(summaryResult.error || "Failed to fetch dashboard summary");
      }

      if (trendsResult.success && trendsResult.data) {
        // Format dates for display
        const formattedTrends = trendsResult.data.map((trend) => ({
          ...trend,
          date: new Date(trend.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        }));
        setFraudTrends(formattedTrends.reverse()); // Reverse to show oldest first
      }

      if (channelResult.success && channelResult.data) {
        setChannelWiseData(channelResult.data);
      }

      if (locationResult.success && locationResult.data) {
        setLocationWiseData(locationResult.data.slice(0, 10)); // Top 10 locations
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar active="dashboard" onRefresh={fetchDashboardData} refreshing={loading} />

      <main className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="card-elevated p-4 bg-destructive/10 border-destructive/20 animate-fade-in">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* KPI Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 animate-fade-in">
          <StatCard
            icon={BarChart3}
            value={summary?.totalTransactions ?? 0}
            label="Total Transactions"
            variant="info"
          />
          <StatCard
            icon={AlertTriangle}
            value={summary?.fraudTransactions ?? 0}
            label="Fraud Transactions"
            variant="danger"
          />
          <StatCard
            icon={CheckCircle2}
            value={summary?.successTransactions ?? 0}
            label="Success"
            variant="success"
          />
          <StatCard
            icon={XCircle}
            value={summary?.failedTransactions ?? 0}
            label="Failed"
            variant="danger"
          />
          <StatCard
            icon={Clock}
            value={summary?.pendingTransactions ?? 0}
            label="Pending"
            variant="warning"
          />
        </section>

        {/* Fraud Percentage Card */}
        {summary && (
          <section className="animate-fade-in" style={{ animationDelay: "50ms" }}>
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Fraud Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-destructive">
                    {summary.fraudPercentage.toFixed(2)}%
                  </span>
                  <span className="text-muted-foreground">
                    ({summary.fraudTransactions} of {summary.totalTransactions} transactions)
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fraud Trends Line Chart */}
          <Card className="card-elevated animate-fade-in" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Fraud Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fraudTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={fraudTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="fraudCount"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Fraud Count"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  {loading ? "Loading..." : "No fraud trend data available"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Channel-wise Bar Chart */}
          <Card className="card-elevated animate-fade-in" style={{ animationDelay: "150ms" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Channel-wise Fraud
              </CardTitle>
            </CardHeader>
            <CardContent>
              {channelWiseData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={channelWiseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="fraudCount" fill="#ef4444" name="Fraud" />
                    <Bar dataKey="nonFraudCount" fill="#22c55e" name="Non-Fraud" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  {loading ? "Loading..." : "No channel-wise data available"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Location-wise Table */}
        <Card className="card-elevated animate-fade-in" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Top Locations with Fraud
            </CardTitle>
          </CardHeader>
          <CardContent>
            {locationWiseData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Location</th>
                      <th className="text-right py-3 px-4 font-semibold text-muted-foreground">
                        Fraud Count
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-muted-foreground">
                        Total Transactions
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-muted-foreground">
                        Fraud Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationWiseData.map((location, index) => {
                      const fraudRate =
                        location.totalTransactions > 0
                          ? ((location.fraudCount / location.totalTransactions) * 100).toFixed(2)
                          : "0.00";
                      return (
                        <tr
                          key={index}
                          className="border-b hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium">{location.location}</td>
                          <td className="py-3 px-4 text-right text-destructive font-semibold">
                            {location.fraudCount}
                          </td>
                          <td className="py-3 px-4 text-right">{location.totalTransactions}</td>
                          <td className="py-3 px-4 text-right">{fraudRate}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                {loading ? "Loading..." : "No location-wise data available"}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
