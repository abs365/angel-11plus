"use client";

import Link from "next/link";
import { getWorkedExample } from "@/lib/learningEngine/englishExamStrategies";
import { getMathsTeachingContent } from "@/lib/learningEngine/mathsTeachingContent";
import type { SupportStep } from "@/lib/learningEngine/liveRemediation";

/**
 * CSSE Completion Priority 1 -- the support a learner is offered AFTER repeated wrong answers in one family
 * during Practice. Shown only after the answer has been submitted, and it demonstrates the method on a separate,
 * fixed scenario (the worked example / worked method), never the live question's answer.
 * Never rendered in Mock.
 */
export default function InSessionSupport({
  step,
  subject,
  familyId,
  lessonRoute,
}: {
  step: SupportStep;
  subject: "maths" | "english";
  familyId?: string;
  lessonRoute?: string;
}) {
  if (step !== "worked_reasoning" && step !== "explicit_reteach") return null;

  const english = subject === "english" ? getWorkedExample(familyId) : undefined;
  const maths = subject === "maths" ? getMathsTeachingContent(familyId) : undefined;
  if (!english && !maths && !lessonRoute) return null;

  return (
    <section
      aria-label="Support for this kind of question"
      className="mt-4 rounded-xl bg-[var(--angel-sky)] p-4 text-xs text-[var(--angel-ink)]"
    >
      <p className="font-semibold text-[var(--angel-navy)]">
        {step === "explicit_reteach"
          ? "This kind of question has been tricky a few times. Let's slow down and go through the method."
          : "Let's look at how this kind of question works, on a different example."}
      </p>

      {english && (
        <div className="mt-2 space-y-1">
          <p>{english.scenario}</p>
          <p>{english.modelReasoning}</p>
          {english.fiveStepModel && (
            <ol className="list-decimal list-inside">
              {english.fiveStepModel.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          )}
        </div>
      )}

      {maths && (
        <div className="mt-2 space-y-1">
          <p>{maths.model.relationship}</p>
          <p className="font-semibold">{maths.model.scenario}</p>
          <ol className="list-decimal list-inside">
            {maths.model.reasoning.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
          <p>
            Answer: {maths.model.answer}. {maths.model.verification}
          </p>
        </div>
      )}

      {step === "explicit_reteach" && lessonRoute && (
        <p className="mt-3">
          <Link href={lessonRoute} className="font-semibold text-[var(--angel-blue)] hover:underline">
            Open the lesson for this skill
          </Link>
        </p>
      )}
    </section>
  );
}
