'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'accent' | 'dark' | 'ghost' | 'ghost-white';
type ButtonSize = 'md' | 'sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  accent: 'bg-accent hover:bg-accent-hover text-white border-transparent',
  dark: 'bg-foreground hover:bg-foreground/80 text-white border-transparent',
  ghost: 'bg-transparent hover:bg-foreground/5 text-foreground border-foreground',
  'ghost-white': 'bg-transparent hover:bg-white/10 text-white border-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'px-[22px] py-4 text-[15px] font-medium tracking-[-0.075px]',
  sm: 'px-4 py-[10px] text-[13px] font-medium',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'accent', size = 'md', fullWidth = true, className = '', children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        {...props}
        className={[
          'font-body inline-flex items-center justify-center rounded-full border transition-colors duration-150',
          'focus-visible:ring-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant };
