import { enableDropping, handleDrop } from "@/hooks/DragFunctions";
import { handleDragStart } from "@/hooks/DragFunctions";
import { DivAttributes } from '@/hooks/extractDivAttributes';
import { extractAllDivAttributes } from '@/hooks/extractAllDivAttributes';
import { invoke } from "@tauri-apps/api";
import "@/App.css";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "./ui/button";

const Designer: React.FC = () => {
  const handleTkExecution = (allAttributes: DivAttributes[]) => {
    invoke('generate_tkinter_code', { allAttributes }).then((message) => console.log(message));
  }

  const handleGenerateButtonClick = () => {
    const container = document.getElementById("dropzone");
    if (container) {
      const allAttributes: DivAttributes[] = extractAllDivAttributes(container);
      console.log(allAttributes);
      handleTkExecution(allAttributes);
    } else {
      console.error("Container with id 'dropzone' not found");
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={70} minSize={70}>
        <main className="flex justify-content-center align-items-center w-full h-full ">
          <div id="dropzone" className="relative m-4 justify-center items-center bg-neutral-300 w-[500px] h-[600px] resize"
            onDragOver={enableDropping}
            onDrop={handleDrop}
          >
          </div>
        </main>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={30} minSize={20}>
        <div className="bg-app-third w-full h-full px-4">
          <div className="space-y-4 pt-4">
            <div id="1" className="textbox" draggable="true" onDragStart={handleDragStart}>TextBox</div>
            <div id="2" className="button" draggable="true" onDragStart={handleDragStart}>Button</div>
            <div id="3" className="label" draggable="true" onDragStart={handleDragStart}>Label</div>
            <div id="4" className="checkBox" draggable="true" onDragStart={handleDragStart}>CheckBox</div>
            <div id="5" className="radioButton" draggable="true" onDragStart={handleDragStart}>RadioButton</div>
          </div>

          <Button className="mt-8 h-10 w-full rounded-lg" onClick={handleGenerateButtonClick}>
            GENERATE TK CODE
          </Button>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default Designer;