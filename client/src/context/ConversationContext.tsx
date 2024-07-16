import { createContext, useReducer, ReactNode, useContext } from "react";

interface userInterface {
  _id: string;
  username: string;
}

interface MessagesInterface {
  sender: string;
  content: string;
  createdAt: string;
}

interface ConversationInterface {
  _id: string;
  participants: userInterface[];
  conversationType: string[];
  messages: (MessagesInterface[] | null);
}


interface UserConversation {
  conversation: ConversationInterface | null;
  recipientUser: userInterface | null;
}

type ConversationAction = 
  | { type: 'SET_CLICK_CONVERSATION'; payload: ConversationInterface }
  | { type: 'SET_USER'; payload: userInterface };

interface ConversationContextType {
  conversation: ConversationInterface | null;
  recipientUser: userInterface | null;
  dispatch: React.Dispatch<ConversationAction>;
}

export const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const conversationReducer = (
  state: UserConversation, 
  action: ConversationAction
): UserConversation => {
  switch (action.type) {
    case 'SET_CLICK_CONVERSATION':
      return {
        ...state,
        conversation: action.payload
      };
    case 'SET_USER':
      return {
        ...state,
        recipientUser: action.payload
      };
    default:
      return state;
  }
}

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(conversationReducer, {
      conversation: null,
      recipientUser: null
  });
  
return (
  <ConversationContext.Provider value={{ ...state, dispatch }}>
    {children}
  </ConversationContext.Provider>
);
}

export const useConversationContext = (): ConversationContextType => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversationContext must be used within a ConversationContextProvider');
  }
  return context;
};