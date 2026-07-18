import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "../lib/api";
import { useToast } from "@/hooks/use-toast";


interface CustomerData {
  id: string; // Mongoose _id
  customerId: string;
  name: string;
  email: string;
  address: string;
  totalOrders: number;
  totalReturns: number;
  returnRate: number; // Percentage, e.g., 18.3
  riskScore: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High'; // Matches backend string
  totalSpent: number; // Simulated
  lastReturnDate?: string; // Date string
  createdAt: string;
  updatedAt: string;
  avgReturnTime?: number; 
  commonReasons?: string[]; 
  flags?: string[]; 
}

interface ApiResponseWrapper {
  statusCode: number;
  data: CustomerData[]; 
  message: string;
  success: boolean;
}

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>("All");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const { toast } = useToast();

  const { data: apiResponse, isLoading, isError, error } = useQuery<ApiResponseWrapper, Error>({
    queryKey: ['customers', searchTerm, riskLevelFilter],
    queryFn: () => getCustomers({ search: searchTerm, riskLevel: riskLevelFilter === 'All' ? undefined : riskLevelFilter }),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });

  const customers = apiResponse?.data || [];

  console.log("Customers component - isLoading:", isLoading);
  console.log("Customers component - isError:", isError);
  console.log("Customers component - error:", error);
  console.log("Customers component - received apiResponse (raw data from query):", apiResponse);
  console.log("Customers component - extracted customer array (apiResponse?.data):", apiResponse?.data);
  console.log("Customers component - 'customers' variable (after nesting fix):", customers);
  console.log("Customers component - customers.length (after nesting fix):", customers.length);


  const getRiskBadge = (score: number) => {
    if (score >= 70) return { variant: "destructive" as const, label: "High Risk", color: "text-red-600" };
    if (score >= 40) return { variant: "secondary" as const, label: "Medium Risk", color: "text-yellow-600" };
    return { variant: "default" as const, label: "Low Risk", color: "text-green-600" };
  };

  const handleExportCsv = () => {
    if (customers.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no customers matching the current filters to export.",
        variant: "default",
      });
      return;
    }

    const headers = [
      "Customer ID", "Name", "Email", "Address", "Total Orders",
      "Total Returns", "Return Rate (%)", "Risk Score", "Risk Level",
      "Total Spent ($)", "Last Return Date", "Created At", "Updated At"
    ];

    const csvRows = customers.map(customer => {
      return [
        `"${customer.customerId}"`,
        `"${customer.name}"`,
        `"${customer.email}"`,
        `"${customer.address || 'N/A'}"`,
        customer.totalOrders,
        customer.totalReturns,
        customer.returnRate.toFixed(1),
        customer.riskScore,
        `"${customer.riskLevel}"`,
        customer.totalSpent.toFixed(2),
        customer.lastReturnDate ? new Date(customer.lastReturnDate).toLocaleDateString() : 'N/A',
        new Date(customer.createdAt).toLocaleDateString(),
        new Date(customer.updatedAt).toLocaleDateString(),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'customer_risk_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    toast({
      title: "Export Successful",
      description: `${customers.length} customer records exported to CSV.`,
    });
  };

  const handleViewDetails = (customer: CustomerData) => {
    setSelectedCustomer({
      ...customer,
      avgReturnTime: Math.random() * 10 + 1, // Simulate 1-11 days
      commonReasons: Math.random() > 0.5 ? ["Defective", "Not as described"] : ["Wrong size/color", "Changed mind"],
      flags: Math.random() > 0.7 ? ["Multiple defective claims", "Quick returns"] : [],
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-foreground">
        <p>Loading customers...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] text-red-500">
        <p>Error loading customers: {error?.message || "An unknown error occurred"}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search customers..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Risk Levels</SelectItem>
              <SelectItem value="High">High Risk (70+)</SelectItem>
              <SelectItem value="Medium">Medium Risk (40-69)</SelectItem>
              <SelectItem value="Low">Low Risk (0-39)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleExportCsv} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Customer Risk Analysis
            <Badge variant="secondary">{customers.length} customers</Badge>
          </CardTitle>
          <CardDescription>
            Monitor customer return patterns and risk scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Return Rate</TableHead>
                  <TableHead>Orders/Returns</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length > 0 ? (
                  customers.map((customer) => {
                    const riskBadge = getRiskBadge(customer.riskScore);
                    return (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">{customer.email}</div>
                            <div className="text-xs text-muted-foreground">{customer.customerId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge {...riskBadge}>{customer.riskScore}</Badge>
                            {customer.riskLevel === "High" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={riskBadge.color}>{customer.returnRate.toFixed(1)}%</span>
                            {customer.returnRate > 50 ? (
                              <TrendingUp className="h-4 w-4 text-red-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {customer.totalOrders} orders / {customer.totalReturns} returns
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">${customer.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </TableCell>
                        <TableCell>
                          {/* Dialog for View Details */}
                          <Dialog onOpenChange={(open) => !open && setSelectedCustomer(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(customer)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            {selectedCustomer && ( // Only render DialogContent if selectedCustomer is not null
                              <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto"> {/* Adjusted max-w and added scrollability */}
                                <DialogHeader>
                                  <DialogTitle>Customer Profile: {selectedCustomer.name}</DialogTitle>
                                  <DialogDescription>
                                    Detailed insights into {selectedCustomer.name}'s return behavior.
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                                  {/* Left Column: Risk Score & Core Details */}
                                  <div className="space-y-4">
                                    <Card className="text-center">
                                      <CardContent className="pt-6">
                                        <div className="text-5xl font-bold mb-2 text-foreground">{selectedCustomer.riskScore}</div>
                                        <Badge {...getRiskBadge(selectedCustomer.riskScore)} className="text-base py-1 px-3">
                                          {getRiskBadge(selectedCustomer.riskScore).label}
                                        </Badge>
                                        <Progress value={selectedCustomer.riskScore} className="mt-4 h-3 bg-muted" color={getRiskBadge(selectedCustomer.riskScore).color.replace('text-', 'bg-')} /> {/* Dynamic progress bar color */}
                                        <p className="text-xs text-muted-foreground mt-2">Risk score based on return patterns.</p>
                                      </CardContent>
                                    </Card>

                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                      <div className="col-span-2 flex justify-between items-center py-1 border-b border-border">
                                        <Label className="text-muted-foreground">Customer ID:</Label>
                                        <span className="font-medium text-foreground">{selectedCustomer.customerId}</span>
                                      </div>
                                      <div className="col-span-2 flex justify-between items-center py-1 border-b border-border">
                                        <Label className="text-muted-foreground">Email:</Label>
                                        <span className="text-foreground">{selectedCustomer.email}</span>
                                      </div>
                                      <div className="col-span-2 flex justify-between items-center py-1 border-b border-border">
                                        <Label className="text-muted-foreground">Address:</Label>
                                        <span className="text-foreground text-right">{selectedCustomer.address || 'N/A'}</span>
                                      </div>
                                      <div className="col-span-2 flex justify-between items-center py-1 border-b border-border">
                                        <Label className="text-muted-foreground">Joined Date:</Label>
                                        <span className="text-foreground">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                                      </div>
                                      <div className="col-span-2 flex justify-between items-center py-1">
                                        <Label className="text-muted-foreground">Last Updated:</Label>
                                        <span className="text-foreground">{new Date(selectedCustomer.updatedAt).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right Column: Key Stats & Additional Info */}
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <Card className="text-center">
                                        <CardContent className="pt-4">
                                          <div className="text-3xl font-bold text-foreground">{selectedCustomer.totalReturns}</div>
                                          <div className="text-sm text-muted-foreground">Total Returns</div>
                                        </CardContent>
                                      </Card>
                                      <Card className="text-center">
                                        <CardContent className="pt-4">
                                          <div className="text-3xl font-bold text-foreground">{selectedCustomer.returnRate.toFixed(1)}%</div>
                                          <div className="text-sm text-muted-foreground">Return Rate</div>
                                        </CardContent>
                                      </Card>
                                      <Card className="text-center col-span-full"> {/* Make this span full width */}
                                        <CardContent className="pt-4">
                                          <div className="text-3xl font-bold text-foreground">
                                            {selectedCustomer.avgReturnTime ? selectedCustomer.avgReturnTime.toFixed(1) : 'N/A'}
                                          </div>
                                          <div className="text-sm text-muted-foreground">Avg Return Days</div>
                                        </CardContent>
                                      </Card>
                                    </div>

                                    {/* Risk Flags */}
                                    <Card>
                                      <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Risk Flags</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        {selectedCustomer.flags && selectedCustomer.flags.length > 0 ? (
                                          <div className="flex flex-wrap gap-2">
                                            {selectedCustomer.flags.map((flag: string, index: number) => (
                                              <Badge key={index} variant="destructive" className="text-xs">
                                                {flag}
                                              </Badge>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-sm text-muted-foreground">No specific risk flags identified.</p>
                                        )}
                                      </CardContent>
                                    </Card>

                                    {/* Common Return Reasons */}
                                    <Card>
                                      <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Common Return Reasons</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        {selectedCustomer.commonReasons && selectedCustomer.commonReasons.length > 0 ? (
                                          <div className="flex flex-wrap gap-2">
                                            {selectedCustomer.commonReasons.map((reason: string, index: number) => (
                                              <Badge key={index} variant="outline" className="text-xs">
                                                {reason}
                                              </Badge>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-sm text-muted-foreground">No common return reasons recorded.</p>
                                        )}
                                      </CardContent>
                                    </Card>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button type="button" onClick={() => setSelectedCustomer(null)} variant="outline">Close</Button>
                                </DialogFooter>
                              </DialogContent>
                            )}
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No customers found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
