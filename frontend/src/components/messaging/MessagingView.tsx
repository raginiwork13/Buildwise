import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Search, 
  ArrowLeft, 
  MessageSquare, 
  Building, 
  Truck, 
  HardHat, 
  Home, 
  AlertCircle
} from 'lucide-react';
import { BuildwiseApiClient } from '../../api/buildwiseApi';
import type { ConversationThread, ChatMessage } from '../../types/communication';
import type { UserProfile } from '../../types';

interface MessagingViewProps {
  currentUser: UserProfile | null;
  initialConversationId?: string;
  refreshTrigger?: number;
  onBackToHome: () => void;
}

export const MessagingView: React.FC<MessagingViewProps> = ({
  currentUser,
  initialConversationId,
  refreshTrigger,
  onBackToHome
}) => {
  const [conversations, setConversations] = useState<ConversationThread[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingConversations, setLoadingConversations] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>('');
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Mobile responsive view switcher: 'list' | 'chat'
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch conversations
  const loadConversations = async (selectId?: string) => {
    if (!currentUser) {
      setConversations([]);
      setLoadingConversations(false);
      return;
    }
    try {
      const list = await BuildwiseApiClient.getConversations(currentUser.id, searchQuery);
      setConversations(list);

      // Select initial or first conversation
      if (selectId) {
        const found = list.find(c => c.id === selectId);
        if (found) {
          setSelectedConversation(found);
          setMobileView('chat');
        }
      } else if (!selectedConversation && list.length > 0) {
        setSelectedConversation(list[0]);
      }
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    loadConversations(initialConversationId);
    // Periodically poll for new messages
    const interval = setInterval(() => {
      loadConversations();
    }, 4000);
    return () => clearInterval(interval);
  }, [currentUser?.id, searchQuery, initialConversationId, refreshTrigger]);

  // 2. Fetch messages whenever selected conversation changes
  const loadMessages = async (convId: string) => {
    if (!currentUser) return;
    setLoadingMessages(true);
    setSendError(null);
    try {
      const msgs = await BuildwiseApiClient.getMessages(convId, currentUser.id);
      setMessages(msgs);
      // Mark as read
      await BuildwiseApiClient.markConversationRead(convId, currentUser.id);
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread_count: 0 } : c));
    } finally {
      setLoadingMessages(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation?.id]);

  // 3. Send Message with Error Resilience and Unsent Text Preservation
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation || sendingMessage || !currentUser) return;

    const textToSend = messageText.trim();
    setSendingMessage(true);
    setSendError(null);

    // Optimistic local preview
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      conversation_id: selectedConversation.id,
      sender_id: currentUser.id,
      sender_name: currentUser.fullName,
      sender_role: currentUser.role,
      content: textToSend,
      message_type: 'text',
      created_at: new Date().toISOString(),
      is_outgoing: true
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setMessageText('');
    setTimeout(scrollToBottom, 50);

    try {
      const confirmedMsg = await BuildwiseApiClient.sendMessage(
        selectedConversation.id,
        currentUser.id,
        currentUser.fullName,
        currentUser.role,
        textToSend
      );

      // Replace optimistic message with confirmed server message
      setMessages(prev => prev.map(m => m.id === tempId ? confirmedMsg : m));
      // Update thread preview
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id 
          ? { ...c, last_message_preview: textToSend, last_message_at: confirmedMsg.created_at }
          : c
      ));
    } catch (err: any) {
      // PRESERVE unsent message text upon error!
      setMessageText(textToSend);
      setSendError('Failed to deliver message. Network timeout. Your text has been preserved.');
      // Remove failed optimistic message
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setSendingMessage(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'professional':
        return <HardHat className="w-3.5 h-3.5 text-amber-600" />;
      case 'supplier':
        return <Truck className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Home className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Active User Persona Selected</h2>
        <p className="text-slate-600 max-w-md mx-auto mb-6 text-sm">
          Please select a persona (Customer Rahul, Contractor Carlos, or Supplier Sunil) from the switcher in the header to access your messages and conversations.
        </p>
        <button
          onClick={onBackToHome}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors text-sm cursor-pointer"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const getOtherParticipant = (conv: ConversationThread) => {
    return conv.participants.find(p => p.user_id !== currentUser.id) || conv.participants[0];
  };

  return (
    <div className="h-[calc(100vh-4.5rem)] bg-slate-100 flex flex-col font-sans">
      
      {/* Top Bar Navigation */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Marketplace</span>
          </button>
          
          <div className="h-4 w-px bg-slate-200" />
          
          <span className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-amber-500" />
            <span>Marketplace Messaging Center</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden md:inline">
            Active Persona: <strong className="text-slate-900">{currentUser.fullName}</strong> ({currentUser.role})
          </span>
        </div>
      </div>

      {/* Main 2-Pane Chat Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANE: Conversation List */}
        <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0 ${
          mobileView === 'chat' ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Search Header */}
          <div className="p-3 border-b border-slate-100 space-y-2 bg-slate-50/50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations or projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingConversations ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-xs font-bold text-slate-700">No conversations found</div>
                <p className="text-[11px] text-slate-400">
                  Select a contractor from the directory or request a material quote to start chatting.
                </p>
              </div>
            ) : (
              conversations.map(conv => {
                const other = getOtherParticipant(conv);
                const isSelected = selectedConversation?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConversation(conv);
                      setMobileView('chat');
                    }}
                    className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start relative ${
                      isSelected ? 'bg-amber-50/60 border-l-4 border-l-amber-500' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={other?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                        alt={other?.full_name || conv.title}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white shadow-xs">
                        {getRoleIcon(other?.role)}
                      </div>
                    </div>

                    {/* Metadata & Preview */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {other?.company_name || other?.full_name || conv.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {conv.project_title && (
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium truncate max-w-full">
                          <Building className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span className="truncate">{conv.project_title}</span>
                        </div>
                      )}

                      <p className="text-[11px] text-slate-500 truncate leading-tight">
                        {conv.last_message_preview || 'No messages yet'}
                      </p>
                    </div>

                    {/* Unread Counter Badge */}
                    {conv.unread_count > 0 && (
                      <span className="shrink-0 mt-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow-xs">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: Active Chat Conversation */}
        <div className={`flex-1 bg-slate-50 flex flex-col ${
          mobileView === 'list' ? 'hidden md:flex' : 'flex'
        }`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              {(() => {
                const other = getOtherParticipant(selectedConversation);
                return (
                  <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      {/* Mobile Back Button */}
                      <button
                        onClick={() => setMobileView('list')}
                        className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 mr-1"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>

                      <img
                        src={other?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                        alt={other?.full_name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-sm">
                            {other?.company_name || other?.full_name}
                          </h3>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {other?.role}
                          </span>
                        </div>
                        {selectedConversation.project_title && (
                          <div className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                            <Building className="w-3 h-3 text-amber-600" />
                            <span>Linked Project: {selectedConversation.project_title}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Verified Direct Channel</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Chat Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {loadingMessages ? (
                  <div className="p-8 text-center text-slate-400 text-xs">Loading message history...</div>
                ) : messages.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                    <div>No messages in this conversation yet. Send the first message below.</div>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isOutgoing = msg.sender_id === currentUser.id;

                    if (msg.message_type === 'system') {
                      return (
                        <div key={msg.id} className="flex justify-center my-2">
                          <div className="bg-slate-200 text-slate-700 text-[11px] px-3 py-1 rounded-full font-medium shadow-xs border border-slate-300">
                            {msg.content}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[10px] font-bold text-slate-500">
                            {isOutgoing ? 'You' : msg.sender_name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Message Bubble Card */}
                        <div
                          className={`max-w-md sm:max-w-lg rounded-2xl p-3.5 text-xs shadow-xs space-y-2 leading-relaxed ${
                            isOutgoing
                              ? 'bg-slate-900 text-white rounded-tr-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>

                          {/* Quotation Link Embedded Card */}
                          {msg.message_type === 'quotation_link' && msg.metadata?.amount && (
                            <div className={`p-3.5 rounded-xl border mt-2 space-y-2.5 ${
                              isOutgoing ? 'bg-slate-800 border-slate-700 text-white' : 'bg-amber-50/80 border-amber-200 text-amber-950'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                                    Formal Itemized Quotation
                                  </div>
                                  <div className="text-base font-black">
                                    ₹{(Number(msg.metadata.amount) / 100000).toFixed(2)} Lakhs
                                  </div>
                                  {msg.metadata.version && (
                                    <div className="text-[10px] opacity-75">Rev {msg.metadata.version}</div>
                                  )}
                                </div>
                                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-500 text-slate-950">
                                  Scope Itemized
                                </span>
                              </div>

                              {currentUser.role === 'customer' && !isOutgoing && (
                                <div className="pt-2 border-t border-amber-200 flex items-center gap-2">
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      await BuildwiseApiClient.triggerQuotationEvent({
                                        quotation_id: String(msg.metadata?.quotation_id || 'quote-102'),
                                        project_id: selectedConversation?.project_id || 'proj-margao-1',
                                        project_title: selectedConversation?.project_title || 'Margao Villa',
                                        customer_id: currentUser.id,
                                        professional_id: msg.sender_id,
                                        professional_name: msg.sender_name,
                                        total_price: Number(msg.metadata?.amount || 4850000),
                                        action: 'accept'
                                      });
                                      if (selectedConversation) {
                                        loadMessages(selectedConversation.id);
                                      }
                                    }}
                                    className="flex-1 py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer text-center shadow-xs"
                                  >
                                    ✓ Accept Quote
                                  </button>
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      await BuildwiseApiClient.triggerQuotationEvent({
                                        quotation_id: String(msg.metadata?.quotation_id || 'quote-102'),
                                        project_id: selectedConversation?.project_id || 'proj-margao-1',
                                        project_title: selectedConversation?.project_title || 'Margao Villa',
                                        customer_id: currentUser.id,
                                        professional_id: msg.sender_id,
                                        professional_name: msg.sender_name,
                                        total_price: Number(msg.metadata?.amount || 4850000),
                                        action: 'reject'
                                      });
                                      if (selectedConversation) {
                                        loadMessages(selectedConversation.id);
                                      }
                                    }}
                                    className="py-1 px-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-[10px] transition-colors cursor-pointer shadow-xs"
                                  >
                                    Decline
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Product RFQ Embedded Card */}
                          {msg.message_type === 'product_rfq' && msg.metadata?.quantity && (
                            <div className={`p-3 rounded-xl border mt-2 flex items-center justify-between ${
                              isOutgoing ? 'bg-slate-800 border-slate-700 text-white' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                            }`}>
                              <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                  Wholesale Material RFQ
                                </div>
                                <div className="text-xs font-bold">
                                  Quantity: {msg.metadata.quantity} {msg.metadata.unit || 'units'}
                                </div>
                                {msg.metadata.unit_price && (
                                  <div className="text-[11px] font-extrabold text-emerald-700">
                                    Rate: ₹{msg.metadata.unit_price}/{msg.metadata.unit}
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-600 text-white">
                                Confirmed Supply
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Error preservation toast banner */}
              {sendError && (
                <div className="bg-red-50 border-t border-red-200 px-4 py-2 flex items-center justify-between text-xs text-red-700">
                  <div className="flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{sendError}</span>
                  </div>
                </div>
              )}

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="bg-white border-t border-slate-200 p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Message ${getOtherParticipant(selectedConversation)?.full_name || 'chat'}... (Press Enter to send)`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    disabled={sendingMessage}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                  />

                  <button
                    type="submit"
                    disabled={!messageText.trim() || sendingMessage}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                      messageText.trim() && !sendingMessage
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-300 shadow-sm">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm">Select a conversation to start messaging</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Choose an existing thread from the left rail or initiate a quotation enquiry with contractors or material suppliers.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
