/**
 * Notification Service for MAKAO Rental Management System
 * This module handles sending notifications via SMS and Email
 */

import { sendSMS } from '../sms/africas-talking';
import { sendEmail, EmailOptions } from '../email/nodemailer';
import * as smsTemplates from '../sms/templates';
import * as emailTemplates from '../email/templates';

export type NotificationType = 
  | 'PAYMENT_REMINDER'
  | 'PAYMENT_CONFIRMATION'
  | 'MAINTENANCE_UPDATE'
  | 'LEASE_EXPIRY'
  | 'WELCOME'
  | 'GENERAL_ANNOUNCEMENT';

export interface NotificationRecipient {
  name: string;
  email?: string;
  phone?: string;
}

export interface NotificationOptions {
  type: NotificationType;
  recipient: NotificationRecipient;
  variables: Record<string, string | number | Date>;
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
  }>;
}

/**
 * Send a notification via SMS, email, or both depending on available contact information
 * @param options Notification options including type, recipient, and variables
 * @returns Promise with the result of sending notifications
 */
export async function sendNotification(options: NotificationOptions): Promise<{
  sms: { success: boolean; messageId?: string; error?: any };
  email: { success: boolean; messageId?: string; error?: any };
}> {
  const { type, recipient, variables, attachments } = options;
  const result = {
    sms: { success: false },
    email: { success: false }
  };

  try {
    // Send SMS if phone number is available
    if (recipient.phone) {
      try {
        // Get SMS template and render with variables
        const message = smsTemplates.renderTemplate(type, {
          name: recipient.name,
          ...variables
        });

        // Send SMS
        const smsResult = await sendSMS(recipient.phone, message);
        result.sms = { success: true, messageId: smsResult.messageId };
      } catch (error) {
        console.error('Error sending SMS notification:', error);
        result.sms = { success: false, error };
      }
    }

    // Send email if email address is available
    if (recipient.email) {
      try {
        // Get email template function based on notification type
        let emailTemplate;
        let subject = '';

        switch (type) {
          case 'PAYMENT_REMINDER':
            emailTemplate = emailTemplates.paymentReminderTemplate;
            subject = 'Rent Payment Reminder';
            break;
          case 'PAYMENT_CONFIRMATION':
            emailTemplate = emailTemplates.paymentReceiptTemplate;
            subject = 'Payment Receipt';
            break;
          case 'MAINTENANCE_UPDATE':
            emailTemplate = emailTemplates.maintenanceUpdateTemplate;
            subject = 'Maintenance Request Update';
            break;
          case 'LEASE_EXPIRY':
            emailTemplate = emailTemplates.leaseRenewalTemplate;
            subject = 'Lease Expiry Notice';
            break;
          case 'WELCOME':
            emailTemplate = emailTemplates.welcomeEmailTemplate;
            subject = 'Welcome to MAKAO Rental Management';
            break;
          default:
            // Default to a generic template
            emailTemplate = (vars: any) => {
              return `<p>Hello ${vars.name},</p><p>${vars.message || ''}</p>`;
            };
            subject = 'MAKAO Rental Management Notification';
        }

        // Render email template with variables
        const html = emailTemplate({
          name: recipient.name,
          ...variables
        });

        // Prepare email options
        const emailOptions: EmailOptions = {
          to: recipient.email,
          subject,
          html,
          attachments
        };

        // Send email
        const emailResult = await sendEmail(emailOptions);
        result.email = { success: true, messageId: emailResult.messageId };
      } catch (error) {
        console.error('Error sending email notification:', error);
        result.email = { success: false, error };
      }
    }

    return result;
  } catch (error) {
    console.error('Error in notification service:', error);
    return result;
  }
}

/**
 * Send a bulk notification to multiple recipients
 * @param type Notification type
 * @param recipients Array of recipients
 * @param variables Variables to use in the template
 * @param attachments Optional attachments for emails
 * @returns Promise with the results of sending notifications
 */
export async function sendBulkNotification(
  type: NotificationType,
  recipients: NotificationRecipient[],
  variables: Record<string, string | number | Date>,
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
  }>
): Promise<Array<{ recipient: NotificationRecipient; result: any }>> {
  const results = [];

  for (const recipient of recipients) {
    const result = await sendNotification({
      type,
      recipient,
      variables: {
        ...variables,
        name: recipient.name // Override name for each recipient
      },
      attachments
    });

    results.push({
      recipient,
      result
    });
  }

  return results;
}

/**
 * Schedule a notification to be sent at a specific date and time
 * @param options Notification options
 * @param scheduledDate Date and time to send the notification
 * @returns Promise with the scheduled notification ID
 */
export async function scheduleNotification(
  options: NotificationOptions,
  scheduledDate: Date
): Promise<string> {
  // In a real implementation, this would store the notification in a database
  // and use a job scheduler like Bull or Agenda to send it at the scheduled time
  
  const scheduledId = `scheduled-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  
  console.log(`Scheduled notification ${scheduledId} for ${scheduledDate.toISOString()}`);
  console.log(`Type: ${options.type}, Recipient: ${options.recipient.name}`);
  
  // Mock implementation - in a real app, this would be handled by a job scheduler
  const now = new Date();
  const delay = scheduledDate.getTime() - now.getTime();
  
  if (delay <= 0) {
    // If the scheduled date is in the past, send immediately
    return sendNotification(options).then(() => scheduledId);
  }
  
  // Schedule the notification
  setTimeout(() => {
    sendNotification(options).catch(error => {
      console.error(`Error sending scheduled notification ${scheduledId}:`, error);
    });
  }, delay);
  
  return Promise.resolve(scheduledId);
}
