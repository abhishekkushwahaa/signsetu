// supabase/functions/send-reminders/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";
import { Resend } from 'npm:resend';

const MONGODB_URI = Deno.env.get("MONGODB_URI")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

serve(async (_req) => {
  const mongoClient = new MongoClient();
  try {
    await mongoClient.connect(MONGODB_URI);
    const db = mongoClient.database("quiet_hours_db");
    const timeBlocksCollection = db.collection("time_blocks");
    const resend = new Resend(RESEND_API_KEY);

    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

    const upcomingBlocks = await timeBlocksCollection.find({
      startTime: { $gte: now, $lt: tenMinutesFromNow },
      notificationSent: false,
    }).toArray();

    if (upcomingBlocks.length === 0) {
      return new Response("No upcoming blocks to process.", { status: 200 });
    }

    for (const block of upcomingBlocks) {
      // You would normally fetch the user's email from a `users` table
      const userEmail = "your-verified-test-email@example.com"; 

      await resend.emails.send({
        from: 'Reminder <onboarding@resend.dev>',
        to: [userEmail],
        subject: `Reminder: "${block.title}" starts in 10 minutes`,
        html: `<p>This is a reminder that your scheduled quiet time, <strong>${block.title}</strong>, is starting at ${new Date(block.startTime).toLocaleTimeString()}.</p>`,
      });

      // CRITICAL: Mark as sent to prevent duplicate notifications
      await timeBlocksCollection.updateOne(
        { _id: block._id },
        { $set: { notificationSent: true } }
      );
    }
    return new Response(JSON.stringify({ message: `Processed ${upcomingBlocks.length} notifications.` }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  } finally {
    await mongoClient.close();
  }
})