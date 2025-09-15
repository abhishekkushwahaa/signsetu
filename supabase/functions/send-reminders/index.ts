import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@^2";
import { Resend } from "npm:resend";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

serve(async (_req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const resend = new Resend(RESEND_API_KEY);

    // --- MODIFIED QUERY: We removed the broken time check ---
    // This will now find ALL slots that haven't been sent a reminder yet.
    const { data: upcomingSlots, error } = await supabaseAdmin
      .from("time_slots")
      .select("*")
      .eq("notification_sent", false);

    if (error) throw error;
    if (upcomingSlots.length === 0)
      return new Response("No upcoming slots to process.", { status: 200 });

    for (const slot of upcomingSlots) {
      const { data: user, error: userError } =
        await supabaseAdmin.auth.admin.getUserById(slot.user_id);
      if (userError || !user.user?.email) continue;

      await resend.emails.send({
        from: "Reminder <onboarding@resend.dev>",
        to: ["genius.abhishek.sir@gmail.com"],
        subject: `Reminder: Your slot "${slot.title}" starts soon`,
        html: `<p>Reminder for your scheduled slot: <strong>${slot.title}</strong>.</p>`,
      });

      await supabaseAdmin
        .from("time_slots")
        .update({ notification_sent: true })
        .eq("id", slot.id);
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${upcomingSlots.length} notifications.`,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
