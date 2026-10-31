export interface Transaction {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  amount: number;
  purpose: string;
  timestamp: number;
  isCoinbase?: boolean;
}

export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
  difficulty: number;
  minerId: string;
  minerName: string;
  isGenesis?: boolean;
  isValid?: boolean;
  tampered?: boolean;
  tamperOriginalHash?: string;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  color: string;
  grade: string;
  role: string;
  description: string;
  initialBalance: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  hint: string;
  completed: boolean;
  actionText: string;
}

export interface GlossaryTerm {
  term: string;
  simpleName: string;
  explanation: string;
  everydayAnalogy: string;
  iconName: string;
}
