import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const id = pathParts[pathParts.length - 1];

  const { error } = await supabase
    .from("time_slots")
    .delete()
    .match({ id: id, user_id: user.id });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: "Slot deleted successfully" },
    { status: 200 }
  );
}
