import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from "recharts";
import { TrendingUp, TrendingDown, Calendar, Download, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAnalyticsData } from "../lib/api";

// Define your interface types
interface Metric {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

interface MonthlyData {
  month: string;
  returns: number;
  riskScore: number;
  revenue: number;
}

interface CategoryData {
  category: string;
  returns: number;
  riskScore: number;
  color: string;
}

interface RiskDistribution {
  name: string;
  value: number;
  color: string;
  percentage: string;
}

interface ReturnReason {
  reason: string;
  count: number;
  percentage: string;
}

interface AnalyticsData {
  metrics: Metric[];
  monthlyData: MonthlyData[];
  riskDistribution: RiskDistribution[];
  categoryData: CategoryData[];
  topReasons: ReturnReason[];
}

interface ApiResponseData {
  statusCode: number;
  data: AnalyticsData;
  message: string;
  success: boolean;
}

const FALLBACK_DATA: AnalyticsData = {
  metrics: [
    { title: "Avg Risk Score", value: "0", change: "0%", trend: "down" },
    { title: "Return Rate", value: "0%", change: "0%", trend: "down" },
    { title: "High Risk %", value: "0%", change: "0%", trend: "down" },
    { title: "Revenue Impact", value: "$0K", change: "0%", trend: "down" }
  ],
  monthlyData: [
    { month: "Jan", returns: 0, riskScore: 0, revenue: 0 },
    { month: "Feb", returns: 0, riskScore: 0, revenue: 0 },
    { month: "Mar", returns: 0, riskScore: 0, revenue: 0 }
  ],
  riskDistribution: [
    { name: "Low Risk", value: 1, color: "#10B981", percentage: "33.3" },
    { name: "Medium Risk", value: 1, color: "#F59E0B", percentage: "33.3" },
    { name: "High Risk", value: 1, color: "#EF4444", percentage: "33.3" }
  ],
  categoryData: [
    { category: "No Data", returns: 0, riskScore: 0, color: "#6B7280" }
  ],
  topReasons: [
    { reason: "No Data", count: 0, percentage: "0" }
  ]
};
const Analytics = () => {
  const [timePeriod, setTimePeriod] = useState("12months");
  
  // Fetch analytics data
const { 
  data: apiResponse, 
  isLoading, 
  isError, 
  error,
  refetch
} = useQuery<ApiResponseData, Error>({
  queryKey: ['analyticsData', timePeriod],
  queryFn: async () => {
    try {
      console.log("Fetching analytics data for period:", timePeriod);
      const data = await getAnalyticsData(timePeriod);
      console.log("API Response:", data);
      console.log("API Response type:", typeof data);
      console.log("API Response keys:", data ? Object.keys(data) : 'null');
      console.log("API Response.data:", data?.data);
      return data;
    } catch (error) {
      console.error("Error in queryFn:", error);
      throw error instanceof Error 
        ? error 
        : new Error("Failed to fetch analytics data");
    }
  },
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  retry: 1,
  retryDelay: 1000,
});
  
  // Extract data from API response
  const { 
  metrics = FALLBACK_DATA.metrics, 
  monthlyData = FALLBACK_DATA.monthlyData, 
  riskDistribution = FALLBACK_DATA.riskDistribution,
  categoryData = FALLBACK_DATA.categoryData,
  topReasons = FALLBACK_DATA.topReasons
} = apiResponse?.data || FALLBACK_DATA;
  
  // Handle time period change
  const handlePeriodChange = (value: string) => {
    setTimePeriod(value);
  };
  
useEffect(() => {
  console.log("Analytics component mounted, checking connection to backend");
  
  // Test API endpoint directly
  fetch('http://localhost:5000/api/analytics?period=12months')
    .then(res => {
      console.log('Direct API test response status:', res.status);
      return res.json();
    })
    .then(data => console.log('Direct API test data:', data))
    .catch(err => console.error('Direct API test error:', err));
    
  return () => console.log("Analytics component unmounted");
}, []);

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-foreground">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] text-red-500">
        <p>Error loading analytics: {error?.message || "An unknown error occurred"}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Deep insights into return patterns and risk trends</p>
        </div>
        <div className="flex gap-3">
          <Select value={timePeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="1month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <div className="flex items-center mt-1">
                    {metric.trend === "down" ? (
                      <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm ${metric.trend === "down" ? "text-green-600" : "text-red-600"}`}>
                      {metric.change} vs last period
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Return Trends</CardTitle>
            <CardDescription>Returns volume and average risk score over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="returns" fill="#3B82F6" name="Returns" />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="riskScore" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Avg Risk Score"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Risk Distribution</CardTitle>
            <CardDescription>Breakdown of customers by risk level</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-full" style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                      if (percent < 0.05) return null; // Only show label for sections > 5%
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                      const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                      return (
                        <text 
                          x={x} 
                          y={y} 
                          fill="#fff" 
                          textAnchor="middle" 
                          dominantBaseline="central"
                          fontSize={12}
                          fontWeight="bold"
                        >
                          {`${riskDistribution[index].percentage}%`}
                        </text>
                      );
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [props.payload.percentage + '%', name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-4 gap-6">
              {riskDistribution.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center">
                  <div style={{ 
                    width: 12, 
                    height: 12, 
                    backgroundColor: entry.color,
                    marginRight: 8,
                    borderRadius: 3 
                  }} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{entry.name}</span>
                    <span className="text-xs text-muted-foreground">{entry.percentage}% ({entry.value.toLocaleString()})</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Returns by Category</CardTitle>
            <CardDescription>Category-wise return analysis with risk scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="returns" fill="#3B82F6" name="Returns" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Return Reasons */}
        <Card>
          <CardHeader>
            <CardTitle>Top Return Reasons</CardTitle>
            <CardDescription>Most common reasons for returns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topReasons.map((reason, index) => (
                <div key={reason.reason} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium">{reason.reason}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{reason.count}</Badge>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {reason.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Risk Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Risk Analysis</CardTitle>
          <CardDescription>Detailed breakdown of return risks by product category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Total Returns</th>
                  <th className="text-left py-3 px-4 font-medium">Avg Risk Score</th>
                  <th className="text-left py-3 px-4 font-medium">Risk Level</th>
                  <th className="text-left py-3 px-4 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((category) => {
                  const getRiskLevel = (score: number) => {
                    if (score >= 50) return { label: "High", variant: "destructive" as const };
                    if (score >= 30) return { label: "Medium", variant: "secondary" as const };
                    return { label: "Low", variant: "default" as const };
                  };
                  
                  const riskLevel = getRiskLevel(category.riskScore);
                  
                  return (
                    <tr key={category.category} className="border-b">
                      <td className="py-3 px-4 font-medium">{category.category}</td>
                      <td className="py-3 px-4">{category.returns}</td>
                      <td className="py-3 px-4">{category.riskScore.toFixed(1)}</td>
                      <td className="py-3 px-4">
                        <Badge variant={riskLevel.variant}>{riskLevel.label}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        {category.riskScore > 40 ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;