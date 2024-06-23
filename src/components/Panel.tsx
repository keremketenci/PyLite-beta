import { useEffect, useState } from "react";
import Terminal from "./Terminal";
import DebugConsole from "./DebugConsole";

interface PanelProps {
  onToggleTerminal: () => void;
  onRunCommand: string;
  onDebugCommand: string;
  onCommandExecuted: () => void;
  breakpoints: number[];
}

const Panel: React.FC<PanelProps> = ({ onToggleTerminal, onRunCommand, onDebugCommand, onCommandExecuted, breakpoints }) => {
  const [activeTab, setActiveTab] = useState('terminal');
  const [stepCommand, setStepCommand] = useState('');

  useEffect(() => {
    setActiveTab('debug');
  }, [onDebugCommand]);

  const handleStepping = (cmd: string) => {
    setStepCommand(cmd);
  };

  return (
    <div>
      <div className="flex flex-row h-8 w-full border-b border-app-border p-1 justify-start space-x-4">
        <button 
          onClick={() => setActiveTab('problems')} 
          className={`bg-app-secondary/25 text-sm tracking-wider truncate hover:text-app-activetext ${activeTab === 'problems' ? 'text-app-activetext' : 'text-app-inactivetext'}`}>
          PROBLEMS
        </button>
        <button 
          onClick={() => setActiveTab('terminal')} 
          className={`bg-app-secondary/25 text-sm tracking-wider truncate hover:text-app-activetext ${activeTab === 'terminal' ? 'text-app-activetext' : 'text-app-inactivetext'}`}>
          TERMINAL
        </button>
        <button 
          onClick={() => setActiveTab('debug')} 
          className={`bg-app-secondary/25 text-sm tracking-wider truncate hover:text-app-activetext ${activeTab === 'debug' ? 'text-app-activetext' : 'text-app-inactivetext'}`}>
          DEBUG CONSOLE
        </button>
        <button onClick={onToggleTerminal} className="flex justify-center items-center p-2 rounded-xl">
          X
        </button>
      </div>
      <div className="ps-1 mb-20">
        <div className={`pt-4 ${activeTab === 'problems' ? 'block' : 'hidden'}`}>
          Problems content...
        </div>
        <div className={`pt-4 ${activeTab === 'terminal' ? 'block' : 'hidden'}`}>
          <Terminal command={onRunCommand} onCommandExecuted={onCommandExecuted} />
        </div>
        <div className={`pt-0 ${activeTab === 'debug' ? 'block' : 'hidden'}`}>
          <DebugConsole startCommand={onDebugCommand} stepCommand={stepCommand} handleClick={handleStepping} breakpoints={breakpoints} />
        </div>
      </div>
    </div>
  )
}

export default Panel;