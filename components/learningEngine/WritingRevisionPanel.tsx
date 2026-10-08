"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { WritingFeedback } from "@/types/writing-feedback";
import {
  buildRevisionEvidenceEvent,
  canOfferRevision,
  chooseableAreas,
  compareDimensionReads,
  describeMovement,
  type DimensionRead,
} from "@/lib/learningEngine/writingRevision";
import { recordWritingRevisionEvent } from "@/lib/learningEngine/writingRevisionStore";

const LABEL: Record<string, string> = {
  ideas: "Ideas",
  vocabulary: "Vocabulary (including spelling)",
  grammar: "Grammar",
  structure: "Structure",
  punctuation: "Punctuation",
};

const wordsOf = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;
const toReads = (fb: WritingFeedback): DimensionRead[] => (fb.dimensions ?? []).map((d) => ({ dimension: d.dimension, level: d.level, confident: d.confident }));

/**
 * Optional revision step shown after the first Practice Writing feedback (Tier 1: no child text is stored anywhere).
 * Flow: choose ONE area, say in a sentence what you will change (kept on this screen only), revise, check, compare.
 * The first attempt is untouched: its feedback and evidence were recorded when it was submitted. The second read is
 * requested independently of the first (same request shape, no reference to the earlier feedback). Never a score, never
 * mastery, one revision per attempt. Practice only.
 */
