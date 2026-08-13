# Angel 11+ — Review Throughput Plan V1

**Prepared:** Educational Increment 007F, 2026-08-13. **Purpose:** per Part 11, how Angel supports sustained content scale without the Founder becoming (or remaining) the permanent review bottleneck, once the 007F pilot proves the mechanism works.

## The Founder's role after the pilot

Per Decision 50, the Founder acting as Educational Reviewer for the 7-target pilot is a bounded authorisation, not the standing pattern. After the pilot:
- **Founder review**: reserved for high-impact releases (a new family type, a new passage genre, anything that sets a pattern other content will follow) and for escalations (a `requires_revalidation`/`rejected` finding another reviewer can't resolve alone).
- **Founder Approver** role (programme/release decisions, activation authorisation) remains theirs throughout — this does not change, and is not what throughput scaling addresses.

## Recommended reviewer capacity, by subject

- **Mathematics**: one additional reviewer with strong subject knowledge and/or 11+ tutoring experience. Mathematics families are the most deterministic content in the programme (single correct numeric/method answer per family), so family-level review (Operating Model §3) covers the most ground per hour of reviewer time here.
- **English/Comprehension**: one additional reviewer with English teaching or tutoring experience, ideally with real 11+ preparation exposure — English review requires more judgement per item (ambiguity, wording quality, teaching quality) than Mathematics, so this role carries relatively more of the ongoing workload even though the current supply (117 English questions) is smaller than Mathematics (146).
- **Writing**: not needed yet — only 1 Writing prompt exists, and Decision 47 already records the Continuous Writing scoring model as a known defect ahead of a rebuild; recommend deferring a dedicated Writing reviewer until that rebuild lands.

Two people (one per subject) is enough to clear the current backlog (24 English targets + 20 Mathematics families) at a sustainable pace using family-level sampling — this is deliberately not a large team, per the Founder's own "do not create unnecessary staffing bureaucracy" instruction.

## How review effort scales with content growth

The scaling lever is **family-level sampling (Operating Model §3), not headcount.** A family review, once approved, covers every deterministic sibling automated validation already proves conforms to the same tier/shape. Concretely:
- Reviewing `wave1-fam-vocab-explain` once (its 8-item representative+boundary sample) currently covers all 17 live instances. If that family grows to 50 instances next wave, the SAME review effort still covers it, provided automated validation's tier-conformance check keeps passing for every new sibling — the reviewer only needs to re-look if a genuinely new structural variant appears (a new sub-type, like 007C's cause-effect sequencing addition).
- Passages do not benefit from this — each new passage is its own unit of reviewer time, always. This is the one part of review effort that scales linearly with content volume regardless of process improvements, and is the strongest argument for keeping passage authoring volume itself deliberate (a small number of strong, varied passages) rather than large.

## What happens after this pilot proves the loop

1. The Founder (or Founder Approver decision) recruits the 2 subject reviewers above.
2. Each new reviewer is onboarded the same way the pilot proves out: sign in, `/admin-beta/review`, work the backlog by priority.
3. `is_admin` grants (migration 008's existing bootstrap) are the only access-control step needed — no new mechanism required.
4. Content authoring resumes at scale only once this throughput is demonstrated to keep pace with authoring volume — the Founder's own Part 12 instruction across 007D-007F.
