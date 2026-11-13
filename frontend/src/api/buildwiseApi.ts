import type { 
  NotificationItem, 
  NotificationCategory, 
  ConversationThread, 
  ChatMessage, 
  MessageType
} from '../types/communication';

const API_BASE = 'http://localhost:8000/api/v1';

// In-browser fallback state store when backend is unreachable or during standalone client demo
class LocalFallbackStore {
  private notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      user_id: 'demo-cust-1',
      title: 'New Quotation Submitted',
      message: 'Carlos Fernandes (Fernandes & Sons) submitted an itemized quotation of ₹48.5 Lakhs for your Margao Villa.',
      category: 'quotation',
      action_url: '/messages',
      metadata: { project_id: 'proj-margao-1', project_title: '2,400 sq.ft Luxury Villa Margao', amount: 4850000 },
      is_read: false,
      is_dismissed: false,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'notif-2',
      user_id: 'demo-cust-1',
      title: 'Site Milestone 2 Photo Log Uploaded',
      message: '12 new high-res site photos were posted for Foundation Concrete Pouring by Carlos Fernandes.',
      category: 'milestone',
      action_url: '/messages',
      metadata: { project_id: 'proj-margao-1', milestone_name: 'Foundation Concrete Pouring' },
      is_read: false,
      is_dismissed: false,
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'notif-3',
      user_id: 'demo-cust-1',
      title: 'Supplier RFQ Response Available',
      message: 'Mandovi Building Solutions replied with bulk pricing of ₹385/bag for UltraTech Weather Plus Cement.',
      category: 'supplier_enquiry',
      action_url: '/messages',
      metadata: { supplier_name: 'Mandovi Building Solutions', product: 'UltraTech Weather Plus Cement' },
      is_read: true,
      is_dismissed: false,
      created_at: new Date(Date.now() - 14400000).toISOString()
    },
    {
      id: 'notif-4',
      user_id: 'demo-prof-1',
      title: 'Project Lead Shortlisted!',
      message: 'Rahul Naik shortlisted your profile for the 2,400 sq.ft Margao Villa project. Prepare your formal quotation.',
      category: 'enquiry',
      action_url: '/messages',
      metadata: { project_id: 'proj-margao-1', customer_name: 'Rahul Naik' },
      is_read: false,
      is_dismissed: false,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'notif-5',
      user_id: 'demo-prof-1',
      title: 'Customer Sent a Direct Message',
      message: 'Rahul Naik: "Hi Carlos, can we review the foundation waterproofing specifications tomorrow?"',
      category: 'message',
      action_url: '/messages',
      metadata: { sender_name: 'Rahul Naik' },
      is_read: false,
      is_dismissed: false,
      created_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'notif-6',
      user_id: 'demo-supp-1',
      title: 'New Bulk RFQ Received',
      message: 'Fernandes & Sons Civil Construction requested pricing for 15 Metric Tons of Tata Tiscon 550D TMT Steel.',
      category: 'supplier_enquiry',
      action_url: '/messages',
      metadata: { buyer_name: 'Carlos Fernandes', product_name: 'Tata Tiscon 550D TMT Steel' },
      is_read: false,
      is_dismissed: false,
      created_at: new Date(Date.now() - 1800000).toISOString()
    }
  ];

  private conversations: ConversationThread[] = [
    {
      id: 'conv-cust-pro-1',
      project_id: 'proj-margao-1',
      project_title: '2,400 sq.ft Luxury Villa Margao',
      title: 'Carlos Fernandes (Fernandes & Sons)',
      created_by: 'demo-cust-1',
      participants: [
        {
          user_id: 'demo-cust-1',
          full_name: 'Rahul Naik',
          role: 'customer',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          last_read_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          user_id: 'demo-prof-1',
          full_name: 'Carlos Fernandes',
          company_name: 'Fernandes & Sons Civil Construction',
          role: 'professional',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          last_read_at: new Date().toISOString()
        }
      ],
      last_message_preview: 'I have uploaded the Revised Rev 2 quotation with the updated waterproofing warranty terms.',
      last_message_at: new Date().toISOString(),
      unread_count: 1,
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'conv-pro-supp-1',
      project_id: 'proj-margao-1',
      project_title: 'Tata Tiscon 550D TMT Steel (15 MT)',
      title: 'Sunil Silva (Mandovi Building Supplies)',
      created_by: 'demo-prof-1',
      participants: [
        {
          user_id: 'demo-prof-1',
          full_name: 'Carlos Fernandes',
          company_name: 'Fernandes & Sons Civil Construction',
          role: 'professional',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          last_read_at: new Date().toISOString()
        },
        {
          user_id: 'demo-supp-1',
          full_name: 'Sunil Silva',
          company_name: 'Mandovi Building Solutions',
          role: 'supplier',
          avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
          last_read_at: new Date().toISOString()
        }
      ],
      last_message_preview: 'We can dispatch 15 tons from Verna stockyard by Thursday at ₹62,000/ton.',
      last_message_at: new Date(Date.now() - 1800000).toISOString(),
      unread_count: 0,
      created_at: new Date(Date.now() - 43200000).toISOString()
    },
    {
      id: 'conv-cust-supp-1',
      project_id: 'proj-margao-1',
      project_title: 'Kajaria Vitrified Floor Tiles (800x1200mm)',
      title: 'Sunil Silva (Mandovi Building Supplies)',
      created_by: 'demo-cust-1',
      participants: [
        {
          user_id: 'demo-cust-1',
          full_name: 'Rahul Naik',
          role: 'customer',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          last_read_at: new Date().toISOString()
        },
        {
          user_id: 'demo-supp-1',
          full_name: 'Sunil Silva',
          company_name: 'Mandovi Building Solutions',
          role: 'supplier',
          avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
          last_read_at: new Date().toISOString()
        }
      ],
      last_message_preview: 'Yes, we have 3,000 sq.ft in stock in the Matte Sand finish.',
      last_message_at: new Date(Date.now() - 7200000).toISOString(),
      unread_count: 0,
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  private messages: Record<string, ChatMessage[]> = {
    'conv-cust-pro-1': [
      {
        id: 'msg-101',
        conversation_id: 'conv-cust-pro-1',
        sender_id: 'demo-cust-1',
        sender_name: 'Rahul Naik',
        sender_role: 'customer',
        content: 'Hi Carlos, I reviewed your initial quotation. The civil rates look reasonable, but can you detail the waterproofing specifications for the coastal monsoon climate?',
        message_type: 'text',
        created_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'msg-102',
        conversation_id: 'conv-cust-pro-1',
        sender_id: 'demo-prof-1',
        sender_name: 'Carlos Fernandes',
        sender_role: 'professional',
        content: 'Hello Rahul! Absolutely. For coastal Margao properties, we apply Dr. Fixit Fastflex 2-component polymer waterproof coating followed by protective screed. It carries a 10-year warranty.',
        message_type: 'text',
        created_at: new Date(Date.now() - 5400000).toISOString()
      },
      {
        id: 'msg-103',
        conversation_id: 'conv-cust-pro-1',
        sender_id: 'demo-prof-1',
        sender_name: 'Carlos Fernandes',
        sender_role: 'professional',
        content: 'I have uploaded the Revised Rev 2 quotation with the updated waterproofing warranty terms.',
        message_type: 'quotation_link',
        metadata: { quotation_id: 'quote-cf-102', amount: 4850000, version: 2 },
        created_at: new Date().toISOString()
      }
    ],
    'conv-pro-supp-1': [
      {
        id: 'msg-201',
        conversation_id: 'conv-pro-supp-1',
        sender_id: 'demo-prof-1',
        sender_name: 'Carlos Fernandes',
        sender_role: 'professional',
        content: 'Sunil, I need 15 Metric Tons of Tata Tiscon 550D (12mm and 16mm) for our Margao Villa foundation. What is your best wholesale delivery rate?',
        message_type: 'text',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'msg-202',
        conversation_id: 'conv-pro-supp-1',
        sender_id: 'demo-supp-1',
        sender_name: 'Sunil Silva',
        sender_role: 'supplier',
        content: 'We can dispatch 15 tons from Verna stockyard by Thursday at ₹62,000/ton. Includes delivery to Margao site and mill test certificates.',
        message_type: 'product_rfq',
        metadata: { unit_price: 62000, unit: 'metric ton', quantity: 15 },
        created_at: new Date(Date.now() - 1800000).toISOString()
      }
    ],
    'conv-cust-supp-1': [
      {
        id: 'msg-301',
        conversation_id: 'conv-cust-supp-1',
        sender_id: 'demo-cust-1',
        sender_name: 'Rahul Naik',
        sender_role: 'customer',
        content: 'Hi Sunil, do you have sample pieces available for the Kajaria 800x1200mm matte floor tiles?',
        message_type: 'text',
        created_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'msg-302',
        conversation_id: 'conv-cust-supp-1',
        sender_id: 'demo-supp-1',
        sender_name: 'Sunil Silva',
        sender_role: 'supplier',
        content: 'Yes, we have 3,000 sq.ft in stock in the Matte Sand finish. You can visit our Verna showroom or I can courier tile swatches to your Margao address.',
        message_type: 'text',
        created_at: new Date(Date.now() - 5400000).toISOString()
      }
    ]
  };

  getNotifications(userId: string, category?: string, unreadOnly?: boolean): NotificationItem[] {
    let list = this.notifications.filter(n => n.user_id === userId && !n.is_dismissed);
    if (category && category !== 'all') {
      list = list.filter(n => n.category === category);
    }
    if (unreadOnly) {
      list = list.filter(n => !n.is_read);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getUnreadCount(userId: string): number {
    return this.notifications.filter(n => n.user_id === userId && !n.is_read && !n.is_dismissed).length;
  }

  markRead(id: string): boolean {
    const item = this.notifications.find(n => n.id === id);
    if (item) {
      item.is_read = true;
      return true;
    }
    return false;
  }

  markAllRead(userId: string): number {
    let count = 0;
    this.notifications.forEach(n => {
      if (n.user_id === userId && !n.is_read && !n.is_dismissed) {
        n.is_read = true;
        count++;
      }
    });
    return count;
  }

  dismiss(id: string): boolean {
    const item = this.notifications.find(n => n.id === id);
    if (item) {
      item.is_dismissed = true;
      return true;
    }
    return false;
  }

  getConversations(userId: string, search?: string): ConversationThread[] {
    let list = this.conversations.filter(c => c.participants.some(p => p.user_id === userId));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => 
        c.title.toLowerCase().includes(q) || 
        (c.last_message_preview && c.last_message_preview.toLowerCase().includes(q)) ||
        (c.project_title && c.project_title.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
  }

  getMessages(convId: string, currentUserId: string): ChatMessage[] {
    const msgs = this.messages[convId] || [];
    return msgs.map(m => ({
      ...m,
      is_outgoing: m.sender_id === currentUserId
    }));
  }

  sendMessage(convId: string, senderId: string, senderName: string, senderRole: string, content: string, messageType: MessageType = 'text', metadata?: Record<string, any>): ChatMessage {
    const now = new Date().toISOString();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: convId,
      sender_id: senderId,
      sender_name: senderName,
      sender_role: senderRole,
      content,
      message_type: messageType,
      metadata,
      created_at: now,
      is_outgoing: true
    };

    if (!this.messages[convId]) {
      this.messages[convId] = [];
    }
    this.messages[convId].push(newMsg);

    const conv = this.conversations.find(c => c.id === convId);
    if (conv) {
      conv.last_message_preview = content.slice(0, 100);
      conv.last_message_at = now;
      
      // Notify other participants
      conv.participants.forEach(p => {
        if (p.user_id !== senderId) {
          this.notifications.unshift({
            id: `notif-${Date.now()}-${p.user_id}`,
            user_id: p.user_id,
            title: `New message from ${senderName}`,
            message: content.slice(0, 80),
            category: 'message',
            action_url: '/messages',
            metadata: { conversation_id: convId },
            is_read: false,
            is_dismissed: false,
            created_at: now
          });
        }
      });
    }

    return newMsg;
  }

  createConversation(creatorId: string, creatorName: string, creatorRole: string, participantId: string, participantName: string, participantRole: string, projectTitle?: string, productTitle?: string, initialMessage?: string): ConversationThread {
    // Check if exists
    const existing = this.conversations.find(c => 
      c.participants.some(p => p.user_id === creatorId) &&
      c.participants.some(p => p.user_id === participantId)
    );
    if (existing) {
      if (initialMessage) {
        this.sendMessage(existing.id, creatorId, creatorName, creatorRole, initialMessage);
      }
      return existing;
    }

    const now = new Date().toISOString();
    const newConv: ConversationThread = {
      id: `conv-${Date.now()}`,
      project_title: projectTitle || productTitle || 'Construction Workspace',
      title: participantName,
      created_by: creatorId,
      participants: [
        { user_id: creatorId, full_name: creatorName, role: creatorRole, last_read_at: now },
        { user_id: participantId, full_name: participantName, role: participantRole, last_read_at: now }
      ],
      last_message_preview: initialMessage || 'Conversation started',
      last_message_at: now,
      unread_count: 0,
      created_at: now
    };

    this.conversations.unshift(newConv);
    this.messages[newConv.id] = [];

    if (initialMessage) {
      this.sendMessage(newConv.id, creatorId, creatorName, creatorRole, initialMessage);
    }

    return newConv;
  }

  markConversationRead(convId: string, userId: string): void {
    const conv = this.conversations.find(c => c.id === convId);
    if (conv) {
      conv.unread_count = 0;
      const part = conv.participants.find(p => p.user_id === userId);
      if (part) {
        part.last_read_at = new Date().toISOString();
      }
    }
  }

  addEventNotification(userId: string, title: string, message: string, category: NotificationCategory, actionUrl?: string, metadata?: Record<string, any>) {
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: userId,
      title,
      message,
      category,
      action_url: actionUrl,
      metadata,
      is_read: false,
      is_dismissed: false,
      created_at: new Date().toISOString()
    });
  }
}

export const localFallback = new LocalFallbackStore();

// Universal API Client connecting to FastAPI backend with automatic graceful local fallback
export class BuildwiseApiClient {
  private static getHeaders(userId: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-User-Id': userId
    };
  }

  static async getNotifications(userId: string, category?: string, unreadOnly?: boolean): Promise<NotificationItem[]> {
    try {
      const url = new URL(`${API_BASE}/notifications`);
      if (category && category !== 'all') url.searchParams.append('category', category);
      if (unreadOnly) url.searchParams.append('unread_only', 'true');

      const res = await fetch(url.toString(), {
        headers: this.getHeaders(userId),
        signal: AbortSignal.timeout(1800)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return localFallback.getNotifications(userId, category, unreadOnly);
  }

  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const res = await fetch(`${API_BASE}/notifications/unread-count`, {
        headers: this.getHeaders(userId),
        signal: AbortSignal.timeout(1800)
      });
      if (res.ok) {
        const data = await res.json();
        return data.unread_count;
      }
    } catch {
      // Fallback
    }
    return localFallback.getUnreadCount(userId);
  }

  static async markNotificationRead(id: string, userId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: this.getHeaders(userId),
        signal: AbortSignal.timeout(1800)
      });
      if (res.ok) return true;
    } catch {
      // Fallback
    }
    return localFallback.markRead(id);
  }

  static async markAllNotificationsRead(userId: string): Promise<number> {
    try {
      const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: 'POST',
        headers: this.getHeaders(userId),
        signal: AbortSignal.timeout(1800)
      });
      if (res.ok) {
        const data = await res.json();
        return data.marked_read_count;
      }
    } catch {
      // Fallback
    }
    return localFallback.markAllRead(userId);
  }

  static async dismissNotification(id: string, userId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(userId),
        signal: AbortSignal.timeout(1800)
      });
      if (res.ok) return true;
    } catch {
      // Fallback
    }
    return localFallback.dismiss(id);
  }

  static async getConversations(userId: string, search?: string): Promise<ConversationThread[]> {
    try {
      const url = new URL(`${API_BASE}/conversations`);
      if (search) url.searchParams.append('search', search);

      const res = await fetch(url.toString(), {
        headers: this.getHeaders(userId),
        signal: AbortSignal.timeout(1800)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return localFallback.getConversations(userId, search);
  }

  static async getMessages(conversationId: string, userId: string): Promise<ChatMessage[]> {
    try {
      const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
        headers: this.getHeaders(userId),
        signal: AbortSignal.timeout(1800)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return localFallback.getMessages(conversationId, userId);
  }

  static async sendMessage(
    conversationId: string, 
    userId: string, 
    userName: string, 
    userRole: string, 
    content: string, 
    messageType: MessageType = 'text', 
    metadata?: Record<string, any>
  ): Promise<ChatMessage> {
    try {
      const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: this.getHeaders(userId),
        body: JSON.stringify({ content, message_type: messageType, metadata: metadata || {} }),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return localFallback.sendMessage(conversationId, userId, userName, userRole, content, messageType, metadata);
  }

  static async createConversation(
    creatorId: string,
    creatorName: string,
    creatorRole: string,
    participantId: string,
    participantName: string,
    participantRole: string,
    projectTitle?: string,
    productTitle?: string,
    initialMessage?: string
  ): Promise<ConversationThread> {
    try {
      const res = await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        headers: this.getHeaders(creatorId),
        body: JSON.stringify({
          participant_ids: [participantId],
          title: participantName,
          initial_message: initialMessage
        }),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return localFallback.createConversation(
      creatorId, creatorName, creatorRole, 
      participantId, participantName, participantRole, 
      projectTitle, productTitle, initialMessage
    );
  }

  static async markConversationRead(conversationId: string, userId: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/conversations/${conversationId}/read`, {
        method: 'PATCH',
        headers: this.getHeaders(userId),
        signal: AbortSignal.timeout(1800)
      });
    } catch {
      // Fallback
    }
    localFallback.markConversationRead(conversationId, userId);
  }

  // Marketplace action event triggers
  static async triggerEnquiryEvent(payload: {
    project_id: string;
    project_title: string;
    customer_id: string;
    professional_id: string;
    professional_name: string;
    pitch_message?: string;
    action: 'submit' | 'shortlist' | 'decline';
  }) {
    try {
      const res = await fetch(`${API_BASE}/events/enquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    if (payload.action === 'submit') {
      localFallback.addEventNotification(
        payload.customer_id,
        `New Project Proposal from ${payload.professional_name}`,
        payload.pitch_message || `Submitted enquiry for ${payload.project_title}`,
        'enquiry',
        '/messages'
      );
    } else if (payload.action === 'shortlist') {
      localFallback.addEventNotification(
        payload.professional_id,
        `Shortlisted for ${payload.project_title}!`,
        `Customer shortlisted your proposal for ${payload.project_title}. Prepare your formal quotation.`,
        'enquiry',
        '/messages'
      );
    }
    return { status: 'ok' };
  }

  static async triggerQuotationEvent(payload: {
    quotation_id: string;
    project_id: string;
    project_title: string;
    customer_id: string;
    professional_id: string;
    professional_name: string;
    total_price: number;
    action: 'submit' | 'revise' | 'accept' | 'reject';
  }) {
    try {
      const res = await fetch(`${API_BASE}/events/quotation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    if (payload.action === 'submit') {
      localFallback.addEventNotification(
        payload.customer_id,
        `New Quotation: ₹${(payload.total_price / 100000).toFixed(1)} Lakhs by ${payload.professional_name}`,
        `Itemized quotation submitted for ${payload.project_title}.`,
        'quotation',
        '/messages'
      );
    } else if (payload.action === 'accept') {
      localFallback.addEventNotification(
        payload.professional_id,
        `Contract Awarded! Quotation Accepted`,
        `Customer accepted your quotation for ${payload.project_title}.`,
        'quotation',
        '/messages'
      );
    }
    return { status: 'ok' };
  }

  static async triggerSupplierRFQEvent(payload: {
    product_id: string;
    product_name: string;
    supplier_id: string;
    buyer_id: string;
    buyer_name: string;
    buyer_role: string;
    quantity: number;
    notes?: string;
  }): Promise<{ status: string; conversation_id?: string; notified_user?: string }> {
    try {
      const res = await fetch(`${API_BASE}/events/supplier-rfq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    const conv = localFallback.createConversation(
      payload.buyer_id,
      payload.buyer_name,
      payload.buyer_role,
      payload.supplier_id,
      'Mandovi Building Solutions',
      'supplier',
      undefined,
      `${payload.product_name} (Qty: ${payload.quantity})`,
      payload.notes || `Inquiry for ${payload.quantity} units of ${payload.product_name}`
    );
    localFallback.addEventNotification(
      payload.supplier_id,
      `New Material RFQ from ${payload.buyer_name}`,
      `RFQ submitted for ${payload.quantity} units of ${payload.product_name}.`,
      'supplier_enquiry',
      '/messages'
    );
    return { status: 'rfq_created', conversation_id: conv.id, notified_user: payload.supplier_id };
  }
}
