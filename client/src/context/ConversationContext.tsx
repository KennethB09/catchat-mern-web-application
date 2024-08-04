import { createContext, useReducer, ReactNode, useContext } from "react";

// Interfaces
import { userInterface, MessagesInterface, ConversationInterface, UserConversation } from "../ts/interfaces/Conversation_interface";

type ConversationAction =
  | { type: 'SET_CONVERSATIONS'; payload: ConversationInterface[] }
  | { type: 'UPDATE_CONVERSATIONS'; payload: { conversationId: string; newMessage: MessagesInterface } }
  | { type: 'SET_USER'; payload: userInterface }
  | { type: 'SET_CLICK_CONVERSATION'; payload: ConversationInterface }
  | { type: 'ADD_MESSAGE'; payload: MessagesInterface };

type ConversationContextType = {
  conversations: ConversationInterface[] | null;
  recipientUser: userInterface | null;
  conversation: ConversationInterface | null;
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
    case 'UPDATE_CONVERSATIONS':
      return {
        ...state,
        conversations: state.conversations ? 
          state.conversations.map(c =>
            c._id === action.payload.conversationId ? 
            { ...c, messages: [...c.messages!, action.payload.newMessage] }
            : c
          )
          : state.conversations
      }
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
    case 'ADD_MESSAGE':
      return {
        ...state,
        conversation: state.conversation ? {
          ...state.conversation,
          messages: [...state.conversation.messages!, action.payload]
        } : null
      };
    default:
      return state;
  }
};

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(conversationReducer, {
    conversations: null,
    recipientUser: null,
    conversation: null
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