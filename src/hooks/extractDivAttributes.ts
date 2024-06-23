export type DivAttributes = {
  id: string;
  top: string;
  left: string;
  width: string;
  height: string;
  backgroundColor: string;
  color: string;
  type: string;
};

export function extractDivAttributes(target: HTMLElement): DivAttributes {
  const inputElement = target.querySelector('input');
  const buttonElement = target.querySelector('button');
  const labelElement = target.querySelector('label');

  const divElements = target.querySelectorAll('div');
  const CheckBoxElement = divElements[divElements.length - 1];
  const RadioButtonElement = divElements[divElements.length - 1];

  const element = inputElement || buttonElement || labelElement || CheckBoxElement || RadioButtonElement || target;

  if (!element) {
    throw new Error("No element found within the target");
  }
  const top = target.style.top || '0px';
  const left = target.style.left || '0px';

  let width = element.style.width || 'N/A';
  let height = element.style.height || 'N/A';

  const backgroundColor = element.style.backgroundColor || 'N/A';
  const color = element.style.color || 'N/A';

  let type = element.getAttribute('type') || element.nodeName;
  type = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

  if (type === 'Div') {
    const x = target.id;
    switch (true) {
      case element.id.startsWith(x):
        type = 'Checkbutton';
        break;
      case element.id.startsWith(x):
        type = 'Radiobutton';
        break;
    }
  }

  type = (type === 'Text') ? 'Entry' : type;


  if (width === 'N/A') {
    switch (type) {
      case 'Entry':
        width = '100px';
        break;
      case 'Button':
        width = '100px';
        break;
      case 'Label':
        width = '30px';
        break;
      case 'Checkbutton':
        width = '24px';
        break;
      case 'Radiobutton':
        width = '24px';
        break;
      default:
        width = element.style.width || 'N/A';
    }
  }

  if (height === 'N/A') {
    switch (type) {
      case 'Entry':
        height = '24px';
        break;
      case 'Button':
        height = '24px';
        break;
      case 'Label':
        height = '24px';
        break;
      case 'Checkbutton':
        height = '24px';
        break;
      case 'Radiobutton':
        height = '24px';
        break;
      default:
        height = element.style.height || 'N/A';
    }
  }

  return {
    id: target.id || 'N/A',
    top,
    left,
    width,
    height,
    backgroundColor,
    color,
    type,
  };
}
