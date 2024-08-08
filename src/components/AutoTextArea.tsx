import { useEffect, useRef } from 'react';

interface Props {
  value?: string;
  placeholder?: string;
  maxLength?: number;
  maxRows?: number;
  border?: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function AutoTextArea({ value, placeholder, maxLength, maxRows = 5, border, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '0';
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = parseInt(window.getComputedStyle(textareaRef.current).lineHeight, 10);
      const maxHeight = lineHeight * (maxRows + 1);
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      return scrollHeight > maxHeight;
    }
  };

  useEffect(() => {
    resize();
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!resize()) onChange(e);
  };

  return (
    <textarea
      className={'w-full ' + (!border && 'border-none')}
      value={value}
      placeholder={placeholder}
      maxLength={maxLength}
      onChange={handleChange}
      ref={textareaRef}
      required
    />
  );
}
