'use client';

import type { ReactNode } from 'react';
import { safeUrl } from '../lib/safeUrl';

export interface SlateNode {
  type?: string;
  children?: SlateNode[];
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  url?: string;
  newTab?: boolean;
  value?: { url?: string; alt?: string; width?: number; height?: number };
  relationTo?: string;
}

/** Estimate reading time from a Slate rich-text body (≈200 wpm). Null when empty. */
export function readingMinutes(body?: SlateNode[] | null): number | null {
  if (!Array.isArray(body) || body.length === 0) return null;
  let words = 0;
  const walk = (node: SlateNode) => {
    if (typeof node.text === 'string') {
      words += node.text.trim().split(/\s+/).filter(Boolean).length;
    }
    if (Array.isArray(node.children)) node.children.forEach(walk);
  };
  body.forEach(walk);
  return words > 0 ? Math.max(1, Math.round(words / 200)) : null;
}

function renderLeaf(node: SlateNode, i: number): ReactNode {
  let el: ReactNode = node.text ?? '';
  if (!node.text) return el;
  if (node.bold) el = <strong key={i}>{el}</strong>;
  if (node.italic) el = <em key={i}>{el}</em>;
  if (node.underline) el = <u key={i}>{el}</u>;
  if (node.strikethrough) el = <s key={i}>{el}</s>;
  if (node.code)
    el = (
      <code key={i} className="bg-surface-elevated rounded px-1.5 py-0.5 font-mono text-[13px]">
        {el}
      </code>
    );
  return el;
}

function renderNode(node: SlateNode, i: number): ReactNode {
  if (node.text !== undefined) return renderLeaf(node, i);

  const children = node.children?.map((child, j) => renderNode(child, j));

  switch (node.type) {
    case 'h1':
      return (
        <h1
          key={i}
          className="text-foreground mb-4 mt-8 font-sans text-[26px] font-semibold leading-[1.2] first:mt-0"
        >
          {children}
        </h1>
      );
    case 'h2': {
      const h2id =
        extractText(node)
          .toLowerCase()
          .replace(/[^\p{L}\p{N}]+/gu, '-')
          .replace(/^-+|-+$/g, '') || undefined;
      return (
        <h2
          key={i}
          id={h2id}
          className="text-foreground mb-3 mt-7 scroll-mt-28 font-sans text-[22px] font-semibold leading-[1.25] first:mt-0"
        >
          {children}
        </h2>
      );
    }
    case 'h3': {
      const h3id =
        extractText(node)
          .toLowerCase()
          .replace(/[^\p{L}\p{N}]+/gu, '-')
          .replace(/^-+|-+$/g, '') || undefined;
      return (
        <h3
          key={i}
          id={h3id}
          className="text-foreground mb-3 mt-6 scroll-mt-28 font-sans text-[18px] font-semibold leading-[1.3] first:mt-0"
        >
          {children}
        </h3>
      );
    }
    case 'h4':
      return (
        <h4
          key={i}
          className="text-foreground mb-2 mt-5 font-sans text-[16px] font-semibold leading-[1.35] first:mt-0"
        >
          {children}
        </h4>
      );
    case 'h5':
      return (
        <h5
          key={i}
          className="text-foreground mb-2 mt-4 font-sans text-[15px] font-semibold leading-[1.4] first:mt-0"
        >
          {children}
        </h5>
      );
    case 'h6':
      return (
        <h6
          key={i}
          className="text-foreground mb-2 mt-4 font-sans text-[14px] font-semibold leading-[1.4] first:mt-0"
        >
          {children}
        </h6>
      );
    case 'ul':
      return (
        <ul
          key={i}
          className="font-body text-foreground mb-4 list-disc space-y-1 hyphens-auto ps-6 text-justify text-[15px] leading-[1.7]"
        >
          {children}
        </ul>
      );
    case 'ol':
      return (
        <ol
          key={i}
          className="font-body text-foreground mb-4 list-decimal space-y-1 hyphens-auto ps-6 text-justify text-[15px] leading-[1.7]"
        >
          {children}
        </ol>
      );
    case 'li':
      return <li key={i}>{children}</li>;
    case 'link':
      return (
        <a
          key={i}
          href={safeUrl(node.url)}
          {...(node.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="text-accent decoration-accent/30 hover:decoration-accent underline underline-offset-2 transition-colors"
        >
          {children}
        </a>
      );
    case 'blockquote':
      return (
        <blockquote key={i} className="border-accent/40 text-muted my-5 border-s-[3px] ps-4 italic">
          {children}
        </blockquote>
      );
    case 'upload': {
      const media = node.value;
      if (!media?.url) return null;
      return (
        <figure key={i} className="my-6">
          <img
            src={safeUrl(media.url)}
            alt={media.alt ?? ''}
            width={media.width ?? undefined}
            height={media.height ?? undefined}
            className="rounded-card w-full"
            loading="lazy"
          />
        </figure>
      );
    }
    default:
      return (
        <p
          key={i}
          className="font-body text-foreground mb-4 hyphens-auto text-justify text-[15px] leading-[1.7]"
        >
          {children}
        </p>
      );
  }
}

interface RichTextProps {
  content: SlateNode[] | null | undefined;
  className?: string;
}

export function RichText({ content, className }: RichTextProps) {
  if (!content || content.length === 0) return null;
  return <div className={className}>{content.map((node, i) => renderNode(node, i))}</div>;
}

export function extractHeadings(
  content: SlateNode[] | null | undefined,
): { id: string; text: string; level: number }[] {
  if (!content) return [];
  const headings: { id: string; text: string; level: number }[] = [];
  for (const node of content) {
    const match = node.type?.match(/^h(\d)$/);
    if (match) {
      const text = extractText(node);
      const id = text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-+|-+$/g, '');
      headings.push({ id, text, level: Number(match[1]) });
    }
  }
  return headings;
}

function extractText(node: SlateNode): string {
  if (node.text !== undefined) return node.text;
  return node.children?.map(extractText).join('') ?? '';
}
