import React, { useState, useEffect } from "react";
import { componentCount, updateComponentCount } from "@/hooks/DragFunctions";
import useDragger from "@/hooks/useDragger";
import { useComponentStyles } from "./ComponentFunctions";
import styles from "./ui.module.css";
import Customize from "./Customize";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const TextBox: React.FC = () => {
  const { styles: dynamicStyles, handleChange, getStyles } = useComponentStyles();
  
  // Ensure unique ID for each TextBox component
  useEffect(() => {
    updateComponentCount('TextBox');
  }, []);

  const uniqueId = "TextBox" + componentCount.TextBox;
  const containerId = "dropzone";
  const [text, setText] = useState("");

  // Use the unique ID for the dragger hook
  useDragger(uniqueId, containerId, getStyles);

  const handleDelete = () => {
    const component = document.getElementById(uniqueId);
    if (component) {
      component.remove();
      // Ebeveyn bileşeni al
      const parentComponent = document.getElementById(uniqueId);
      // Ebeveyn bileşenin altındaki tüm divleri bul ve kaldır
      if (parentComponent) {
        const childDivs = parentComponent.querySelectorAll('div');
        childDivs.forEach(div => {
          div.remove();
        });
      }
    }
  };

  return (
    <div id={uniqueId} className={styles.ComponentContainer}>
      <Popover>
        <PopoverTrigger asChild>
          <div className="PopoverTrigger">
            <input
              className={styles.TextBox}
              style={dynamicStyles}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text here"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <Customize styles={dynamicStyles} handleChange={handleChange} handleDelete={handleDelete} />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TextBox;
