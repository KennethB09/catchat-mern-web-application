export interface userInterface {
    _id: string;
    username: string;
    userAvatar: string | null;
    email?: string
    userStatus?: string
}

export interface participantsInterface {
    user: userInterface;
    role: 'admin' | 'member'
}

export interface MessagesInterface {
    sender: userInterface;
    content: string;
    createdAt: string;
}

export interface ConversationInterface {
    _id: string;
    participants: participantsInterface[];
    conversationType: string;
    groupAvatar: string;
    conversationName: string;
    messages: (MessagesInterface[] | null);
}


export type UserConversation = {
    conversations: ConversationInterface[] | null;
    recipientUser: userInterface | null;
    conversation: ConversationInterface | null;
}