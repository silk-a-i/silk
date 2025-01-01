
export function renderFileStructure(context) {
  const structure = {};

  context.forEach(file => {
      const parts = file.split('/');
      let current = structure;

      parts.forEach((part, index) => {
          if (!current[part]) {
              if (index === parts.length - 1) {
                  current[part] = null;
              } else {
                  current[part] = {};
              }
          }
          current = current[part];
      });
  });

  function renderStructure(structure, indent = '') {
      let result = '';
      for (const key in structure) {
          result += `${indent}├── ${key}\n`;
          if (structure[key]) {
              result += renderStructure(structure[key], indent + '│   ');
          }
      }
      return result;
  }

  return renderStructure(structure).replace(/├── ([^│]*)\n│/g, '├── $1\n');
}
