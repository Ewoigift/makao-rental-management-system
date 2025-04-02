/**
 * Africa's Talking API Integration for SMS Services
 * This module handles SMS sending functionality for the MAKAO rental management system
 */

// Types for Africa's Talking API responses
interface AfricasTalkingResponse {
  SMSMessageData: {
    Message: string;
    Recipients: {
      statusCode: number;
      number: string;
      cost: string;
      status: string;
      messageId: string;
    }[];
  };
}

interface SMSOptions {
  to: string | string[];
  message: string;
  from?: string;
}

/**
 * Initializes the Africa's Talking SMS service
 */
export async function initializeAfricasTalking() {
  // In a real implementation, we would use the Africa's Talking SDK
  // For now, we'll create a mock implementation
  return {
    send: async (options: SMSOptions): Promise<AfricasTalkingResponse> => {
      console.log(`[MOCK] Sending SMS to ${options.to}: ${options.message}`);
      
      // Mock response
      const recipients = Array.isArray(options.to) 
        ? options.to 
        : [options.to];
      
      return {
        SMSMessageData: {
          Message: "Sent to 1 recipients",
          Recipients: recipients.map(number => ({
            statusCode: 101,
            number,
            cost: "KES 0.80",
            status: "Success",
            messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
          }))
        }
      };
    }
  };
}

/**
 * Sends an SMS using Africa's Talking API
 * @param to Phone number(s) to send to
 * @param message Message content
 * @param from Sender ID (optional)
 * @returns Promise with the API response
 */
export async function sendSMS(
  to: string | string[],
  message: string,
  from?: string
): Promise<AfricasTalkingResponse> {
  try {
    const smsService = await initializeAfricasTalking();
    
    const options: SMSOptions = {
      to,
      message,
    };
    
    if (from) {
      options.from = from;
    }
    
    return await smsService.send(options);
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

/**
 * Validates and formats a phone number for Africa's Talking API
 * @param phoneNumber Phone number to validate
 * @param countryCode Country code (default: KE for Kenya)
 * @returns Formatted phone number
 */
export function validateAndFormatPhoneNumber(
  phoneNumber: string,
  countryCode: string = 'KE'
): string {
  // Remove any non-digit characters
  let digits = phoneNumber.replace(/\D/g, '');
  
  // For Kenya numbers
  if (countryCode === 'KE') {
    // If it starts with 0, replace with country code
    if (digits.startsWith('0')) {
      digits = `254${digits.substring(1)}`;
    }
    
    // If it doesn't have country code, add it
    if (!digits.startsWith('254')) {
      digits = `254${digits}`;
    }
  }
  
  // Basic validation
  if (digits.length < 10 || digits.length > 15) {
    throw new Error('Invalid phone number length');
  }
  
  return `+${digits}`;
}
