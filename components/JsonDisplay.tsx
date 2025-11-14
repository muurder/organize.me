
import React from 'react';

interface JsonDisplayProps {
  data: object | null;
}

const JsonDisplay: React.FC<JsonDisplayProps> = ({ data }) => {
  const syntaxHighlight = (jsonString: string) => {
    jsonString = jsonString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return jsonString.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'text-green-400'; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-cyan-400'; // key
        } else {
          cls = 'text-yellow-400'; // string
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-purple-400'; // boolean
      } else if (/null/.test(match)) {
        cls = 'text-gray-500'; // null
      }
      return `<span class="${cls}">${match}</span>`;
    });
  };

  const formattedJson = JSON.stringify(data, null, 2);

  return (
    <pre className="bg-gray-900/50 p-3 rounded-md text-sm overflow-x-auto">
      <code dangerouslySetInnerHTML={{ __html: syntaxHighlight(formattedJson) }} />
    </pre>
  );
};

export default JsonDisplay;
