const fs = require("fs");
function patch(p, pairs) {
  let s = fs.readFileSync(p, "utf8"); const crlf = s.includes("\r\n"); s = s.replace(/\r\n/g, "\n");
  for (const [a, b] of pairs) { if (!s.includes(a)) throw new Error("missing in " + p + ": " + a.slice(0, 50)); s = s.replace(a, b); }
  fs.writeFileSync(p, crlf ? s.replace(/\n/g, "\r\n") : s);
}
patch("components/parent/ParentSetupCard.tsx", [[
`So you always know whose progress you are looking at. A nickname is fine. It is kept on this device
                  only and is never sent to Angel 11+.`,
`So you always know whose progress you are looking at. A first name or nickname is enough. It is
                  saved with your account only so you can tell your children apart.`]]);
patch("components/parent/ChildNameForm.tsx", [[
` * wording and limits are identical everywhere. The name is local to this
 * device (lib/childProfile.ts) -- never sent to Angel 11+ servers.`,
` * wording and limits are identical everywhere. Since migration 260 the name
 * is stored on the learner's own account record (profiles.learner_name) so a
 * parent can identify and switch between children; a first name or nickname
 * only.`]]);
patch("app/privacy/page.tsx", [
[`            <li>• Your child&apos;s first name or nickname, if you choose to add one (kept on this device only; never sent to us)\n`, ``],
[`          <p className="mt-2">Data synced if you sign in: email address, progress records, session history.</p>`,
`          <p className="mt-2">Data synced if you sign in: email address, progress records, session history, and, for each child on your account, the first name or nickname you choose to give them, their exam pathway, and the exam date and school year if you enter them.</p>
          <p className="mt-2">One account can hold more than one child. Each child has their own separate progress, practice, recommendations and Mock results; they are never combined. We store only a first name or nickname for each child, and only so that you can tell your children apart and switch between them. We never ask for a surname, date of birth, photograph, school, address, phone number or location for this purpose.</p>`],
]);
