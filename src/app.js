/* Formula Explainer - taskpane.
 * Luong xu ly: doc o dang chon -> phan tich cu phap -> lap danh sach bieu thuc con
 * -> tinh tat ca trong MOT lan dong bo tren sheet an tam -> danh dau nhanh khong duoc chon
 * -> ve cay cac buoc, che do tung buoc va danh muc ham.
 */
/* global Office, Excel, FXP, FXDOCS */
(function () {
  "use strict";

  const SCRATCH = "__FXE_TMP__";
  const MAX_CELLS = 400;
  const ARR_MARK = "~FXE_ARR~";
  const VOLATILE = ["RAND", "RANDBETWEEN", "RANDARRAY", "NOW", "TODAY", "OFFSET", "INDIRECT", "CELL", "INFO"];
  const KIND = { ref: "Lấy giá trị ô/vùng", name: "Lấy giá trị tên/biến", op: "Tính toán tử", func: "Tính hàm", array: "Hằng mảng" };

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const state = { auto: false, busy: false, pending: false, timer: null, lastKey: "", sep: ",", dec: ".", nodes: new Map(), steps: [], idx: 0, root: null };

  /* ============================== Khoi dong ============================== */
  function boot(isExcel) {
    if (!isExcel) { setStatus("Add-in này chỉ chạy trong Excel.", "err"); return; }
    $("btnRefresh").onclick = () => run(true);
    $("chkAuto").onchange = (e) => setAuto(e.target.checked);
    $("btnExpand").onclick = () => toggleAll(true);
    $("btnCollapse").onclick = () => toggleAll(false);
    $("btnPrev").onclick = () => showStep(state.idx - 1);
    $("btnNext").onclick = () => showStep(state.idx + 1);
    $("btnFirst").onclick = () => showStep(0);
    $("btnLast").onclick = () => showStep(state.steps.length - 1);
    document.querySelectorAll(".tab").forEach((t) => (t.onclick = () => selectTab(t.dataset.tab)));
    document.addEventListener("keydown", (e) => {
      if ($("pane-seq").hidden) return;
      if (e.key === "ArrowRight") showStep(state.idx + 1);
      if (e.key === "ArrowLeft") showStep(state.idx - 1);
    });
    initPopover();
    let auto = false;
    try { auto = localStorage.getItem("fxe.auto") === "1"; } catch (e) { /* bo qua */ }
    $("chkAuto").checked = auto;
    setAuto(auto);
    if (!Office.context.requirements.isSetSupported("ExcelApi", "1.9")) {
      setStatus("Phiên bản Excel này quá cũ. Cần Excel 2021 / Microsoft 365.", "err");
      return;
    }
    run(true);
  }
  if (typeof Office !== "undefined") Office.onReady((info) => boot(info.host === Office.HostType.Excel));
  window.FXE_TEST = { boot, run, state };

  function setAuto(on) {
    state.auto = on;
    try { localStorage.setItem("fxe.auto", on ? "1" : "0"); } catch (e) { /* bo qua */ }
    const doc = Office.context.document;
    if (on) doc.addHandlerAsync(Office.EventType.DocumentSelectionChanged, onSelChanged);
    else doc.removeHandlerAsync(Office.EventType.DocumentSelectionChanged, { handler: onSelChanged });
  }
  function onSelChanged() { clearTimeout(state.timer); state.timer = setTimeout(() => run(false), 450); }
  function setStatus(msg, cls) { const s = $("status"); s.textContent = msg || ""; s.className = cls || ""; s.hidden = !msg; }
  function selectTab(name) {
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("on", t.dataset.tab === name));
    document.querySelectorAll(".pane").forEach((p) => (p.hidden = p.id !== "pane-" + name));
  }

  /* ============================== Chay phan tich ============================== */
  async function run(force) {
    if (state.busy) { state.pending = true; return; }
    state.busy = true;
    document.body.classList.add("busy");
    try {
      await Excel.run(async (ctx) => {
        const api112 = Office.context.requirements.isSetSupported("ExcelApi", "1.12");
        let cell = ctx.workbook.getActiveCell();
        cell.load("address,formulas,values,valueTypes");
        let parent = null;
        if (api112) { parent = cell.getSpillParentOrNullObject(); parent.load("address"); }
        const ws = cell.worksheet;
        ws.load("name");
        let culture = null;
        if (Office.context.requirements.isSetSupported("ExcelApi", "1.11")) {
          culture = ctx.application.cultureInfo.numberFormat;
          culture.load("numberDecimalSeparator");
        }
        await ctx.sync();
        if (culture) { state.dec = culture.numberDecimalSeparator || "."; state.sep = state.dec === "," ? ";" : ","; }

        let f = cell.formulas[0][0];
        if (!isFormula(f) && parent && !parent.isNullObject) {
          cell = parent;
          cell.load("address,formulas,values,valueTypes");
          await ctx.sync();
          f = cell.formulas[0][0];
        }
        if (!isFormula(f)) { state.lastKey = ""; showEmpty(cell.address); return; }
        const key = cell.address + "|" + f;
        if (!force && key === state.lastKey) return;
        state.lastKey = key;

        let root;
        try { root = FXP.parse(f); }
        catch (e) { showParseError(cell.address, f, e.message); return; }

        const info = { sheet: ws.name, cellAddr: cell.address, cell };
        await resolveContext(ctx, root, info);
        const plan = buildPlan(root, info);
        await evaluatePlan(ctx, plan, api112);
        markTaken(root, true);

        let finalRes = fromCell(cell.values[0][0], cell.valueTypes[0][0]);
        if (api112) {
          const sp = cell.getSpillingToRangeOrNullObject();
          sp.load("values,valueTypes,rowCount,columnCount");
          await ctx.sync();
          if (!sp.isNullObject) finalRes = arrRes(sp.values, sp.valueTypes);
        }
        render(root, info, f, finalRes);
      });
    } catch (e) {
      setStatus("Lỗi: " + (e && e.message ? e.message : e), "err");
    } finally {
      state.busy = false;
      document.body.classList.remove("busy");
      if (state.pending) { state.pending = false; run(false); }
    }
  }
  const isFormula = (f) => typeof f === "string" && f[0] === "=";

  /* ---- [@Cot] -> o that cua dong hien tai; ROW()/COLUMN() -> o goc ---- */
  async function resolveContext(ctx, root, info) {
    const jobs = [];
    FXP.walk(root, (n) => {
      if (n.type === "func" && !n.kids.length && ["ROW", "COLUMN"].includes(FXP.norm(n.name))) n.addr = info.cellAddr;
      if (n.type === "struct") { const p = FXP.parseStruct(n.text); if (p) jobs.push({ n, p }); }
    });
    if (!jobs.length) return;
    try {
      let own = null;
      for (const j of jobs) {
        if (j.p.table) j.tbl = ctx.workbook.tables.getItemOrNullObject(j.p.table);
        else { if (!own) own = info.cell.getTables(false).getFirstOrNullObject(); j.tbl = own; }
        j.tbl.load("name");
      }
      await ctx.sync();
      const live = jobs.filter((j) => !j.tbl.isNullObject);
      live.forEach((j) => { j.col = j.tbl.columns.getItemOrNullObject(j.p.col); j.col.load("name"); });
      await ctx.sync();
      const ok = live.filter((j) => !j.col.isNullObject);
      ok.forEach((j) => {
        let rg = j.col.getDataBodyRange();
        if (j.p.thisRow) rg = rg.getIntersectionOrNullObject(info.cell.getEntireRow());
        j.rg = rg;
        rg.load("address");
      });
      await ctx.sync();
      ok.forEach((j) => { if (!j.rg.isNullObject) j.n.addr = j.rg.address; });
    } catch (e) { /* khong xac dinh duoc -> de nguyen, se bao "khong tinh rieng duoc" */ }
  }

  /* ============================== Lap ke hoach tinh ============================== */
  function collectLocals(root) {
    const set = new Set();
    FXP.walk(root, (n) => {
      if (n.type !== "func") return;
      const f = FXP.norm(n.name), k = n.kids;
      k.forEach((a, i) => {
        const isP = (f === "LET" && i < k.length - 1 && i % 2 === 0) || (f === "LAMBDA" && i < k.length - 1);
        if (isP && a.type === "name") { a.isParam = true; set.add(FXP.norm(a.text)); }
      });
    });
    return set;
  }
  function freeVars(n, locals, bound = new Set(), out = new Set()) {
    if (n.type === "name") {
      const u = FXP.norm(n.text);
      if (!n.isParam && locals.has(u) && !bound.has(u)) out.add(u);
      return out;
    }
    if (n.type === "func") {
      const f = FXP.norm(n.name);
      if (locals.has(f) && !bound.has(f)) out.add(f);
      if (f === "LET" || f === "LAMBDA") {
        const b = new Set(bound);
        n.kids.forEach((a) => { if (a.isParam) b.add(FXP.norm(a.text)); else freeVars(a, locals, new Set(b), out); });
        return out;
      }
    }
    n.kids.forEach((c) => freeVars(c, locals, bound, out));
    return out;
  }
  function scanBad(n) {
    let why = null;
    FXP.walk(n, (x) => {
      if (why) return;
      if (x.type === "struct" && !x.addr && FXP.parseStruct(x.text)) why = "Tham chiếu bảng theo dòng hiện tại – không xác định được dòng.";
    });
    return why;
  }
  function notEvaluable(n, env, locals) {
    if (n.type === "func" && FXP.norm(n.name) === "LAMBDA") return "LAMBDA là định nghĩa hàm – chỉ có giá trị khi được gọi.";
    const bad = scanBad(n);
    if (bad) return bad;
    const have = new Set(env.map((e) => e.upper));
    const miss = [...freeVars(n, locals)].filter((v) => !have.has(v));
    return miss.length ? `Phụ thuộc tham số LAMBDA (${miss.join(", ")}) – chỉ có giá trị khi hàm được gọi.` : null;
  }
  function litRes(n) {
    switch (n.type) {
      case "num": return { k: "s", v: Number(n.text), t: "Double" };
      case "str": return { k: "s", v: n.text.slice(1, -1).replace(/""/g, '"'), t: "String" };
      case "bool": return { k: "s", v: /^TRUE$/i.test(n.text), t: "Boolean" };
      default: return { k: "s", v: n.text.toUpperCase(), t: "Error" };
    }
  }

  function buildPlan(root, info) {
    const locals = collectLocals(root);
    const plan = [];
    state.locals = locals;
    const ev = (n) => FXP.text(n, { mode: "eval", sheet: info.sheet });
    function add(n, env) {
      const why = notEvaluable(n, env, locals);
      if (why) { n.res = { k: "na", msg: why }; return; }
      let expr = ev(n);
      if (freeVars(n, locals).size) expr = "LET(" + env.map((e) => e.name + "," + e.text).join(",") + "," + expr + ")";
      plan.push({ node: n, expr });
    }
    function walk(n, env) {
      switch (n.type) {
        case "num": case "str": case "bool": case "err": n.res = litRes(n); return;
        case "missing": n.res = { k: "na", msg: "Bỏ trống – Excel dùng giá trị mặc định của tham số." }; return;
        case "array": case "ref": case "struct": case "name": if (!n.isParam) add(n, env); return;
        case "paren": walk(n.kids[0], env); return;
        case "unary": case "postfix": {
          const c = n.kids[0];
          if (n.type === "unary" && n.op === "-" && c.type === "num") { walk(c, env); n.res = { k: "s", v: -Number(c.text), t: "Double" }; return; }
          walk(c, env); add(n, env); return;
        }
        case "binary": if (n.op !== ":") n.kids.forEach((k) => walk(k, env)); add(n, env); return;
        case "func": {
          const f = FXP.norm(n.name), k = n.kids;
          if (f === "LAMBDA") { n.res = { k: "na", msg: "LAMBDA là định nghĩa hàm – chỉ có giá trị khi được gọi." }; return; }
          if (f === "LET" && k.length >= 3) {
            const env2 = env.slice();
            for (let i = 0; i + 1 < k.length; i += 2) {
              walk(k[i + 1], env2);
              if (k[i].type === "name") env2.push({ name: k[i].text, upper: FXP.norm(k[i].text), text: ev(k[i + 1]) });
            }
            walk(k[k.length - 1], env2);
          } else k.forEach((c) => walk(c, env));
          add(n, env);
        }
      }
    }
    walk(root, []);
    return plan;
  }

  /* ============================== Tinh tren sheet tam ============================== */
  const wrapExpr = (e) =>
    `LET(fxeV,${e},fxeR,IFERROR(ROWS(fxeV),1),fxeC,IFERROR(COLUMNS(fxeV),1),` +
    `IF(fxeR*fxeC=1,INDEX(fxeV,1,1),"${ARR_MARK}"&fxeR&"x"&fxeC))`;

  function fromCell(v, t) {
    if (t === "String" && typeof v === "string" && v.startsWith(ARR_MARK)) {
      const m = v.slice(ARR_MARK.length).split("x");
      return { k: "pend", rows: +m[0], cols: +m[1] };
    }
    if (t === "Empty") return { k: "s", v: "", t: "Empty" };
    return { k: "s", v, t };
  }
  const arrRes = (values, types) =>
    values.length === 1 && values[0].length === 1 ? fromCell(values[0][0], types[0][0]) :
      { k: "a", rows: values.length, cols: values[0].length, values, types };

  async function getScratch(ctx) {
    let sh = ctx.workbook.worksheets.getItemOrNullObject(SCRATCH);
    await ctx.sync();
    if (sh.isNullObject) {
      sh = ctx.workbook.worksheets.add(SCRATCH);
      try { await ctx.sync(); }
      catch (e) { throw new Error("Không tạo được sheet tạm để tính (workbook có thể đang bị khóa cấu trúc – Review > Protect Workbook)."); }
    } else {
      sh.getRange().clear(Excel.ClearApplyTo.contents);
    }
    sh.visibility = Excel.SheetVisibility.veryHidden;
    await ctx.sync();
    return sh;
  }
  async function dropScratch(ctx, sh) {
    try { sh.delete(); await ctx.sync(); return; } catch (e) { /* thu cach khac */ }
    try { sh.visibility = Excel.SheetVisibility.visible; sh.delete(); await ctx.sync(); } catch (e) { /* bo qua */ }
  }

  async function evalSpill(ctx, sh, expr, api112) {
    const c = sh.getRange("B1");
    try {
      c.formulas = [["=" + expr]];
      c.load("values,valueTypes");
      let sp = null;
      if (api112) { sp = c.getSpillingToRangeOrNullObject(); sp.load("values,valueTypes,rowCount,columnCount"); }
      await ctx.sync();
      if (sp && !sp.isNullObject) return arrRes(sp.values, sp.valueTypes);
      return fromCell(c.values[0][0], c.valueTypes[0][0]);
    } catch (e) {
      return { k: "na", msg: "Không tính riêng được phần này." };
    }
  }

  async function evaluatePlan(ctx, plan, api112) {
    if (!plan.length) return;
    const sh = await getScratch(ctx);
    try {
      const t = sh.getRange("A1");
      t.formulas = [["=LET(x,1,x)"]];
      t.load("values");
      await ctx.sync();
      const hasLet = t.values[0][0] === 1;
      if (!hasLet) {
        for (const p of plan) p.node.res = await evalSpill(ctx, sh, p.expr, api112);
        return;
      }
      // Luot 1: moi bieu thuc mot o, ket qua vo huong -> tinh tat ca trong mot lan dong bo
      let ok = true;
      try {
        const rg = sh.getRangeByIndexes(0, 0, plan.length, 1);
        rg.formulas = plan.map((p) => ["=" + wrapExpr(p.expr)]);
        rg.load("values,valueTypes");
        await ctx.sync();
        plan.forEach((p, i) => (p.node.res = fromCell(rg.values[i][0], rg.valueTypes[i][0])));
      } catch (e) { ok = false; }
      if (!ok) {
        // co bieu thuc Excel tu choi -> tinh tung cai de khoanh vung
        for (let i = 0; i < plan.length; i++) {
          const c = sh.getRangeByIndexes(i, 0, 1, 1);
          try {
            c.formulas = [["=" + wrapExpr(plan[i].expr)]];
            c.load("values,valueTypes");
            await ctx.sync();
            plan[i].node.res = fromCell(c.values[0][0], c.valueTypes[0][0]);
          } catch (e) {
            plan[i].node.res = { k: "na", msg: "Không tính riêng được phần này." };
          }
        }
      }
      // Luot 2: ket qua la mang -> tinh lai rieng de doc vung tran
      for (const p of plan) {
        const r = p.node.res;
        if (!r || r.k !== "pend") continue;
        p.node.res = r.rows * r.cols > MAX_CELLS ? { k: "big", rows: r.rows, cols: r.cols } : await evalSpill(ctx, sh, p.expr, api112);
      }
    } finally {
      await dropScratch(ctx, sh);
    }
  }

  /* ============================== Nhanh duoc chon (giong Excel) ============================== */
  const resOf = (n) => (n.type === "paren" ? resOf(n.kids[0]) : n.res);
  function truthy(r) {
    if (!r || r.k !== "s") return "both";
    if (r.t === "Error") return "none";
    if (r.t === "Boolean") return r.v;
    if (r.t === "Double") return r.v !== 0;
    if (r.t === "Empty") return false;
    if (r.t === "String") { const u = r.v.toUpperCase(); return u === "TRUE" ? true : u === "FALSE" ? false : "none"; }
    return "both";
  }
  function markTaken(n, taken) {
    n.skipped = !taken;
    const k = n.kids;
    if (taken && n.type === "func") {
      const f = FXP.norm(n.name);
      if (f === "IF" && k.length) {
        markTaken(k[0], true);
        const t = truthy(resOf(k[0]));
        if (k[1]) markTaken(k[1], t === true || t === "both");
        if (k[2]) markTaken(k[2], t === false || t === "both");
        return;
      }
      if ((f === "IFERROR" || f === "IFNA") && k.length) {
        markTaken(k[0], true);
        const r = resOf(k[0]);
        const unknown = !r || r.k !== "s";
        const err = r && r.k === "s" && r.t === "Error" && (f === "IFERROR" || r.v === "#N/A");
        if (k[1]) markTaken(k[1], unknown || err);
        return;
      }
      if (f === "IFS") {
        let done = false;
        for (let i = 0; i < k.length; i += 2) {
          markTaken(k[i], !done);
          const t = done ? false : truthy(resOf(k[i]));
          if (k[i + 1]) markTaken(k[i + 1], !done && t !== false && t !== "none");
          if (t === true || t === "none") done = true;
        }
        return;
      }
      if (f === "CHOOSE" && k.length > 1) {
        markTaken(k[0], true);
        const r = resOf(k[0]);
        const idx = r && r.k === "s" && r.t === "Double" ? Math.trunc(r.v) : null;
        for (let i = 1; i < k.length; i++) markTaken(k[i], idx === null || idx === i);
        return;
      }
    }
    k.forEach((c) => markTaken(c, taken));
  }

  /* ============================== Gia tri -> chu ============================== */
  function numText(v) {
    let s = Number.isInteger(v) && Math.abs(v) < 1e15 ? String(v) : String(+v.toPrecision(15));
    if (state.dec !== ".") s = s.replace(".", state.dec);
    return s;
  }
  function scalarText(v, t, emptyText) {
    switch (t) {
      case "Empty": return emptyText;
      case "String": return '"' + String(v).replace(/"/g, '""') + '"';
      case "Boolean": return v ? "TRUE" : "FALSE";
      case "Double": return typeof v === "number" ? numText(v) : String(v);
      default: return String(v);
    }
  }
  function literal(r, maxItems = 12) {
    if (!r) return "";
    if (r.k === "s") return scalarText(r.v, r.t, "0");
    if (r.k === "big") return `[vùng ${r.rows}×${r.cols} ô]`;
    if (r.k === "a") {
      let n = 0, more = false;
      const rows = [];
      for (let i = 0; i < r.rows && !more; i++) {
        const cells = [];
        for (let j = 0; j < r.cols; j++) {
          if (n++ >= maxItems) { more = true; break; }
          cells.push(scalarText(r.values[i][j], r.types[i][j], ""));
        }
        rows.push(cells.join(","));
      }
      return "{" + rows.join(";") + (more ? ";…" : "") + "}";
    }
    return "";
  }
  const isVal = (r) => r && (r.k === "s" || r.k === "a" || r.k === "big");
  const valClass = (r) => (r.k === "a" || r.k === "big" ? "arr" : { Double: "num", String: "str", Boolean: "bool", Error: "err", Empty: "empty" }[r.t] || "num");

  /* ============================== Tai lieu ham ============================== */
  function doc(f) { const d = FXDOCS.FN[f]; return d ? { cat: d[0], desc: d[1], params: d[2], rep: d[3] } : null; }
  function paramFor(f, i, total) {
    if (f === "LET") {
      if (i === total - 1) return ["calculation", "Biểu thức cuối cùng – kết quả của cả hàm LET."];
      const k = Math.floor(i / 2) + 1;
      return i % 2 ? ["name_value" + k, `Giá trị gán cho biến thứ ${k}.`] : ["name" + k, `Tên biến thứ ${k}.`];
    }
    if (f === "LAMBDA") return i === total - 1 ? ["calculation", "Thân hàm – tính khi LAMBDA được gọi."] : ["parameter" + (i + 1), "Tham số của LAMBDA."];
    const d = doc(f);
    if (!d) return ["đối số " + (i + 1), ""];
    const P = d.params, r = d.rep;
    if (i < P.length) return P[i];
    if (!r) return ["(thừa) đối số " + (i + 1), "Hàm không nhận thêm đối số này."];
    const base = P.length - r, k = Math.floor((i - base) / r), p = P[base + ((i - base) % r)];
    return [p[0].replace(/(\d+)(\]?)$/, (m, dd, b) => +dd + k + b), p[1]];
  }
  const syntaxOf = (f, d) => `${f}(${d.params.map((p) => p[0]).join(state.sep + " ")}${d.rep ? state.sep + " …" : ""})`;

  function refExplain(n) {
    if (n.type === "struct") return n.addr ? `Tham chiếu Bảng theo dòng hiện tại – tương ứng ô ${n.addr}.` : "Tham chiếu Bảng (Table): Bảng[Cột] = cả cột dữ liệu của bảng.";
    if (n.type === "name") return state.locals && state.locals.has(FXP.norm(n.text)) ? "Biến cục bộ khai báo trong LET – lấy giá trị đã gán ở trên." : "Tên định nghĩa (Formulas › Name Manager) – thay bằng vùng/giá trị mà tên đại diện.";
    if (n.type === "array") return "Hằng mảng viết trực tiếp trong công thức.";
    const t = n.text, p = [t.includes(":") ? "Tham chiếu một VÙNG nhiều ô – lấy toàn bộ giá trị dưới dạng mảng." : "Tham chiếu MỘT ô – lấy giá trị hiện có của ô (ô trống được coi là 0)."];
    if (t.includes("!")) p.push("Phần trước dấu ! là tên sheet khác.");
    if (t.includes("$")) p.push("Dấu $ cố định cột/dòng khi sao chép công thức.");
    if (t.endsWith("#")) p.push("Dấu # lấy toàn bộ vùng tràn (spill).");
    return p.join(" ");
  }

  /* ============================== Ve giao dien ============================== */
  function fhtml(n) {
    const sep = `<span class="t-op">${esc(state.sep)} </span>`;
    switch (n.type) {
      case "func": return `<span class="t-fn">${esc(FXP.norm(n.name))}</span><span class="t-p">(</span>${n.kids.map(fhtml).join(sep)}<span class="t-p">)</span>`;
      case "ref": case "struct": return `<span class="t-ref" data-n="${n.id}">${esc(n.text)}</span>`;
      case "name": return `<span class="t-name"${isVal(n.res) ? ` data-n="${n.id}"` : ""}>${esc(FXP.stripPfx(n.text))}</span>`;
      case "str": return `<span class="t-str">${esc(n.text)}</span>`;
      case "num": return `<span class="t-num">${esc(state.dec !== "." ? n.text.replace(".", state.dec) : n.text)}</span>`;
      case "bool": return `<span class="t-bool">${esc(n.text.toUpperCase())}</span>`;
      case "err": return `<span class="t-err">${esc(n.text)}</span>`;
      case "array": return `<span class="t-arr" data-n="${n.id}">${esc(n.text)}</span>`;
      case "binary": return fhtml(n.kids[0]) + `<span class="t-op">${esc(n.op)}</span>` + fhtml(n.kids[1]);
      case "unary": return `<span class="t-op">${esc(n.op)}</span>` + fhtml(n.kids[0]);
      case "postfix": return fhtml(n.kids[0]) + `<span class="t-op">%</span>`;
      case "paren": return `<span class="t-p">(</span>${fhtml(n.kids[0])}<span class="t-p">)</span>`;
      case "missing": return `<span class="t-miss">∅</span>`;
      default: return esc(n.text);
    }
  }
  function chip(n) {
    const r = n.res;
    if (n.isParam) return `<span class="chip tag">tên biến</span>`;
    if (n.skipped) return `<span class="chip skip" title="Excel không tính nhánh này">không tính</span>`;
    if (!r) return "";
    if (r.k === "na") return `<span class="chip na" title="${esc(r.msg)}">? ${esc(r.msg)}</span>`;
    const full = literal(r, 200), short = literal(r, 8);
    const label = r.k === "a" ? esc(short) + `<em>${r.rows}×${r.cols}</em>` : esc(short.length > 60 ? short.slice(0, 57) + "…" : short);
    const hov = r.k === "a" || r.k === "big" || n.type === "ref" || n.type === "struct" ? ` data-n="${n.id}"` : "";
    return `<span class="chip ${valClass(r)}"${hov} title="${esc(full)}">${label}</span>`;
  }
  const isLeaf = (n) => !(n.type === "func" || n.type === "postfix" || (n.type === "binary" && n.op !== ":") ||
    (n.type === "unary" && !(n.op === "-" && n.kids[0].type === "num")) || n.type === "paren");

  function treeNode(n, label, labelDesc, depth) {
    if (n.type === "paren") return treeNode(n.kids[0], label, labelDesc, depth);
    const lab = label ? `<span class="plabel" title="${esc(labelDesc || "")}">${esc(label)}</span>` : "";
    const el = document.createElement("div");
    el.className = "tn" + (n.skipped ? " skipped" : "");
    if (isLeaf(n)) {
      const showVal = ["ref", "struct", "name", "array"].includes(n.type) || n.type === "missing";
      el.innerHTML = `<div class="row leaf">${lab}<span class="expr">${fhtml(n)}</span>${showVal ? `<span class="eq">=</span>${chip(n)}` : n.skipped ? chip(n) : ""}</div>`;
      return el;
    }
    let head, body = "", kids = [];
    if (n.type === "func") {
      const f = FXP.norm(n.name), d = doc(f);
      head = `<span class="fname">${esc(f)}</span>`;
      body = d ? `<div class="fdesc"><span class="cat">${esc(d.cat)}</span> ${esc(d.desc)}</div>` :
        `<div class="fdesc muted">${state.locals && state.locals.has(f) ? "Hàm tự định nghĩa (LAMBDA gán cho biến trong LET)." : "Chưa có mô tả cho hàm này."}</div>`;
      kids = n.kids.map((c, i) => [c, ...paramFor(f, i, n.kids.length)]);
    } else {
      const key = n.type === "unary" ? "u" + n.op : n.op, d = FXDOCS.OP[key] || [n.op, ""];
      head = `<span class="opname">${esc(n.op)}</span><span class="opdesc">${esc(d[0])}</span>`;
      body = d[1] ? `<div class="fdesc">${esc(d[1])}</div>` : "";
      kids = n.type === "binary" ? [[n.kids[0], "vế trái", ""], [n.kids[1], "vế phải", ""]] : [[n.kids[0], "toán hạng", ""]];
    }
    const open = depth < 2 && !n.skipped;
    el.classList.toggle("open", open);
    el.innerHTML =
      `<div class="row head"><button class="caret" aria-label="Mở/đóng"></button>${lab}${head}` +
      `<span class="eq">=</span>${chip(n)}</div>` +
      `<div class="mini expr">${fhtml(n)}</div>` +
      `<div class="body">${body}<div class="kids"></div></div>`;
    const kidsEl = el.querySelector(".kids");
    kids.forEach(([c, pl, pd]) => kidsEl.appendChild(treeNode(c, pl, pd, depth + 1)));
    el.querySelector(".row.head").onclick = (e) => { if (!e.target.closest("[data-n]")) el.classList.toggle("open"); };
    return el;
  }
  function toggleAll(open) { document.querySelectorAll("#tree .tn").forEach((t) => { if (t.querySelector(".body")) t.classList.toggle("open", open); }); }

  function buildSteps(root) {
    const steps = [], subst = new Map();
    const disp = (hl) => FXP.text(root, { mode: "disp", subst, hl, sep: state.sep, dec: state.dec });
    function visit(n) {
      if (n.skipped || n.isParam) return;
      if (n.type === "paren") { visit(n.kids[0]); return; }
      if (["num", "str", "bool", "err", "missing"].includes(n.type)) return;
      if (n.type === "unary" && n.op === "-" && n.kids[0].type === "num") return;
      if (n.type === "func" && FXP.norm(n.name) === "LAMBDA") return;
      if (!(n.type === "binary" && n.op === ":")) n.kids.forEach(visit);
      const before = disp(n.id);
      if (isVal(n.res)) subst.set(n.id, literal(n.res));
      steps.push({ node: n, before, after: disp(n.id) });
    }
    visit(root);
    return steps;
  }
  const hlHtml = (s, cls) => esc(s).replace(/\u0001/g, `<mark class="${cls}">`).replace(/\u0002/g, "</mark>");
  const kindOf = (n) => (n.type === "func" ? "func" : n.type === "array" ? "array" : n.type === "name" ? "name" : n.type === "ref" || n.type === "struct" ? "ref" : "op");

  function argTable(rows) {
    return `<table class="args"><tr><th>Tham số</th><th>Truyền vào</th><th>Giá trị</th></tr>` + rows.map(([n, name, desc]) =>
      `<tr><td><b>${esc(name)}</b>${desc ? `<div class="pdesc">${esc(desc)}</div>` : ""}</td><td class="expr">${fhtml(n)}</td><td>${chip(n) || '<span class="chip na">—</span>'}</td></tr>`).join("") + `</table>`;
  }
  function explainHtml(n) {
    if (n.type === "func") {
      const f = FXP.norm(n.name), d = doc(f);
      const head = d ? `<p><b>${esc(f)}</b> <span class="cat">${esc(d.cat)}</span><br>${esc(d.desc)}</p><p class="syntax">${esc(syntaxOf(f, d))}</p>` : `<p><b>${esc(f)}</b> – chưa có mô tả.</p>`;
      return head + (n.kids.length ? argTable(n.kids.map((c, i) => [c, ...paramFor(f, i, n.kids.length)])) : "<p class='muted'>Hàm không có tham số.</p>");
    }
    if (["binary", "unary", "postfix"].includes(n.type)) {
      const key = n.type === "unary" ? "u" + n.op : n.op, d = FXDOCS.OP[key] || [n.op, ""];
      const rows = n.type === "binary" ? [[n.kids[0], "Vế trái", ""], [n.kids[1], "Vế phải", ""]] : [[n.kids[0], "Toán hạng", ""]];
      return `<p>Toán tử <b>${esc(n.op)}</b> – ${esc(d[0])}. ${esc(d[1])}</p>` + (n.op === ":" ? "" : argTable(rows));
    }
    return `<p>${esc(refExplain(n))}</p>`;
  }

  function showStep(i) {
    const s = state.steps;
    if (!s.length) return;
    i = Math.max(0, Math.min(s.length - 1, i));
    state.idx = i;
    const st = s[i], n = st.node;
    $("stepNo").textContent = `Bước ${i + 1} / ${s.length}`;
    $("stepView").innerHTML =
      `<div class="kind">${esc(KIND[kindOf(n)])}</div>` +
      `<div class="fbox">=${hlHtml(st.before, "cur")}</div>` +
      `<div class="arrow">↓ ${chip(n)}</div>` +
      `<div class="fbox after">=${hlHtml(st.after, "done")}</div>` +
      `<div class="explain">${explainHtml(n)}</div>`;
    [...$("stepList").children].forEach((li, k) => li.classList.toggle("on", k === i));
    $("btnPrev").disabled = $("btnFirst").disabled = i === 0;
    $("btnNext").disabled = $("btnLast").disabled = i === s.length - 1;
  }

  function render(root, info, formula, finalRes) {
    state.root = root;
    state.sheet = info.sheet;
    state.nodes = new Map();
    FXP.walk(root, (n) => state.nodes.set(String(n.id), n));
    setStatus("");
    $("empty").hidden = true;
    $("main").hidden = false;

    const rootRes = resOf(root);
    const sameAsCell = isVal(rootRes) && literal(rootRes, 1e9) === literal(finalRes, 1e9);
    $("cellAddr").textContent = info.cellAddr;
    $("formula").innerHTML = `<span class="t-op">=</span>` + fhtml(root);
    $("result").innerHTML = `<span class="lbl">Kết quả</span>` + chip({ id: "final", res: finalRes, type: "final" }) +
      (isVal(rootRes) ? (sameAsCell ? `<span class="match ok" title="Mô phỏng cho cùng kết quả với ô">✔ khớp</span>` :
        `<span class="match warn" title="Mô phỏng: ${esc(literal(rootRes))}">≠ mô phỏng</span>`) : "");
    state.nodes.set("final", { id: "final", res: finalRes, type: "final", text: "" });

    const tree = $("tree");
    tree.innerHTML = "";
    tree.appendChild(treeNode(root, "", "", 0));

    state.steps = buildSteps(root);
    $("stepList").innerHTML = state.steps.map((s, i) =>
      `<li data-i="${i}"><span class="k">${i + 1}</span><span class="expr">${esc(FXP.text(s.node, { mode: "disp", sep: state.sep, dec: state.dec }))}</span><span class="r">${esc(literal(s.node.res, 6) || "—")}</span></li>`).join("");
    $("stepList").onclick = (e) => { const li = e.target.closest("li"); if (li) showStep(+li.dataset.i); };
    state.idx = 0;
    if (state.steps.length) showStep(0);
    else { $("stepView").innerHTML = "<p class='muted'>Công thức chỉ là hằng số – không có bước tính nào.</p>"; $("stepNo").textContent = ""; }

    const funcs = [];
    FXP.walk(root, (n) => { if (n.type === "func") { const f = FXP.norm(n.name); if (!funcs.includes(f)) funcs.push(f); } });
    $("funcs").innerHTML = funcs.length ? funcs.map((f) => {
      const d = doc(f);
      if (!d) return `<div class="card"><b>${esc(f)}</b><p class="muted">Chưa có mô tả trong từ điển.</p></div>`;
      return `<div class="card"><div><b>${esc(f)}</b> <span class="cat">${esc(d.cat)}</span></div><p>${esc(d.desc)}</p>` +
        `<p class="syntax">${esc(syntaxOf(f, d))}</p><ul>${d.params.map((p) => `<li><b>${esc(p[0])}</b>${p[0][0] === "[" ? " <i>(tùy chọn)</i>" : ""} – ${esc(p[1])}</li>`).join("")}</ul></div>`;
    }).join("") : "<p class='muted'>Công thức không dùng hàm.</p>";

    const notes = [];
    const vol = funcs.filter((f) => VOLATILE.includes(f));
    if (vol.length) notes.push(`Có hàm thay đổi mỗi lần tính (${vol.join(", ")}) – giá trị mô phỏng có thể khác giá trị đang hiển thị.`);
    if (funcs.includes("INDIRECT")) notes.push("INDIRECT với địa chỉ không ghi tên sheet sẽ trỏ sang sheet tạm, nên bước trung gian có thể sai.");
    notes.push("Giống Evaluate Formula: nhánh IF / IFS / IFERROR / IFNA / CHOOSE không được chọn được làm mờ và ghi \"không tính\".");
    notes.push("Để tính từng phần, add-in tạo một sheet ẩn tạm rồi xóa ngay. Việc này làm mất lịch sử Undo (Ctrl+Z) của Excel.");
    $("notes").innerHTML = notes.map((x) => `<li>${esc(x)}</li>`).join("");
  }

  function showEmpty(addr) {
    $("main").hidden = true;
    $("empty").hidden = false;
    $("emptyMsg").innerHTML = `Ô <b>${esc(addr || "")}</b> không chứa công thức.<br>Hãy chọn một ô có công thức` + (state.auto ? "." : " rồi bấm <b>⟳ Phân tích</b>.");
    setStatus("");
  }
  function showParseError(addr, f, msg) {
    $("main").hidden = true;
    $("empty").hidden = false;
    $("emptyMsg").innerHTML = `Không phân tích được công thức ở <b>${esc(addr)}</b>:<br><code>${esc(f)}</code><br><span class="errtxt">${esc(msg)}</span>`;
  }

  /* ============================== Popover xem truoc vung/mang ============================== */
  function colName(i) { let s = ""; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
  function colIndex(L) { let n = 0; for (const c of L.toUpperCase()) n = n * 26 + (c.charCodeAt(0) - 64); return n - 1; }
  function parseAddr(a) {
    const m = /^(?:(?:'((?:[^']|'')+)'|([^!]+))!)?\$?([A-Za-z]{1,3})\$?(\d+)/.exec(a || "");
    if (!m) return null;
    return { sheet: (m[1] || m[2] || "").replace(/''/g, "'"), col: colIndex(m[3]), row: +m[4] };
  }
  function initPopover() {
    const pop = $("pop");
    let hideT = null;
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest("[data-n]");
      if (!t) return;
      const n = state.nodes.get(t.dataset.n);
      if (!n || !n.res) return;
      clearTimeout(hideT);
      pop.innerHTML = popHtml(n);
      pop.hidden = false;
      const r = t.getBoundingClientRect(), W = document.documentElement.clientWidth;
      const pw = pop.offsetWidth, ph = pop.offsetHeight;
      let x = Math.min(Math.max(4, r.left), W - pw - 4);
      let y = r.bottom + 4;
      if (y + ph > window.innerHeight - 4) y = Math.max(4, r.top - ph - 4);
      pop.style.left = x + "px";
      pop.style.top = y + "px";
    });
    document.addEventListener("mouseout", (e) => { if (e.target.closest("[data-n]")) hideT = setTimeout(() => (pop.hidden = true), 120); });
    window.addEventListener("scroll", () => (pop.hidden = true), true);
  }
  function popHtml(n) {
    const r = n.res;
    const ref = n.type === "ref" || n.type === "struct";
    const a = ref ? parseAddr(n.addr || n.text) : null;
    let title = ref ? `Tham chiếu: <b>${esc(n.text)}</b>` : n.type === "final" ? "Kết quả trong ô" : r.k === "a" ? `Mảng ${r.rows}×${r.cols}` : "Giá trị";
    if (a && a.sheet) title += ` <span class="sheet">${esc(a.sheet)}</span>`;
    else if (ref) title += ` <span class="sheet">${esc(state.sheet || "")}</span>`;
    if (r.k === "na") return `<div class="ptitle">${title}</div><div class="muted">${esc(r.msg)}</div>`;
    if (r.k === "big") return `<div class="ptitle">${title}</div><div class="muted">Vùng ${r.rows}×${r.cols} ô – quá lớn để xem trước.</div>`;
    const vals = r.k === "a" ? r.values : [[r.v]], types = r.k === "a" ? r.types : [[r.t]];
    const R = Math.min(vals.length, 12), C = Math.min(vals[0].length, 8);
    let h = `<div class="ptitle">${title}</div><table class="grid"><tr><th></th>`;
    for (let j = 0; j < C; j++) h += `<th>${a ? colName(a.col + j) : j + 1}</th>`;
    h += "</tr>";
    for (let i = 0; i < R; i++) {
      h += `<tr><th>${a ? a.row + i : i + 1}</th>`;
      for (let j = 0; j < C; j++) {
        const t = types[i][j], v = vals[i][j];
        h += `<td class="${{ Double: "num", String: "str", Boolean: "bool", Error: "err" }[t] || ""}">${esc(t === "Empty" ? "" : t === "String" ? '"' + v + '"' : scalarText(v, t, ""))}</td>`;
      }
      h += "</tr>";
    }
    h += "</table>";
    if (vals.length > R || vals[0].length > C) h += `<div class="muted small">… hiển thị ${R}×${C} / ${vals.length}×${vals[0].length}</div>`;
    return h;
  }

  // xuat cho kiem thu
  window.FXE_INTERNAL = { buildPlan, markTaken, buildSteps, literal, paramFor, wrapExpr, render, collectLocals };
})();
