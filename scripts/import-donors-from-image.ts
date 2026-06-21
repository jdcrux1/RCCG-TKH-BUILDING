import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const rawDonors = [
  { name: "MRS.BROWN", phone: "09010237776", amount: 5000 },
  { name: "OLADIMEJI TIJANI", phone: "08139256823", amount: 5000 },
  { name: "OLAWUWO JUMOKE", phone: "09042862860", amount: 10000 },
  { name: "AFOLABI TOLUWANIMI", phone: "08163210272", amount: 10000 },
  { name: "OMOYELE ADEJARE", phone: "08060974492", amount: 10000 },
  { name: "JIF OKONMA", phone: "07063343757", amount: 20000 },
  { name: "GIFT AGOVIE", phone: "08037814239", amount: 100000 },
  { name: "FALEMI OLUSANJO", phone: "08023453718", amount: 200000 }
];

const TIERS = [
  { name: 'Cornerstone Partner', min: 1000000 },
  { name: 'Pillar Builder', min: 500000 },
  { name: 'Foundation Stone', min: 200000 },
  { name: 'Nehemiah Builder', min: 100000 },
  { name: 'Covenant Partner', min: 50000 },
  { name: 'Faithful Hand', min: 20000 },
  { name: 'Open-Heart', min: 10000 },
  { name: 'Willing Heart', min: 5000 },
] as const;

const TIER_AMOUNTS: Record<string, string> = {
  'Cornerstone Partner': '₦1,000,000',
  'Pillar Builder': '₦500,000',
  'Foundation Stone': '₦200,000',
  'Nehemiah Builder': '₦100,000',
  'Covenant Partner': '₦50,000',
  'Faithful Hand': '₦20,000',
  'Open-Heart': '₦10,000',
  'Willing Heart': '₦5,000'
};

