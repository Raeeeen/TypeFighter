"use client";

import { useState } from "react";

export default function ProfileVisibilityToggle({
  initialHidden,
}: {
  initialHidden: boolean;
}) {
  const [hidden, setHidden] = useState(initialHidden);
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    const next = !hidden;
    setSaving(true);
    setHidden(next); // optimistic

    try {
      const res = await fetch("/api/profile/visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setHidden(!next); // revert on failure
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between border border-white/[0.07] bg-white/[0.025] p-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
          Profile Visibility
        </p>
        <p className="mt-1 text-sm text-white/50">
          {hidden
            ? "Your profile is hidden from other players"
            : "Anyone can view your profile from the leaderboard"}
        </p>
      </div>

      <button
        onClick={toggle}
        disabled={saving}
        aria-label="Toggle profile visibility"
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
          hidden ? "bg-white/15" : "bg-purple-500"
        } disabled:opacity-50`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            hidden ? "translate-x-0" : "translate-x-5"
          }`}
        />
      </button>
    </div>
  );
}
