import Image from "next/image";

/**
 * The homepage hero's real photograph, replacing Increment 1A/1B's
 * temporary book-and-pencil SVG (`StudyIllustration.tsx`, now retired — no
 * longer used anywhere, so removed rather than kept as dead code). This is
 * the Founder-approved brand asset (`public/images/hero-preparation.png`),
 * copied byte-for-byte from the supplied file — not regenerated, recropped
 * at the source, or altered in any way.
 *
 * ASPECT RATIO — disclosed deliberate deviation from Increment 1B's
 * documented 4:5 portrait spec. The supplied asset is a single 1536x1024
 * (3:2 landscape) image containing two photographs side by side. Forcing a
 * 4:5 portrait crop onto a 3:2 landscape source would take a narrow
 * vertical slice from the middle of the frame — landing almost exactly on
 * the boundary between the two photos, cutting into both rather than
 * showing either cleanly. That would violate the governing instruction's
 * own explicit rule ("do not crop faces, heads or important learning
 * activity"), so the container's aspect ratio is set to match the source
 * almost exactly (`aspect-[3/2]`) instead: `object-fit: cover` then crops
 * nothing meaningful, and the whole approved image is shown intact, in
 * the same hero column, at the same general size, with no card/border
 * treatment — the "different object-position/crop behaviour if necessary"
 * allowance the governing instruction itself provides, applied to aspect
 * ratio because the alternative would break its own no-crop-faces rule.
 * One ratio is used at every breakpoint (no per-breakpoint crop
 * difference is needed, since none of them require cropping this image).
 */
export default function HeroPhoto() {
  return (
    <div className="relative aspect-[3/2] w-full rounded-lg overflow-hidden">
      <Image
        src="/images/hero-preparation.png"
        alt="A girl in school uniform holding a stack of books in a home study room, and the same girl helping a younger child with handwriting practice at a desk with English, Mathematics, Reasoning and Vocabulary workbooks."
        fill
        priority
        sizes="(min-width: 768px) 40vw, 100vw"
        className="object-cover object-center"
      />
    </div>
  );
}
