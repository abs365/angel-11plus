"use client";

import { Flame, Star } from "lucide-react";

interface XPBarProps {
  xp: number;
  streak: number;
  name?: string;
}

export default function XPBar({ xp, streak, name = "Angel" }: XPBarProps) {
  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;

  return (
    <div className="bg-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm border border-gray-100">
      <div>
        <p className="text-gray-400 text-xs font-medium">Welcome back</p>
        <p className="text-gray-900 font-bold text-lg leading-tight">{name}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Streak */}
        <div className="flex items-center gap-1.5">
          <Flame size={18} className="text-orange-500" />
          <div>
            <p className="text-gray-900 font-bold text-sm leading-none">{streak}</p>
            <p className="text-gray-400 text-[10px]">day streak</p>
          </div>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1.5">
          <Star size={18} className="text-purple-500" />
          <div>
            <p className="text-gray-900 font-bold text-sm leading-none">{xp} XP</p>
            <p className="text-gray-400 text-[10px]">Level {level}</p>
          </div>
        </div>
      </div>

      {/* XP Progress bar (compact) */}
      <div className="hidden sm:block w-24">
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-gray-400">Lv {level}</span>
          <span className="text-[10px] text-gray-400">Lv {level + 1}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${xpInLevel}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5 text-center">{xpInLevel}/100 XP</p>
      </div>
    </div>
  );
}
