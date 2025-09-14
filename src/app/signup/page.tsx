"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

interface TimeBlock {
  _id: string;
  title: string;
  startTime: string;
}

export default function Dashboard() {
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const fetchBlocks = async () => {
    const res = await fetch("/api/time-blocks");
    if (res.ok) {
      const data = await res.json();
      setBlocks(data);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000);

    await fetch("/api/time-blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        startTime,
        endTime: endTime.toISOString(),
      }),
    });

    setTitle("");
    setStartTime("");
    fetchBlocks();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDelete = async (blockId: string) => {
    const res = await fetch(`/api/time-blocks/${blockId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchBlocks();
    } else {
      alert("Failed to delete the block.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            {/* --- UPDATED: Logout button with onClick and styles --- */}
            <button
              onClick={handleLogout}
              className="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Add a New Quiet Hour
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Deep Work Session"
                required
                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="startTime"
                className="block text-sm font-medium text-gray-700"
              >
                Start Time
              </label>
              <input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="text-right">
              {/* --- UPDATED: Add Block button with styles --- */}
              <button
                type="submit"
                className="inline-flex cursor-pointer justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Add Block
              </button>
            </div>
          </form>
        </div>
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Your Scheduled Blocks
          </h2>
          <div className="space-y-4">
            {blocks.length > 0 ? (
              blocks.map((block) => (
                <div
                  key={block._id}
                  className="flex items-center justify-between rounded-lg bg-white p-4 shadow"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{block.title}</p>
                    <p className="text-sm text-gray-500">
                      Starts: {new Date(block.startTime).toLocaleString()}
                    </p>
                  </div>
                  {/* --- UPDATED: Delete button with onClick and styles --- */}
                  <button
                    onClick={() => handleDelete(block._id)}
                    className="cursor-pointer text-sm font-medium text-red-600 transition-colors hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md"
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">
                You have no scheduled blocks yet.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
