// backend/controllers/return.controller.js
import Return from '../models/Return.js';
import Customer from '../models/Customer.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import ReturnRisk from '../models/ReturnRisk.js';
import { sendApprovalMail, sendRejectionMail } from '../utils/mailer.js';

// Helper function to calculate risk score (reused from customer controller)
const calculateRiskScore = (totalOrders, totalReturns) => {
  if (totalOrders === 0) return 0;
  const returnRate = (totalReturns / totalOrders) * 100;
  return Math.min(Math.round(returnRate), 100);
};

const getReturnStats = asyncHandler(async (req, res) => {
  const totalReturnsCount = await Return.countDocuments();
  const pendingCount = await Return.countDocuments({ status: 'Pending' });
  const approvedCount = await Return.countDocuments({ status: 'Approved' });
  const rejectedCount = await Return.countDocuments({ status: 'Rejected' });
  
  const customers = await Customer.find({});
  let highRiskReturnCount = 0;
  customers.forEach(customer => {
    const riskScore = calculateRiskScore(customer.totalOrders, customer.totalReturns);
    if (riskScore >= 70) {
      highRiskReturnCount += customer.totalReturns;
    }
  });

  const stats = {
    total: totalReturnsCount,
    pending: pendingCount,
    approved: approvedCount,
    rejected: rejectedCount,
    highRisk: highRiskReturnCount,
  };

  res.status(200).json(new ApiResponse(200, stats, 'Return stats fetched successfully'));
});


/**
 * @function getReturns
 * @description Fetches a list of returns with optional search and filtering.
 * @route GET /api/returns
 * @access Private (Admin only)
 * @query search - Optional search term for customer, product, or reason
 * @query status - Optional filter by status ('Pending', 'Approved', 'Rejected')
 */
const getReturns = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const query = {};
  
  if (search) {
    query.$or = [
      { customerName: { $regex: search, $options: 'i' } },
      { product: { $regex: search, $options: 'i' } },
      { reason: { $regex: search, $options: 'i' } },
    ];
  }

  if (status && status !== 'All') {
    query.status = status;
  }

  // Fetch returns from DB and populate customer details to get risk data
  const returns = await Return.find(query)
    .sort({ returnDate: -1 })
    .populate('customer', 'totalOrders totalReturns'); // Populate only needed fields

  const processedReturns = returns.map(returnItem => {
    // Get the populated customer object
    const customer = returnItem.customer;
    const riskScore = customer ? calculateRiskScore(customer.totalOrders, customer.totalReturns) : 0;
    
    return {
      id: returnItem._id,
      returnId: returnItem.returnId,
      orderId: returnItem.orderId,
      customerId: returnItem.customerId,
      customer: returnItem.customerName,
      product: returnItem.product,
      reason: returnItem.reason,
      status: returnItem.status,
      riskScore: riskScore,
      flags: returnItem.flags || [],
      productPrice: returnItem.productPrice,
    };
  });

  res.status(200).json(new ApiResponse(200, processedReturns, 'Returns fetched successfully'));
});


const getReturnById = asyncHandler(async (req, res) => {
  const returnId = req.params.id;

  const returnItem = await Return.findById(returnId).populate('customer', 'customerId email name');

  if (!returnItem) {
    throw new ApiError(404, 'Return not found');
  }

  const customer = returnItem.customer;
  const riskScore = customer ? calculateRiskScore(customer.totalOrders, customer.totalReturns) : 0;
  
  const returnDetails = {
    id: returnItem._id,
    returnId: returnItem.returnId,
    orderId: returnItem.orderId,
    product: {
      name: returnItem.product,
      sku: returnItem.productSku || 'N/A',
      category: returnItem.productCategory || 'N/A',
      price: returnItem.productPrice,
    },
    customer: {
      name: returnItem.customerName,
      email: customer?.email || 'N/A',
      id: customer?.customerId || 'N/A',
    },
    reason: returnItem.reason,
    status: returnItem.status,
    riskScore: riskScore,
    requestDate: returnItem.returnDate.toLocaleDateString('en-US'),
    responseTime: returnItem.responseTime || 'N/A',
    images: returnItem.images || [],
    adminNotes: returnItem.adminNotes || 'No notes available.',
    flags: returnItem.flags || [],
  };

  res.status(200).json(new ApiResponse(200, returnDetails, 'Return details fetched successfully'));
});


/**
 * @function approveReturn
 * @description Approves a return request and sends email to customer
 * @route POST /api/returns/:id/approve
 * @access Private (Admin only)
 */
