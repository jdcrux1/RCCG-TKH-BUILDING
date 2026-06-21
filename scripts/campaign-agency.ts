const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Configuration
const TARGET_NAIRA = 650000000;
const TIER_AMOUNTS = {
  'Cornerstone Partner': '₦1,000,000',
  'Pillar Builder': '₦500,000',
  'Foundation Stone': '₦200,000',
  'Nehemiah Builder': '₦100,000',
  'Covenant Partner': '₦50,000',
  'Faithful Hand': '₦20,000',
  'Open-Heart': '₦10,000',
  'Willing Heart': '₦5,000'
};

async function runAgency() {
  console.log("🚀 [AGENCY STARTING] Waking up the Media Campaign Agency...");

  // 1. DATA ANALYST AGENT: Pull live stats
  console.log("📊 [DATA ANALYST] Querying live database...");
  let totalRaisedKobo = 0;
  try {
    const total = await prisma.contribution.aggregate({ _sum: { amount: true } });
    totalRaisedKobo = Number(total._sum.amount || 0);
  } catch (e) {
    console.error("❌ Database Error:", e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }

  const totalRaisedNaira = totalRaisedKobo / 100;
  const gapNaira = TARGET_NAIRA - totalRaisedNaira;
  const percentage = ((totalRaisedNaira / TARGET_NAIRA) * 100).toFixed(2);

  console.log(`✅ Data Retrieved: Raised ₦${totalRaisedNaira.toLocaleString()}, Gap ₦${gapNaira.toLocaleString()} (${percentage}% to target)`);

  // 2. CHIEF COPYWRITER AGENT: Generate collateral
  console.log("✍️ [CHIEF COPYWRITER] Synthesizing data into media collateral...");
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY is missing from your .env file. Please add it to generate the copy.");
    process.exit(1);
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
- Tiers Available: Cornerstone Partner (₦1M), Pillar Builder (₦500k), Foundation Stone (₦200k), Nehemiah Builder (₦100k), Covenant Partner (₦50k), Faithful Hand (₦20k), Open-Heart (₦10k), Willing Heart (₦5k).

**YOUR TASK:**
Generate a markdown formatted "Media Kit" with 3 specific deliverables for this week.
CRITICAL RULES:
1. ALL terminology must be Christian, biblical, and Pentecostal (e.g., Nehemiah, building the sanctuary, advancing the Kingdom, faith, grace, RCCG). Do not use secular corporate jargon.
2. The tone must be urgent, highly encouraging, and faith-filled. Ensure you are educating and enlightening the congregation on the spiritual importance of this project.
3. EVERY SINGLE MESSAGE MUST INCLUDE THE LOGISTICS:
   - **Bank Account Details:** [INSERT BANK NAME, ACCOUNT NUMBER, ACCOUNT NAME HERE]
   - **How to Register:** Tell them to click the link in our bio to set up their monthly pledge or make a one-time donation.
   - **Support:** Explicitly state: "For any inquiries or assistance, please reach out to our WhatsApp Support line at [INSERT WHATSAPP NUMBER HERE]".
4. Remind people that this is an ongoing journey, but highlight the upcoming August Convention as a massive opportunity for an outpouring of support.
5. Output EXACTLY these 3 items:
   - **DELIVERABLE 1: VISION MONDAY (Instagram Caption)**. A powerful, faith-stirring caption highlighting our legacy and explicitly listing 3 specific giving tiers. End with a call to click the link in bio. Include relevant hashtags.
   - **DELIVERABLE 2: WEDNESDAY BUILDER UPDATE (WhatsApp Broadcast)**. A highly personalized, emoji-rich message structured for WhatsApp. You MUST state exactly how much we have raised (₦${totalRaisedNaira.toLocaleString()}) and the gap (₦${gapNaira.toLocaleString()}). Include the bank details and WhatsApp support number directly in this message.
   - **DELIVERABLE 3: FRIDAY CLIMAX (60-Second Video Script)**. A punchy, spoken-word script for the Lead Pastor counting down to the August Convention surge. Include stage directions [in brackets].

Do not hallucinate any numbers other than the exact data provided.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const dateStr = new Date().toISOString().split('T')[0];
    const outputDir = path.join(__dirname, '../campaign_kits');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    const outputPath = path.join(outputDir, `Media_Kit_${dateStr}.md`);
    fs.writeFileSync(outputPath, text);
    
    console.log(`🎉 [DIRECTOR] Success! The weekly media kit has been saved to: ${outputPath}`);
  } catch (error) {
    console.error("❌ AI Generation Error:", error.message);
  }
}

runAgency();
