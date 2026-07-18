const handleDownload = async (reportId: string) => {
  try {
    const response = await fetch(`/api/generate-report?reportId=${reportId}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to generate report");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportId}-report.csv`; // file name
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
  }
};



// import { Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  FileText,
  Calendar,
  TrendingUp,
  Users,
  AlertTriangle,
  DollarSign,
  BarChart3,
} from "lucide-react";

const Reports = () => {
  const reportTemplates = [
    {
      id: "risk-summary",
      name: "Customer Risk Summary",
      description:
        "Comprehensive report of all customer risk scores and patterns",
      icon: Users,
      frequency: "Weekly",
      lastGenerated: "2024-01-15",
      downloadCount: 45,
      type: "PDF",
    },
    {
      id: "return-analysis",
      name: "Return Analysis Report",
      description: "Detailed analysis of return patterns, reasons, and trends",
      icon: TrendingUp,
      frequency: "Monthly",
      lastGenerated: "2024-01-01",
      downloadCount: 23,
      type: "Excel",
    },
    {
      id: "high-risk-alerts",
      name: "High Risk Customer Alerts",
      description: "List of customers flagged as high risk requiring attention",
      icon: AlertTriangle,
      frequency: "Daily",
      lastGenerated: "2024-01-15",
      downloadCount: 89,
      type: "PDF",
    },
    {
      id: "financial-impact",
      name: "Financial Impact Assessment",
      description: "Revenue impact analysis of returns and risk mitigation",
      icon: DollarSign,
      frequency: "Monthly",
      lastGenerated: "2024-01-01",
      downloadCount: 12,
      type: "Excel",
    },
    {
      id: "category-insights",
      name: "Category Performance Insights",
      description:
        "Product category breakdown with return rates and risk scores",
      icon: BarChart3,
      frequency: "Bi-weekly",
      lastGenerated: "2024-01-08",
      downloadCount: 34,
      type: "PDF",
    },
    {
      id: "trend-forecast",
      name: "Trend Forecasting Report",
      description:
        "Predictive analysis of return patterns and risk projections",
      icon: FileText,
      frequency: "Quarterly",
      lastGenerated: "2024-01-01",
      downloadCount: 8,
      type: "PDF",
    },
  ];

  // const scheduledReports = [
  //   {
  //     name: "Daily Risk Alerts",
  //     nextRun: "2024-01-16 09:00",
  //     recipients: ["admin@ecommerce.com", "risk@ecommerce.com"],
  //     status: "active",
  //   },
  //   {
  //     name: "Weekly Summary",
  //     nextRun: "2024-01-22 08:00",
  //     recipients: ["admin@ecommerce.com", "management@ecommerce.com"],
  //     status: "active",
  //   },
  //   {
  //     name: "Monthly Deep Dive",
  //     nextRun: "2024-02-01 10:00",
  //     recipients: ["admin@ecommerce.com", "analytics@ecommerce.com"],
  //     status: "paused",
  //   },
  // ];

  const getFrequencyBadge = (frequency: string) => {
    switch (frequency) {
      case "Daily":
        return {
          variant: "default" as const,
          color: "bg-blue-100 text-blue-800",
        };
      case "Weekly":
        return {
          variant: "secondary" as const,
          color: "bg-green-100 text-green-800",
        };
      case "Monthly":
        return {
          variant: "outline" as const,
          color: "bg-purple-100 text-purple-800",
        };
      case "Quarterly":
        return {
          variant: "destructive" as const,
          color: "bg-orange-100 text-orange-800",
        };
      default:
        return {
          variant: "outline" as const,
          color: "bg-gray-100 text-gray-800",
        };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Reports & Analytics
          </h2>
          <p className="text-muted-foreground">
            Generate and schedule comprehensive business reports
          </p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="daily">Daily Reports</SelectItem>
              <SelectItem value="weekly">Weekly Reports</SelectItem>
              <SelectItem value="monthly">Monthly Reports</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Custom Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Reports Generated
                </p>
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Auto Downloads
                </p>
                <p className="text-2xl font-bold">89</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Scheduled reports
                </p>
              </div>
              <Download className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Schedules
                </p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Running reports
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Data Points
                </p>
                <p className="text-2xl font-bold">2.4M</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total analyzed
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>
            Pre-configured reports ready to generate or schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((report) => {
              const Icon = report.icon;
              const frequencyBadge = getFrequencyBadge(report.frequency);

              return (
                <Card
                  key={report.id}
                  className="h-full flex flex-col justify-between group hover:shadow-md transition-shadow bg-muted text-foreground"
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-2">
                          {report.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {report.description}
                        </p>

                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={frequencyBadge.color}>
                            {report.frequency}
                          </Badge>
                          <Badge variant="outline">{report.type}</Badge>
                        </div>

                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Last generated: {report.lastGenerated}</div>
                          <div>Downloads: {report.downloadCount}</div>
                        </div>
                      </div>
                    </div>

                    {/* ✅ Button Section - Updated to stay inside card */}
                  <div className="flex gap-2 mt-auto pt-2">
                      <Button size="sm" className="flex-1"onClick={() => handleDownload(report.id)}>
                        <Download className="h-3 w-3 mr-1" />
                        Generate
                      </Button>
                  </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

     
      {/* Recent Downloads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Downloads</CardTitle>
          <CardDescription>
            Latest generated reports and downloads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: "High Risk Customer Alerts",
                date: "2024-01-15 14:30",
                size: "2.3 MB",
                type: "PDF",
              },
              {
                name: "Weekly Risk Summary",
                date: "2024-01-15 09:00",
                size: "4.1 MB",
                type: "Excel",
              },
              {
                name: "Return Analysis Report",
                date: "2024-01-14 16:45",
                size: "1.8 MB",
                type: "PDF",
              },
              {
                name: "Category Performance",
                date: "2024-01-14 11:20",
                size: "3.2 MB",
                type: "Excel",
              },
              {
                name: "Daily Risk Alerts",
                date: "2024-01-14 09:00",
                size: "856 KB",
                type: "PDF",
              },
            ].map((download, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{download.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {download.date} • {download.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{download.type}</Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
