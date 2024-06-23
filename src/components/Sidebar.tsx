import { useEffect, useState } from "react";

// components & utils
import Explorer from "@/components/Explorer";
import { getLocalStorageItem } from "@/utils/LocalStorage";
import { Icons } from "./Icons";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  FileDirectoryOpenFillIcon,
  SearchIcon,
  SquirrelIcon,
  ThreeBarsIcon,
  TypographyIcon,
  WorkflowIcon
} from "@primer/octicons-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  StAccordion,
  StAccordionContent,
  StAccordionItem,
  StAccordionTrigger,
} from "@/components/ui/st-accordion";

import { Command } from "@tauri-apps/api/shell";
import { openFolderDialog } from "@/utils/FsHandler";
import { invoke } from "@tauri-apps/api";
import { MenubarSeparator } from "./ui/menubar";

interface SearchResult {
  file_name: string;
  line_content: string;
  line_number: number;
}

interface Variable {
  name: string;
  type: string;
  value: any;
  size_kb: number;
}

interface Function {
  name: string;
  type: string;
  size_kb: number;
  args: string[];
  docstring: string | null;
}

const Sidebar = ({ onFileClick, onCollapse, fileContent, filePath }: { onFileClick: (path: string, name: string, content: string) => void, onCollapse: () => void, fileContent: string | null, filePath: string | null }) => {
  const [activeTab, setActiveTab] = useState('explorer');
  const [sidebarTitle, setSidebarTitle] = useState('EXPLORER');
  const selectedDirectory = getLocalStorageItem<string>('openedFolder');
  const [pseudoOutput, setPseudoOutput] = useState('');
  const [resultPath, setResultPath] = useState('');
  const [selectedType, setSelectedType] = useState('data-flow-diagram');
  const [dotExecPath, setDotExecPath] = useState('');
  const [keyword, setKeyword] = useState('');
  const [directory] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isMatchCaseActive, setIsMatchCaseActive] = useState(false);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [functions, setFunctions] = useState<Function[]>([]);

  const handleSearch = async (searchKeyword: string) => {
    if (!searchKeyword.trim()) {
      setResults([]);
      return;
    }
    const response = await invoke('find_in_files', {
      query: {
        keyword: searchKeyword,
        directory,
        match_case: isMatchCaseActive
      }
    });
    setResults(response as SearchResult[]);
  };


  useEffect(() => {
    handleSearch(keyword);
  }, [keyword, isMatchCaseActive]);

  const groupedResults = results.reduce((acc: any, result: SearchResult) => {
    if (!acc[result.file_name]) {
      acc[result.file_name] = [];
    }
    acc[result.file_name].push(result);
    return acc;
  }, {});


  async function getPseudoCode() {
    if (!fileContent) return;
    const command = Command.sidecar("bin/python/pseudo_generator", [fileContent]);
    const output = await command.execute();
    const { stdout, stderr } = output;

    setPseudoOutput(stdout ? stdout : stderr);
  }

  async function getVariables() {
    if (!fileContent) return;
    const command = Command.sidecar("bin/python/datadict_generator", [fileContent]);
    const output = await command.execute();
    const { stdout, stderr } = output;
    console.log('Command Output:', stdout ? stdout : stderr);
    const data = JSON.parse(stdout ? stdout : stderr);
    setVariables(data.variables);
    setFunctions(data.functions);
  }

  async function generateDFD() {
    if (!pseudoOutput) return;

    invoke<string>('get_graphviz_dot_path')
      .then((path) => setDotExecPath(path.trim()))
      .catch((error) => console.error('Error occurred while fetching Dot executable path: ', error));

    console.log(dotExecPath);

    const command = Command.sidecar("bin/python/dfd_generator", [pseudoOutput, resultPath, dotExecPath]);
    const output = await command.execute();
    const { stdout, stderr } = output;
    console.log(stdout + stderr);
  }

  async function generateFlowchart() {
    if (!filePath) return;
    console.log(filePath);
    const command = Command.sidecar("bin/python/flowchart_generator", [filePath, resultPath]);
    const output = await command.execute();
    const { stdout, stderr } = output;
    console.log(stdout + stderr);
  }

  const handleGenerate = () => {
    console.log(selectedType);
    if (selectedType === 'Data-flow Diagram') {
      generateDFD();
    } else {
      generateFlowchart();
    }
  }

  const onTabChange = (tabName: string) => {
    setActiveTab(tabName);

    switch (tabName) {
      case 'explorer':
        setSidebarTitle('EXPLORER');
        break;
      case 'search':
        setSidebarTitle('FIND & REPLACE');
        break;
      case 'syntax-tool':
        setSidebarTitle('SYNTAX TOOL');
        break;
      case 'documentation':
        setSidebarTitle('CHART & DIAGRAM GENERATOR');
        break;
      default:
        setSidebarTitle('EXPLORER');
    }
  }

  const explorerStruct = (directory: string | null) => {
    if (directory) {
      return (
        <div className="w-full">
          <Accordion type="single" defaultValue="selectedPath" collapsible>
            <AccordionItem value="selectedPath">
              <AccordionTrigger>
                <div className="inline-flex w-full items-center ms-3 space-x-2">
                  <span><FileDirectoryOpenFillIcon size={13} /></span>
                  <span>{directory.split(/[\\/]/).pop()}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Explorer directory={directory} level={1} onFileClick={onFileClick} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      );
    }
  };

  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === keyword.toLowerCase() ? <span key={index} className="bg-yellow-200 text-black">{part}</span> : part
    );
  };
  const handleMatchCaseToggle = () => {
    setIsMatchCaseActive(!isMatchCaseActive);
  };
  const searchStruct = (directory: string | null) => {
    if (directory) {
      const defaultOpenItems = Object.keys(groupedResults).concat("searchInput");
      return (
        <div className="w-full !overflow-hidden">
          <Accordion type="multiple" defaultValue={defaultOpenItems}>
            <AccordionItem value="searchInput">
              <ul>
                <li className="flex items-center mb-2">
                  <input
                    type="text"
                    placeholder="Search"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="flex-grow outline-none p-2"
                  />
                  <button
                    onClick={handleMatchCaseToggle}
                    className={`w-12 h-11 ${isMatchCaseActive ? 'bg-gray-500 text-white' : 'bg-black-500'}`}
                  >
                    <TypographyIcon />
                  </button>
                </li>
              </ul>
            </AccordionItem>
            {Object.keys(groupedResults).map((fileName, index) => (
              <AccordionItem key={index} value={fileName}>
                <AccordionTrigger>
                  <div className="inline-flex w-full items-center ms-3 space-x-2">
                    <span>{fileName}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="m-4">

                  {groupedResults[fileName].map((result: SearchResult, subIndex: number) => (
                    <div className="m-4">
                      <p key={subIndex}>
                        {highlightKeyword(`${result.line_content} - line: ${result.line_number}`, keyword)}
                      </p>
                      <MenubarSeparator />
                    </div>
                  ))}

                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      );
    }
  };

  const types = [
    {
      id: "data-flow-diagram",
      label: "Data-flow Diagram",
    },
    {
      id: "flowchart",
      label: "Flowchart",
    },
  ] as const

  const ChartAndDiagramGenerator = () => {
    const handleFileDialog = async () => {
      const selectedPath = await openFolderDialog();

      if (selectedPath && typeof selectedPath === 'string') {
        setResultPath(selectedPath);
      }
    };

    return (
      <div className="w-full px-3 pt-6 space-y-10">
        <div className="space-y-2">
          <p className="text-sm text-app-inactivetext/75">PSEUDO CODE</p>
          <Textarea
            placeholder="Once you generated pseudo code will be shown here."
            value={pseudoOutput}
            onChange={(e) => setPseudoOutput(e.target.value)}
          />
          <Button onClick={getPseudoCode} className="h-10 w-full rounded-lg">
            GET
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-app-inactivetext/75">RESULT FOLDER</p>
          <span className="text-sm">{resultPath ? "Selected path: " + resultPath : ""}</span>
          <div className="flex items-center space-x-2">
            <Button onClick={handleFileDialog} className="h-10 w-full rounded-lg">
              BROWSE
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-app-inactivetext/75">CHOOSE ONE</p>
          <RadioGroup
            defaultValue="data-flow diagram"
            onValueChange={(value) => setSelectedType(value)}
          >
            {types.map((type) => (
              <div className="flex flex-row items-center space-x-2">
                <RadioGroupItem value={type.label} id={type.id} />
                <span>{type.label}</span>
              </div>
            ))}
          </RadioGroup>
        </div>
        <Button onClick={handleGenerate} className="h-10 w-full rounded-lg">
          GENERATE
        </Button>
      </div>
    );
  };

  const DataDictionary = () => {
    return (
      <div className="w-full">
        <Button onClick={getVariables} className="h-10 w-full rounded-lg mt-4 ms-3">
          GET
        </Button>
        <div>
          <p className="text-sm text-app-inactivetext/75 px-3 pt-6">VARIABLES</p>
          <StAccordion type="single" collapsible>
            {variables.map((item, index) => (
              <StAccordionItem value={item.name} key={index}>
                <StAccordionTrigger>{item.name}</StAccordionTrigger>
                <StAccordionContent>
                  <p>Type: {item.type}</p>
                  {item.value && <p>Value: {JSON.stringify(item.value)}</p>}
                  <p>Size (KB): {item.size_kb}</p>
                </StAccordionContent>
              </StAccordionItem>
            ))}
          </StAccordion>
        </div>

        <div>
          <p className="text-sm text-app-inactivetext/75 px-3 pt-6">FUNCTIONS</p>
          <StAccordion type="single" collapsible>
            {functions.map((item, index) => (
              <StAccordionItem value={item.name} key={index}>
                <StAccordionTrigger>{item.name}</StAccordionTrigger>
                <StAccordionContent>
                  <p>Type: {item.type}</p>
                  <p>Args: {JSON.stringify(item.args)}</p>
                  <p>Size (KB): {item.size_kb}</p>
                  {item.docstring && <p>Docstring: {item.docstring}</p>}
                </StAccordionContent>
              </StAccordionItem>
            ))}
          </StAccordion>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'explorer':
        return explorerStruct(selectedDirectory);
      case 'search':
        return searchStruct(selectedDirectory);
      case 'syntax-tool':
        return DataDictionary();
      case 'documentation':
        return ChartAndDiagramGenerator();
      default:
        setActiveTab('explorer');
        return null;
    }
  };

  return (
    <div className="flex flex-col bg-app-third h-full">
      <header className="h-10 w-full bg-app-fourth float-left items-center shadow-sm">
        <h3 className="float-left text-sm p-3 text-app-inactivetext tracking-widest truncate">
          {sidebarTitle}
        </h3>
        <div className="flex float-right p-2.5 space-x-2 items-center">
          <button className="bg-[#1E1E24]" >{Icons.swapArrows}</button>
          <button className="bg-[#1E1E24]" onClick={onCollapse}>{Icons.chevronDoubleL}</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {renderContent()}
      </div>

      <footer className="flex h-10 bg-app-fourth grid grid-flow-col justify-stretch">
        <button
          className={`px-4 bg-app-fourth ${activeTab === 'explorer' ? 'active text-app-activetext border-b border-b-teal-400' : 'text-app-inactivetext'}`}
          onClick={() => onTabChange('explorer')}
        >
          <ThreeBarsIcon size={13} />
        </button>
        <button
          className={`px-4 bg-app-fourth ${activeTab === 'search' ? 'active text-app-activetext border-b border-b-teal-400' : 'text-app-inactivetext'}`}
          onClick={() => onTabChange('search')}
        >
          <SearchIcon size={13} />
        </button>
        <button
          className={`px-4 bg-app-fourth ${activeTab === 'syntax-tool' ? 'active text-app-activetext border-b border-b-teal-400' : 'text-app-inactivetext'}`}
          onClick={() => onTabChange('syntax-tool')}
        >
          <SquirrelIcon size={13} />
        </button>
        <button
          className={`px-4 bg-app-fourth ${activeTab === 'documentation' ? 'active text-app-activetext border-b border-b-teal-400' : 'text-app-inactivetext'}`}
          onClick={() => onTabChange('documentation')}
        >
          <WorkflowIcon size={13} />
        </button>
      </footer>
    </div>
  );
};

export default Sidebar;