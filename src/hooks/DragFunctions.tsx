import { createRoot } from "react-dom/client";
import { TextBox, Button, Label, CheckBox, RadioButton } from "@/components/designer/ui/index";
import React, { DragEventHandler, ReactElement } from 'react';

export let componentCount: { [key: string]: number } = {
    TextBox: 1,
    Button: 1,
    Label: 1,
    CheckBox: 1,
    RadioButton: 1,
  };
  
  export const updateComponentCount = (id: keyof typeof componentCount) => {
    componentCount[id]++;
    return componentCount;
  };

export const enableDropping = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
}

export const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('id', event.currentTarget.id);
    event.dataTransfer.setData('className', event.currentTarget.className);
}

const components: { [key: string]: ReactElement } = {
    '1': <TextBox />,
    '2': <Button />,
    '3': <Label />,
    '4': <CheckBox />,
    '5': <RadioButton />,
};

const renderComponent = (id: string, event: React.DragEvent<HTMLDivElement>) => {
    const newDiv = document.createElement('div');
    const component = components[id];

    // const offsetX = event.clientX;
    // const offsetY = event.clientY;

    // // Get the drop zone's bounding rectangle to adjust for its position on the page
    // const dropZoneRect = event.currentTarget.getBoundingClientRect();

    // // Calculate the position of the new element relative to the drop zone
    // const left = offsetX - dropZoneRect.left;
    // const top = offsetY - dropZoneRect.top;

    // newDiv.style.position = 'absolute';
    // newDiv.style.left = `${left}px`;
    // newDiv.style.top = `${top}px`;

    if (component) {
        const root = createRoot(newDiv);
        root.render(component);
        if (event.currentTarget instanceof HTMLElement) {
            event.currentTarget.appendChild(newDiv);
        } else {
            console.error("event.currentTarget is not an HTMLElement");
        }
    } else {
        console.error("Invalid component ID:", id);
    }
};

export const handleDrop: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    const id = event.dataTransfer.getData('id');
  
    if (!id) {
      console.error("No ID found in dataTransfer");
      return;
    }
  
    if (event.currentTarget) {
      renderComponent(id, event);
      // Update the component count
      updateComponentCount(id as keyof typeof componentCount);
    } else {
      console.error("event.currentTarget is null");
    }
  };
