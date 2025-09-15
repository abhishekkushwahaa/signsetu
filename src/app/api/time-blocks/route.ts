import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: slots, error } = await supabase
    .from("time_slots")
    .select("*")
    .eq("user_id", user.id)
    .order("start_time", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(slots);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, startTime, endTime } = await request.json();

  const { error } = await supabase.from("time_slots").insert({
    title,
    start_time: startTime,
    end_time: endTime,
    user_id: user.id,
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Success" }, { status: 201 });
}
