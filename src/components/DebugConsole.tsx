import { useEffect, useRef, useState } from "react";

// dependencies
import { Terminal as Term } from "xterm";
import { FitAddon } from 'xterm-addon-fit';
import "xterm/css/xterm.css";
import { spawn } from "tauri-pty";
import { Icons } from "./Icons";

interface DebugConsoleProps {
  startCommand: string
  stepCommand: string
  handleClick: (cmd: string) => void
  breakpoints: number[];
}

const DebugConsole: React.FC<DebugConsoleProps> = ({ startCommand, stepCommand, handleClick, breakpoints }) => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const ptyRef = useRef<any>(null);
  const [debuggingProcess, setDebuggingProcess] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) return;

    if (breakpoints.length > 0 && ptyRef.current) {
      breakpoints.forEach(bp => {
        const actualCommand = `b ${bp}`;
        ptyRef.current.write(actualCommand + "\r\n");
      });
    }
  }, [breakpoints, initialized]);

  useEffect(() => {
    setDebuggingProcess(true);

    if (startCommand !== '' && ptyRef.current) {
      const actualCommand = startCommand.split('#')[0];
      ptyRef.current.write(actualCommand + "\r\n");
    }
  }, [startCommand]);

  useEffect(() => {
    if (stepCommand !== '' && ptyRef.current) {
      const actualCommand = stepCommand.split('#')[0];
      ptyRef.current.write(actualCommand + "\r\n");
    }
  }, [stepCommand]);

  useEffect(() => {
    if (debuggingProcess) {
      const terminal = new Term({
        convertEol: true,
        windowsMode: false,
        fontFamily: "Geist Mono",
        fontSize: 12,
        theme: {
          background: "rgba(23, 23, 25, 0.25)",
        },
      });

      if (!terminalRef.current) return;

      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.open(terminalRef.current);
      fitAddon.fit();
      addEventListener('resize', () => fitAddon.fit());

      const pty = spawn("powershell.exe", [], {
        cols: terminal.cols,
        rows: terminal.rows,
      });

      ptyRef.current = pty;

      pty.onData(data => terminal.write(data));
      terminal.onData(data => pty.write(data));
      terminal.onResize(e => pty.resize(e.cols, e.rows));
      pty.onExit(({ exitCode }) => { terminal.write(`\n\nProgram exit: ${exitCode}`); });

      setInitialized(true);

      return () => {
        terminal.dispose();
        pty.kill();
      };
    }
  }, [debuggingProcess == true]);

  const handleKillProcesses = () => {
    if (ptyRef.current) {
      setDebuggingProcess(false);
      ptyRef.current.kill();
    }
  };

  return (
    <div>
      <div className="w-52 flex bg-app-third shadow-xl mb-1 justify-center items-center mx-auto space-x-2">
        <button className="p-2 bg-app-third items-center text-green-500" onClick={() => handleClick(`c#${new Date().getTime()}`)}>{Icons.RunIcon}</button>
        <button className="p-2 bg-app-third items-center text-blue-400" onClick={() => handleClick(`n#${new Date().getTime()}`)}>{Icons.stepOver}</button>
        <button className="p-2 bg-app-third items-center text-blue-400" onClick={() => handleClick(`s#${new Date().getTime()}`)}>{Icons.arrowDown}</button>
        <button className="p-2 bg-app-third items-center text-green-400" onClick={() => handleClick(`r#${new Date().getTime()}`)}>{Icons.restart}</button>
        <button className="p-2 bg-app-third items-center text-red-400" onClick={() => handleClick(`q#${new Date().getTime()}`)} onDoubleClick={handleKillProcesses}>{Icons.StopIcon}</button>
      </div>
      <div ref={terminalRef} className="w-full h-full">
      </div>
    </div>
  );
}

export default DebugConsole;
