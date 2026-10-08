const fs = require("fs");
const p = "tests/components/authProviderPasswordSupport.test.ts";
let s = fs.readFileSync(p, "utf8"); const crlf = s.includes("\r\n"); s = s.replace(/\r\n/g, "\n");
function rep(a, b) { if (!s.includes(a)) throw new Error("missing: " + a.slice(0, 60)); s = s.replace(a, b); }
rep('assert.equal(clientCalls.length, 3, "expected exactly one getSupabaseClient() call per new method (signInWithPassword, sendPasswordResetEmail, updatePassword)");',
    'assert.equal(clientCalls.length, 4, "expected exactly one getSupabaseClient() call per new method (signInWithPassword, signUpWithPassword, sendPasswordResetEmail, updatePassword)");');
rep("assert.match(SOURCE, /signInWithPassword,\s*\n\s*sendPasswordResetEmail,", "assert.match(SOURCE, /signInWithPassword,\s*\n\s*signUpWithPassword,\s*\n\s*sendPasswordResetEmail,");
s += `
test("signUpWithPassword uses Supabase's own signUp() with an email-confirmation redirect to /dashboard; it never reads or stores the password", () => {
  const block = SOURCE.slice(SOURCE.indexOf("const signUpWithPassword"), SOURCE.indexOf("const sendPasswordResetEmail"));
  assert.match(block, /supabase\.auth\.signUp\(\{/);
  assert.match(block, /emailRedirectTo: typeof window !== "undefined" \? \`\$\{window\.location\.origin\}\/dashboard\` : undefined/);
  assert.doesNotMatch(block, /localStorage|sessionStorage|console\./, "the password must never be stored or logged");
  assert.doesNotMatch(block, /service_role|admin\./i);
});

test("an existing address is detected (Supabase returns a user with no identities, not an error) so nothing is created and the parent is told", () => {
  const block = SOURCE.slice(SOURCE.indexOf("const signUpWithPassword"), SOURCE.indexOf("const sendPasswordResetEmail"));
  assert.match(block, /identities\.length === 0/);
});
`;
fs.writeFileSync(p, crlf ? s.replace(/\n/g, "\r\n") : s);
