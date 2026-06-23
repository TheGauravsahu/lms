import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Code2, Play, Terminal, Eye, RefreshCw, AlertCircle, Sparkles, Award } from "lucide-react";
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
  <p>Modify this HTML or CSS code and click "Update Preview" to see the live rendering below.</p>
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

h1 {
  color: #ff6b00;
  margin-top: 0;
}

button {
  background: linear-gradient(to bottom, #ff9040, #ff6b00);
  border: none;
  color: white;
  padding: 10px 20px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 15px;
  box-shadow: 0 4px 10px rgba(255, 107, 0, 0.2);
  transition: transform 0.2s;
}

button:hover {
  transform: translateY(-2px);
}
`;

const DEFAULT_HTML_JS = `// Live JS inside HTML Sandbox
const btn = document.getElementById("alert-btn");
btn.addEventListener("click", () => {
  alert("Interactive script runs inside this iframe sandbox! 🎉");
});
`;

export const Sandbox = () => {
  const earnMutation = studentApi.useEarnRewards();

  // Mode Selection: "javascript" or "html"
  const [mode, setMode] = useState("javascript");
  
  // Editor code states
  const [jsCode, setJsCode] = useState(DEFAULT_JS);
  const [htmlCode, setHtmlCode] = useState(DEFAULT_HTML);
  const [cssCode, setCssCode] = useState(DEFAULT_CSS);
  const [htmlJsCode, setHtmlJsCode] = useState(DEFAULT_HTML_JS);

  // Output outputs
  const [consoleLogs, setConsoleLogs] = useState(["Console ready... Click 'Run Code' to execute."]);
  const [iframeSrcDoc, setIframeSrcDoc] = useState("");

  // Run Javascript in sandbox
  const runJavascript = () => {
    const logs = [];
    const customConsole = {
      log: (...args) => {
        logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" "));
      },
      error: (...args) => {
        logs.push("🔴 Error: " + args.join(" "));
      },
      warn: (...args) => {
        logs.push("⚠️ Warning: " + args.join(" "));
      }
    };

    try {
      const runFn = new Function("console", jsCode);
      runFn(customConsole);
      setConsoleLogs(logs.length > 0 ? logs : ["(Script finished execution, no output)"]);
    } catch (err) {
      setConsoleLogs([...logs, "🔴 Runtime Error: " + err.message]);
    }

    // Award rewards
    earnMutation.mutate({ xp: 15, badge: "Code Explorer" });
  };

  // Compile and run HTML/CSS/JS in iframe
  const runWebSandbox = () => {
    const srcDoc = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
          <script>
            try {
              ${htmlJsCode}
            } catch (err) {
              console.error("Script Error:", err.message);
              document.body.innerHTML += '<div style="color: #ff4444; font-family: monospace; font-size: 11px; padding: 10px; background: #221111; border: 1px solid #ff4444; border-radius: 8px; margin-top: 15px;">Script Error: ' + err.message + '</div>';
            }
          </script>
        </body>
      </html>
    `;
    setIframeSrcDoc(srcDoc);

    // Award rewards
    earnMutation.mutate({ xp: 20, badge: "Web Creator" });
  };

  // Run code on template load or shift
  useEffect(() => {
    if (mode === "html") {
      runWebSandbox();
    }
  }, [mode]);

  const handleReset = () => {
    if (mode === "javascript") {
      setJsCode(DEFAULT_JS);
      setConsoleLogs(["Console cleared..."]);
    } else {
      setHtmlCode(DEFAULT_HTML);
      setCssCode(DEFAULT_CSS);
      setHtmlJsCode(DEFAULT_HTML_JS);
      setIframeSrcDoc("");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card border border-border/40 p-5 rounded-2xl shadow-xs">
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

        {/* Templates Mode Toggler */}
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

      {/* Main Workspace Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch min-h-[500px]">
        {/* Left Side: Monaco Editors */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
          {/* Header controls */}
          <div className="bg-muted/40 p-4 border-b border-border/50 flex items-center justify-between">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-orange-500" />
              Source Code
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs h-8 cursor-pointer border-border hover:bg-secondary bg-background"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset
              </Button>

              <Button
                size="sm"
                onClick={mode === "javascript" ? runJavascript : runWebSandbox}
                className="bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold text-xs h-8 px-3 cursor-pointer rounded-lg flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-white" /> Run Code
              </Button>
            </div>
          </div>

          {/* Editors Container */}
          <div className="flex-1 min-h-[400px]">
            {mode === "javascript" ? (
              <Editor
                height="450px"
                language="javascript"
                theme="vs-dark"
                value={jsCode}
                onChange={(val) => setJsCode(val || "")}
                options={{
                  fontSize: 12,
                  fontFamily: "Space Grotesk, monospace",
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  scrollbar: { vertical: "visible" },
                }}
              />
            ) : (
              <div className="flex flex-col h-full">
                {/* Multi-file selector inside HTML */}
                <div className="flex bg-muted/20 border-b text-[10px] font-bold text-muted-foreground">
                  <span className="px-4 py-2 bg-background border-r text-orange-500 border-t-2 border-t-orange-500">
                    index.html
                  </span>
                </div>
                
                <Editor
                  height="410px"
                  language="html"
                  theme="vs-dark"
                  value={htmlCode}
                  onChange={(val) => setHtmlCode(val || "")}
                  options={{
                    fontSize: 12,
                    fontFamily: "Space Grotesk, monospace",
                    minimap: { enabled: false },
                    lineNumbers: "on",
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Preview / Console log */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
          {/* Header */}
          <div className="bg-muted/40 p-4 border-b border-border/50 flex items-center justify-between">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              {mode === "javascript" ? (
                <>
                  <Terminal className="w-4 h-4 text-orange-500" />
                  Terminal Console Output
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-orange-500" />
                  Live Preview Output
                </>
              )}
            </span>

            {mode === "javascript" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConsoleLogs(["Console cleared..."])}
                className="text-[10px] font-semibold text-muted-foreground hover:text-foreground h-7 rounded-lg"
              >
                Clear Console
              </Button>
            )}
          </div>

          {/* Output Container */}
          <div className="flex-1 bg-black/95 dark:bg-black/80 p-5 font-mono text-xs overflow-y-auto min-h-[400px]">
            {mode === "javascript" ? (
              <div className="space-y-2">
                {consoleLogs.map((log, idx) => {
                  const isErr = log.startsWith("🔴");
                  const isWarn = log.startsWith("⚠️");
                  return (
                    <div
                      key={idx}
                      className={`whitespace-pre-wrap leading-relaxed ${
                        isErr
                          ? "text-red-500 font-semibold"
                          : isWarn
                          ? "text-yellow-500"
                          : "text-green-400"
                      }`}
                    >
                      {log}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full h-full bg-white rounded-xl overflow-hidden min-h-[380px]">
                {iframeSrcDoc ? (
                  <iframe
                    srcDoc={iframeSrcDoc}
                    title="sandbox-preview"
                    sandbox="allow-scripts"
                    className="w-full h-full border-none bg-white"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-xs p-6 text-center bg-[#fcfbf9]">
                    <Eye className="w-8 h-8 mb-2 text-muted-foreground/50 animate-pulse" />
                    <span>Live preview compilation will appear here.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sandbox;
