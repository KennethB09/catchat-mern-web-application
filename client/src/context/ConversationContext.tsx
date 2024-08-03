import { createContext, useReducer, ReactNode, useContext } from "react";

// Interfaces
import { userInterface, MessagesInterface, ConversationInterface, UserConversation } from "../ts/interfaces/Conversation_interface";

type ConversationAction =
  { type: 'SET_CONVERSATIONS'; payload: ConversationInterface[] }
  | { type: 'SET_USER'; payload: userInterface }
  | { type: 'SET_CLICK_CONVERSATION'; payload: ConversationInterface }
  | { type: 'MESSAGES', payload: MessagesInterface[] }
  | { type: 'ADD_MESSAGE', payload: MessagesInterface };

interface ConversationContextType {
  conversations: ConversationInterface[] | null;
  recipientUser: userInterface | null;
  conversation: ConversationInterface | null;
  messages: MessagesInterface[];
  dispatch: React.Dispatch<ConversationAction>;
}

export const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const conversationReducer = (state: UserConversation, action: ConversationAction): UserConversation => {

  switch (action.type) {
    case 'SET_CONVERSATIONS':
      return {
        ...state,
        conversations: action.payload
      };
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
    case 'MESSAGES':
      return {
        ...state,
        messages: action.payload
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };

    default:
      return state;
  }
};

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(conversationReducer, {
    conversations: null,
    recipientUser: null,
    conversation: null,
    messages: []
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