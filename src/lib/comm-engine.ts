import { prisma } from '@/lib/prisma';

type MessageType = 'PLEDGE_CONFIRMATION' | 'CONTRIBUTION_RECEIVED' | 'MONTHLY_REMINDER' | 'BIRTHDAY_GREETING';

export async function sendSMS(phone: string, message: string) {
  console.log(`[SMS Gateway] Sending to ${phone}: ${message}`);
  
  // Example Termii Integration Template (uncomment and configure to use)
  /*
  try {
    const response = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phone,
        from: process.env.TERMII_SENDER_ID || 'RCCG-TKH',
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: process.env.TERMII_API_KEY,
      }),
    });
    const result = await response.json();
    return { success: response.ok, messageId: result.message_id };
  } catch (error) {
    console.error('[SMS Gateway Error]', error);
    return { success: false };
  }
  */

  return { success: true, messageId: 'msg_' + Math.random().toString(36).substr(2, 9) };
}

export async function sendEmail(email: string, subject: string, body: string) {
  console.log(`[Email Service] Sending to ${email}: [${subject}] ${body}`);
  // Integration point for SMTP / SendGrid / etc.
  return { success: true };
}

export async function triggerNotification(type: MessageType, donorId: string, data: Record<string, unknown> = {}) {
  const donor = await prisma.donor.findUnique({ where: { id: donorId } });
  if (!donor) return;

  let message = '';
  let subject = '';

  switch (type) {
    case 'PLEDGE_CONFIRMATION':
      message = `God bless you ${donor.name}! Your Kingdom Builder pledge of ₦${(Number(donor.monthlyPledge) / 100).toLocaleString()}/month has been recorded. Tier: ${donor.tier}. PIN: ${data.pin || '1234'}`;
      subject = 'Kingdom Builder Pledge Confirmation';
      break;
    case 'CONTRIBUTION_RECEIVED':
      message = `Praise God! We received your contribution of ₦${Number(data.amount || 0).toLocaleString()}. Your total fulfillment is now at ${Number(data.fulfillmentRate || 0).toFixed(1)}%. Thank you!`;
      subject = 'Contribution Received - RCCG TKH';
      break;
    case 'MONTHLY_REMINDER':
      message = `Hello ${donor.name}, this is a gentle reminder of your Kingdom Builder pledge. Your current balance for this month is ₦${Number(data.remaining || 0).toLocaleString()}. God bless you.`;
      subject = 'Kingdom Builder Monthly Reminder';
      break;
  }

  if (donor.phone) await sendSMS(donor.phone, message);
  if (donor.email) await sendEmail(donor.email, subject, message);
}

