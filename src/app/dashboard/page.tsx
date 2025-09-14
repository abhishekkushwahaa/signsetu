"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface TimeSlot {
  _id: string;
  title: string;
  startTime: string;
}

export default function Dashboard() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const fetchSlots = async () => {
    const res = await fetch("/api/time-blocks");
    if (res.ok) {
      const data = await res.json();
      setSlots(data);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime) {
      alert("Please select a start time.");
      return;
    }

    const [datePart, timePart] = startTime.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    // Create the UTC ISO string manually
    const startDateUTC = new Date(Date.UTC(year, month - 1, day, hour, minute));
    const endDateUTC = new Date(startDateUTC.getTime() + 60 * 60 * 1000);

    const payload = {
      title,
      startTime: startDateUTC.toISOString(),
      endTime: endDateUTC.toISOString(),
    };

    console.log("Sending this payload to the server:", payload);

    await fetch("/api/time-blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setTitle("");
    setStartTime("");
    fetchSlots();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDelete = async (slotId: string) => {
    const res = await fetch(`/api/time-blocks/${slotId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchSlots();
    } else {
      alert("Failed to delete the slot.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
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
            Add a New Slot
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
                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="text-right">
              <button
                type="submit"
                className="inline-flex cursor-pointer justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Add Slot
              </button>
            </div>
          </form>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Your Scheduled Slots
          </h2>
          <div className="space-y-4">
            {slots.length > 0 ? (
              slots.map((slot) => (
                <div
                  key={slot._id}
                  className="flex items-center justify-between rounded-lg bg-white p-4 shadow"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{slot.title}</p>
                    <p className="text-sm text-gray-500">
                      Starts: {new Date(slot.startTime).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(slot._id)}
                    className="cursor-pointer rounded-md p-1 text-sm font-medium text-red-600 transition-colors hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">
                You have no scheduled slots yet.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
