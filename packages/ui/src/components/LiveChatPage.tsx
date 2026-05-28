'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface Message {
  id: number;
  from: 'agent' | 'user';
  text: string;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    from: 'agent',
    text: "Hi! 👋 I'm Sara from the Newera365 support team. How can I help today?",
    time: '14:32',
  },
];

const QUICK_REPLIES = [
  'Withdrawal times',
  'How to verify ID',
  'Spreads on EUR/USD',
  'Reset MT5 password',
  'Talk to a human',
] as const;

const AGENT_REPLIES: Record<string, string> = {
  'Withdrawal times':
    'Great question! For UK bank withdrawals, we process internally within 2 hours. Funds typically arrive in your account within 1–3 business days, depending on your bank.',
  'How to verify ID':
    'To verify your ID, go to your Client Portal → Documents → Upload ID. We accept a valid passport, national ID, or driving licence. Processing usually takes under 2 hours during business hours.',
  'Spreads on EUR/USD':
    'Our EUR/USD spread on the Raw account starts from 0.0 pip with a $3.50/lot commission. On Standard, spreads start from 1.0 pip with no commission. Both accounts use the same liquidity pool.',
  'Reset MT5 password':
    'To reset your MT5 password, go to Client Portal → My Accounts → the account you want → Reset Trading Password. The new password will be sent to your registered email.',
  'Talk to a human':
    'Connecting you to a senior support agent now. Average wait time is under 2 minutes. You can also reach us at support@newera365.com or via WhatsApp.',
};

function getTime() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function LiveChatPage() {
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(2);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, typing]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { id: idRef.current++, from: 'user', text, time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    const reply =
      AGENT_REPLIES[text] ??
      'Thanks for your message! A member of our team will respond shortly. Average response time is under 2 minutes.';

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
      <div className="dark:bg-background flex flex-shrink-0 items-center justify-between border-b border-[#e5e7eb] bg-white px-5 py-4 dark:border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <Link
            href={`/${locale}/contact`}
            aria-label="Back to contact"
            className="text-foreground mr-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#f4f4f5] transition-colors hover:bg-[#e8e8e8] dark:bg-[#1c1c1c] dark:hover:bg-[#2a2a2a]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
          <div className="bg-accent relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white">
            <span className="font-sans text-[15px] font-semibold">SC</span>
            <span className="dark:border-background absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#22C55E]" />
          </div>

          <div>
            <p className="text-foreground font-sans text-[15px] font-semibold">Sara Chen</p>
            <p className="font-body text-muted text-[12px]">
              <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
              ONLINE · AVG REPLY 90S
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            aria-label="Voice call"
            className="text-foreground flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f4f5] transition-colors hover:bg-[#e8e8e8] dark:bg-[#1c1c1c] dark:hover:bg-[#2a2a2a]"
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
            aria-label="Video call"
            className="text-foreground flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f4f5] transition-colors hover:bg-[#e8e8e8] dark:bg-[#1c1c1c] dark:hover:bg-[#2a2a2a]"
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
      <div ref={chatRef} className="flex-1 overflow-y-auto px-5 py-4">
        {/* Date chip */}
        <div className="mb-4 flex justify-center">
          <span className="font-body rounded-full bg-[#e5e7eb] px-3 py-[3px] text-[10px] text-[#6b7280] dark:bg-[#2a2a2a] dark:text-[#9ca3af]">
            TODAY · {INITIAL_MESSAGES[0].time}
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
                    ? 'rounded-bl-[4px] bg-[#f9f9f9] dark:bg-[#1c1c1c]'
                    : 'rounded-br-[4px] bg-[#111111]'
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
                className="rounded-[16px] rounded-bl-[4px] bg-[#f9f9f9] px-4 py-3 dark:bg-[#1c1c1c]"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
              >
                <p className="font-body text-muted text-[13px]">Sara is typing...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick replies */}
      <div className="dark:bg-background flex-shrink-0 border-t border-[#e5e7eb] bg-white px-5 py-3 dark:border-[#2a2a2a]">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
          {QUICK_REPLIES.map((qr) => (
            <button
              key={qr}
              onClick={() => sendMessage(qr)}
              className="font-body text-foreground hover:border-foreground flex-shrink-0 rounded-full border border-[#e5e7eb] px-3.5 py-2 text-[12px] transition-colors dark:border-[#2a2a2a]"
            >
              {qr}
            </button>
          ))}
        </div>
      </div>

      {/* Message input */}
      <div className="dark:bg-background flex-shrink-0 bg-white px-5 pb-6 pt-3">
        <div className="flex items-center gap-2 rounded-[16px] border border-[#e5e7eb] bg-[#f9f9f9] px-4 py-3 dark:border-[#2a2a2a] dark:bg-[#1c1c1c]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Type a message..."
            className="font-body text-foreground flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#9ca3af] focus:outline-none focus-visible:outline-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="bg-accent flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full disabled:opacity-40"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
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
