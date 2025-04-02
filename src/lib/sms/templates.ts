/**
 * SMS Templates for MAKAO Rental Management System
 * This module provides templates for different types of SMS notifications
 */

// Type for template variables
export type TemplateVars = Record<string, string | number | Date>;

// SMS template definitions
export const smsTemplates = {
  PAYMENT_REMINDER: 'Hello {{name}}, your rent of KES {{amount}} for {{propertyName}} Unit {{unitNumber}} is due on {{dueDate}}. Please make payment to avoid late fees.',
  
  PAYMENT_CONFIRMATION: 'Thank you {{name}}! Your payment of KES {{amount}} has been received and processed successfully. Receipt #{{receiptNumber}}',
  
  PAYMENT_OVERDUE: 'IMPORTANT: Your rent payment of KES {{amount}} for {{propertyName}} Unit {{unitNumber}} is now {{daysLate}} days overdue. Please contact management at {{contactNumber}}.',
  
  MAINTENANCE_UPDATE: 'Hello {{name}}, your maintenance request #{{requestId}} has been {{status}}. {{additionalInfo}}',
  
  LEASE_RENEWAL: 'Hello {{name}}, your lease for {{propertyName}} Unit {{unitNumber}} expires on {{expiryDate}}. Please contact us at {{contactNumber}} to discuss renewal options.',
  
  PENALTY_NOTIFICATION: 'Notice: A late payment penalty of KES {{penaltyAmount}} has been applied to your account for {{propertyName}} Unit {{unitNumber}}. Total due: KES {{totalDue}}',
  
  EVICTION_NOTICE: 'IMPORTANT LEGAL NOTICE: This is a formal notice regarding your tenancy at {{propertyName}} Unit {{unitNumber}}. Please contact management immediately at {{contactNumber}}.',
  
  DEPOSIT_REFUND: 'Hello {{name}}, your deposit refund of KES {{amount}} for {{propertyName}} Unit {{unitNumber}} has been processed. {{additionalInfo}}',
  
  GENERAL_ANNOUNCEMENT: '{{propertyName}} ANNOUNCEMENT: {{message}}'
};

/**
 * Renders an SMS template with the provided variables
 * @param templateKey The template key from smsTemplates
 * @param variables Variables to insert into the template
 * @returns The rendered SMS message
 */
export function renderSMSTemplate(
  templateKey: keyof typeof smsTemplates,
  variables: TemplateVars
): string {
  let template = smsTemplates[templateKey];
  
  // Replace all variables in the template
  Object.entries(variables).forEach(([key, value]) => {
    // Format dates if the value is a Date object
    let formattedValue = value;
    if (value instanceof Date) {
      formattedValue = value.toLocaleDateString('en-KE');
    }
    
    // Replace all occurrences of the variable
    template = template.replace(
      new RegExp(`{{${key}}}`, 'g'),
      String(formattedValue)
    );
  });
  
  return template;
}
