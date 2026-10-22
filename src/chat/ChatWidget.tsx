import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Smile } from "lucide-react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import PixelAvatar from "../components/Avatar";
import type { Player } from "../lib/types";
import "./chat-widget.css";

type Row = { id: number; room_id: string; user_id: string; body: string; created_at: string };
type Msg = { id: number; userId: string; text: string; time: string };

const EMOJI_GROUPS: Record<string, string[]> = {
  "😀": "😀 😃 😄 😁 😆 😅 🤣 😂 🙂 😉 😊 😇 🥰 😍 🤩 😘 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐 🤨 😐 😑 😶 😏 😒 🙄 😬 😌 😔 😪 😴 😷 🤒 🥵 🥶 🥴 😵 🤯 🤠 🥳 😎 🤓 🧐 😕 😟 🙁 😮 😯 😲 😳 🥺 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 💀 🤡 👻 👽 🤖".split(" "),
  "👍": "👍 👎 👊 ✊ 🤛 🤜 👏 🙌 👐 🤲 🤝 🙏 ✌️ 🤞 🤟 🤘 👌 🤌 👈 👉 👆 👇 ☝️ ✋ 🤚 🖐️ 🖖 👋 🤙 💪 🧠 👀".split(" "),
  "❤️": "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💯 💢 💥 💫 💦 💨 🔥 ✨ ⭐ 🌟 ⚡".split(" "),
  "🎮": "🎮 🎲 🧩 🎯 🏆 🥇 🥈 🥉 🎉 🎊 🎈 🔒 🔓 🔑 🗝️ 🕵️ 🔍 💡 🧮 🔢 ⏰ ⌛ 🚀 🎁".split(" "),
};

const fmt = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/** Same tile as the Lovable design, but it shows the avatar the player picked on the main page. */
function Avatar({ who, id }: { who: "me" | "them"; id: number }) {
  return (
    <div
      className={`grid size-8 shrink-0 place-items-center rounded-lg border-2 border-ink text-base ${
        who === "me" ? "bg-sun" : "bg-lilac"
      }`}
      aria-hidden
    >
      <PixelAvatar id={id} size={22} />
    </div>
  );
}

function TypingDots({ tone = "ink" }: { tone?: "ink" | "light" }) {
  return (
    <span className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`animate-typing-dot size-1.5 rounded-full ${tone === "ink" ? "bg-ink/70" : "bg-primary-foreground"}`}
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </span>
  );
}

function TypingBubble({ name, avatar }: { name: string; avatar: number }) {
  return (
    <div role="status" className="animate-msg-in flex items-end gap-2">
      <span className="sr-only">{name} is typing</span>
      <Avatar who="them" id={avatar} />
      <div className="flex flex-col items-start">
        <span className="mb-0.5 px-1 text-xs text-muted-foreground">{name} · typing…</span>
        <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border-2 border-ink bg-bubble-them px-4 py-3">
          <TypingDots />
        </div>
      </div>
    </div>
  );
}

