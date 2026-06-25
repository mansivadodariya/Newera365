'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

interface Message {
  id: number;
  from: 'agent' | 'user';
  text: string;
  time: string;
}

function getTime() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function LiveChatPage() {
  const locale = useLocale();
  const t = useTranslations('liveChat');
  const quickReplies = [
    { key: 'withdrawal', label: t('quickReply1'), reply: t('replyWithdrawal') },
    { key: 'verify', label: t('quickReply2'), reply: t('replyVerify') },
    { key: 'spreads', label: t('quickReply3'), reply: t('replySpreads') },
    { key: 'mt5', label: t('quickReply4'), reply: t('replyMT5') },
    { key: 'human', label: t('talkHuman'), reply: t('replyHuman') },
  ];
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 1, from: 'agent' as const, text: t('greeting'), time: '14:32' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(2);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, typing]);

  function sendMessage(displayText: string, agentReply?: string) {
    if (!displayText.trim()) return;
    const userMsg: Message = {
      id: idRef.current++,
      from: 'user',
      text: displayText,
      time: getTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    const reply = agentReply ?? t('replyDefault');

    setTimeout(() => {
      setTyping(false);
      const agentMsg: Message = {
        id: idRef.current++,
        from: 'agent',
        text: reply,
        time: getTime(),
      };
      setMessages((prev) => [...prev, agentMsg]);
    }, 1200);
  }

  return (
    <div
      className="dark:bg-background flex flex-col bg-white"
      style={{ height: 'calc(100dvh - 72px)' }}
    >
      {/* Agent header */}
      <div className="border-border bg-surface flex flex-shrink-0 items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <Link
            href={`/${locale}/contact`}
            aria-label={t('backBtn')}
            className="text-foreground dark:bg-surface dark:hover:bg-surface me-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#f4f4f5] transition-colors hover:bg-[#e8e8e8]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="rtl:-scale-x-100"
            >
              <path
                d="M10 4L6 8l4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          {/* Avatar */}
          <div className="bg-accent relative flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full text-white">
            <span className="font-sans text-[15px] font-semibold">SC</span>
            <span className="dark:border-background absolute bottom-0 end-0 h-3 w-3 rounded-full border-2 border-white bg-[#22C55E]" />
          </div>
          <div>
            <p className="text-foreground font-sans text-[15px] font-semibold">{t('agentName')}</p>
            <p className="font-body text-muted text-[12px]">
              <span className="me-1 inline-block h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
              {t('statusLabel')}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            aria-label={t('voiceLabel')}
            className="text-foreground dark:bg-surface dark:hover:bg-surface flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f4f5] transition-colors hover:bg-[#e8e8e8]"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 2h3l1.5 4-2 1.5a11 11 0 004 4L13 9.5l4 1.5v3c0 2.5-5 4-10-1S2.5 4.5 5 2z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            aria-label={t('videoLabel')}
            className="text-foreground dark:bg-surface dark:hover:bg-surface flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f4f5] transition-colors hover:bg-[#e8e8e8]"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <rect
                x="2"
                y="5"
                width="11"
                height="10"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M13 8.5l5-3v9l-5-3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat area — scrollable, fills available height */}
      <div ref={chatRef} className="flex-1 overflow-y-auto px-5 py-4 xl:px-6">
        <div className="mx-auto">
          {/* Date chip */}
          <div className="mb-4 flex justify-center">
            <span className="font-body rounded-full bg-[#e5e7eb] px-3 py-[3px] text-[10px] text-[#6b7280] dark:bg-[#2a2a2a] dark:text-[#9ca3af]">
              {t('todayLabel')} · {messages[0]?.time}
            </span>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {msg.from === 'agent' && (
                  <div className="bg-accent flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-white">
                    <span className="font-sans text-[10px] font-bold">SC</span>
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-[16px] px-4 py-3 ${
                    msg.from === 'agent'
                      ? 'rounded-es-[4px] bg-[#f9f9f9] dark:bg-[#1c1c1c]'
                      : 'rounded-ee-[4px] bg-[#111111]'
                  }`}
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
                >
                  <p
                    className={`font-body text-[13px] leading-[1.55] ${msg.from === 'user' ? 'text-white' : 'text-foreground'}`}
                  >
                    {msg.text}
                  </p>
                  <p
                    className={`font-body mt-1 text-[10px] ${msg.from === 'user' ? 'text-white/50' : 'text-muted'}`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex items-end gap-2">
                <div className="bg-accent flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-white">
                  <span className="font-sans text-[10px] font-bold">SC</span>
                </div>
                <div
                  className="rounded-[16px] rounded-es-[4px] bg-[#f9f9f9] px-4 py-3 dark:bg-[#1c1c1c]"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
                >
                  <p className="font-body text-muted text-[13px]">{t('agentTyping')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick replies */}
      <div className="dark:bg-background dark:border-border flex-shrink-0 border-t border-[#e5e7eb] bg-white px-5 py-3">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
          {quickReplies.map((qr) => (
            <button
              key={qr.key}
              onClick={() => sendMessage(qr.label, qr.reply)}
              className="font-body text-foreground hover:border-foreground dark:border-border flex-shrink-0 rounded-full border border-[#e5e7eb] px-3.5 py-2 text-[12px] transition-colors"
            >
              {qr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message input */}
      <div className="dark:bg-background flex-shrink-0 bg-white px-5 pb-6 pt-3">
        <div className="bg-surface flex items-center gap-2 rounded-[999px] px-4 py-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder={t('inputPlaceholder')}
            className="font-body text-foreground placeholder:text-muted flex-1 bg-transparent text-[14px] outline-none focus:outline-none focus-visible:outline-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="bg-accent flex flex-shrink-0 items-center justify-center rounded-[99px] px-[12px] py-[10px] disabled:opacity-40"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              className="rtl:-scale-x-100"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
