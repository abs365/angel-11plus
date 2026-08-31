"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, Mic, Square, MicOff, RotateCcw } from "lucide-react";
import { compareTranscript } from "@/lib/readingUtils";
import type { ReadResult } from "@/lib/readingUtils";

type ListenState = "idle" | "playing" | "paused";
type RecordState = "idle" | "recording" | "done" | "unsupported";

interface Props {
  passage: string;
}

export default function PassagePlayer({ passage }: Props) {
  const [listenState, setListenState] = useState<ListenState>("idle");
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [result, setResult] = useState<ReadResult | null>(null);

  const finalRef = useRef("");
  const startTimeRef = useRef(0);
  // Whether the recording loop should keep restarting (handles iOS 60s cutoff)
  const activeRef = useRef(false);
  const recRef = useRef<any>(null);

  // Feature detection (safe for SSR)
  const hasTTS =
    typeof window !== "undefined" && "speechSynthesis" in window;
  const hasSpeechRec =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hasTTS) window.speechSynthesis.cancel();
      activeRef.current = false;
      try { recRef.current?.abort(); } catch {}
    };
  }, [hasTTS]);

  // ── TTS listen ─────────────────────────────────────────────────────────────

  function startListening() {
    if (!hasTTS) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(passage);
    utter.lang = "en-GB";
    utter.rate = 0.85;
    utter.pitch = 1.0;

    // Prefer a local en-GB voice when available
    const voices = window.speechSynthesis.getVoices();
    const pick =
      voices.find((v) => v.lang.startsWith("en-GB") && v.localService) ??
      voices.find((v) => v.lang.startsWith("en-GB")) ??
      voices.find((v) => v.lang.startsWith("en")) ??
      null;
    if (pick) utter.voice = pick;

    utter.onend = () => setListenState("idle");
    utter.onerror = () => setListenState("idle");

    window.speechSynthesis.speak(utter);
    setListenState("playing");
  }

  function pauseListening() {
    window.speechSynthesis.pause();
    setListenState("paused");
  }

  function resumeListening() {
    window.speechSynthesis.resume();
    setListenState("playing");
  }

  function stopListening() {
    window.speechSynthesis.cancel();
    setListenState("idle");
  }

  // ── Read-aloud recording ───────────────────────────────────────────────────

  function buildRecognition(): any | null {
    if (!hasSpeechRec) return null;
    const SpeechRec =
      (window as any).SpeechRecognition ??
      (window as any).webkitSpeechRecognition;
    const rec = new SpeechRec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-GB";
    rec.maxAlternatives = 1;
    return rec;
  }

  function attachHandlers(rec: any) {
    rec.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text: string = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalRef.current += text + " ";
        } else {
          interim = text;
        }
      }
      setLiveTranscript(finalRef.current + interim);
    };

    // iOS stops recognition after ~60 s — restart silently while still recording
    rec.onend = () => {
      if (activeRef.current) {
        const fresh = buildRecognition();
        if (!fresh) return;
        attachHandlers(fresh);
        recRef.current = fresh;
        try { fresh.start(); } catch {}
      }
    };

    rec.onerror = (event: any) => {
      if (event.error === "no-speech") return;
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        activeRef.current = false;
        setRecordState("unsupported");
      }
    };
  }

  function startRecording() {
    // Stop TTS if running
    if (hasTTS) {
      window.speechSynthesis.cancel();
      setListenState("idle");
    }

    if (!hasSpeechRec) {
      setRecordState("unsupported");
      return;
    }

    finalRef.current = "";
    startTimeRef.current = Date.now();
    activeRef.current = true;
    setLiveTranscript("");
    setResult(null);

    const rec = buildRecognition();
    attachHandlers(rec);
    recRef.current = rec;

    try {
      rec.start();
      setRecordState("recording");
    } catch {
      setRecordState("unsupported");
      activeRef.current = false;
    }
  }

  function stopRecording() {
    activeRef.current = false;
    try { recRef.current?.stop(); } catch {}

    const seconds = (Date.now() - startTimeRef.current) / 1000;
    const spoken = finalRef.current.trim();

    if (spoken.length > 0) {
      setResult(compareTranscript(passage, spoken, seconds));
    }
    setRecordState("done");
  }

  function resetReading() {
    finalRef.current = "";
    setLiveTranscript("");
    setResult(null);
    setRecordState("idle");
  }

  // ── Hide entirely when nothing is supported ───────────────────────────────
  if (!hasTTS && !hasSpeechRec) return null;

  return (
    <div className="mb-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 px-3 py-2.5">
      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-2">

        {/* ── Listen controls ── */}
        {hasTTS && listenState === "idle" && recordState !== "recording" && (
          <button
            onClick={startListening}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Volume2 size={13} />
            Listen
          </button>
        )}

        {hasTTS && listenState === "playing" && (
          <>
            <button
              onClick={pauseListening}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span className="flex gap-0.5">
                <span className="w-1 h-3 bg-blue-600 dark:bg-blue-400 rounded-sm inline-block" />
                <span className="w-1 h-3 bg-blue-600 dark:bg-blue-400 rounded-sm inline-block" />
              </span>
              Pause
            </button>
            <button
              onClick={stopListening}
              className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2 py-1.5 rounded-lg transition-colors"
            >
              <Square size={10} className="fill-current" />
              Stop
            </button>
            <span className="text-xs text-blue-500 dark:text-blue-400 animate-pulse font-medium">Reading…</span>
          </>
        )}

        {hasTTS && listenState === "paused" && (
          <>
            <button
              onClick={resumeListening}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Volume2 size={13} />
              Resume
            </button>
            <button
              onClick={stopListening}
              className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2 py-1.5 rounded-lg transition-colors"
            >
              <Square size={10} className="fill-current" />
              Stop
            </button>
          </>
        )}

        {/* Divider */}
        {hasTTS && hasSpeechRec && listenState === "idle" && recordState === "idle" && (
          <span className="text-gray-200 dark:text-gray-700 select-none">|</span>
        )}

        {/* ── Read-aloud controls ── */}
        {hasSpeechRec && recordState === "idle" && listenState === "idle" && (
          <button
            onClick={startRecording}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Mic size={13} />
            Read aloud
          </button>
        )}

        {recordState === "recording" && (
          <>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
              Recording
            </span>
            <button
              onClick={stopRecording}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Square size={10} className="fill-current" />
              Done
            </button>
          </>
        )}

        {recordState === "unsupported" && (
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <MicOff size={12} />
            Read-aloud needs Chrome or Safari
          </span>
        )}
      </div>

      {/* Live transcript preview */}
      {recordState === "recording" && liveTranscript && (
        <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500 italic leading-snug line-clamp-2">
          &ldquo;{liveTranscript}&rdquo;
        </p>
      )}

      {/* Results panel */}
      {recordState === "done" && result && (
        <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-end gap-5 flex-wrap">
            <Stat
              value={`${result.accuracy}%`}
              label="Accuracy"
              color={
                result.accuracy >= 80 ? "text-green-600 dark:text-green-400"
                : result.accuracy >= 60 ? "text-amber-500 dark:text-amber-400"
                : "text-red-500 dark:text-red-400"
              }
            />
            <Stat value={String(result.wpm || "N/A")} label="WPM" />
            <Stat value={`${result.wordsMatched}/${result.wordsTotal}`} label="Words" />
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug flex-1 min-w-[120px]">
              {result.accuracy >= 90
                ? "Excellent reading fluency."
                : result.accuracy >= 75
                ? "Good. A second read-through will sharpen this."
                : result.accuracy >= 55
                ? "Keep practising. Read slowly and clearly."
                : "Try again. Speak clearly and follow the text."}
            </p>
          </div>
          <button
            onClick={resetReading}
            className="mt-2 flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <RotateCcw size={10} />
            Try again
          </button>
        </div>
      )}

      {recordState === "done" && !result && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">No speech detected.</span>
          <button onClick={resetReading} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({
  value,
  label,
  color = "text-gray-800 dark:text-gray-100",
}: {
  value: string;
  label: string;
  color?: string;
}) {
  return (
    <div className="text-center">
      <p className={`text-xl font-black leading-none ${color}`}>{value}</p>
      <p className="text-[9px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
