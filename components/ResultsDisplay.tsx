
import React, { useState } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

interface ResultsDisplayProps {
  originalTitle: string;
  titles: string[];
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ originalTitle, titles }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700/60 p-4 sm:p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-indigo-300">
        Variações para: <span className="font-bold text-gray-200">"{originalTitle}"</span>
      </h3>
      <ul className="space-y-3">
        {titles.map((title, index) => (
          <li
            key={index}
            className="group flex items-center justify-between bg-gray-900/50 border border-gray-700 p-4 rounded-lg hover:bg-gray-800/80 transition-colors duration-200"
          >
            <p className="text-gray-300 flex-grow pr-4">{title}</p>
            <button
              onClick={() => handleCopy(title, index)}
              className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
              aria-label="Copiar título"
            >
              {copiedIndex === index ? (
                <CheckIcon className="w-5 h-5 text-green-400" />
              ) : (
                <ClipboardIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-200" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
