
import React from 'react';

interface SubjectTagProps {
  subject: string;
  onRemove: (subject: string) => void;
  disabled?: boolean;
}

export const SubjectTag: React.FC<SubjectTagProps> = ({ subject, onRemove, disabled }) => {
  return (
    <div className="flex items-center bg-slate-700 text-slate-200 text-sm font-medium px-3 py-1 rounded-full animate-fade-in">
      <span>{subject}</span>
      <button
        onClick={() => onRemove(subject)}
        disabled={disabled}
        className="ml-2 text-slate-400 hover:text-white disabled:opacity-50 transition-colors focus:outline-none"
        aria-label={`Remove ${subject}`}
      >
        &#x2715;
      </button>
    </div>
  );
};

// Add keyframes for fade-in animation to index.html if needed, or use Tailwind config
// For simplicity with CDN, we rely on browser defaults or can add a style tag.
// A simple animation can be done with Tailwind's animate classes.
