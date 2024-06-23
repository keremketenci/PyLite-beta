import { useEffect, useRef } from "react";

// dependencies
import { Terminal as Term } from "xterm";
import { FitAddon } from 'xterm-addon-fit';
import "xterm/css/xterm.css";
import { spawn } from "tauri-pty";
import { getLocalStorageItem } from "@/utils/LocalStorage";

const Terminal = ({ command, onCommandExecuted }: { command: string, onCommandExecuted: () => void }) => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const ptyRef = useRef<any>(null);
  const commandRef = useRef<string>('');
  let openedFolder = getLocalStorageItem('openedFolder');

  useEffect(() => {
    if (command !== '' && ptyRef.current && command !== commandRef.current) {
      const actualCommand = command.split('#')[0];
      ptyRef.current.write(actualCommand + "\r\n");
      commandRef.current = command;
      onCommandExecuted();
    }
  }, [command, onCommandExecuted]);

  useEffect(() => {
    const terminal = new Term({
      convertEol: true,
      windowsMode: false,
      fontFamily: "Geist Mono",
      fontSize: 12,
      theme: {
        background: "rgba(23, 23, 25, 0.25)",
      },
    });

    if(!terminalRef.current) return;
    
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);
    fitAddon.fit();
    addEventListener('resize', () => fitAddon.fit());

    const pty = spawn("powershell.exe", [], {
      cols: terminal.cols,
      rows: terminal.rows,
      cwd: openedFolder as string,
    });

    ptyRef.current = pty;

    pty.onData(data => terminal.write(data));
    terminal.onData(data => pty.write(data));
    terminal.onResize(e => pty.resize(e.cols, e.rows));
    pty.onExit(({ exitCode }) => { terminal.write(`\n\nProgram exit: ${exitCode}`); });

    return () => {
      terminal.dispose();
      pty.kill();
    };
  }, []);

  return <div ref={terminalRef} className="w-full h-full" />;
}

export default Terminal;