function sanitizePhoneNumber(phone: string): string {
  const digits = phone.replace(/[\s\-\(\)]/g, '');
  if (digits.startsWith('+234')) return '+234' + digits.slice(4);
  if (digits.startsWith('234')) return '+234' + digits.slice(3);
  if (digits.startsWith('0')) return '+234' + digits.slice(1);
  if (/^\d{10}$/.test(digits)) return '+234' + digits;
  return '+234' + digits.slice(-10);
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getTier(monthlyPledgeNaira: number): string {
  if (!monthlyPledgeNaira || monthlyPledgeNaira < 5000) return 'Supporter';
  for (const tier of TIERS) {
    if (monthlyPledgeNaira >= tier.min) return tier.name;
  }
  return 'Supporter';
}

async function main() {
  console.log('Starting Personalized Donor Import Update...');
  
  const results: any[] = [];
  
  for (const raw of rawDonors) {
    const sanitizedPhone = sanitizePhoneNumber(raw.phone);
    
    // Formatting name properly (e.g. MRS.BROWN -> Mrs. Brown)
    let formattedName = raw.name.replace(/\./g, '. ').replace(/\s+/g, ' ').trim();
    formattedName = toTitleCase(formattedName);
    
    // Check if duplicate phone exists
    const existing = await prisma.donor.findUnique({ where: { phone: sanitizedPhone } });
    
    if (existing) {
      // Update name to the clean formatted name if it has changed
      const updated = await prisma.donor.update({
        where: { id: existing.id },
        data: { name: formattedName }
      });
      
      console.log(`[UPDATED NAME] ${existing.name} -> ${formattedName} (Ref: ${existing.donorRefId})`);
      
      results.push({
        name: updated.name,
        phone: updated.phone,
        donorRefId: updated.donorRefId,
        tier: updated.tier,
        claimToken: updated.claimToken || 'ALREADY_CLAIMED',
        isNew: false
      });
      continue;
    }
    
    // (Fallback code in case any didn't get created in the last run)
    // Find current highest KB number
    const allDonors = await prisma.donor.findMany();
    let maxNum = 0;
    allDonors.forEach(d => {
      if (d.donorRefId && d.donorRefId.startsWith('KB-')) {
        const num = parseInt(d.donorRefId.replace('KB-', ''), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    
    maxNum++;
    const donorRefId = `KB-${maxNum.toString().padStart(3, '0')}`;
    const claimToken = crypto.randomBytes(32).toString('hex');
    const claimTokenExpires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    
    const monthlyPledgeKobo = BigInt(raw.amount * 100);
    const totalPledgedKobo = monthlyPledgeKobo * 24n;
    const tier = getTier(raw.amount);
    
    const created = await prisma.donor.create({
      data: {
        name: formattedName,
        phone: sanitizedPhone,
        donorRefId,
        tier,
        monthlyPledge: monthlyPledgeKobo,
        totalPledged: totalPledgedKobo,
        isClaimed: false,
        claimToken,
        claimTokenExpires,
        status: 'ACTIVE',
        role: 'DONOR'
      }
    });
    
    console.log(`[CREATED FALLBACK] ${formattedName} successfully imported as ${donorRefId}`);
    
    results.push({
      name: created.name,
      phone: created.phone,
      donorRefId: created.donorRefId,
      tier: created.tier,
      claimToken,
      isNew: true
    });
  }
  
  console.log('\n==================================================');
  console.log('IMPORT UPDATE COMPLETE. GENERATING PERSONALIZED BROADCASTS:');
  console.log('==================================================\n');
  
  const domain = 'https://rccg-tkh-building.vercel.app';
  
  results.forEach(donor => {
    // Generate personalized greeting name
    let greetingName = donor.name;
    if (donor.name.toUpperCase().startsWith('MRS.') || donor.name.toUpperCase().startsWith('MR.') || donor.name.toUpperCase().startsWith('PASTOR.')) {
      greetingName = donor.name; // Keep full prefix name
    } else {
      greetingName = donor.name.split(' ')[0]; // Use first name
    }
    
    if (donor.claimToken === 'ALREADY_CLAIMED') {
      console.log(`Donor: ${donor.name} (${donor.donorRefId}) - Already Claimed and setup.`);
      console.log('--------------------------------------------------\n');
      return;
    }
    
    const amountStr = TIER_AMOUNTS[donor.tier] || '';
    const tierDetails = amountStr 
      ? `under the *${donor.tier}* tier (${amountStr} / month)` 
      : `as a monthly Kingdom Builder (${donor.tier})`;
      
    const rawMsg = 
      `🕊️ *Grace and Peace to you, ${greetingName}!* 🕊️\n\n` +
      `We want to say a massive *THANK YOU* for stepping out in faith to partner with us as a monthly Kingdom Builder ${tierDetails} for the RCCG TKH Building Project.\n\n` +
      `Your builder account has been successfully created. Please use the secure invitation link below to activate your account, set up your secure login PIN/password, and access your dashboard where you can log contributions and track progress:\n\n` +
      `👉 *Activate Account:* ${domain}/claim?token=${donor.claimToken}\n\n` +
      `*Please note: This activation link is unique to you and will expire in 90 days.*\n\n` +
      `• *Donor Reference ID:* ${donor.donorRefId || 'N/A'}\n\n` +
      `Once activated, you can always log back in at any time here:\n` +
      `👉 *Login Portal:* ${domain}/login\n\n` +
      `"Let us rise up and build." (Nehemiah 2:18). Thank you for your incredible sacrifice. God bless you abundantly! 🙏🏽⛪`;
      
    let waPhone = donor.phone.replace(/[^0-9]/g, '');
    if (waPhone.startsWith('0')) {
      waPhone = '234' + waPhone.substring(1);
    }
    const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(rawMsg)}`;
    
    console.log(`Donor: ${donor.name} (${donor.donorRefId})`);
    console.log(`Phone: ${donor.phone}`);
    console.log(`WhatsApp Link: ${waLink}`);
    console.log('\n--- MESSAGE TO COPY ---');
    console.log(rawMsg);
    console.log('--------------------------------------------------\n');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
