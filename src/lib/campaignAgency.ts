import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const TARGET_NAIRA = 650000000;

export async function generateAndSendCampaign() {
  console.log("🚀 [AGENCY STARTING] Waking up the Media Campaign Agency...");

  let totalRaisedKobo = 0;
  try {
    const total = await prisma.contribution.aggregate({ _sum: { amount: true } });
    totalRaisedKobo = Number(total._sum.amount || 0);
  } catch (e: any) {
    console.error("❌ Database Error:", e);
    throw new Error("Failed to read live stats from database.");
  }

  const totalRaisedNaira = totalRaisedKobo / 100;
  const gapNaira = TARGET_NAIRA - totalRaisedNaira;
  const percentage = ((totalRaisedNaira / TARGET_NAIRA) * 100).toFixed(2);

  console.log(`✅ Data Retrieved: Raised ₦${totalRaisedNaira.toLocaleString()}, Gap ₦${gapNaira.toLocaleString()} (${percentage}% to target)`);

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are the Chief Copywriter for the RCCG The King's House (TKH) Building Campaign.
We are on an ongoing, aggressive drive to raise ₦650 Million. There is a massive surge planned for the RCCG Annual Convention in August at the Redemption Camp, where we expect many visitors. 

**LIVE FUNDING DATA:**
- Total Target: ₦650,000,000
- Total Raised So Far: ₦${totalRaisedNaira.toLocaleString()}
- Gap Remaining: ₦${gapNaira.toLocaleString()}
- Progress: ${percentage}%

**YOUR TASK:**
Generate a text-based "Media Kit" with 3 specific deliverables for this week.
CRITICAL RULES:
1. ALL terminology must be Christian, biblical, and Pentecostal (e.g., Nehemiah, building the sanctuary, advancing the Kingdom, faith, grace, RCCG). Do not use secular corporate jargon.
2. The tone must be urgent, highly encouraging, and faith-filled. Ensure you are educating and enlightening the congregation on the spiritual importance of this project.
3. EVERY SINGLE MESSAGE MUST INCLUDE THE LOGISTICS:
   - **Bank Account Details:** RCCG The King's House, 0130430547, Haggai Mortgage Bank
   - **How to Register:** Tell them to click the link in our bio to set up their monthly pledge or make a one-time donation.
   - **Support:** Explicitly state: "For any inquiries or assistance, please reach out to our WhatsApp Support line at 08052039445 or 07036730533".
4. Remind people that this is an ongoing journey, but highlight the upcoming August Convention as a massive opportunity for an outpouring of support.
5. Output EXACTLY these 3 items (Do NOT use complex Markdown syntax like asterisks for bolding, just use plain text and ALL CAPS for emphasis to ensure easy copying on Telegram):
   - DELIVERABLE 1: VISION MONDAY (Instagram Caption). A powerful, faith-stirring caption highlighting our legacy and explicitly listing 3 specific giving tiers. End with a call to click the link in bio. Include relevant hashtags.
   - DELIVERABLE 2: WEDNESDAY BUILDER UPDATE (WhatsApp Broadcast). A highly personalized, emoji-rich message structured for WhatsApp. You MUST state exactly how much we have raised (₦${totalRaisedNaira.toLocaleString()}) and the gap (₦${gapNaira.toLocaleString()}). Include the bank details and WhatsApp support number directly in this message.
   - DELIVERABLE 3: FRIDAY CLIMAX (60-Second Video Script). A punchy, spoken-word script for the Lead Pastor counting down to the August Convention surge. Include stage directions [in brackets].

Do not hallucinate any numbers other than the exact data provided.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Send to Telegram
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const tgResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: "🚨 NEW WEEKLY MEDIA KIT GENERATED 🚨\n\n" + text,
      })
    });
    
    if (!tgResponse.ok) {
      console.error("Failed to send Telegram message", await tgResponse.text());
      throw new Error("Telegram delivery failed.");
    }
    console.log("✅ Successfully delivered Media Kit to Telegram.");
  } else {
    console.warn("⚠️ TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing. Skipped Telegram delivery.");
  }

  return { success: true, text };
}
