import type { ReactNode } from "react";

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * The overlay itself scrolls (not a fixed-height box centered inside it), so a tall
 * form plus an open mobile keyboard can still be scrolled to reach the last field or
 * the submit button — a nested "centered box with its own max-height" doesn't hold up
 * once the visual viewport shrinks under a keyboard, especially on iOS Safari.
 */
export function Modal({ title, onClose, children }: Props) {
  return (
    <div
      className="fixed inset-0 z-20 overflow-y-auto bg-black/30 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-auto my-8 w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}
