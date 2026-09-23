(function () {
  var codes = window.STIR_FAIL_CODES || {};
  var configs = window.STIR_CONFIGS || [];
  var tasks = window.STIR_TASKS || {};
  var STEP_S = 0.1;
  var VIDEO_DIR = "static/videos/";
  var VIDEOS = {};
  (window.STIR_VIDEO_MANIFEST || []).forEach(function (f) { VIDEOS[f] = true; });

  var ABBR = {
    old_goal: "OGC", grasp: "GRA", already_held: "HLD", gripper: "GRP", collision: "COL", stuck: "STK",
    timeout: "TMO", missing: "MIS", wrong_goal: "WRG", controller: "CTR", other: "FAI",
  };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function isWin(cell) { return typeof cell === "number"; }
  function secs(steps) { return (steps * STEP_S).toFixed(1); }

  // ---- teaser slot ----
  (function mountTeaser() {
    var slot = document.getElementById("teaser");
    if (!slot || !window.STIR_TEASER) return;
    var v = document.createElement("video");
    v.src = VIDEO_DIR + window.STIR_TEASER;
    // Full-length narrated overview: let the visitor start it, and load only
    // metadata up front so the page itself stays light.
    v.controls = true; v.preload = "metadata"; v.playsInline = true;
    v.setAttribute("playsinline", "");
    if (window.STIR_TEASER_POSTER) v.poster = VIDEO_DIR + window.STIR_TEASER_POSTER;
    slot.textContent = "";
    slot.appendChild(v);
    var cap = document.getElementById("teaser-cap");
    if (cap && window.STIR_TEASER_CAPTION) {
      cap.textContent = window.STIR_TEASER_CAPTION;
      cap.hidden = false;
    }
  })();

  // ---- datasets -> one common shape ----
  // { id, videoId, kind, title, detail, badge, rows: {cfgKey: [7 cells]} }
  function taskName(i) { var t = tasks[i]; return t ? t.object + " → " + t.place : "Task " + i; }

  function real2Cases() {
    return (window.STIR_REAL2 || []).map(function (c) {
      var badge = null;
      if (c.kind === "switch") {
        var a = tasks[c.from], b = tasks[c.to];
        if (a && b) badge = a.object === b.object ? "Destination only"
          : a.place === b.place ? "Object only" : "Object + destination";
      }
      return {
        id: c.id, videoId: c.id, kind: c.kind,
        title: c.kind === "fixed" ? "Task " + c.from : "Switch " + c.from + " → " + c.to,
        detail: c.kind === "fixed" ? taskName(c.from) : taskName(c.from) + "  ⇒  " + taskName(c.to),
        badge: badge,
        rows: { fixed: c.fixed, grid: c.grid, stir: c.stir },
      };
    });
  }

  function real1Cases() {
    var d = window.STIR_REAL1;
    if (!d) return [];
    var CUBE = { R: "Red cube", K: "Black cube", B: "Blue cube" };
    var out = [];
    (d.noswitch || []).forEach(function (c) {
      out.push({
        id: c.id, videoId: c.id.replace(/^r1-/, ""), kind: "fixed",
        title: CUBE[c.goal],
        detail: "Carry the " + CUBE[c.goal].toLowerCase() + " to the tabletop goal region",
        badge: null,
        rows: { fixed: c.fixed, grid: c.grid },
      });
    });
    (d.switch || []).forEach(function (c) {
      out.push({
        id: c.id, videoId: c.id.replace(/^r1-/, ""), kind: "switch",
        title: "Switch " + CUBE[c.from] + " → " + CUBE[c.to],
        detail: "The commanded cube changes during transport",
        badge: "Target only",
        rows: { fixed: c.fixed, grid: c.grid, stir: c.stir },
      });
    });
    return out;
  }

  // ---- tooltip ----
  var tip = el("div", "cell-tip");
  tip.hidden = true;
  document.body.appendChild(tip);
  function fillTip(lines) {
    tip.textContent = "";
    lines.forEach(function (l, i) { tip.appendChild(el("div", i === 0 ? "cell-tip-head" : null, l)); });
    tip.hidden = false;
  }
  function showTip(target, lines) {
    fillTip(lines);
    var r = target.getBoundingClientRect();
    var top = r.top + window.scrollY - tip.offsetHeight - 8;
    if (top < window.scrollY + 4) top = r.bottom + window.scrollY + 8;
    var left = r.left + window.scrollX + r.width / 2 - tip.offsetWidth / 2;
    left = Math.max(8, Math.min(left, document.documentElement.clientWidth - tip.offsetWidth - 8));
    tip.style.top = top + "px";
    tip.style.left = left + "px";
  }
  function positionTipAtPointer(e) {
    var gap = 14, edge = 8;
    var sx = window.scrollX, sy = window.scrollY;
    var right = sx + document.documentElement.clientWidth;
    var bottom = sy + document.documentElement.clientHeight;
    var left = e.clientX + sx + gap;
    var top = e.clientY + sy + gap;
    if (left + tip.offsetWidth + edge > right) left = e.clientX + sx - tip.offsetWidth - gap;
    if (top + tip.offsetHeight + edge > bottom) top = e.clientY + sy - tip.offsetHeight - gap;
    tip.style.left = Math.max(sx + edge, Math.min(left, right - tip.offsetWidth - edge)) + "px";
    tip.style.top = Math.max(sy + edge, Math.min(top, bottom - tip.offsetHeight - edge)) + "px";
  }
  function showTipAtPointer(e, lines) {
    fillTip(lines);
    positionTipAtPointer(e);
  }
  function moveTipWithPointer(e) {
    if (!tip.hidden) positionTipAtPointer(e);
  }
  function hideTip() { tip.hidden = true; }
  window.addEventListener("scroll", hideTip, { passive: true });

  // ---- video dialog ----
  var dialog = null;
  function openVideo(src, caption) {
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.className = "video-dialog";
      dialog.innerHTML = '<video controls autoplay loop muted playsinline></video>' +
        '<p class="video-dialog-cap"></p><button type="button" class="video-dialog-close">Close</button>';
      dialog.querySelector(".video-dialog-close").addEventListener("click", function () { dialog.close(); });
      dialog.addEventListener("close", function () { dialog.querySelector("video").pause(); });
      dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
      document.body.appendChild(dialog);
    }
    dialog.querySelector("video").src = VIDEO_DIR + src;
    dialog.querySelector(".video-dialog-cap").textContent = caption;
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute("open", "");
  }

  // ---- matrix ----
  function stats(row) {
    var wins = 0, sum = 0, n = 0;
    row.forEach(function (c) {
      if (c == null) return;
      n++;
      if (isWin(c)) { wins++; sum += c; }
    });
    return { wins: wins, n: n, mean: wins ? sum / wins : null };
  }

  function buildMatrix(ds, cases, caption) {
    var table = el("table", "matrix");
    table.appendChild(el("caption", null, caption));
    var thead = el("thead"), hr = el("tr");
    hr.appendChild(el("th", "col-case", "Case"));
    hr.appendChild(el("th", "col-config", "Configuration"));
    for (var t = 1; t <= ds.cols; t++) hr.appendChild(el("th", "num", String(t)));
    hr.appendChild(el("th", "num col-sum", "Success"));
    hr.appendChild(el("th", "num col-sum", "Mean (s)"));
    thead.appendChild(hr);
    table.appendChild(thead);

    cases.forEach(function (c) {
      var body = el("tbody", "grp " + c.kind);
      var present = configs.filter(function (cfg) { return c.rows[cfg.key]; });
      present.forEach(function (cfg, idx) {
        var tr = el("tr");
        if (idx === 0) {
          var th = el("th", "col-case");
          th.rowSpan = present.length;
          th.scope = "rowgroup";
          th.appendChild(el("span", "case-title", c.title));
          th.appendChild(el("span", "case-detail", c.detail));
          if (c.badge) th.appendChild(el("span", "case-kind", c.badge));
          tr.appendChild(th);
        }
        var cfgCell = el("td", "col-config");
        var name = el("span", "cfg-name");
        name.innerHTML = cfg.label;
        cfgCell.appendChild(name);
        tr.appendChild(cfgCell);

        var row = c.rows[cfg.key];
        row.forEach(function (cell, i) {
          var td = el("td", "cell " + (cell == null ? "empty" : isWin(cell) ? "win" : "fail"));
          td.tabIndex = 0;
          var head = c.title + " · " + ds.colWord + " " + (i + 1);
          var lines;
          if (cell == null) {
            td.appendChild(el("span", "code", "–"));
            lines = [head, cfg.short, "Not run"];
          } else if (isWin(cell)) {
            td.appendChild(el("span", "v", secs(cell)));
            lines = [head, cfg.short, "Success · " + secs(cell) + " s (" + cell + " steps)"];
            td.setAttribute("aria-label", ds.colWord + " " + (i + 1) + ": success, " + secs(cell) + " seconds");
          } else {
            td.appendChild(el("span", "x", "✕"));
            td.appendChild(el("span", "code", ABBR[cell.f] || "FAI"));
            var what = codes[cell.f] || "Failure";
            lines = [head, cfg.short, "Failure · " + what];
            if (cell.s) lines.push("Recorded " + secs(cell.s) + " s (" + cell.s + " steps)");
            if (cell.n) lines.push("Note: “" + cell.n + "”");
            td.setAttribute("aria-label", ds.colWord + " " + (i + 1) + ": failure, " + what);
          }
          var file = ds.key + "_" + cfg.key + "_" + c.videoId + "_" + (i + 1) + ".mp4";
          if (VIDEOS[file]) {
            td.classList.add("has-video");
            td.setAttribute("role", "button");
            var cap = head + " — " + cfg.short;
            var open = function () { openVideo(file, cap); };
            td.addEventListener("click", open);
            td.addEventListener("keydown", function (e) {
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
            });
            lines = lines.concat(["Click to play this run"]);
          }
          td.addEventListener("mouseenter", function () { showTip(td, lines); });
          td.addEventListener("focus", function () { showTip(td, lines); });
          td.addEventListener("mouseleave", hideTip);
          td.addEventListener("blur", hideTip);
          tr.appendChild(td);
        });

        var s = stats(row);
        var sc = el("td", "num col-sum rate");
        sc.appendChild(el("span", "rate-v", s.wins + "/" + s.n));
        tr.appendChild(sc);
        tr.appendChild(el("td", "num col-sum", s.mean == null ? "—" : secs(s.mean)));
        body.appendChild(tr);
      });
      table.appendChild(body);
    });
    return table;
  }

  // Success counts per configuration, split by whether the episode had a switch.
  function tally(ds) {
    var out = {};
    configs.forEach(function (cfg) {
      var b = { sw: { wins: 0, n: 0 }, ns: { wins: 0, n: 0 } };
      ds.cases.forEach(function (c) {
        var row = c.rows[cfg.key];
        if (!row) return;
        var bucket = c.kind === "switch" ? b.sw : b.ns;
        row.forEach(function (cell) {
          if (cell == null) return;
          bucket.n++;
          if (isWin(cell)) bucket.wins++;
        });
      });
      out[cfg.key] = b;
    });
    return out;
  }
  function rate(b) { return b.n ? (b.wins / b.n).toFixed(2) : "—"; }
  function count(b) { return b.wins + "/" + b.n + " episodes"; }

  // The summary is an argument in three steps, not three parallel scores:
  // the task is easy, the switch is what breaks it, and replanning gets it back.
  // Without a switch STIR reduces to the grid policy, so step 1 covers all three
  // configurations and there is no separate STIR number to report there.
  function buildLegend(ds) {
    var frag = document.createDocumentFragment();
    var keys = el("div", "legend-keys");
    var win = el("span", "legend-item");
    win.appendChild(el("span", "swatch win", "12.0"));
    win.appendChild(el("span", null, "Success, with completion time in seconds"));
    keys.appendChild(win);
    var fail = el("span", "legend-item");
    fail.appendChild(el("span", "swatch fail", "✕"));
    fail.appendChild(el("span", null, "Failure, with the cause below"));
    keys.appendChild(fail);
    frag.appendChild(keys);

    var used = {};
    ds.cases.forEach(function (c) {
      configs.forEach(function (cfg) {
        (c.rows[cfg.key] || []).forEach(function (cell) {
          if (cell && !isWin(cell)) used[cell.f] = true;
        });
      });
    });
    var dl = el("dl", "legend-codes");
    Object.keys(codes).forEach(function (k) {
      if (!used[k]) return;
      dl.appendChild(el("dt", null, ABBR[k] || "FAI"));
      dl.appendChild(el("dd", null, codes[k]));
    });
    frag.appendChild(dl);
    frag.appendChild(el("p", "legend-note", ds.note));
    return frag;
  }


  // ---- headline chart -------------------------------------------------
  // Emphasis chart: one ordered ramp, not a categorical palette. Bars are
  // directly labeled, so color is emphasis only and never identity.
  function bar(cfg, b, ref, cls) {
    var row = el("div", "ch-row");
    var label = el("div", "ch-label");
    label.innerHTML = cfg.label;
    row.appendChild(label);

    var track = el("div", "ch-track");
    var fill = el("div", "ch-bar " + cls);
    var pct = b.n ? (b.wins / b.n) : 0;
    fill.style.width = (pct * 100).toFixed(1) + "%";
    track.appendChild(fill);
    row.appendChild(track);

    row.appendChild(el("div", "ch-val", rate(b)));

    var lines = [cfg.short, "Success " + rate(b), count(b)];
    if (ref) lines.push("Without a switch: " + ref);
    row.tabIndex = 0;
    track.addEventListener("mouseenter", function (e) { showTipAtPointer(e, lines); });
    track.addEventListener("mousemove", moveTipWithPointer);
    track.addEventListener("mouseleave", hideTip);
    row.addEventListener("focus", function () { showTip(track, lines); });
    row.addEventListener("blur", hideTip);
    return row;
  }

  function buildFacet(ds) {
    var t = tally(ds);
    var pooled = { wins: 0, n: 0 };
    ["fixed", "grid"].forEach(function (k) {
      if (!t[k]) return;
      pooled.wins += t[k].ns.wins;
      pooled.n += t[k].ns.n;
    });

    var fig = el("figure", "chart");
    fig.appendChild(el("figcaption", null, ds.title));

    var plot = el("div", "chart-plot");
    // No-switch ceiling, drawn across the track column behind the bars.
    var refWrap = el("div", "ch-ref");
    var refPct = pooled.n ? pooled.wins / pooled.n : 1;
    var refLine = el("div", "ch-ref-line");
    refLine.style.left = (refPct * 100).toFixed(1) + "%";
    refLine.appendChild(el("span", "ch-ref-tag", "No switch " + rate(pooled)));
    refWrap.appendChild(refLine);
    plot.appendChild(refWrap);

    var CLS = { fixed: "is-1", grid: "is-2", stir: "is-3" };
    configs.forEach(function (cfg) {
      if (!t[cfg.key] || !t[cfg.key].sw.n) return;
      plot.appendChild(bar(cfg, t[cfg.key].sw, rate(pooled), CLS[cfg.key]));
    });
    fig.appendChild(plot);

    var axis = el("div", "ch-axis");
    ["0", "0.5", "1.0"].forEach(function (v) { axis.appendChild(el("span", null, v)); });
    fig.appendChild(axis);
    return fig;
  }

  // ---- outcome composition -------------------------------------------
  // Counting old-goal commitment on its own did not read: a bare count hides
  // what it is a count OF, and "shorter is better" inverts the chart above it.
  // Stacking the whole episode set per configuration puts the success rate and
  // the shrinking old-goal block in the same mark, so the gain and its cause
  // are one shape rather than two charts to reconcile.
  var SEG = [
    { key: "win",   label: "Success",              cls: "seg-win" },
    { key: "ogc",   label: "Old-goal commitment",  cls: "seg-ogc" },
    { key: "other", label: "Other failure",        cls: "seg-other" },
  ];

  function composition(ds, cfgKey) {
    var c = { win: 0, ogc: 0, other: 0, n: 0 };
    ds.cases.forEach(function (k) {
      if (k.kind !== "switch") return;
      (k.rows[cfgKey] || []).forEach(function (cell) {
        if (cell == null) return;
        c.n++;
        if (isWin(cell)) c.win++;
        else if (cell.f === "old_goal") c.ogc++;
        else c.other++;
      });
    });
    return c;
  }

  function buildMechanism(sets) {
    var frag = document.createDocumentFragment();

    var key = el("div", "seg-key");
    SEG.forEach(function (sg) {
      var it = el("span", "seg-key-item");
      it.appendChild(el("span", "seg-swatch " + sg.cls));
      it.appendChild(el("span", null, sg.label));
      key.appendChild(it);
    });
    frag.appendChild(key);

    sets.forEach(function (ds) {
      var fig = el("figure", "chart chart-stack");
      fig.appendChild(el("figcaption", null, ds.title));
      var plot = el("div", "chart-plot");
      configs.forEach(function (cfg) {
        var c = composition(ds, cfg.key);
        if (!c.n) return;
        var row = el("div", "ch-row");
        var label = el("div", "ch-label");
        label.innerHTML = cfg.label;
        row.appendChild(label);

        var track = el("div", "ch-track ch-stack");
        var lines = [cfg.short];
        SEG.forEach(function (sg) {
          var v = c[sg.key];
          if (!v) return;
          var seg = el("div", "seg " + sg.cls);
          seg.style.width = (v / c.n * 100).toFixed(2) + "%";
          // a number only goes inside a segment wide enough to hold it
          if (v / c.n >= 0.12) seg.appendChild(el("span", "seg-n", String(v)));
          track.appendChild(seg);
          lines.push(sg.label + ": " + v);
        });
        row.appendChild(track);
        row.appendChild(el("div", "ch-val", (c.win / c.n).toFixed(2)));

        lines.push("of " + c.n + " switch episodes");
        row.tabIndex = 0;
        track.addEventListener("mouseenter", function (e) { showTipAtPointer(e, lines); });
        track.addEventListener("mousemove", moveTipWithPointer);
        track.addEventListener("mouseleave", hideTip);
        row.addEventListener("focus", function () { showTip(track, lines); });
        row.addEventListener("blur", hideTip);
        plot.appendChild(row);
      });
      fig.appendChild(plot);
      frag.appendChild(fig);
    });
    return frag;
  }

  // ---- per-environment detail ----------------------------------------
  var NOTE = "Cells with a corner mark play that run's video; hover or focus any cell for that run's note. " +
    "A run counts as a success only when the updated goal was completed; runs that reached a goal state incorrectly, " +
    "collided, or timed out are failures even when a time was recorded.";

  function buildDetail(ds) {
    var mount = document.getElementById(ds.mount + "-detail");
    if (!mount || !ds.cases.length) return;
    var groups = [
      { cases: ds.cases.filter(function (c) { return c.kind !== "switch"; }), title: "No goal switch" },
      { cases: ds.cases.filter(function (c) { return c.kind === "switch"; }), title: "With a goal switch" },
    ].filter(function (g) { return g.cases.length; });

    var d = el("details", "detail");
    var sum = el("summary", null, "Per-trial results — every case, seven runs each");
    d.appendChild(sum);
    var body = el("div", "detail-body");
    groups.forEach(function (g) {
      body.appendChild(el("h3", "detail-h", g.title));
      var scroll = el("div", "matrix-scroll");
      scroll.appendChild(buildMatrix(ds, g.cases, g.title + ". " + ds.caption));
      body.appendChild(scroll);
    });
    var leg = el("div", "legend");
    leg.appendChild(buildLegend({ cases: ds.cases, note: NOTE }));
    body.appendChild(leg);
    d.appendChild(body);
    mount.appendChild(d);
  }

  // ---- assemble -------------------------------------------------------
  var CELLS = "Numbers are completion time in seconds; ✕ marks a failure with its cause.";
  var SETS = [
    {
      key: "real1", mount: "r1", cols: 7, colWord: "start position",
      title: "Real 1 — three cubes", cases: real1Cases(), caption: CELLS,
    },
    {
      key: "real2", mount: "r2", cols: 7, colWord: "trial",
      title: "Real 2 — object–destination", cases: real2Cases(), caption: CELLS,
    },
  ].filter(function (ds) { return ds.cases.length; });

  var head = document.getElementById("headline");
  if (head) SETS.forEach(function (ds) { head.appendChild(buildFacet(ds)); });

  var mech = document.getElementById("mechanism-figure");
  if (mech) mech.appendChild(buildMechanism(SETS));

  SETS.forEach(buildDetail);

  var hn = document.getElementById("headline-note");
  if (hn) hn.textContent = "All switch episodes. The command changes 2.5 s into execution.";
  var mn = document.getElementById("mechanism-note");
  if (mn) mn.textContent = "In Real 1 the old-goal block reaches zero: STIR's two remaining failures are " +
    "runs where the arm had already grasped the previous cube before the switch.";
})();
