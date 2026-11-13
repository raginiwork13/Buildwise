export type NotificationCategory = 
  | 'project_update' 
  | 'enquiry' 
  | 'quotation' 
  | 'message' 
  | 'milestone' 
  | 'supplier_enquiry'
  | 'system';

export type MessageType = 
  | 'text' 
  | 'system' 
  | 'quotation_link' 
  | 'project_link' 
  | 'product_rfq'
  | 'file';

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  action_url?: string;
  metadata?: Record<string, any>;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export interface NotificationStats {
  total: number;
  unread_count: number;
  by_category: Record<string, number>;
}

export interface ParticipantInfo {
  user_id: string;
  full_name: string;
  role: string;
  company_name?: string;
  avatar_url?: string;
  last_read_at: string;
  is_pinned?: boolean;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  content: string;
  message_type: MessageType;
  metadata?: Record<string, any>;
  created_at: string;
  is_outgoing?: boolean;
}

export interface ConversationThread {
  id: string;
  project_id?: string;
  project_title?: string;
  title: string;
  created_by: string;
  participants: ParticipantInfo[];
  last_message_preview?: string;
  last_message_at: string;
  unread_count: number;
  created_at: string;
}

