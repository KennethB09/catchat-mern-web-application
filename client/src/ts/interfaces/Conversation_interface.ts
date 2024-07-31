export interface userInterface {
    _id: string;
    username: string | null;
    userAvatar: string | null;
}

export interface MessagesInterface {
    sender: userInterface;
    content: string;
    createdAt: string;
}

export interface ConversationInterface {
    _id: string;
    participants: userInterface[];
    conversationType: string;
    groupAvatar: string;
    conversationName: string;
    messages: (MessagesInterface[] | null);
}


export interface UserConversation {
    conversations: ConversationInterface[] | null;
    recipientUser: userInterface | null;
    conversation: ConversationInterface | null;
    messages: MessagesInterface[];
}