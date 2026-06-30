import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface TypewriterTextProps {
  words: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseMs?: number;
}

/**
 * Cycles through `words`, typing each one in and out character-by-character
 * with a blinking caret. Honors reduced-motion by showing the first word
 * statically (no animation, caret hidden).
 */
export function TypewriterText({
  words,
  className,
  typingSpeed = 95,
  deletingSpeed = 45,
  pauseMs = 1500,
}: TypewriterTextProps): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const current = words[wordIndex % words.length];
    const atFullWord = !deleting && text === current;
    const atEmpty = deleting && text === '';

    let delay = deleting ? deletingSpeed : typingSpeed;
    if (atFullWord) delay = pauseMs;
    if (atEmpty) delay = 300;

    const timer = setTimeout(() => {
      if (atFullWord) {
        setDeleting(true);
      } else if (atEmpty) {
        setDeleting(false);
        setWordIndex((i) => (i + 1) % words.length);
      } else {
        setText(
          deleting
            ? current.slice(0, text.length - 1)
            : current.slice(0, text.length + 1),
        );
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, deleting, wordIndex, words, prefersReducedMotion, typingSpeed, deletingSpeed, pauseMs]);

  if (prefersReducedMotion) {
    return <span className={className}>{words[0]}</span>;
  }

  return (
    <span className={className}>
      {text}
      <span
        aria-hidden="true"
        className="ml-1 inline-block w-[3px] translate-y-[0.08em] rounded-[1px] bg-lsl-navy align-baseline animate-blink"
        style={{ height: '0.85em' }}
      />
    </span>
  );
}
