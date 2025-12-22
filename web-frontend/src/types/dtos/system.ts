// System DTOs - Email, Notifications

// Email DTOs
export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  isHtml: boolean;
}

export interface EmailSettings {
  smtpServer: string;
  smtpPort: number;
  senderName: string;
  senderEmail: string;
  username: string;
  password: string;
  enableSsl: boolean;
}

// Notification DTOs
export interface NotificationDto {
  id: string;
  userId: string;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
}

export interface NotificationListDto {
  id: string;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface UnreadCountDto {
  unreadCount: number;
}
