import { NextResponse } from 'next/server';
import { generateAndSendCampaign } from '../../../../lib/campaignAgency';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Secure the route so only Vercel (or you with the secret) can trigger it
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized. Invalid CRON_SECRET.' }, { status: 401 });
    }

    // Run the agency
    const result = await generateAndSendCampaign();
    
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Cron execution failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
