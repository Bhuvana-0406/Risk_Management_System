import Customer from '../models/Customer.js';
import Return from '../models/Return.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const calculateRiskScore = (totalOrders, totalReturns) => {
  if (totalOrders === 0) return 0; 
  const returnRate = (totalReturns / totalOrders) * 100;
  return Math.min(Math.round(returnRate), 100);
};

const getRiskCategory = (score) => {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};


const formatTimeAgo = (date) => {
  if (!date) return 'N/A';
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};



const getDashboardData = asyncHandler(async (req, res) => {

  const customers = await Customer.find({});
  // Fetch recent returns and populate customer details
  // Only fetch returns from the last 30 days for "recent"
  const recentReturnsFromDB = await Return.find({
    returnDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  })
    .sort({ returnDate: -1 }) 
    .limit(10) 
    .populate('customer', 'customerId name totalOrders totalReturns'); 

  // Initialize dashboard stats
  let totalCustomers = customers.length;
  let totalOrdersAcrossAllCustomers = 0;
  let totalReturnsAcrossAllCustomers = 0;
  let highRiskCustomerCount = 0;
  let lowRiskCustomerCount = 0;
  let mediumRiskCustomerCount = 0;

  const highRiskCustomersList = [];
  const recentReturnsListFormatted = []; // To store formatted recent return info

  // Simulate revenue impact (placeholder, as you don't have product prices)
  let revenueImpact = Math.floor(Math.random() * 100000) + 20000; // Random value for demonstration

  // Process customers to calculate stats and identify high-risk
  customers.forEach(customer => {
    totalOrdersAcrossAllCustomers += customer.totalOrders;
    totalReturnsAcrossAllCustomers += customer.totalReturns;

    const riskScore = calculateRiskScore(customer.totalOrders, customer.totalReturns);
    const riskCategory = getRiskCategory(riskScore);

    // Count risk categories
    if (riskCategory === 'high') {
      highRiskCustomerCount++;
    } else if (riskCategory === 'medium') {
      mediumRiskCustomerCount++;
    } else {
      lowRiskCustomerCount++;
    }

    // Add to high risk list if applicable
    if (riskCategory === 'high') {
      highRiskCustomersList.push({
        id: customer.customerId,
        name: customer.name,
        riskScore: riskScore,
        returns: customer.totalReturns,
        totalOrders: customer.totalOrders,
      });
    }
  });

  // Format recent returns from DB
  recentReturnsFromDB.forEach(returnItem => {
    // Ensure customer is populated and not null
    const customerData = returnItem.customer;
    if (customerData) {
      recentReturnsListFormatted.push({
        id: returnItem.returnId,
        customer: customerData.name,
        product: returnItem.product,
        reason: returnItem.reason,
        // Calculate risk score for the customer associated with this return
        riskScore: calculateRiskScore(customerData.totalOrders, customerData.totalReturns),
        time: formatTimeAgo(returnItem.returnDate)
      });
    }
  });

  highRiskCustomersList.sort((a, b) => b.riskScore - a.riskScore);


  const overallReturnRate = totalOrdersAcrossAllCustomers > 0
    ? ((totalReturnsAcrossAllCustomers / totalOrdersAcrossAllCustomers) * 100).toFixed(1)
    : '0.0';

  // Simulate change (for now, hardcode or generate random small changes)
  const generateRandomChange = () => (Math.random() * 5 - 2.5).toFixed(1); // -2.5% to +2.5%
  const generateRandomTrend = () => (Math.random() > 0.5 ? 'up' : 'down');

  const stats = [
    {
      title: "Total Customers",
      value: totalCustomers.toLocaleString(),
      change: `${generateRandomTrend() === 'up' ? '+' : ''}${generateRandomChange()}%`,
      trend: generateRandomTrend(),
      icon: 'Users', 
      color: "text-blue-600",
    },
    {
      title: "Return Rate",
      value: `${overallReturnRate}%`,
      change: `${generateRandomTrend() === 'up' ? '+' : ''}${generateRandomChange()}%`,
      trend: generateRandomTrend(),
      icon: 'TrendingDown',
      color: "text-green-600",
    },
    {
      title: "High Risk Customers",
      value: highRiskCustomerCount.toLocaleString(),
      change: `${generateRandomTrend() === 'up' ? '+' : ''}${generateRandomChange()}%`,
      trend: generateRandomTrend(),
      icon: 'AlertTriangle',
      color: "text-red-600",
    },
    {
      title: "Revenue Impact",
      value: `$${revenueImpact.toLocaleString()}`, 
      change: `${generateRandomTrend() === 'up' ? '+' : ''}${generateRandomChange()}%`,
      trend: generateRandomTrend(),
      icon: 'DollarSign',
      color: "text-purple-600",
    },
  ];

  const totalCustomersForPercentage = totalCustomers > 0 ? totalCustomers : 1; // Avoid division by zero
  const lowRiskPercentage = ((lowRiskCustomerCount / totalCustomersForPercentage) * 100).toFixed(1);
  const mediumRiskPercentage = ((mediumRiskCustomerCount / totalCustomersForPercentage) * 100).toFixed(1);
  const highRiskPercentage = ((highRiskCustomerCount / totalCustomersForPercentage) * 100).toFixed(1);

  const riskDistribution = [
    {
      label: "Low Risk (0-39)",
      count: lowRiskCustomerCount.toLocaleString(),
      percentage: lowRiskPercentage,
      color: "text-green-500",
    },
    {
      label: "Medium Risk (40-69)",
      count: mediumRiskCustomerCount.toLocaleString(),
      percentage: mediumRiskPercentage,
      color: "text-yellow-500",
    },
    {
      label: "High Risk (70-100)",
      count: highRiskCustomerCount.toLocaleString(),
      percentage: highRiskPercentage,
      color: "text-red-500",
    },
  ];



  res.status(200).json(
    new ApiResponse(
      200,
      {
        stats,
        highRiskCustomers: highRiskCustomersList.slice(0, 5), 
        recentReturns: recentReturnsListFormatted.slice(0, 4), 
        riskDistribution,
      },
      'Dashboard data fetched successfully'
    )
  );
});

export { getDashboardData };
