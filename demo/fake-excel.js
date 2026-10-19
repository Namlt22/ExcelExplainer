/* Excel gia lap cho trang demo / kiem thu: bo tinh cong thuc thu gon + Office.js gia.
 * Chi phuc vu xem truoc giao dien; khong dung trong add-in that. */
(function (w) {
  "use strict";
  w.makeFakeExcel = function (sheets, active, getSel, opts) {
    opts = opts || {};
    const FXP = w.FXP;
    const log = { writes: 0, syncs: 0, deleted: false };
  // ---------- mini evaluator ----------
  const colIdx = (L) => [...L.toUpperCase()].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;
  const colName = (i) => { let s = ""; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
  function splitRef(t, defSheet) {
    let sheet = defSheet, a = t;
    const k = t.lastIndexOf("!");
    if (k >= 0) { sheet = t.slice(0, k).replace(/^'|'$/g, "").replace(/''/g, "'"); a = t.slice(k + 1); }
    return { sheet, a: a.replace(/\$/g, "").replace(/#$/, "") };
  }
  function rangeVals(sheet, a) {
    const [p, q] = a.split(":");
    const m1 = /^([A-Z]+)(\d+)$/i.exec(p), m2 = /^([A-Z]+)(\d+)$/i.exec(q || p);
    const r0 = +m1[2] - 1, c0 = colIdx(m1[1]), r1 = +m2[2] - 1, c1 = colIdx(m2[1]);
    const out = [];
    for (let r = r0; r <= r1; r++) { const row = []; for (let c = c0; c <= c1; c++) row.push(cellVal(sheet, r, c)); out.push(row); }
    return out;
  }
  function cellVal(sheet, r, c) {
    const s = sheets[sheet] || {};
    const key = colName(c) + (r + 1);
    const v = s[key];
    if (v === undefined) return null;
    if (typeof v === "string" && v[0] === "=") return evalFormula(v, sheet, true);
    return v;
  }
  class XErr { constructor(c) { this.c = c; } }
  const isArr = (x) => Array.isArray(x);
  const scal = (x) => (isArr(x) ? x[0][0] : x);
  const num = (x) => { x = scal(x); if (x instanceof XErr) throw x; if (x === null) return 0; if (typeof x === "boolean") return x ? 1 : 0; if (typeof x === "string") { if (x === "" || isNaN(+x)) throw new XErr("#VALUE!"); return +x; } return x; };
  const str = (x) => { x = scal(x); if (x instanceof XErr) throw x; if (x === null) return ""; if (typeof x === "boolean") return x ? "TRUE" : "FALSE"; return String(x); };
  const map2 = (a, b, f) => {
    if (!isArr(a) && !isArr(b)) return f(a, b);
    const A = isArr(a) ? a : [[a]], B = isArr(b) ? b : [[b]];
    const R = Math.max(A.length, B.length), C = Math.max(A[0].length, B[0].length);
    const out = [];
    for (let i = 0; i < R; i++) { const row = []; for (let j = 0; j < C; j++) { const x = A[Math.min(i, A.length - 1)][Math.min(j, A[0].length - 1)], y = B[Math.min(i, B.length - 1)][Math.min(j, B[0].length - 1)]; try { row.push(f(x, y)); } catch (e) { if (e instanceof XErr) row.push(e); else throw e; } } out.push(row); }
    return out;
  };
  const flat = (args) => args.flatMap((a) => (isArr(a) ? a.flat() : [a]));
  function ev(n, sheet, env) {
    switch (n.type) {
      case "num": return +n.text;
      case "str": return n.text.slice(1, -1).replace(/""/g, '"');
      case "bool": return /TRUE/i.test(n.text);
      case "err": return new XErr(n.text);
      case "array": return n.text.slice(1, -1).split(";").map((r) => r.split(",").map((x) => (x[0] === '"' ? x.slice(1, -1) : /TRUE|FALSE/i.test(x) ? /TRUE/i.test(x) : +x)));
      case "paren": return ev(n.kids[0], sheet, env);
      case "missing": return null;
      case "ref": { const { sheet: sh, a } = splitRef(n.text, sheet); const v = rangeVals(sh, a); return v.length === 1 && v[0].length === 1 ? (v[0][0] === null ? 0 : v[0][0]) : v; }
      case "name": { const u = FXP.norm(n.text); if (env && u in env) return env[u]; return new XErr("#NAME?"); }
      case "struct": return new XErr("#REF!");
      case "unary": { const v = ev(n.kids[0], sheet, env); return n.op === "-" ? map2(v, 0, (x) => -num(x)) : v; }
      case "postfix": return map2(ev(n.kids[0], sheet, env), 0, (x) => num(x) / 100);
      case "binary": {
        if (n.op === ":") { const { sheet: sh } = splitRef(n.kids[0].text, sheet); return rangeVals(sh, splitRef(n.kids[0].text).a + ":" + splitRef(n.kids[1].text).a); }
        const a = ev(n.kids[0], sheet, env), b = ev(n.kids[1], sheet, env);
        const ops = { "+": (x, y) => num(x) + num(y), "-": (x, y) => num(x) - num(y), "*": (x, y) => num(x) * num(y),
          "/": (x, y) => { if (num(y) === 0) throw new XErr("#DIV/0!"); return num(x) / num(y); }, "^": (x, y) => num(x) ** num(y),
          "&": (x, y) => str(x) + str(y), "=": (x, y) => cmp(x, y) === 0, "<>": (x, y) => cmp(x, y) !== 0, "<": (x, y) => cmp(x, y) < 0,
          ">": (x, y) => cmp(x, y) > 0, "<=": (x, y) => cmp(x, y) <= 0, ">=": (x, y) => cmp(x, y) >= 0 };
        return map2(a, b, ops[n.op]);
      }
      case "func": return fn(FXP.norm(n.name), n.kids, sheet, env);
    }
  }
  function cmp(x, y) { if (x instanceof XErr) throw x; if (y instanceof XErr) throw y; x = x ?? 0; y = y ?? 0; if (typeof x === "string" || typeof y === "string") return String(x).toLowerCase().localeCompare(String(y).toLowerCase()); return x - y; }
  function fn(f, k, sheet, env) {
    const E = (i) => ev(k[i], sheet, env);
    switch (f) {
      case "SUM": return flat(k.map((_, i) => E(i))).reduce((s, x) => { if (x instanceof XErr) throw x; return s + (typeof x === "number" ? x : 0); }, 0);
      case "AVERAGE": { const v = flat(k.map((_, i) => E(i))).filter((x) => typeof x === "number"); return v.reduce((a, b) => a + b, 0) / v.length; }
      case "ROUND": { const p = 10 ** num(E(1)); return Math.round(num(E(0)) * p) / p; }
      case "UPPER": return str(E(0)).toUpperCase();
      case "LEFT": return str(E(0)).slice(0, k[1] ? num(E(1)) : 1);
      case "IF": { const c = E(0); if (isArr(c)) { const t = E(1), e = k[2] ? E(2) : false; return map2(c, 0, (x) => 0).map((r, i) => r.map((_, j) => (c[i][j] ? (isArr(t) ? t[i][j] : t) : isArr(e) ? e[i][j] : e))); } return scal(c) && num(c) ? E(1) : k[2] ? E(2) : false; }
      case "IFERROR": { try { const v = E(0); if (scal(v) instanceof XErr) return E(1); return v; } catch (e) { if (e instanceof XErr) return E(1); throw e; } }
      case "ROWS": { const v = E(0); return isArr(v) ? v.length : 1; }
      case "COLUMNS": { const v = E(0); return isArr(v) ? v[0].length : 1; }
      case "INDEX": { const v = E(0); const r = num(E(1)), c = k[2] ? num(E(2)) : 1; if (!isArr(v)) return v; return v[r - 1] && v[r - 1][c - 1] !== undefined ? (v[r - 1][c - 1] ?? 0) : new XErr("#REF!"); }
      case "TEXTJOIN": { const d = str(E(0)), ign = !!scal(E(1)); const parts = flat(k.slice(2).map((_, i) => E(i + 2))).filter((x) => !(ign && (x === null || x === ""))).map(str); return parts.join(d); }
      case "VLOOKUP": { const x = scal(E(0)), t = E(1), c = num(E(2)); for (const row of t) if (cmp(row[0], x) === 0) return row[c - 1]; return new XErr("#N/A"); }
      case "MATCH": { const x = scal(E(0)), t = flat([E(1)]); const i = t.findIndex((y) => cmp(y, x) === 0); return i < 0 ? new XErr("#N/A") : i + 1; }
      case "LET": { const env2 = Object.assign({}, env || {}); for (let i = 0; i + 1 < k.length; i += 2) env2[FXP.norm(k[i].text)] = ev(k[i + 1], sheet, env2); return ev(k[k.length - 1], sheet, env2); }
      case "SUMIFS": { const s = E(0); const conds = []; for (let i = 1; i + 1 < k.length; i += 2) conds.push([E(i), scal(E(i + 1))]); let tot = 0; s.forEach((row, r) => row.forEach((v, c) => { if (conds.every(([rg, cr]) => cmp(rg[r][c], cr) === 0)) tot += typeof v === "number" ? v : 0; })); return tot; }
      default: return new XErr("#NAME?");
    }
  }
  function evalFormula(f, sheet, scalarOnly) {
    let v;
    try { v = ev(FXP.parse(f), sheet, null); } catch (e) { if (e instanceof XErr) v = e; else throw e; }
    if (scalarOnly && isArr(v)) v = v[0][0];
    return v;
  }
  const typeOf = (v) => (v instanceof XErr ? "Error" : v === null ? "Empty" : typeof v === "number" ? "Double" : typeof v === "boolean" ? "Boolean" : "String");
  const outVal = (v) => (v instanceof XErr ? v.c : v === null ? "" : v);

  // ---------- fake Office.js ----------
  function rangeProxy(sheet, r0, c0, h, wd) {
    const p = {
      isNullObject: false,
      load() { return p; },
      get address() { return `${/[^A-Za-z0-9_]/.test(sheet) ? "'" + sheet + "'" : sheet}!${colName(c0)}${r0 + 1}${h > 1 || wd > 1 ? ":" + colName(c0 + wd - 1) + (r0 + h) : ""}`; },
      get formulas() { const out = []; for (let i = 0; i < h; i++) { const row = []; for (let j = 0; j < wd; j++) { const v = (sheets[sheet] || {})[colName(c0 + j) + (r0 + i + 1)]; row.push(v === undefined ? "" : v); } out.push(row); } return out; },
      set formulas(F) {
        log.writes++;
        sheets[sheet] = sheets[sheet] || {};
        F.forEach((row, i) => row.forEach((f, j) => {
          // dong goi: Excel tu choi cong thuc khong hop le
          try { FXP.parse(f); } catch (e) { if (!opts.lenient) throw new Error("InvalidArgument: " + f); }
          sheets[sheet][colName(c0 + j) + (r0 + i + 1)] = f;
        }));
      },
      get values() { return grid().map((r) => r.map(outVal)); },
      get valueTypes() { return grid().map((r) => r.map(typeOf)); },
      get rowCount() { return h; }, get columnCount() { return wd; },
      worksheet: sheetProxy(sheet),
      getSpillParentOrNullObject() { return { isNullObject: true, load() {} }; },
      getSpillingToRangeOrNullObject() {
        const f = (sheets[sheet] || {})[colName(c0) + (r0 + 1)];
        if (typeof f !== "string" || f[0] !== "=") return { isNullObject: true, load() {} };
        const v = evalFormula(f, sheet === "__FXE_TMP__" ? active : sheet, false);
        if (!isArr(v)) return { isNullObject: true, load() {} };
        return { isNullObject: false, load() {}, values: v.map((r) => r.map(outVal)), valueTypes: v.map((r) => r.map(typeOf)), rowCount: v.length, columnCount: v[0].length };
      },
      getTables() { return { getFirstOrNullObject() { return { isNullObject: true, load() {} }; } }; },
      getEntireRow() { return p; },
      clear() {},
    };
    function grid() {
      const out = [];
      for (let i = 0; i < h; i++) { const row = []; for (let j = 0; j < wd; j++) { const f = (sheets[sheet] || {})[colName(c0 + j) + (r0 + i + 1)]; row.push(typeof f === "string" && f[0] === "=" ? evalFormula(f, sheet === "__FXE_TMP__" ? active : sheet, true) : f === undefined ? null : f); } out.push(row); }
      return out;
    }
    return p;
  }
  function sheetProxy(name) {
    return {
      name, isNullObject: false, visibility: "Visible", load() {},
      getRange(a) { if (!a) return rangeProxy(name, 0, 0, 1, 1); const m = /^([A-Z]+)(\d+)$/.exec(a); return rangeProxy(name, +m[2] - 1, colIdx(m[1]), 1, 1); },
      getRangeByIndexes(r, c, h, wd) { return rangeProxy(name, r, c, h, wd); },
      delete() { delete sheets[name]; log.deleted = true; },
    };
  }
  
  const ctx = {
    workbook: {
      getActiveCell: () => { const m = /^([A-Z]+)(\d+)$/.exec(getSel()); return rangeProxy(active, +m[2] - 1, colIdx(m[1]), 1, 1); },
      worksheets: {
        getItemOrNullObject: (n) => (sheets[n] ? sheetProxy(n) : { isNullObject: true }),
        add: (n) => { sheets[n] = {}; return sheetProxy(n); },
      },
      tables: { getItemOrNullObject: () => ({ isNullObject: true, load() {} }) },
    },
    application: { cultureInfo: { numberFormat: { load() {}, numberDecimalSeparator: opts.dec || "." } } },
    sync: async () => { log.syncs++; },
  };
  w.Excel = { run: async (cb) => cb(ctx), ClearApplyTo: { contents: "Contents" }, SheetVisibility: { veryHidden: "VeryHidden", visible: "Visible" } };
  w.Office = {
    HostType: { Excel: "Excel" }, EventType: { DocumentSelectionChanged: "sel" },
    onReady: (cb) => { if (opts.autoReady) setTimeout(() => cb({ host: "Excel" }), 0); return Promise.resolve(); },
    context: { requirements: { isSetSupported: () => true }, document: { addHandlerAsync() {}, removeHandlerAsync() {} } },
  };
    return log;
  };
})(typeof window !== "undefined" ? window : globalThis);
