import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

console.log('📧 Email configuration:');
console.log('📧 MAIL_USER:', process.env.MAIL_USER);
console.log('📧 MAIL_PASS:', process.env.MAIL_PASS ? '***configured***' : 'NOT SET');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // Gmail App Password
  },
});

// Test the connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to take our messages');
  }
});

export const sendApprovalMail = async (to, returnId, customerName = '') => {
  try {
    console.log(`📤 SENDING APPROVAL EMAIL`);
    console.log(`📤 To: ${to}`);
    console.log(`📤 Return ID: ${returnId}`);
    console.log(`📤 Customer Name: ${customerName}`);
    
    const mailOptions = {
      from: `"Risk Return System" <${process.env.MAIL_USER}>`,
      to,
      subject: `Return ${returnId} Approved`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Return Request Approved</h2>
          ${customerName ? `<p>Dear ${customerName},</p>` : '<p>Dear Customer,</p>'}
          <p>Your return request <strong>${returnId}</strong> has been <span style="color: #28a745; font-weight: bold;">approved</span>.</p>
          <p>We will process your return shortly. You will receive further instructions via email.</p>
          <p>Thank you for your patience.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Risk Return Management System</p>
        </div>
      `,
    };
    
    console.log(`📤 Mail options:`, {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Approval email sent successfully to ${to} for return ${returnId}`);
    console.log(`✅ Message ID: ${result.messageId}`);
    console.log(`✅ Response: ${result.response}`);
    
    return result;
  } catch (error) {
    console.error(`❌ Error sending approval email:`, error);
    console.error(`❌ Error code:`, error.code);
    console.error(`❌ Error response:`, error.response);
    console.error(`❌ Error stack:`, error.stack);
    throw error;
  }
};

export const sendRejectionMail = async (to, returnId, customerName = '') => {
  try {
    console.log(`📤 SENDING REJECTION EMAIL`);
    console.log(`📤 To: ${to}`);
    console.log(`📤 Return ID: ${returnId}`);
    console.log(`📤 Customer Name: ${customerName}`);
    
    const mailOptions = {
      from: `"Risk Return System" <${process.env.MAIL_USER}>`,
      to,
      subject: `Return ${returnId} Rejected`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Return Request Rejected</h2>
          ${customerName ? `<p>Dear ${customerName},</p>` : '<p>Dear Customer,</p>'}
          <p>We regret to inform you that your return request <strong>${returnId}</strong> has been <span style="color: #dc3545; font-weight: bold;">rejected</span>.</p>
          <p>After careful review, we are unable to process this return request. This decision may be based on our return policy guidelines.</p>
          <p>If you have any questions or believe this decision was made in error, please contact our customer service team.</p>
          <p>Thank you for your understanding.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Risk Return Management System</p>
        </div>
      `,
    };
    
    console.log(`📤 Mail options:`, {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Rejection email sent successfully to ${to} for return ${returnId}`);
    console.log(`✅ Message ID: ${result.messageId}`);
    console.log(`✅ Response: ${result.response}`);
    
    return result;
  } catch (error) {
    console.error(`❌ Error sending rejection email:`, error);
    console.error(`❌ Error code:`, error.code);
    console.error(`❌ Error response:`, error.response);
    console.error(`❌ Error stack:`, error.stack);
    throw error;
  }
};