export default function WritingRevisionPanel({
  questionId,
  promptTitle,
  promptType,
  promptText,
  originalText,
  originalFeedback,
  checkedItems,
}: {
  questionId: string;
  promptTitle: string;
  promptType: string;
  promptText: string;
  originalText: string;
  originalFeedback: WritingFeedback;
  checkedItems: string[];
}) {
  type Stage = "closed" | "choose" | "revise" | "checking" | "compared";
  const [stage, setStage] = useState<Stage>("closed");
  const [areaId, setAreaId] = useState<string>("");
  const [plan, setPlan] = useState("");
  const [draft, setDraft] = useState(originalText);
  const [error, setError] = useState("");
  const [revisedFeedback, setRevisedFeedback] = useState<WritingFeedback | null>(null);
  const [sessionKey] = useState(() => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Math.random()).slice(2)));

  const areas = chooseableAreas({ areasToImprove: originalFeedback.areasToImprove, dimensions: toReads(originalFeedback) });
  const chosen = areas.find((a) => a.id === areaId) ?? null;
  const revisionsMade = revisedFeedback ? 1 : 0;
  if (!canOfferRevision({ hasFeedback: true, revisionsMade }) && stage !== "compared") return null;
  if (areas.length === 0 && stage === "closed") return null;

  async function check() {
    setError("");
    setStage("checking");
    try {
      const client = getSupabaseClient();
      const token = client ? (await client.auth.getSession()).data.session?.access_token : undefined;
      const res = await fetch("/api/writing-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ promptTitle, promptType, promptText, writingText: draft, checkedItems }),
      });
      if (!res.ok) {
        setError(res.status === 401 ? "Please refresh the page and try again." : "Smart feedback is temporarily unavailable. Your first attempt is safe.");
        setStage("revise");
        return;
      }
      const fb: WritingFeedback = await res.json();
      setRevisedFeedback(fb);
      setStage("compared");
      // Text-free evidence event (best effort; formative only; never counted towards mastery).
      recordWritingRevisionEvent(
        buildRevisionEvidenceEvent({
          questionId,
          sessionKey,
          chosenArea: chosen?.dimension ?? null,
          originalReads: toReads(originalFeedback),
          revisedReads: toReads(fb),
          originalWords: wordsOf(originalText),
          revisedWords: wordsOf(draft),
        })
      ).catch(() => {});
    } catch {
      setError("We couldn't reach Angel 11+. Your first attempt is safe. Please check your connection and try again.");
      setStage("revise");
    }
  }

  const movements = revisedFeedback ? compareDimensionReads(toReads(originalFeedback), toReads(revisedFeedback)) : [];

  return (
    <section aria-label="Optional revision" className="rounded-xl border border-[var(--angel-border)] bg-[var(--angel-paper)] p-4 text-xs text-[var(--angel-ink)]">
      {stage === "closed" && (
        <div>
          <p className="font-semibold text-[var(--angel-navy)] text-sm">Want to improve one thing?</p>
          <p className="mt-1 text-[var(--angel-muted)]">Optional. Your first attempt stays exactly as it is. Pick one area from your feedback and try to make it better.</p>
          <button type="button" onClick={() => setStage("choose")} className="mt-3 rounded-xl bg-[var(--angel-sky)] px-4 py-2 font-semibold text-[var(--angel-navy)]">
            Choose one thing to improve
          </button>
        </div>
      )}

      {stage === "choose" && (
        <div>
          <p className="font-semibold text-[var(--angel-navy)] text-sm">Pick ONE area to work on</p>
          <fieldset className="mt-2 space-y-1.5">
            <legend className="sr-only">Area to improve</legend>
            {areas.map((a) => (
              <label key={a.id} className="flex items-start gap-2">
                <input type="radio" name="revision-area" value={a.id} checked={areaId === a.id} onChange={() => setAreaId(a.id)} className="mt-0.5" />
                <span>{a.label}</span>
              </label>
            ))}
          </fieldset>
          <label className="mt-3 block">
            <span className="font-semibold">In one sentence, what will you change?</span>
            <input value={plan} onChange={(e) => setPlan(e.target.value.slice(0, 200))} className="mt-1 w-full rounded-lg border border-[var(--angel-border)] bg-white p-2 text-sm" placeholder="For example: use more exact words in my first paragraph" />
            <span className="text-[11px] text-[var(--angel-muted)]">This stays on your screen only. It is not saved.</span>
          </label>
          <div className="mt-3 flex gap-2">
            <button type="button" disabled={!areaId} onClick={() => setStage("revise")} className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-40">
              Start my revision
            </button>
            <button type="button" onClick={() => setStage("closed")} className="rounded-xl px-4 py-2 font-semibold text-[var(--angel-muted)]">
              Not now
            </button>
          </div>
        </div>
      )}

      {(stage === "revise" || stage === "checking") && (
        <div>
          <p className="font-semibold text-[var(--angel-navy)] text-sm">Revise your writing{chosen ? `: ${chosen.label}` : ""}</p>
          {plan && <p className="mt-1 text-[var(--angel-muted)]">Your plan: {plan}</p>}
          <label className="mt-2 block">
            <span className="sr-only">Your revised writing</span>
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={10} className="w-full rounded-lg border border-[var(--angel-border)] bg-white p-3 text-sm" disabled={stage === "checking"} />
          </label>
          <p className="mt-1 text-[11px] text-[var(--angel-muted)]">{wordsOf(draft)} words. Change what you chose to work on. You do not need to rewrite everything.</p>
          {error && <p role="alert" className="mt-2 text-red-600">{error}</p>}
          <button type="button" disabled={wordsOf(draft) < 10 || stage === "checking" || draft.trim() === originalText.trim()} onClick={check} aria-busy={stage === "checking"} className="mt-3 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-40">
            {stage === "checking" ? "Checking…" : "Check my revision"}
          </button>
          {draft.trim() === originalText.trim() && <p className="mt-1 text-[11px] text-[var(--angel-muted)]">Make at least one change first.</p>}
        </div>
      )}

      {stage === "compared" && revisedFeedback && (
        <div>
          <p className="font-semibold text-[var(--angel-navy)] text-sm">What changed</p>
          <p className="mt-1 text-[var(--angel-muted)]">Practice feedback on your changes. It is not a mark, and your first attempt stays as it was.</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <p className="font-semibold">Your first version</p>
              <p className="mt-1 whitespace-pre-wrap rounded-lg bg-white p-3 border border-[var(--angel-border)]">{originalText}</p>
            </div>
            <div>
              <p className="font-semibold">Your revision</p>
              <p className="mt-1 whitespace-pre-wrap rounded-lg bg-white p-3 border border-[var(--angel-border)]">{draft}</p>
            </div>
          </div>
          {chosen && (
            <p className="mt-3">
              <strong>The area you chose, {chosen.label}: </strong>
              {chosen.dimension ? describeMovement(movements.find((m) => m.dimension === chosen.dimension)?.movement ?? "not_compared") : "look at the two versions and ask whether your change did what you planned."}
            </p>
          )}
          <ul className="mt-2 space-y-0.5">
            {movements.map((m) => (
              <li key={m.dimension}>
                <strong>{LABEL[m.dimension]}: </strong>
                {describeMovement(m.movement)}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-[var(--angel-muted)]">AI-generated guidance. It can read the same writing slightly differently each time, so trust what you can see in your own words.</p>
        </div>
      )}
    </section>
  );
}
