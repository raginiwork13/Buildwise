import { API_BASE_URL } from '../../config';
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, CheckCheck, FolderKanban, HardHat, Truck, User, Lock, Crown } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { ChangePlanModal } from '../subscription/ChangePlanModal';

export interface ChatTarget {
  recipientId: string;
  recipientName: string;
  recipientRole: string;
  projectId?: string;
  projectTitle?: string;
}

interface MessageItem {
  id: string;
  conversation_id: string;
  project_id?: string;
  project_title?: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  recipient_id: string;
  recipient_name: string;
  recipient_role: string;
  message_text: string;
  is_read?: boolean;
  created_at?: string;
}

interface OlxChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTarget?: ChatTarget | null;
}

export const OlxChatDrawer: React.FC<OlxChatDrawerProps> = ({ isOpen, onClose, initialTarget }) => {
  const { currentUser, accounts } = useUser();
  const currentUserName = currentUser?.fullName || 'Rahul Naik';
  const currentUserRole = currentUser?.role || 'customer';

  // Active chat state
  const [activeTarget, setActiveTarget] = useState<ChatTarget | null>(null);
  const [conversations, setConversations] = useState<ChatTarget[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userTier = (currentUser?.subscriptionTier || 'free').toLowerCase();
  const canChat = userTier === 'pro' || userTier === 'premium';

  // Normalize conversation ID using sorted user names so both sender & receiver share the same thread
  const generateConvId = (name1: string, name2: string) => {
    return [name1.toLowerCase().trim(), name2.toLowerCase().trim()].sort().join('__');
  };

  // Build conversations list based on current user and other registered accounts
  useEffect(() => {
    const list: ChatTarget[] = [];

    // Filter accounts to show other participants (not the logged in user)
    const others = accounts.filter(a => a.email.toLowerCase() !== (currentUser?.email || '').toLowerCase());
    
    others.forEach(o => {
      list.push({
        recipientId: o.id,
        recipientName: o.fullName,
        recipientRole: o.role,
        projectTitle: o.role === 'customer' 
          ? `${o.defaultLocation || 'Goa'} Project Consultation` 
          : o.role === 'professional' 
            ? `${o.companyName || 'Construction & Architecture Services'}` 
            : `${o.businessName || 'Materials Supply'}`
      });
    });

    // If an initialTarget was passed (e.g. from clicking "Chat" on a project card)
    if (initialTarget && initialTarget.recipientName !== currentUserName) {
      const existsIndex = list.findIndex(c => c.recipientName.toLowerCase() === initialTarget.recipientName.toLowerCase());
      if (existsIndex >= 0) {
        list[existsIndex] = { ...list[existsIndex], ...initialTarget };
      } else {
        list.unshift(initialTarget);
      }
    }

    setConversations(list);

    // Set active target if none chosen yet or if initialTarget specified
    if (initialTarget && initialTarget.recipientName !== currentUserName) {
      setActiveTarget(initialTarget);
    } else if (!activeTarget && list.length > 0) {
      setActiveTarget(list[0]);
    } else if (activeTarget && activeTarget.recipientName === currentUserName && list.length > 0) {
      setActiveTarget(list[0]);
    }
  }, [currentUser, accounts, initialTarget]);

  // When initialTarget is explicitly updated by parent
  useEffect(() => {
    if (initialTarget && initialTarget.recipientName !== currentUserName) {
      setActiveTarget(initialTarget);
    }
  }, [initialTarget, currentUserName]);

  // Fetch messages from backend/Supabase for active conversation
  const fetchMessages = async (silent = false) => {
    if (!activeTarget) return;
    if (!silent) setLoading(true);

    const convId = generateConvId(currentUserName, activeTarget.recipientName);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/chat/messages?conversation_id=${encodeURIComponent(convId)}`);
      if (res.ok) {
        const data: MessageItem[] = await res.json();
        setMessages(data);
      }
    } catch {
      // Local fallback: read from localStorage if backend offline
      const localKey = `bw_chat_${convId}`;
      const saved = localStorage.getItem(localKey);
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Poll for new messages every 3 seconds while chat drawer is open
  useEffect(() => {
    if (!isOpen || !activeTarget) return;

    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, activeTarget, currentUserName]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeTarget) return;

    const convId = generateConvId(currentUserName, activeTarget.recipientName);
    const msgPayload = {
      conversation_id: convId,
      project_id: activeTarget.projectId,
      project_title: activeTarget.projectTitle,
      sender_id: currentUser?.id || 'current-user',
      sender_name: currentUserName,
      sender_role: currentUserRole,
      recipient_id: activeTarget.recipientId,
      recipient_name: activeTarget.recipientName,
      recipient_role: activeTarget.recipientRole,
      message_text: inputText.trim()
    };

    const optimisticMsg: MessageItem = {
      ...msgPayload,
      id: `msg-${Date.now()}`,
      created_at: new Date().toISOString(),
      is_read: false
    };

    // Update state immediately
    const updated = [...messages, optimisticMsg];
    setMessages(updated);
    setInputText('');

    // Save to localStorage for instant cross-tab access
    const localKey = `bw_chat_${convId}`;
    localStorage.setItem(localKey, JSON.stringify(updated));

    // Send to backend / Supabase
    try {
      await fetch(`${API_BASE_URL}/api/v1/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgPayload)
      });
    } catch (err) {
      console.warn('Backend message sync notice:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300">
      <div className="w-full max-w-3xl h-full sm:h-[88vh] sm:mr-6 bg-white sm:rounded-3xl shadow-2xl flex overflow-hidden border border-slate-200 animate-in slide-in-from-right duration-300">
        
        {/* Left Sidebar: Conversations List */}
        <div className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col justify-between hidden sm:flex">
          <div>
            <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 leading-tight">Messages</h2>
                  <p className="text-[10px] text-emerald-600 font-semibold">Live 2-Way Real-Time Chat</p>
                </div>
              </div>
            </div>

            {/* Conversation Items */}
            <div className="p-2 space-y-1 overflow-y-auto max-h-[70vh]">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No other active users yet. Register another profile or select one from the switcher.
                </div>
              ) : (
                conversations.map((conv, idx) => {
                  const isSelected = activeTarget?.recipientName.toLowerCase() === conv.recipientName.toLowerCase();
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveTarget(conv)}
                      className={`w-full p-3 rounded-2xl text-left flex items-start gap-3 transition-colors cursor-pointer ${
                        isSelected ? 'bg-white shadow-sm border border-slate-200' : 'hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {conv.recipientRole === 'professional' ? (
                          <HardHat className="w-4 h-4 text-amber-600" />
                        ) : conv.recipientRole === 'supplier' ? (
                          <Truck className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <User className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 truncate">{conv.recipientName}</span>
                          <span className="text-[9px] text-emerald-600 font-semibold">Online</span>
                        </div>
                        <p className="text-[11px] text-indigo-700 font-medium truncate mt-0.5">
                          {conv.projectTitle || 'Project Inquiries & Consultation'}
                        </p>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          {conv.recipientRole}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-3 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
            Chatting as: <strong className="text-slate-900">{currentUserName}</strong> ({currentUserRole})
          </div>
        </div>

        {/* Right Main Area: Active Chat Conversation */}
        <div className="flex-1 flex flex-col justify-between bg-white h-full">
          
          {/* Chat Header */}
          <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs">
            {activeTarget ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-black">
                  {activeTarget.recipientName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{activeTarget.recipientName}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 uppercase">
                      {activeTarget.recipientRole}
                    </span>
                  </div>
                  {activeTarget.projectTitle && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <FolderKanban className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-xs">{activeTarget.projectTitle}</span>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 font-medium">Select a conversation to start chatting</div>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message Thread */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
            {loading ? (
              <div className="text-center py-10 text-xs text-slate-400">Loading conversation...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">No messages in this chat yet</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Start the conversation below. Messages are delivered in real-time between accounts!
                </p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.sender_name.toLowerCase().trim() === currentUserName.toLowerCase().trim();
                return (
                  <div
                    key={msg.id || i}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="text-[10px] text-slate-400 mb-1 px-1">
                      {isMe ? 'You' : msg.sender_name}
                    </div>
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200'
                      }`}
                    >
                      {msg.message_text}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1 flex items-center gap-1 px-1">
                      <span>{new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-indigo-600" />}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Box */}
          {!canChat ? (
            <div className="p-4 bg-amber-50 border-t border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-950">Chat is locked on Free Tier</div>
                  <div className="text-[11px] text-amber-800">Direct real-time consultation is available for Pro & Premium members.</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Upgrade to Pro / Premium</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                disabled={!activeTarget}
                placeholder={activeTarget ? `Message ${activeTarget.recipientName}...` : 'Select a recipient first...'}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!activeTarget || !inputText.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          )}

        </div>

      </div>

      <ChangePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
};
