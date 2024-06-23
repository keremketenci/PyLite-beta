import React, { useEffect } from "react";
import { componentCount, updateComponentCount } from "@/hooks/DragFunctions";
import useDragger from "@/hooks/useDragger";
import { useComponentStyles } from "./ComponentFunctions";
import styles from "./ui.module.css";
import Customize from "./Customize";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Button: React.FC = () => {
  const { styles: dynamicStyles, handleChange, getStyles } = useComponentStyles();

  useEffect(() => {
    updateComponentCount('Button');
  }, []);

  const uniqueId = "Button" + componentCount.Button;
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
            <button 
              className={styles.Button}
              style={dynamicStyles}
            >
              button
            </button>
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <Customize styles={dynamicStyles} handleChange={handleChange} handleDelete={handleDelete} />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Button;
