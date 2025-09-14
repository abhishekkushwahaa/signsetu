import { MongoClient, ObjectId } from "mongodb";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

const uri = process.env.MONGODB_URI!;

export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pathParts = request.nextUrl.pathname.split("/");
  const id = pathParts[pathParts.length - 1];

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { error: "Invalid Block ID format" },
      { status: 400 }
    );
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("SignSetu");

    const result = await db.collection("Clusters").deleteOne({
      _id: new ObjectId(id),
      userId: user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Block not found or you do not have permission" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Block deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete API Error:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the block" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
