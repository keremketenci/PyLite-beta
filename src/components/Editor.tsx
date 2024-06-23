import { useEffect, useState } from "react";
import { Editor as Monaco } from '@monaco-editor/react';
import { MonacoBreakpoint } from 'monaco-breakpoints';
import { invoke } from "@tauri-apps/api";

import { Icons } from "./Icons";
import Default from "../themes/default.json";
import { CommandPaletteIcon, DotFillIcon } from "@primer/octicons-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import Panel from "./Panel";
import Designer from "./Designer";
import { getLocalStorageItem, setLocalStorageItem } from "@/utils/LocalStorage";

const Editor = ({ filePath, fileName, fileContent }: { filePath: string | null, fileName: string | null, fileContent: string | null }) => {
  const [isTerminalOpen, setTerminalState] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({ lineNumber: 1, column: 1 });
  const [pythonVersion, setPythonVersion] = useState('');
  const [pythonExecPath, setPythonExecPath] = useState('');
  const [runCommand, setRunCommand] = useState('');
  const [debugCommand, setDebugCommand] = useState('');
  const [breakpoints, setBreakpoints] = useState<number[]>([]);
  const [showDesigner, setShowDesigner] = useState(false);
  const [editStatus, setEditStatus] = useState(false);
  const [editorContent, setEditorContent] = useState('');

  useEffect(() => {
    // const existedFilePath = getLocalStorageItem('filePath');
    // if (!existedFilePath) {
    //   setLocalStorageItem('filePath', filePath)
    // }
    setLocalStorageItem('filePath', filePath)
  }, [filePath]);

  useEffect(() => {
    const existedEditorContent = getLocalStorageItem('editorContent');
    if (!existedEditorContent) {
      setLocalStorageItem('editorContent', editorContent)
    }
  }, [fileContent]);

  useEffect(() => {
    setLocalStorageItem('editorContent', editorContent);
  }, [editorContent]);

  useEffect(() => {
    invoke<string>('get_python_version')
      .then((version) => setPythonVersion(version.trim()))
      .catch((error) => console.error('Error occurred while fetching Python version: ', error));

    invoke<string>('get_python_exec_path')
      .then((path) => setPythonExecPath(path.trim()))
      .catch((error) => console.error('Error occurred while fetching Python executable path: ', error));
  }, []);

  const toggleTerminal = () => {
    setTerminalState(!isTerminalOpen);
  };

  const toggleDesigner = () => {
    setShowDesigner(!showDesigner);
  };

  const saveFile = () => {
    const existedFilePath = getLocalStorageItem('filePath');
    const existedEditorContent = getLocalStorageItem('editorContent');
    console.log('Saving file:', existedFilePath, existedEditorContent);
    if (existedFilePath) {
      invoke('save_file', { path: existedFilePath, content: existedEditorContent })
        .then(() => {
          console.log('File saved successfully');
          setEditStatus(false);
        })
        .catch((error) => console.error('Error occurred while saving file: ', error));
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    setEditorContent(value || '');
    setEditStatus(true);
  };

  const handleRunScript = () => {
    if (pythonExecPath && filePath) {
      const command = `${pythonExecPath} ${filePath}`;
      const commandWithId = `${command}#${new Date().getTime()}`;

      if (command) {
        setRunCommand(commandWithId);
        setTerminalState(true);
      }
    }
  };

  const handleDebugScript = () => {
    if (pythonExecPath && filePath) {
      const command = `${pythonExecPath} -m pdb ${filePath}`;
      const commandWithId = `${command}#${new Date().getTime()}`;

      if (command) {
        setDebugCommand(commandWithId);
        setTerminalState(true);
      }
    }
  };

  const handleCommandExecuted = () => {
    setRunCommand('');
  };

  function handleEditorDidMount(editor: any, monaco: any) {
    const instance = new MonacoBreakpoint({ editor });

    monaco.editor.defineTheme('default', Default);
    monaco.editor.setTheme('default');

    instance.on('breakpointChanged', breakpoints => {
      console.log('breakpointChanged: ', breakpoints);
      setBreakpoints(breakpoints);
    });

    const position = editor.getPosition();
    if (position) {
      setCurrentPosition({ lineNumber: position.lineNumber, column: position.column });
    }

    editor.onDidChangeCursorPosition((e: any) => {
      const newPosition = e.position;
      setCurrentPosition({ lineNumber: newPosition.lineNumber, column: newPosition.column });
    });

    const snippets: { [key: string]: string } = {
      'if': 'if condition:\n\t# Statements to execute if\n\t# condition is true',
      'if-else': 'if (condition):\n\t# Executes this block if\n\t# condition is true\nelse:\n\t# Executes this block if\n\t# condition is false',
      'for': 'for var in iterable:\n\t# statements',
      'while': 'while expression:\n\tstatement(s)',
      'try': 'try:\n\t# Some Code\nexcept:\n\t# Executed if error in the\n\t# try block'
    };

    function showSnippetPopup() {
      const snippetKeys = Object.keys(snippets);
      const snippetMenu = document.createElement('div');
      snippetMenu.style.position = 'absolute';
      snippetMenu.style.backgroundColor = '#171719';
      snippetMenu.style.border = '1px solid #444348';
      snippetMenu.style.padding = '10px';
      snippetMenu.style.zIndex = '1000';

      snippetKeys.forEach(key => {
        const menuItem = document.createElement('div');
        menuItem.textContent = key;
        menuItem.style.cursor = 'pointer';
        menuItem.style.padding = '5px';
        menuItem.addEventListener('mouseover', () => {
          menuItem.style.backgroundColor = '#fff';
        });
        menuItem.addEventListener('mouseout', () => {
          menuItem.style.backgroundColor = 'transparent';
        });
        menuItem.addEventListener('click', () => {
          insertSnippet(key);
          document.body.removeChild(snippetMenu);
        });

        snippetMenu.appendChild(menuItem);
      });

      document.body.appendChild(snippetMenu);

      snippetMenu.style.left = `${editor.getDomNode().getBoundingClientRect().left + 10}px`;
      snippetMenu.style.top = `${editor.getDomNode().getBoundingClientRect().top + 10}px`;
    }

    function insertSnippet(key: string) {
      const selection = editor.getSelection();
      if (selection) {
        const range = new monaco.Range(selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn);
        const id = { major: 1, minor: 1 };
        const text = snippets[key];
        const op = { identifier: id, range: range, text: text, forceMoveMarkers: true };
        editor.executeEdits("my-source", [op]);
      }
    }

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      showSnippetPopup();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
      insertSnippet('if');
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyE, () => {
      insertSnippet('if-else');
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO, () => {
      insertSnippet('for');
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyW, () => {
      insertSnippet('while');
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyT, () => {
      insertSnippet('try');
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        saveFile();
        setEditStatus(false);
    });
  }


  return (
    <div className="h-full w-full flex flex-col">
      {/* Tab Area */}
      <header className="flex h-10 bg-app-fourth">
        <div className="inline-flex tabs md:w-[84vw] lg:w-[92vw]">
          <div className="float-left">
            <button className={`flex border-t border-t-cyan-500 text-app-activetext bg-app-primary items-center px-3 py-1.5 border-r border-[#2E2E32]`}>
              {fileName || 'Untitled-1'}
              {editStatus ? (
                <DotFillIcon className="ms-2 text-white" size={16} />
              ) : (
                <button className={`closebtn ms-1 text-red-500 hover:bg-shadow-tab rounded-xl bg-app-primary`}>
                  {editStatus ? <DotFillIcon className="text-white" size={16} /> : Icons.fileClose}
                </button>
              )}
            </button>
          </div>
        </div>
        <div className="inline-flex items-center md:w-[16vw] lg:w-[8vw]">
          {!showDesigner && (
            <>
              <button onClick={handleRunScript} className="inline-flex items-center px-2 py-2.5 bg-app-fourth text-green-600">
                {Icons.RunIcon}
              </button>
              <button onClick={handleDebugScript} className="inline-flex items-center px-2 py-2.5 bg-app-fourth text-orange-500">
                {Icons.Debug}
              </button>
            </>
          )}
          <button onClick={toggleDesigner} className="inline-flex items-center px-2 py-2.5 bg-app-fourth text-blue-500">
            {showDesigner ? Icons.Editor : Icons.Brush}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-auto">
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel className="h-full !overflow-auto" defaultSize={65} minSize={50}>
            {showDesigner ? (
              <Designer />
            ) : (
              <Monaco
                theme="vs-dark"
                defaultLanguage="python"
                value={fileContent as string}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  automaticLayout: true,
                  minimap: {
                    enabled: false,
                  },
                  glyphMargin: true,
                }}
              />
            )}
          </ResizablePanel>
          {/* Terminal Section */}
          <ResizableHandle />
          <ResizablePanel className={`w-full bg-app-secondary/25 p-3 space-y-4 border-t border-t-app-border ${isTerminalOpen ? 'block' : 'hidden'}`} defaultSize={35} minSize={20}>
            <Panel onToggleTerminal={toggleTerminal} onRunCommand={runCommand} onDebugCommand={debugCommand} onCommandExecuted={handleCommandExecuted} breakpoints={breakpoints} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <footer className="flex h-10 bg-app-secondary items-center px-3">
        <div className="ms-0">
          <button onClick={toggleTerminal}
            className={`flex h-10 px-2 text-app-activetext items-center space-x-2 ${isTerminalOpen ? 'bg-shadow-controls text-white focus:bg-shadow-controls' : 'bg-app-secondary'
              } hover:bg-shadow-controls`}
          >
            <CommandPaletteIcon size={13} />
            <span>Terminal</span>
          </button>
        </div>
        <div className="ml-auto space-x-6">
          <span>Ln {currentPosition.lineNumber}, Col {currentPosition.column}</span>
          <span>{pythonVersion}</span>
        </div>
      </footer>
    </div>
  );
}

export default Editor;