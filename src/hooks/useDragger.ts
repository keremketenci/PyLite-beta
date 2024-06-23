import { useEffect, useRef } from "react";

function useDragger(id: string, containerId: string, getStyles: () => any): void {
  const isClicked = useRef<boolean>(false);
  const coords = useRef<{
    startX: number,
    startY: number,
    lastX: number,
    lastY: number
  }>({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0
  });

  useEffect(() => {
    const target = document.getElementById(id);
    const container = document.getElementById(containerId);
    if (!target || !container) throw new Error("Element with given id doesn't exist");

    const setInitialPositionIfNeeded = () => {
      const computedStyle = window.getComputedStyle(target);
      if (computedStyle.left === 'auto' || computedStyle.left === '0px') {
        target.style.left = `${target.offsetLeft}px`;
      }
      if (computedStyle.top === 'auto' || computedStyle.top === '0px') {
        target.style.top = `${target.offsetTop}px`;
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      console.log('Mouse down');
      isClicked.current = true;
      coords.current.startX = e.clientX;
      coords.current.startY = e.clientY;
      
      // Ensure initial position is set
      setInitialPositionIfNeeded();

      // Update coords with initial position
      const computedStyle = window.getComputedStyle(target);
      coords.current.lastX = parseInt(computedStyle.left, 10);
      coords.current.lastY = parseInt(computedStyle.top, 10);
    };

    const onMouseUp = () => {
      if (isClicked.current) {
        console.log('Mouse up');
        isClicked.current = false;

        const computedStyle = window.getComputedStyle(target);
        coords.current.lastX = parseInt(computedStyle.left, 10);
        coords.current.lastY = parseInt(computedStyle.top, 10);

        // const attributes: DivAttributes = extractDivAttributes(target);
        // console.log(target);
        // console.log(attributes);

        // const allAttributes: DivAttributes[] = extractAllDivAttributes(container);
        // console.log(allAttributes);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isClicked.current) return;

      const nextX = e.clientX - coords.current.startX + coords.current.lastX;
      const nextY = e.clientY - coords.current.startY + coords.current.lastY;

      const Styles = getStyles();

      // console.log(target)

      let defaultWidth;
      let defaultHeight;
      switch (true) {
        case target.id.startsWith("TextBox"):
          defaultWidth = 100;
          defaultHeight = 24;
          break;
        case target.id.startsWith("Button"):
          defaultWidth = 100;
          defaultHeight = 24;
          break;
        case target.id.startsWith("Label"):
        defaultWidth = 30;
        defaultHeight = 24;
        break;
        case target.id.startsWith("CheckBox"):
          defaultWidth = 24;
          defaultHeight = 24;
          break;
          case target.id.startsWith("RadioButton"):
          defaultWidth = 24;
          defaultHeight = 24;
          break;
      }

      const targetWidth = parseInt(Styles.width, 10) || defaultWidth || 100;
      const targetHeight = parseInt(Styles.height, 10) || defaultHeight || defaultWidth || 30;

      // console.log(targetWidth, targetHeight);

      // Calculate boundaries
      const minX = 0;
      const minY = 0;
      const maxX = container.clientWidth - targetWidth;
      const maxY = container.clientHeight - targetHeight;

      // Ensure the element stays within the boundaries
      const boundedX = Math.max(minX, Math.min(nextX, maxX));
      const boundedY = Math.max(minY, Math.min(nextY, maxY));

      target.style.top = `${boundedY}px`;
      target.style.left = `${boundedX}px`;
    };

    target.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseUp);

    return () => {
      target.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseUp);
    };
  }, [id, containerId, getStyles]);
}

export default useDragger;
