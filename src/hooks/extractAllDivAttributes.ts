// src-designer\hooks\extractAllDivAttributes.ts

import { extractDivAttributes, DivAttributes } from './extractDivAttributes';

export function extractAllDivAttributes(container: HTMLElement): DivAttributes[] {
  const divs = container.querySelectorAll('div');
  const uniqueDivs: DivAttributes[] = [];

  Array.from(divs).forEach(div => {
      const attributes = extractDivAttributes(div);
      if (attributes.id !== 'N/A' && !uniqueDivs.some(item => item.id === attributes.id)) {
          uniqueDivs.push(attributes);
      }
  });

  return uniqueDivs;
}
  
