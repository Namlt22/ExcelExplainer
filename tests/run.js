const { makeEnv } = require("./harness");
async function test(name, sheets, sel, opts) {
  const env = makeEnv(sheets, "Sheet1", sel, opts);
  await env.w.FXE_TEST.boot(true);
  await new Promise(r => setTimeout(r, 50));
  const d = env.w.document;
  const st = env.w.FXE_TEST.state;
  console.log("=== " + name, "| status:", d.getElementById("status").textContent, "| syncs", env.log.syncs, "writes", env.log.writes, "tmp deleted", env.log.deleted, "| tmp left:", "__FXE_TMP__" in env.sheets);
  console.log("formula:", d.getElementById("formula").textContent);
  console.log("result:", d.getElementById("result").textContent);
  const walk = (el, dep) => el.querySelectorAll(":scope > .tn").forEach(tn => {
    const row = tn.querySelector(":scope > .row");
    console.log("  ".repeat(dep) + (tn.classList.contains("skipped") ? "[x] " : "") + row.textContent.replace(/\s+/g, " ").trim());
    const k = tn.querySelector(":scope > .body > .kids"); if (k) walk(k, dep + 1);
  });
  walk(d.getElementById("tree"), 1);
  console.log("steps:");
  st.steps.forEach((s, i) => console.log("  " + (i + 1) + ". " + s.after.replace(/\u0001|\u0002/g, "|")));
  return env;
}
(async () => {
  await test("textjoin", { Sheet1: { A2: "a", B2: "B", C2: '=TEXTJOIN("-",TRUE,A2:B2)' } }, "C2");
  await test("if/vlookup", { Sheet1: { A1: 15, B2: "k2", C2: '=IF(A1>10,"Lớn",IFERROR(VLOOKUP(B2,Data!$A$1:$B$3,2,FALSE),"N/A"))' }, Data: { A1: "k1", B1: 1, A2: "k2", B2: 2 } }, "C2");
  await test("if false branch", { Sheet1: { A1: 5, B2: "zz", C2: '=IF(A1>10,"Lớn",IFERROR(VLOOKUP(B2,Data!$A$1:$B$3,2,FALSE),"N/A"))' }, Data: { A1: "k1", B1: 1 } }, "C2");
  await test("let", { Sheet1: { A1: 1, A2: 2, A3: 3, C1: "=LET(x,A1:A3*2,y,SUM(x),y/ROWS(x))" } }, "C1", {dec: ","});
  await test("neg & pct", { Sheet1: { C1: "=-2^2+50%*A1", A1: 4 } }, "C1");
  await test("no formula", { Sheet1: { C1: 5 } }, "C1");
  await test("parse error", { Sheet1: { C1: "=SUM(A1" } }, "C1");
})().catch(e => { console.error("FAIL", e); process.exit(1); });
