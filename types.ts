export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  IMAGE_GEN = 'IMAGE_GEN',
  CAMPAIGN = 'CAMPAIGN'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export interface CampaignData {
  subject: string;
  body: string;
  imagePrompt: string;
}

export interface CampaignResult extends CampaignData {
  imageUrl?: string;
}