import React, { useEffect } from "react";
import { componentCount, updateComponentCount } from "@/hooks/DragFunctions";
import useDragger from "@/hooks/useDragger";
import { useComponentStyles } from "./ComponentFunctions";
import styles from "./ui.module.css";
import Customize from "./Customize";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const CheckBox: React.FC = () => {
    const { styles: dynamicStyles, handleChange2, getStyles } = useComponentStyles();

    useEffect(() => {
        updateComponentCount('CheckBox');
    }, []);

    const uniqueId = "CheckBox" + componentCount.CheckBox;
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
                        <div
                            id={uniqueId}
                            className={styles.CheckBox}
                            style={dynamicStyles}
                        >
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent>
                    <Customize styles={dynamicStyles} handleChange={handleChange2} handleDelete={handleDelete} />
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default CheckBox;
