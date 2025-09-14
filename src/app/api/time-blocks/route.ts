import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const uri = process.env.MONGODB_URI!;

export async function GET() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("SignSetu");
    const blocks = await db
      .collection("Clusters")
      .find({ userId: session.user.id })
      .sort({ startTime: 1 })
      .toArray();
    return NextResponse.json(blocks);
  } finally {
    await client.close();
  }
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, startTime, endTime } = await request.json();
  if (!title || !startTime || !endTime)
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );

  const newBlock = {
    userId: session.user.id,
    title,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    notificationSent: false,
    createdAt: new Date(),
  };

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("SignSetu");
    const result = await db.collection("Clusters").insertOne(newBlock);
    return NextResponse.json(result, { status: 201 });
  } finally {
    await client.close();
  }
}
