/* Formula Explainer - bo tach token & phan tich cu phap cong thuc Excel.
 * Dau vao: cong thuc dang en-US (dau phay ngan cach, dau cham thap phan) nhu Range.formulas tra ve.
 * Dau ra: cay nut { id, type, text, name, op, kids[], isParam, addr }.
 */
(function (g) {
  "use strict";

  const ERRORS = ["#NULL!", "#DIV/0!", "#VALUE!", "#REF!", "#NAME?", "#NUM!", "#N/A", "#GETTING_DATA",
    "#SPILL!", "#CONNECT!", "#BLOCKED!", "#UNKNOWN!", "#FIELD!", "#CALC!"];

  const isWord = (c) => !!c && (/[A-Za-z0-9_.$?\\]/.test(c) || c.charCodeAt(0) > 127);
  const isStart = (c) => !!c && (/[A-Za-z_$\\]/.test(c) || c.charCodeAt(0) > 127);
  const isDigit = (c) => !!c && c >= "0" && c <= "9";

  function errLen(rest) {
    const up = rest.toUpperCase();
    for (const e of ERRORS) if (up.startsWith(e)) return e.length;
    return 0;
  }

  // 1 = o (A1), 2 = cot (A), 3 = dong (1), 0 = khong phai dia chi
  function refKind(w) {
    if (!w) return 0;
    let i = 0, L = "", nD = 0;
    if (w[i] === "$") i++;
    while (i < w.length && /[A-Za-z]/.test(w[i])) L += w[i++];
    if (L && w[i] === "$") i++;
    while (i < w.length && isDigit(w[i])) { nD++; i++; }
    if (i < w.length || L.length > 3) return 0;
    if (L.length === 3 && L.toUpperCase() > "XFD") return 0;
    if (L && nD) return 1;
    if (L) return 2;
    if (nD) return 3;
    return 0;
  }

  function bracketEnd(s, start) {
    let d = 0;
    for (let j = start; j < s.length; j++) {
      const c = s[j];
      if (c === "'") { j++; continue; }
      if (c === "[") d++;
      else if (c === "]" && --d === 0) return j;
    }
    throw new Error("Thiếu dấu ] trong tham chiếu bảng");
  }

  function tokenize(formula) {
    let s = String(formula).trim();
    if (s[0] === "=") s = s.slice(1);
    const toks = [];
    const n = s.length;
    const at = (i) => (i < n && i >= 0 ? s[i] : "");

    // doc phan than sau tien to sheet; tra ve vi tri ke tiep
    function readBody(i, tokStart, hasPrefix) {
      let j = i;
      while (isWord(at(j))) j++;
      const w = s.slice(i, j);
      const kind = refKind(w);
      let isRef = kind === 1;
      if (kind > 0 && at(j) === ":") {
        let k = j + 1;
        while (isWord(at(k))) k++;
        if (refKind(s.slice(j + 1, k)) === kind) { j = k; isRef = true; }
      }
      if (isRef) {
        if (at(j) === "#") j++;
        toks.push({ t: "ref", v: s.slice(tokStart, j) });
      } else if (at(j) === "[") {
        const k = bracketEnd(s, j);
        toks.push({ t: "struct", v: s.slice(tokStart, k + 1) });
        j = k + 1;
      } else if (!w) {
        throw new Error(`Ký tự không hợp lệ "${at(i)}" ở vị trí ${i + 1}`);
      } else if (!hasPrefix && /^(TRUE|FALSE)$/i.test(w)) {
        toks.push({ t: "bool", v: w });
      } else {
        toks.push({ t: "name", v: s.slice(tokStart, j) });
      }
      return j;
    }

    let i = 0;
    while (i < n) {
      const c = s[i], c2 = s.slice(i, i + 2);
      if (/\s/.test(c)) { i++; continue; }
      if (c === '"') {
        let j = i + 1;
        for (;;) {
          if (j >= n) throw new Error("Chuỗi văn bản thiếu dấu \" đóng");
          if (s[j] === '"') { if (s[j + 1] === '"') j += 2; else break; } else j++;
        }
        toks.push({ t: "str", v: s.slice(i, j + 1) }); i = j + 1; continue;
      }
      if (c === "#" && errLen(s.slice(i))) {
        const L = errLen(s.slice(i));
        toks.push({ t: "err", v: s.slice(i, i + L).toUpperCase() }); i += L; continue;
      }
      if (c === "{") {
        let j = i + 1, q = false;
        while (j < n) { if (s[j] === '"') q = !q; if (s[j] === "}" && !q) break; j++; }
        toks.push({ t: "array", v: s.slice(i, j + 1) }); i = j + 1; continue;
      }
      if (c === "'") {
        let j = i + 1;
        for (;;) {
          if (j >= n) throw new Error("Tên sheet trong dấu nháy đơn không hợp lệ");
          if (s[j] === "'") { if (s[j + 1] === "'") j += 2; else break; } else j++;
        }
        if (s[j + 1] !== "!") throw new Error("Tên sheet trong dấu nháy đơn không hợp lệ");
        i = readBody(j + 2, i, true); continue;
      }
      if (c === "[") {
        const k = bracketEnd(s, i);
        let j = k + 1;
        while (isWord(at(j))) j++;
        if (j > k + 1 && at(j) === "!") { i = readBody(j + 1, i, true); }
        else { toks.push({ t: "struct", v: s.slice(i, k + 1) }); i = k + 1; }
        continue;
      }
      if (isDigit(c) || c === ".") {
        let j = i;
        while (isDigit(at(j))) j++;
        if (j > i && at(j) === ":" && /[0-9$]/.test(at(j + 1))) { i = readBody(i, i, false); continue; }
        if (j > i && at(j) === "!") { i = readBody(j + 1, i, true); continue; }
        if (at(j) === ".") { j++; while (isDigit(at(j))) j++; }
        if (/[eE]/.test(at(j)) && (isDigit(at(j + 1)) || (/[+-]/.test(at(j + 1)) && isDigit(at(j + 2))))) {
          j += 2; while (isDigit(at(j))) j++;
        }
        const w = s.slice(i, j);
        if (!w || w === ".") throw new Error(`Ký tự không hợp lệ "${c}" ở vị trí ${i + 1}`);
        toks.push({ t: "num", v: w }); i = j; continue;
      }
      if (isStart(c)) {
        let j = i;
        while (isWord(at(j))) j++;
        const w = s.slice(i, j);
        if (at(j) === "(" && refKind(w) !== 1) { toks.push({ t: "func", v: w }); i = j; }
        else if (at(j) === "!") { i = readBody(j + 1, i, true); }
        else { i = readBody(i, i, false); }
        continue;
      }
      if (c2 === "<>" || c2 === "<=" || c2 === ">=") { toks.push({ t: "op", v: c2 }); i += 2; continue; }
      if ("-+*/^&=<>%:,(){}@;".includes(c)) { toks.push({ t: "op", v: c }); i++; continue; }
      throw new Error(`Ký tự không hợp lệ "${c}" ở vị trí ${i + 1}`);
    }
    return toks;
  }

  const BIN = { ":": 8, "^": 5, "*": 4, "/": 4, "+": 3, "-": 3, "&": 2, "=": 1, "<>": 1, "<": 1, ">": 1, "<=": 1, ">=": 1 };

  function parse(formula) {
    const tk = tokenize(formula);
    let p = 0, id = 0;
    const isOp = (v) => p < tk.length && tk[p].t === "op" && tk[p].v === v;
    const node = (o) => Object.assign({ id: ++id, text: "", name: "", op: "", kids: [], isParam: false, addr: null }, o);
    const expect = (v) => {
      if (!isOp(v)) throw new Error(`Thiếu "${v}"` + (p < tk.length ? ` gần "${tk[p].v}"` : " ở cuối công thức"));
      p++;
    };
    function expr(min) {
      let lhs = prefix();
      while (p < tk.length) {
        const t = tk[p];
        if (t.t !== "op") break;
        if (t.v === "%") { if (6 < min) break; p++; lhs = node({ type: "postfix", op: "%", kids: [lhs] }); continue; }
        const pr = BIN[t.v];
        if (pr === undefined || pr < min) break;
        p++;
        lhs = node({ type: "binary", op: t.v, kids: [lhs, expr(pr + 1)] });
      }
      return lhs;
    }
    function prefix() {
      if (p >= tk.length) throw new Error("Công thức kết thúc đột ngột");
      const t = tk[p++];
      if (["num", "str", "bool", "err", "ref", "name", "struct", "array"].includes(t.t)) return node({ type: t.t, text: t.v });
      if (t.t === "func") {
        const n = node({ type: "func", name: t.v });
        expect("(");
        if (isOp(")")) { p++; return n; }
        for (;;) {
          n.kids.push(isOp(",") || isOp(")") ? node({ type: "missing" }) : expr(0));
          if (isOp(",")) { p++; continue; }
          expect(")"); break;
        }
        return n;
      }
      if (t.v === "-" || t.v === "+") return node({ type: "unary", op: t.v, kids: [expr(7)] });
      if (t.v === "@") return node({ type: "unary", op: "@", kids: [expr(8)] });
      if (t.v === "(") { const e = expr(0); expect(")"); return node({ type: "paren", kids: [e] }); }
      throw new Error(`Không mong đợi "${t.v}"`);
    }
    const root = expr(0);
    if (p < tk.length) throw new Error(`Thừa "${tk[p].v}" trong công thức`);
    return root;
  }

  const stripPfx = (s) => String(s).replace(/^(_xlfn\.|_xlws\.|_xlpm\.)+/i, "");
  const norm = (s) => stripPfx(s).toUpperCase();

  function walk(n, fn) { fn(n); n.kids.forEach((k) => walk(k, fn)); }

  function qualify(ref, sheet) {
    if (!sheet || ref.includes("!")) return ref;
    return "'" + sheet.replace(/'/g, "''") + "'!" + ref;
  }

  // o: { mode: "eval" | "disp", sheet, subst: Map(id -> chuoi), hl: id, sep, dec }
  function text(n, o) {
    o = o || {};
    const disp = o.mode === "disp";
    const wrap = (s) => (o.hl === n.id ? "\u0001" + s + "\u0002" : s);
    if (o.subst && o.subst.has(n.id)) return wrap(o.subst.get(n.id));
    const sep = disp ? (o.sep || ",") + " " : ",";
    const k = n.kids;
    let s;
    switch (n.type) {
      case "func":
        if (!disp && n.addr && !k.length) s = n.name + "(" + n.addr + ")";
        else s = (disp ? norm(n.name) : n.name) + "(" + k.map((c) => text(c, o)).join(sep) + ")";
        break;
      case "unary": s = n.op + text(k[0], o); break;
      case "postfix": s = text(k[0], o) + "%"; break;
      case "binary": s = text(k[0], o) + n.op + text(k[1], o); break;
      case "paren": s = "(" + text(k[0], o) + ")"; break;
      case "ref": s = disp ? n.text : qualify(n.addr || n.text, o.sheet); break;
      case "struct": s = !disp && n.addr ? n.addr : n.text; break;
      case "name": s = disp ? stripPfx(n.text) : n.text; break;
      case "num": s = disp && o.dec && o.dec !== "." ? n.text.replace(".", o.dec) : n.text; break;
      case "missing": s = ""; break;
      default: s = n.text;
    }
    return wrap(s);
  }

  // Phan tich tham chieu bang can ngu canh dong: [@Cot], Bang[@Cot], [[#This Row],[Cot]], [Cot]
  function parseStruct(s) {
    const p = s.indexOf("[");
    if (p < 0) return null;
    const table = s.slice(0, p);
    const inner = s.slice(p + 1, -1);
    let col, thisRow;
    if (inner[0] === "@") { col = inner.slice(1); thisRow = true; }
    else if (/^\[#this row\],/i.test(inner)) { col = inner.replace(/^\[#this row\],/i, ""); thisRow = true; }
    else if (!table) { col = inner; thisRow = false; }
    else return null;
    if (col[0] === "[" && col.endsWith("]")) col = col.slice(1, -1);
    if (!col || col.includes("]:[") || col.includes("],[")) return null;
    col = col.replace(/''/g, "\u0003").replace(/'/g, "").replace(/\u0003/g, "'");
    return { table, col, thisRow };
  }

  g.FXP = { tokenize, parse, walk, text, stripPfx, norm, parseStruct, refKind };
})(typeof window !== "undefined" ? window : globalThis);
