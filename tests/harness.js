const fs = require("fs");
const { JSDOM } = require("jsdom");
const REPO = require("path").resolve(__dirname, "..");
function makeEnv(sheets, active, sel, opts = {}) {
  const html = fs.readFileSync(REPO + "/taskpane.html", "utf8").replace(/<script[^>]*src="https[^"]*"><\/script>/, "");
  const dom = new JSDOM(html, { runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  w.eval(fs.readFileSync(REPO + "/src/parser.js", "utf8"));
  w.eval(fs.readFileSync(REPO + "/demo/fake-excel.js", "utf8"));
  const log = w.makeFakeExcel(sheets, active, () => sel, opts);
  w.eval(fs.readFileSync(REPO + "/src/docs.js", "utf8"));
  w.eval(fs.readFileSync(REPO + "/src/app.js", "utf8"));
  return { w, dom, log, sheets };
}
module.exports = { makeEnv };
