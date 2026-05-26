import { type ReactNode, type HTMLAttributes } from 'react';

interface SectionKickerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function SectionKicker({ children, className = '', ...props }: SectionKickerProps) {
  return (
    <div {...props} className={['flex items-center gap-2', className].filter(Boolean).join(' ')}>
      <span className="bg-muted block h-px w-[18px] flex-shrink-0" />
      <span className="font-body text-[10px] font-medium uppercase tracking-[0.14em]">
        {children}
      </span>
    </div>
  );
}

export { SectionKicker };
