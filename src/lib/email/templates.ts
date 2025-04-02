/**
 * Email Templates for MAKAO Rental Management System
 * This module provides HTML templates for different types of email notifications
 */

// Type for template variables
export type EmailTemplateVars = Record<string, string | number | Date | undefined>;

/**
 * Base HTML template with common styling and structure
 * @param content The main content to insert in the template
 * @returns Complete HTML email template
 */
function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MAKAO Rental Management</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9fafb;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .logo {
          max-height: 60px;
        }
        .content {
          padding: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        }
        .button {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 4px;
          margin: 15px 0;
          font-weight: 500;
        }
        .info-box {
          background-color: #f3f4f6;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          margin: 15px 0;
          border-radius: 4px;
        }
        .warning-box {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 15px 0;
          border-radius: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th, td {
          padding: 10px;
          border-bottom: 1px solid #e5e7eb;
          text-align: left;
        }
        th {
          background-color: #f9fafb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://via.placeholder.com/200x60?text=MAKAO" alt="MAKAO Logo" class="logo">
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} MAKAO Rental Management. All rights reserved.</p>
          <p>If you have any questions, please contact us at support@makao.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Formats a date for display in emails
 * @param date Date to format
 * @returns Formatted date string
 */
function formatDate(date: Date | string | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formats a currency amount
 * @param amount Amount to format
 * @returns Formatted currency string
 */
function formatCurrency(amount: number | string | undefined): string {
  if (amount === undefined) return '';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `KES ${num.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Welcome email template for new tenants
 */
export function welcomeEmailTemplate(vars: EmailTemplateVars): string {
  const content = `
    <h1>Welcome to MAKAO!</h1>
    <p>Hello ${vars.name},</p>
    <p>Welcome to MAKAO Rental Management System. We're excited to have you as a tenant at ${vars.propertyName}.</p>
    
    <div class="info-box">
      <h3>Your Account Details</h3>
      <p><strong>Email:</strong> ${vars.email}</p>
      <p><strong>Property:</strong> ${vars.propertyName}</p>
      <p><strong>Unit:</strong> ${vars.unitNumber}</p>
    </div>
    
    <p>You can now log in to your tenant dashboard to:</p>
    <ul>
      <li>View your lease details</li>
      <li>Make rent payments</li>
      <li>Submit maintenance requests</li>
      <li>Communicate with property management</li>
    </ul>
    
    <a href="${vars.dashboardUrl}" class="button">Access Your Dashboard</a>
    
    <p>If you have any questions, please don't hesitate to contact us.</p>
    <p>Best regards,<br>The MAKAO Team</p>
  `;
  
  return baseTemplate(content);
}

/**
 * Payment receipt email template
 */
export function paymentReceiptTemplate(vars: EmailTemplateVars): string {
  const content = `
    <h1>Payment Receipt</h1>
    <p>Hello ${vars.name},</p>
    <p>Thank you for your payment. This email confirms that we have received your payment.</p>
    
    <div class="info-box">
      <h3>Payment Details</h3>
      <p><strong>Receipt Number:</strong> ${vars.receiptNumber}</p>
      <p><strong>Payment Date:</strong> ${formatDate(vars.paymentDate as Date)}</p>
      <p><strong>Amount:</strong> ${formatCurrency(vars.amount as number)}</p>
      <p><strong>Payment Method:</strong> ${vars.paymentMethod}</p>
      <p><strong>Property:</strong> ${vars.propertyName}</p>
      <p><strong>Unit:</strong> ${vars.unitNumber}</p>
    </div>
    
    <p>Your payment has been applied to your account. You can view your payment history and download receipts from your tenant dashboard.</p>
    
    <a href="${vars.dashboardUrl}" class="button">View Payment History</a>
    
    <p>If you have any questions about this payment, please contact us.</p>
    <p>Thank you for your prompt payment.</p>
    <p>Best regards,<br>The MAKAO Team</p>
  `;
  
  return baseTemplate(content);
}

/**
 * Payment reminder email template
 */
export function paymentReminderTemplate(vars: EmailTemplateVars): string {
  const content = `
    <h1>Rent Payment Reminder</h1>
    <p>Hello ${vars.name},</p>
    <p>This is a friendly reminder that your rent payment is due soon.</p>
    
    <div class="info-box">
      <h3>Payment Details</h3>
      <p><strong>Due Date:</strong> ${formatDate(vars.dueDate as Date)}</p>
      <p><strong>Amount Due:</strong> ${formatCurrency(vars.amount as number)}</p>
      <p><strong>Property:</strong> ${vars.propertyName}</p>
      <p><strong>Unit:</strong> ${vars.unitNumber}</p>
    </div>
    
    <p>Please ensure your payment is made on or before the due date to avoid late fees.</p>
    
    <a href="${vars.paymentUrl}" class="button">Make Payment Now</a>
    
    <p>If you have already made this payment, please disregard this reminder.</p>
    <p>Thank you for your attention to this matter.</p>
    <p>Best regards,<br>The MAKAO Team</p>
  `;
  
  return baseTemplate(content);
}

/**
 * Late payment notice email template
 */
export function latePaymentTemplate(vars: EmailTemplateVars): string {
  const content = `
    <h1>Late Payment Notice</h1>
    <p>Hello ${vars.name},</p>
    <p>Our records indicate that your rent payment is now overdue.</p>
    
    <div class="warning-box">
      <h3>Overdue Payment Details</h3>
      <p><strong>Due Date:</strong> ${formatDate(vars.dueDate as Date)}</p>
      <p><strong>Days Overdue:</strong> ${vars.daysLate}</p>
      <p><strong>Amount Due:</strong> ${formatCurrency(vars.amount as number)}</p>
      <p><strong>Late Fee:</strong> ${formatCurrency(vars.lateFee as number)}</p>
      <p><strong>Total Amount Due:</strong> ${formatCurrency(vars.totalDue as number)}</p>
      <p><strong>Property:</strong> ${vars.propertyName}</p>
      <p><strong>Unit:</strong> ${vars.unitNumber}</p>
    </div>
    
    <p>Please make your payment as soon as possible to avoid additional late fees and potential legal action.</p>
    
    <a href="${vars.paymentUrl}" class="button">Make Payment Now</a>
    
    <p>If you are experiencing financial difficulties, please contact us to discuss possible payment arrangements.</p>
    <p>Thank you for your prompt attention to this matter.</p>
    <p>Best regards,<br>The MAKAO Team</p>
  `;
  
  return baseTemplate(content);
}

/**
 * Maintenance request update email template
 */
export function maintenanceUpdateTemplate(vars: EmailTemplateVars): string {
  const content = `
    <h1>Maintenance Request Update</h1>
    <p>Hello ${vars.name},</p>
    <p>There has been an update to your maintenance request.</p>
    
    <div class="info-box">
      <h3>Request Details</h3>
      <p><strong>Request ID:</strong> ${vars.requestId}</p>
      <p><strong>Status:</strong> ${vars.status}</p>
      <p><strong>Property:</strong> ${vars.propertyName}</p>
      <p><strong>Unit:</strong> ${vars.unitNumber}</p>
      ${vars.scheduledDate ? `<p><strong>Scheduled Date:</strong> ${formatDate(vars.scheduledDate as Date)}</p>` : ''}
      ${vars.assignedTo ? `<p><strong>Assigned To:</strong> ${vars.assignedTo}</p>` : ''}
    </div>
    
    ${vars.notes ? `<p><strong>Notes:</strong> ${vars.notes}</p>` : ''}
    
    <a href="${vars.dashboardUrl}" class="button">View Request Details</a>
    
    <p>If you have any questions about this maintenance request, please contact us.</p>
    <p>Best regards,<br>The MAKAO Team</p>
  `;
  
  return baseTemplate(content);
}

/**
 * Lease renewal email template
 */
export function leaseRenewalTemplate(vars: EmailTemplateVars): string {
  const content = `
    <h1>Lease Renewal Notice</h1>
    <p>Hello ${vars.name},</p>
    <p>Your current lease agreement will be expiring soon.</p>
    
    <div class="info-box">
      <h3>Lease Details</h3>
      <p><strong>Current Lease End Date:</strong> ${formatDate(vars.endDate as Date)}</p>
      <p><strong>Property:</strong> ${vars.propertyName}</p>
      <p><strong>Unit:</strong> ${vars.unitNumber}</p>
    </div>
    
    <p>We would like to offer you the opportunity to renew your lease. The new lease terms would be as follows:</p>
    
    <div class="info-box">
      <h3>New Lease Terms</h3>
      <p><strong>New Lease Period:</strong> ${formatDate(vars.newStartDate as Date)} to ${formatDate(vars.newEndDate as Date)}</p>
      <p><strong>New Monthly Rent:</strong> ${formatCurrency(vars.newRentAmount as number)}</p>
      ${vars.rentIncrease ? `<p><strong>Rent Increase:</strong> ${vars.rentIncrease}%</p>` : ''}
    </div>
    
    <p>Please let us know your decision by ${formatDate(vars.responseDeadline as Date)}.</p>
    
    <a href="${vars.renewalUrl}" class="button">Renew Lease Now</a>
    
    <p>If you have any questions or would like to discuss the renewal terms, please contact us.</p>
    <p>Best regards,<br>The MAKAO Team</p>
  `;
  
  return baseTemplate(content);
}

/**
 * Eviction notice email template
 */
export function evictionNoticeTemplate(vars: EmailTemplateVars): string {
  const content = `
    <h1>Important Notice Regarding Your Tenancy</h1>
    <p>Hello ${vars.name},</p>
    <p>This email serves as an official notice regarding your tenancy at ${vars.propertyName}, Unit ${vars.unitNumber}.</p>
    
    <div class="warning-box">
      <h3>Notice Details</h3>
      <p><strong>Notice Type:</strong> ${vars.noticeType}</p>
      <p><strong>Effective Date:</strong> ${formatDate(vars.effectiveDate as Date)}</p>
      <p><strong>Property:</strong> ${vars.propertyName}</p>
      <p><strong>Unit:</strong> ${vars.unitNumber}</p>
    </div>
    
    <p>${vars.noticeReason}</p>
    
    <p>To resolve this matter, please ${vars.resolutionSteps}</p>
    
    <p>If you have any questions about this notice, please contact us immediately at ${vars.contactNumber}.</p>
    
    <p>Best regards,<br>The MAKAO Management Team</p>
  `;
  
  return baseTemplate(content);
}

/**
 * Deposit refund email template
 */
export function depositRefundTemplate(vars: EmailTemplateVars): string {
  const content = `
    <h1>Deposit Refund Notification</h1>
    <p>Hello ${vars.name},</p>
    <p>We are writing to inform you about the status of your security deposit refund for ${vars.propertyName}, Unit ${vars.unitNumber}.</p>
    
    <div class="info-box">
      <h3>Deposit Refund Details</h3>
      <p><strong>Original Deposit Amount:</strong> ${formatCurrency(vars.originalDeposit as number)}</p>
      <p><strong>Deductions:</strong> ${formatCurrency(vars.deductions as number)}</p>
      <p><strong>Refund Amount:</strong> ${formatCurrency(vars.refundAmount as number)}</p>
      <p><strong>Refund Method:</strong> ${vars.refundMethod}</p>
      <p><strong>Refund Date:</strong> ${formatDate(vars.refundDate as Date)}</p>
    </div>
    
    ${vars.deductionReasons ? `
      <h3>Deduction Details:</h3>
      <table>
        <tr>
          <th>Item</th>
          <th>Amount</th>
        </tr>
        ${(vars.deductionReasons as any).map((item: any) => `
          <tr>
            <td>${item.reason}</td>
            <td>${formatCurrency(item.amount)}</td>
          </tr>
        `).join('')}
      </table>
    ` : ''}
    
    <p>If you have any questions about your deposit refund, please contact us.</p>
    <p>Thank you for your tenancy with MAKAO.</p>
    <p>Best regards,<br>The MAKAO Team</p>
  `;
  
  return baseTemplate(content);
}
