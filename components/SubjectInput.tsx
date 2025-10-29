
import React, { useState } from 'react';

interface SubjectInputProps {
  onAddSubject: (subject: string) => void;
  disabled?: boolean;
}

export const SubjectInput: React.FC<SubjectInputProps> = ({ onAddSubject, disabled }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddSubject(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="e.g., summer nights, road trips..."
        disabled={disabled}
        className="flex-grow bg-slate-700 border-2 border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !inputValue.trim()}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-5 rounded-lg transition-colors shadow-md"
      >
        Add
      </button>
    </form>
  );
};