export function ChatWidget({ roomId, uid, me, opp, oppOnline }: { roomId: string; uid: string; me: Player; opp: Player; oppOnline: boolean }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [unread, setUnread] = useState(0);
  const [showEmoji, setShowEmoji] = useState(false);
  const [tab, setTab] = useState("😀");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openRef = useRef(false);
  const seen = useRef(new Set<number>()); // message ids already shown: stops duplicates (history + live + our own send)
  const ready = useRef(false); // false until history has loaded, so old messages don't count as unread
  const sending = useRef(false);
  const typingChannel = useRef<RealtimeChannel | null>(null);
  const typingSentAt = useRef(0);
  const stopTimer = useRef<number>();
  const oppTimer = useRef<number>();

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const ingest = useCallback(
    (row: Row) => {
      if (seen.current.has(row.id)) return;
      seen.current.add(row.id);
      setMsgs((m) => [...m, { id: row.id, userId: row.user_id, text: row.body, time: fmt(row.created_at) }].sort((a, b) => a.id - b.id));
      if (row.user_id !== uid) {
        setTyping(false);
        if (ready.current && (!openRef.current || document.hidden)) setUnread((u) => u + 1);
      }
    },
    [uid],
  );

  const loadHistory = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("room_id", roomId)
      .order("id", { ascending: false })
      .limit(100);
    if (err || !data) return;
    (data as Row[]).reverse().forEach(ingest);
    ready.current = true;
  }, [roomId, ingest]);

  // Live messages. Who may read them is decided by the database (RLS), not by this code.
  useEffect(() => {
    seen.current = new Set();
    ready.current = false;
    setMsgs([]);
    setUnread(0);
    const ch = supabase
      .channel(`chat:${roomId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` }, (p) => ingest(p.new as Row))
      .subscribe((s) => {
        if (s === "SUBSCRIBED") loadHistory();
      });
    const poll = window.setInterval(loadHistory, 5000); // safety net if the connection drops
    return () => {
      window.clearInterval(poll);
      supabase.removeChannel(ch);
    };
  }, [roomId, ingest, loadHistory]);

  // Typing signals travel on a private channel that only room members can join.
  useEffect(() => {
    const ch = supabase
      .channel(`chat-typing:${roomId}`, { config: { private: true } })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload?.uid === uid) return;
        window.clearTimeout(oppTimer.current);
        setTyping(!!payload?.typing);
        if (payload?.typing) oppTimer.current = window.setTimeout(() => setTyping(false), 4000);
      })
      .subscribe();
    typingChannel.current = ch;
    return () => {
      window.clearTimeout(oppTimer.current);
      window.clearTimeout(stopTimer.current);
      if (typingSentAt.current) void ch.send({ type: "broadcast", event: "typing", payload: { uid, typing: false } });
      typingSentAt.current = 0;
      typingChannel.current = null;
      supabase.removeChannel(ch);
    };
  }, [roomId, uid]);

  const announce = (isTyping: boolean) => {
    void typingChannel.current?.send({ type: "broadcast", event: "typing", payload: { uid, typing: isTyping } });
  };
  const stopTyping = () => {
    window.clearTimeout(stopTimer.current);
    if (typingSentAt.current) {
      announce(false);
      typingSentAt.current = 0;
    }
  };
  const noteTyping = (value: string) => {
    if (!value.trim()) return stopTyping();
    if (Date.now() - typingSentAt.current > 2000) {
      announce(true);
      typingSentAt.current = Date.now();
    }
    window.clearTimeout(stopTimer.current);
    stopTimer.current = window.setTimeout(stopTyping, 3000);
  };

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open, typing]);

  useEffect(() => {
    if (!open) return;
    setUnread(0);
    inputRef.current?.focus();
  }, [open]);

  const send = async () => {
    const t = text.trim();
    if (!t || sending.current) return;
    sending.current = true;
    setText("");
    setShowEmoji(false);
    setError(null);
    stopTyping();
    inputRef.current?.focus();
    const { data, error: err } = await supabase.rpc("send_chat", { p_room: roomId, p_body: t });
    sending.current = false;
    if (err) {
      setText((cur) => cur || t); // give the text back so nothing is lost
      setError(err.message);
      return;
    }
    if (data) ingest(data as Row);
  };

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Room chat"
          className="animate-chat-pop fixed right-3 bottom-24 z-50 flex w-[min(360px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border-[3px] border-ink bg-card text-card-foreground shadow-[var(--shadow-panel)] sm:right-6"
          style={{ height: "min(480px, calc(100dvh - 8rem))" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b-[3px] border-ink bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex -space-x-2">
              <Avatar who="me" id={me.avatar} />
              <Avatar who="them" id={opp.avatar} />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="font-display text-lg font-bold">Room Chat</p>
              <p className="flex items-center gap-1.5 text-sm opacity-90">
                {typing ? (
                  <>
                    <TypingDots tone="light" />
                    <span className="truncate">{opp.name} is typing</span>
                  </>
                ) : (
                  <>
                    <span className={`size-2 rounded-full ${oppOnline ? "bg-online" : "bg-muted-foreground"}`} />
                    <span className="truncate">{oppOnline ? `${me.name} & ${opp.name} online` : `${opp.name} offline`}</span>
                  </>
                )}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="grid size-9 place-items-center rounded-xl border-2 border-primary-foreground/40 transition hover:bg-primary-foreground/15 active:scale-95"
            >
              <X className="size-5" strokeWidth={3} />
            </button>
          </div>

          {/* Messages */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-sky/40 px-3 py-4">
            <p role={error ? "alert" : undefined} className={`text-center text-sm ${error ? "text-destructive" : "text-muted-foreground"}`}>
              {error ?? "Room chat"}
            </p>
            {msgs.map((m) => {
              const mine = m.userId === uid;
              return (
                <div key={m.id} className={`animate-msg-in flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                  <Avatar who={mine ? "me" : "them"} id={mine ? me.avatar : opp.avatar} />
                  <div className={`flex max-w-[75%] flex-col ${mine ? "items-end" : "items-start"}`}>
                    <span className="mb-0.5 px-1 text-xs text-muted-foreground">
                      {mine ? "You" : opp.name} · {m.time}
                    </span>
                    <div
                      className={`rounded-2xl border-2 border-ink px-3.5 py-2 text-[17px] leading-snug break-words ${
                        mine
                          ? "rounded-br-md bg-bubble-me text-primary-foreground"
                          : "rounded-bl-md bg-bubble-them text-card-foreground"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                </div>
              );
            })}
            {typing && <TypingBubble name={opp.name} avatar={opp.avatar} />}
          </div>

          {/* Emoji picker */}
          {showEmoji && (
            <div className="animate-msg-in border-t-2 border-ink/15 bg-card">
              <div className="flex gap-1 border-b border-border px-2 pt-2">
                {Object.keys(EMOJI_GROUPS).map((k) => (
                  <button
                    key={k}
                    onClick={() => setTab(k)}
                    className={`emoji rounded-t-lg px-3 py-1 text-xl transition ${tab === k ? "bg-sky" : "opacity-60 hover:opacity-100"}`}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <div className="grid max-h-40 grid-cols-8 gap-0.5 overflow-y-auto p-2">
                {(EMOJI_GROUPS[tab] ?? []).map((e) => (
                  <button
                    key={e}
                    onClick={() => {
                      setText((t) => t + e);
                      noteTyping(text + e);
                    }}
                    className="emoji grid aspect-square place-items-center rounded-lg text-2xl transition hover:bg-sky active:scale-90"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t-[3px] border-ink bg-card p-2.5"
          >
            <button
              type="button"
              onClick={() => setShowEmoji((s) => !s)}
              aria-label="Emoji"
              className={`grid size-11 shrink-0 place-items-center rounded-xl border-2 border-ink transition active:scale-95 ${showEmoji ? "bg-sun" : "bg-sunsoft"}`}
            >
              <Smile className="size-6 text-ink" strokeWidth={2.5} />
            </button>
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                noteTyping(e.target.value);
              }}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Type a message…"
              maxLength={300}
              enterKeyHint="send"
              className="h-11 min-w-0 flex-1 rounded-xl border-2 border-input bg-muted px-3 text-base text-card-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              aria-label="Send"
              className="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-ink bg-primary text-primary-foreground shadow-[var(--shadow-pop)] transition active:translate-y-0.5 active:shadow-none disabled:opacity-50"
            >
              <Send className="size-5" strokeWidth={2.5} />
            </button>
          </form>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed right-4 bottom-5 z-50 grid size-16 place-items-center rounded-full border-[3px] border-ink bg-primary text-primary-foreground shadow-[var(--shadow-fab)] transition-transform hover:scale-105 active:translate-y-1 sm:right-6"
      >
        <span className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}>
          {open ? <X className="size-8" strokeWidth={3} /> : <MessageCircle className="size-8" strokeWidth={2.75} fill="currentColor" fillOpacity={0.15} />}
        </span>
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 grid min-w-6 place-items-center rounded-full border-2 border-ink bg-destructive px-1.5 font-display text-sm font-bold text-destructive-foreground">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}
