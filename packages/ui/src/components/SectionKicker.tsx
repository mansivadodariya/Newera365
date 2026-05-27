import { type ReactNode, type HTMLAttributes } from 'react';

interface SectionKickerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}
// [&>span:last-child]:text-white/60 [&>span:first-child]:bg-white/60
function SectionKicker({ children, className = '', ...props }: SectionKickerProps) {
  return (
    <div {...props} className={['flex items-center gap-2', className].filter(Boolean).join(' ')}>
      <span className="block h-px w-[18px] flex-shrink-0 bg-[#111111] dark:bg-[#FFFFFF]" />
      <span className="font-mono text-[10px] font-medium uppercase leading-[100%] tracking-[0.18em]">
        {children}
      </span>
    </div>
  );
}

export { SectionKicker };
