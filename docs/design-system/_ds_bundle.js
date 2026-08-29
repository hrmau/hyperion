/* ─────────────────────────────────────────────────────────────────────────
   Grid Gorilla — documentation bundle

   Exposes every component on `window.GridGorilla` so the specimen cards in
   components/ can render without a build step.

   THIS FILE IS FOR THE DOCS SURFACE ONLY. Production code imports the
   modules directly (`import { Button } from ".../core/Button.jsx"`) — do not
   ship this bundle or its loading strategy into the product.

   How it works, and why:
   - The components are ESM `.jsx`. babel-standalone cannot resolve ESM
     imports of .jsx in the browser, so we fetch the sources, strip the
     import/export keywords, concatenate them in dependency order, and run
     ONE Babel transform over the result.
   - The React preset runs in CLASSIC runtime deliberately: the automatic
     runtime injects its own `import` statement, which cannot be evaluated
     here.
   - Loading is synchronous (XHR). The cards run their component code from a
     `<script type="text/babel">` block, which babel-standalone executes on
     DOMContentLoaded — so `window.GridGorilla` must already exist by then.
     Async fetch would race it. Same-origin, small files, docs only.

   Load AFTER react, react-dom and @babel/standalone.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var MODULES = [
    // leaf helpers first, then anything that depends on them
    "components/data/fuels.js",
    "components/core/Eyebrow.jsx",
    "components/core/Button.jsx",
    "components/core/Pill.jsx",
    "components/core/Card.jsx",
    "components/core/Stat.jsx",
    "components/core/Badge.jsx",
    "components/core/GorillaNote.jsx",
    "components/forms/Forms.jsx",
    "components/forms/CountrySearch.jsx",
    "components/feedback/Feedback.jsx",
    "components/overlay/Overlay.jsx",
    "components/nav/LocationPill.jsx",
    "components/nav/TopNav.jsx",
    "components/nav/Footer.jsx",
    "components/nav/SiteFooter.jsx",
    "components/nav/Navigation.jsx",
    "components/data/FuelLegend.jsx",
    "components/data/StackedAreaChart.jsx",
    "components/data/MixBar.jsx",
    "components/data/RankedBarList.jsx",
    "components/data/DonutStat.jsx",
    "components/data/TileGrid.jsx",
    "components/data/DataTable.jsx",
    "components/data/YearScrubber.jsx",
    "components/data/Sparkline.jsx",
    "components/data/Charts.jsx",
    "components/data/WorldMap.jsx",
    "components/content/HookHeadline.jsx",
    "components/content/HookCard.jsx",
    "components/content/QuizCard.jsx",
    "components/content/CountryHeader.jsx",
    "components/content/ChapterCard.jsx",
    "components/content/Prose.jsx"
  ];

  // Resolve against this file's own location, so cards at any depth work.
  var base = (function () {
    var s = document.currentScript;
    if (s && s.src) return s.src.replace(/[^/]*$/, "");
    return new URL(".", location.href).href;
  })();

  function readSync(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false); // sync on purpose — see header note
    xhr.send(null);
    if (xhr.status !== 0 && xhr.status !== 200) {
      throw new Error("Could not load " + url + " (" + xhr.status + ")");
    }
    return xhr.responseText;
  }

  function strip(src) {
    return src
      .replace(/^\s*import[\s\S]*?;\s*$/gm, "")
      .replace(/^\s*export\s+/gm, "");
  }

  if (!window.React || !window.ReactDOM) {
    console.error("[GridGorilla] Load react and react-dom before _ds_bundle.js.");
    return;
  }
  if (!window.Babel) {
    console.error("[GridGorilla] Load @babel/standalone before _ds_bundle.js.");
    return;
  }

  var sources, joined;
  try {
    sources = MODULES.map(function (path) { return strip(readSync(base + path)); });
  } catch (err) {
    console.error("[GridGorilla] " + err.message);
    return;
  }
  joined = sources.join("\n");

  // Collect every top-level binding so we can hand them back as a namespace.
  var names = [];
  var re = /^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm;
  var m;
  while ((m = re.exec(joined)) !== null) {
    if (names.indexOf(m[1]) === -1) names.push(m[1]);
  }

  // Wrap before transforming: a bare `return` at the top of a Program is a
  // syntax error, so the module body has to already be inside a function
  // when Babel parses it.
  var wrapped =
    "(function (React, ReactDOM) {\n" +
    joined +
    "\nreturn {" + names.join(",") + "};\n})";

  var code;
  try {
    code = window.Babel.transform(wrapped, {
      presets: [["react", { runtime: "classic" }]]
    }).code;
  } catch (err) {
    console.error("[GridGorilla] Transform failed: " + err.message);
    return;
  }

  try {
    // eslint-disable-next-line no-eval
    window.GridGorilla = (0, eval)(code)(window.React, window.ReactDOM);
  } catch (err) {
    console.error("[GridGorilla] Evaluation failed: " + err.message);
    return;
  }

  var missing = ["Button", "Card", "Stat", "TopNav", "StackedAreaChart", "Prose"]
    .filter(function (k) { return !window.GridGorilla[k]; });
  if (missing.length) {
    console.warn("[GridGorilla] Missing exports: " + missing.join(", "));
  }

  /* ── Run the card's own demo script ────────────────────────────────────
     Cards mark their demo as type="text/gg-babel" rather than "text/babel"
     so that babel-standalone's automatic DOMContentLoaded pass ignores it.
     We transform and run it here instead: that guarantees it executes AFTER
     window.GridGorilla exists, and that it uses the same classic-runtime
     preset as the components. Relying on Babel's own pass reintroduces both
     an ordering race and a preset ambiguity. */
  function runCardScripts() {
    var nodes = document.querySelectorAll('script[type="text/gg-babel"]');
    for (var i = 0; i < nodes.length; i++) {
      try {
        var out = window.Babel.transform(nodes[i].textContent, {
          presets: [["react", { runtime: "classic" }]]
        }).code;
        (0, eval)(out);
      } catch (err) {
        console.error("[GridGorilla] Card script failed: " + err.message);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runCardScripts);
  } else {
    runCardScripts();
  }
})();