const approveReturn = asyncHandler(async (req, res) => {
  try {
    const returnId = req.params.id;
    console.log(`🚀 APPROVE CONTROLLER STARTED - Return ID: ${returnId}`);
    console.log(`🚀 Request User:`, req.user);

    // Find the return by ID and populate customer data
    console.log(`🔍 Searching for return with ID: ${returnId}`);
    const returnItem = await Return.findById(returnId).populate('customer', 'email name customerId');
    console.log(`🔍 Found return:`, returnItem ? 'YES' : 'NO');

    if (!returnItem) {
      console.log(`❌ Return not found with ID: ${returnId}`);
      return res.status(404).json({
        success: false,
        message: 'Return not found'
      });
    }

    console.log(`✅ Return found: ${returnItem.returnId}`);
    console.log(`📧 Customer populated:`, returnItem.customer ? 'YES' : 'NO');
    console.log(`📧 Customer email:`, returnItem.customer?.email);

    // Check if already approved
    if (returnItem.status === 'Approved') {
      console.log(`⚠️ Return already approved: ${returnItem.returnId}`);
      return res.status(400).json({
        success: false,
        message: 'Return is already approved'
      });
    }

    // Update return status to approved
    console.log(`📝 Updating return status to Approved...`);
    returnItem.status = 'Approved';
    returnItem.responseTime = new Date().toISOString();
    await returnItem.save();
    console.log(`✅ Return status updated successfully`);

    // Get customer email
    const customerEmail = returnItem.customer?.email;
    const customerName = returnItem.customer?.name;
    
    console.log(`📧 Customer Email: ${customerEmail}`);
    console.log(`👤 Customer Name: ${customerName}`);
    
    if (!customerEmail) {
      console.log(`❌ Customer email not found for return: ${returnItem.returnId}`);
      return res.status(400).json({
        success: false,
        message: 'Customer email not found'
      });
    }

    try {
      // Send approval email
      console.log(`📤 Attempting to send email to: ${customerEmail}`);
      console.log(`📤 Return ID for email: ${returnItem.returnId}`);
      console.log(`📤 Customer name for email: ${customerName}`);
      
      const emailResult = await sendApprovalMail(customerEmail, returnItem.returnId, customerName);
      console.log(`✅ Email sent successfully:`, emailResult.messageId);
      
      const responseData = {
        success: true,
        data: { 
          returnId: returnItem.returnId,
          status: returnItem.status,
          customerEmail: customerEmail,
          customerName: customerName
        }, 
        message: 'Return approved and email sent successfully'
      };
      
      console.log(`📤 Sending response:`, responseData);
      return res.status(200).json(responseData);
      
    } catch (emailError) {
      console.error(`❌ Email sending failed:`, emailError);
      console.error(`❌ Email error stack:`, emailError.stack);
      
      // Revert the status change if email fails
      console.log(`🔄 Reverting return status to Pending...`);
      returnItem.status = 'Pending';
      await returnItem.save();
      console.log(`🔄 Status reverted successfully`);
      
      return res.status(500).json({
        success: false,
        message: `Return approval failed: ${emailError.message}`
      });
    }
  } catch (error) {
    console.error(`💥 APPROVE CONTROLLER ERROR:`, error);
    console.error(`💥 Error stack:`, error.stack);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


/**
 * @function rejectReturn
 * @description Rejects a return request and sends email to customer
 * @route POST /api/returns/:id/reject
 * @access Private (Admin only)
 */
const rejectReturn = asyncHandler(async (req, res) => {
  try {
    const returnId = req.params.id;
    console.log(`🚀 REJECT CONTROLLER STARTED - Return ID: ${returnId}`);
    console.log(`🚀 Request User:`, req.user);

    // Find the return by ID and populate customer data
    console.log(`🔍 Searching for return with ID: ${returnId}`);
    const returnItem = await Return.findById(returnId).populate('customer', 'email name customerId');
    console.log(`🔍 Found return:`, returnItem ? 'YES' : 'NO');

    if (!returnItem) {
      console.log(`❌ Return not found with ID: ${returnId}`);
      return res.status(404).json({
        success: false,
        message: 'Return not found'
      });
    }

    console.log(`✅ Return found: ${returnItem.returnId}`);
    console.log(`📧 Customer populated:`, returnItem.customer ? 'YES' : 'NO');
    console.log(`📧 Customer email:`, returnItem.customer?.email);

    // Check if already rejected
    if (returnItem.status === 'Rejected') {
      console.log(`⚠️ Return already rejected: ${returnItem.returnId}`);
      return res.status(400).json({
        success: false,
        message: 'Return is already rejected'
      });
    }

    // Update return status to rejected
    console.log(`📝 Updating return status to Rejected...`);
    returnItem.status = 'Rejected';
    returnItem.responseTime = new Date().toISOString();
    await returnItem.save();
    console.log(`✅ Return status updated successfully`);

    // Get customer email
    const customerEmail = returnItem.customer?.email;
    const customerName = returnItem.customer?.name;
    
    console.log(`📧 Customer Email: ${customerEmail}`);
    console.log(`👤 Customer Name: ${customerName}`);
    
    if (!customerEmail) {
      console.log(`❌ Customer email not found for return: ${returnItem.returnId}`);
      return res.status(400).json({
        success: false,
        message: 'Customer email not found'
      });
    }

    try {
      // Send rejection email
      console.log(`📤 Attempting to send rejection email to: ${customerEmail}`);
      console.log(`📤 Return ID for email: ${returnItem.returnId}`);
      console.log(`📤 Customer name for email: ${customerName}`);
      
      const emailResult = await sendRejectionMail(customerEmail, returnItem.returnId, customerName);
      console.log(`✅ Rejection email sent successfully:`, emailResult.messageId);
      
      const responseData = {
        success: true,
        data: { 
          returnId: returnItem.returnId,
          status: returnItem.status,
          customerEmail: customerEmail,
          customerName: customerName
        }, 
        message: 'Return rejected and email sent successfully'
      };
      
      console.log(`📤 Sending response:`, responseData);
      return res.status(200).json(responseData);
      
    } catch (emailError) {
      console.error(`❌ Email sending failed:`, emailError);
      console.error(`❌ Email error stack:`, emailError.stack);
      
      // Revert the status change if email fails
      console.log(`🔄 Reverting return status to Pending...`);
      returnItem.status = 'Pending';
      await returnItem.save();
      console.log(`🔄 Status reverted successfully`);
      
      return res.status(500).json({
        success: false,
        message: `Return rejection failed: ${emailError.message}`
      });
    }
  } catch (error) {
    console.error(`💥 REJECT CONTROLLER ERROR:`, error);
    console.error(`💥 Error stack:`, error.stack);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export { getReturnStats, getReturns, getReturnById, approveReturn, rejectReturn };
