import { prisma } from '@/lib/prisma';

type MessageType = 'PLEDGE_CONFIRMATION' | 'CONTRIBUTION_RECEIVED' | 'MONTHLY_REMINDER' | 'BIRTHDAY_GREETING';

export async function sendSMS(phone: string, message: string) {
  console.log(`[SMS Gateway] Sending to ${phone}: ${message}`);
  // Integration point for Twilio / Termii / etc.
  return { success: true, messageId: 'msg_' + Math.random().toString(36).substr(2, 9) };
}

export async function sendEmail(email: string, subject: string, body: string) {
  console.log(`[Email Service] Sending to ${email}: [${subject}] ${body}`);
  // Integration point for SMTP / SendGrid / etc.
  return { success: true };
}

export async function triggerNotification(type: MessageType, donorId: string, data: any) {
  const donor = await prisma.donor.findUnique({ where: { id: donorId } });
  if (!donor) return;

  let message = '';
  let subject = '';

  switch (type) {
    case 'PLEDGE_CONFIRMATION':
      message = `God bless you ${donor.name}! Your Kingdom Builder pledge of ₦${donor.monthlyPledge.toLocaleString()}/month has been recorded. Tier: ${donor.tier}.`;
      subject = 'Kingdom Builder Pledge Confirmation';
      break;
    case 'CONTRIBUTION_RECEIVED':
      message = `Praise God! We received your contribution of ₦${data.amount.toLocaleString()}. Your total fulfillment is now at ${data.fulfillmentRate.toFixed(1)}%. Thank you!`;
      subject = 'Contribution Received - RCCG TKH';
      break;
    case 'MONTHLY_REMINDER':
      message = `Hello ${donor.name}, this is a gentle reminder of your Kingdom Builder pledge. Your current balance for this month is ₦${data.remaining.toLocaleString()}. God bless you.`;
      subject = 'Kingdom Builder Monthly Reminder';
      break;
  }

  if (donor.phone) await sendSMS(donor.phone, message);
  if (donor.email) await sendEmail(donor.email, subject, message);
}
