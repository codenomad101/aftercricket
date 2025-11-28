'use client';

import { useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your article content here...',
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 flex justify-between items-center border-b border-gray-300">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`px-3 py-1 text-sm font-medium rounded ${
              !isPreview
                ? 'bg-light-blue text-dark-blue'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`px-3 py-1 text-sm font-medium rounded ${
              isPreview
                ? 'bg-light-blue text-dark-blue'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Preview
          </button>
        </div>
        <span className="text-xs text-gray-500">
          Markdown supported
        </span>
      </div>
      {isPreview ? (
        <div className="p-4 min-h-[400px] bg-white prose max-w-none">
          <div className="whitespace-pre-wrap">{value}</div>
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-4 min-h-[400px] resize-y focus:outline-none focus:ring-2 focus:ring-light-blue"
        />
      )}
    </div>
  );
}



