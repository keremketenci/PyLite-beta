import React, { useEffect } from "react";
import { componentCount, updateComponentCount } from "@/hooks/DragFunctions";
import useDragger from "@/hooks/useDragger";
import { useComponentStyles } from "./ComponentFunctions";
import styles from "./ui.module.css";
import Customize from "./Customize";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Label: React.FC = () => {
  const { styles: dynamicStyles, handleChange, getStyles } = useComponentStyles();

  useEffect(() => {
    updateComponentCount('Label');
  }, []);

  const uniqueId = "Label" + componentCount.Label;
  const containerId = "dropzone";
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
            <label
              className={styles.Label}
              style={dynamicStyles}
            >
              label
            </label>
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <Customize styles={dynamicStyles} handleChange={handleChange} handleDelete={handleDelete} />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Label;
