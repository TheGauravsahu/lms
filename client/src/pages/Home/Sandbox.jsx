import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Code2, Play, Terminal, Eye, RefreshCw } from "lucide-react";
import { studentApi } from "@/api/studentApi";

const DEFAULT_JS = `// JavaScript Console Playground
// Write your code here and click "Run Code"

const message = "Hello from Gaurav LMS Sandbox! 🚀";
console.log(message);

const numbers = [1, 2, 3, 4, 5];
const squares = numbers.map(n => n * n);
console.log("Input numbers:", numbers);
console.log("Squared result:", squares);

// Try creating a function!
function greetUser(username) {
  return \`Happy coding, \${username}! 💻\`;
}
console.log(greetUser("Developer"));
`;

const DEFAULT_HTML = `<!-- HTML Playground -->
<div class="sandbox-container">
  <h1>Interactive Web Sandbox 🎨</h1>
  <p>Edit HTML, CSS and JS then click <strong>Update Preview</strong>.</p>
  <button id="alert-btn">Click Me!</button>
</div>
`;

const DEFAULT_CSS = `/* CSS Stylesheet */
body {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  background: #141210;
  color: #f5f3f0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.sandbox-container {
  background: #221d19;
  border: 1px solid rgba(255, 107, 0, 0.2);
  border-radius: 16px;
  padding: 30px;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

h1 { color: #ff6b00; margin-top: 0; }

button {
  background: linear-gradient(to bottom, #ff9040, #ff6b00);
  border: none;
  color: white;
  padding: 10px 20px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 15px;
  transition: transform 0.2s;
}

button:hover { transform: translateY(-2px); }
`;

const DEFAULT_HTML_JS = `// Live JS inside HTML Sandbox
const btn = document.getElementById("alert-btn");
if (btn) {
  btn.addEventListener("click", () => {
    alert("Interactive script works! 🎉");
  });
}
`;

/**
 * Build a complete HTML document string from the three file pieces.
 * Called with explicit values (not closures) so it always has fresh state.
 */
const buildSrcDoc = (html, css, js) =>
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
${css}
  </style>
