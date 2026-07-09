import { type ReactNode, type HTMLAttributes } from 'react';

interface SectionKickerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}
// [&>span:last-child]:text-white/60 [&>span:first-child]:bg-white/60
function SectionKicker({ children, className = '', ...props }: SectionKickerProps) {
  return (
    <div {...props} className={['flex items-center gap-2', className].filter(Boolean).join(' ')}>
      <span className="block h-px w-[22px] flex-shrink-0 bg-[#111111] dark:bg-[#FFFFFF]" />
      <span className="text-eyebrow font-mono font-medium uppercase">{children}</span>
    </div>
  );
}

export { SectionKicker };