</head>
<body>
${html}
<script>
try {
${js}
} catch (err) {
  document.body.innerHTML +=
    '<div style="color:#ff4444;font-family:monospace;font-size:11px;padding:10px;' +
    'background:#221111;border:1px solid #ff4444;border-radius:8px;margin-top:15px;">' +
    'Script Error: ' + err.message + '</div>';
}
</script>
</body>
</html>`;

export const Sandbox = () => {
  const earnMutation = studentApi.useEarnRewards();

  const [mode, setMode] = useState("javascript");
  const [activeFileTab, setActiveFileTab] = useState("html");

  const [jsCode, setJsCode] = useState(DEFAULT_JS);
  const [htmlCode, setHtmlCode] = useState(DEFAULT_HTML);
  const [cssCode, setCssCode] = useState(DEFAULT_CSS);
  const [htmlJsCode, setHtmlJsCode] = useState(DEFAULT_HTML_JS);

  const [consoleLogs, setConsoleLogs] = useState([
    "Console ready... Click 'Run Code' to execute.",
  ]);
  const [iframeSrcDoc, setIframeSrcDoc] = useState("");

  // ─── JS Runner ───────────────────────────────────────────────────────────────
  const runJavascript = () => {
    const logs = [];
    const customConsole = {
      log: (...args) =>
        logs.push(
          args
            .map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)))
            .join(" ")
        ),
      error: (...args) => logs.push("🔴 Error: " + args.join(" ")),
      warn: (...args) => logs.push("⚠️ Warning: " + args.join(" ")),
    };
    try {
      new Function("console", jsCode)(customConsole);
      setConsoleLogs(logs.length > 0 ? logs : ["(No output)"]);
    } catch (err) {
      setConsoleLogs([...logs, "🔴 Runtime Error: " + err.message]);
    }
    earnMutation.mutate({ xp: 15, badge: "Code Explorer" });
  };

  // ─── HTML Preview Runner ──────────────────────────────────────────────────────
  // Accepts explicit values so it never reads stale closure state.
  const runWebSandbox = (html, css, js) => {
    setIframeSrcDoc(buildSrcDoc(html, css, js));
  };

  const handleRunWebClick = () => {
    runWebSandbox(htmlCode, cssCode, htmlJsCode);
    earnMutation.mutate({ xp: 20, badge: "Web Creator" });
  };

  // Auto-render when switching to HTML mode
  useEffect(() => {
    if (mode === "html") {
      runWebSandbox(htmlCode, cssCode, htmlJsCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // ─── Reset ───────────────────────────────────────────────────────────────────
  const handleReset = () => {
    if (mode === "javascript") {
      setJsCode(DEFAULT_JS);
      setConsoleLogs(["Console cleared..."]);
    } else {
      setHtmlCode(DEFAULT_HTML);
      setCssCode(DEFAULT_CSS);
      setHtmlJsCode(DEFAULT_HTML_JS);
      setActiveFileTab("html");
      setIframeSrcDoc(buildSrcDoc(DEFAULT_HTML, DEFAULT_CSS, DEFAULT_HTML_JS));
    }
  };

  // ─── Editor helpers ───────────────────────────────────────────────────────────
  const activeEditorValue =
    activeFileTab === "html"
      ? htmlCode
      : activeFileTab === "css"
      ? cssCode
      : htmlJsCode;

  const handleEditorChange = (val) => {
    const v = val || "";
    if (activeFileTab === "html") setHtmlCode(v);
    else if (activeFileTab === "css") setCssCode(v);
    else setHtmlJsCode(v);
  };

  const activeLanguage =
    activeFileTab === "css" ? "css" : activeFileTab === "html" ? "html" : "javascript";

  const TABS = [
    { id: "html", label: "index.html" },
    { id: "css", label: "styles.css" },
    { id: "js", label: "script.js" },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card border border-border/40 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Code Playground</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Test snippets, build micro-frontends, and practice your coding live.
            </p>
          </div>
        </div>

        {/* Mode Toggler */}
        <div className="flex items-center gap-1 bg-background border border-border/60 p-1 rounded-xl w-fit self-start md:self-center">
          <button
            onClick={() => setMode("javascript")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === "javascript"
                ? "bg-orange-500 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            JS Playground
          </button>
          <button
            onClick={() => setMode("html")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === "html"
                ? "bg-orange-500 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            HTML/CSS Sandbox
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Editor ── */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="bg-muted/40 px-4 py-3 border-b border-border/50 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-orange-500" />
              Source Code
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs h-8 cursor-pointer border-border bg-background hover:bg-secondary"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset
              </Button>
              <Button
                size="sm"
                onClick={mode === "javascript" ? runJavascript : handleRunWebClick}
                className="bg-gradient-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold text-xs h-8 px-3 cursor-pointer rounded-lg flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-white" />
                {mode === "javascript" ? "Run Code" : "Update Preview"}
              </Button>
            </div>
          </div>

          {/* Editor */}
          {mode === "javascript" ? (
            <Editor
              height="450px"
              language="javascript"
              theme="vs-dark"
              value={jsCode}
              onChange={(v) => setJsCode(v || "")}
              options={{
                fontSize: 12,
                fontFamily: "Space Grotesk, monospace",
                minimap: { enabled: false },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
              }}
            />
          ) : (
            <>
              {/* File tabs */}
              <div className="flex bg-muted/20 border-b border-border/50 text-[10px] font-bold text-muted-foreground shrink-0">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFileTab(tab.id)}
                    className={`px-4 py-2 border-r border-border/40 cursor-pointer transition-all ${
                      activeFileTab === tab.id
                        ? "bg-background text-orange-500 border-t-2 border-t-orange-500"
                        : "hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {/* key forces Monaco to remount when tab changes — prevents stale value */}
              <Editor
                key={activeFileTab}
                height="410px"
                language={activeLanguage}
                theme="vs-dark"
                value={activeEditorValue}
                onChange={handleEditorChange}
                options={{
                  fontSize: 12,
                  fontFamily: "Space Grotesk, monospace",
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                }}
              />
            </>
          )}
        </div>

        {/* ── Right: Output ── */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-muted/40 px-4 py-3 border-b border-border/50 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              {mode === "javascript" ? (
                <>
                  <Terminal className="w-4 h-4 text-orange-500" />
                  Console Output
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-orange-500" />
                  Live Preview
                </>
              )}
            </span>
            {mode === "javascript" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConsoleLogs(["Console cleared..."])}
                className="text-[10px] font-semibold text-muted-foreground hover:text-foreground h-7 rounded-lg cursor-pointer"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Output body */}
          {mode === "javascript" ? (
            /* Console */
            <div className="flex-1 bg-black/95 p-5 font-mono text-xs overflow-y-auto" style={{ minHeight: "450px" }}>
              <div className="space-y-2">
                {consoleLogs.map((log, idx) => {
                  const isErr = log.startsWith("🔴");
                  const isWarn = log.startsWith("⚠️");
                  return (
                    <div
                      key={idx}
                      className={`whitespace-pre-wrap leading-relaxed ${
                        isErr
                          ? "text-red-400 font-semibold"
                          : isWarn
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {log}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* HTML Preview — white background, fixed height, allow-same-origin enables proper DOM */
            <div style={{ background: "#fff", minHeight: "450px", flex: 1 }}>
              {iframeSrcDoc ? (
                <iframe
                  srcDoc={iframeSrcDoc}
                  title="sandbox-preview"
                  sandbox="allow-scripts allow-same-origin"
                  style={{
                    width: "100%",
                    height: "450px",
                    border: "none",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{ minHeight: "450px" }}
                  className="flex flex-col items-center justify-center text-muted-foreground text-xs p-6 text-center"
                >
                  <Eye className="w-8 h-8 mb-2 opacity-40 animate-pulse" />
                  <span>
                    Click <strong>Update Preview</strong> to render your HTML/CSS/JS.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sandbox;
