import { createContext, useReducer, ReactNode, useContext } from "react";

// Interfaces
import { userInterface, MessagesInterface, ConversationInterface, UserConversation, participantsInterface } from "../ts/interfaces/Conversation_interface";

type ConversationAction =
  | { type: 'SET_CONVERSATIONS'; payload: ConversationInterface[] }
  | { type: 'UPDATE_CONVERSATIONS'; payload: { conversationId: string; newMessage: MessagesInterface } }
  | { type: 'SET_USER'; payload: userInterface }
  | { type: 'SET_CLICK_CONVERSATION'; payload: ConversationInterface | null }
  | { type: 'ADD_MESSAGE'; payload: MessagesInterface }
  | { type: 'LEAVE_GROUP'; payload: ConversationInterface }
  | { type: 'USER_BLOCKED_USERS'; payload: userInterface[] }
  | { type: 'BLOCK_USER'; payload: userInterface }
  | { type: 'UNBLOCK_USER'; payload: userInterface }
  | { type: 'NEW_CONVERSATION'; payload: ConversationInterface }
  | { type: 'LOAD_MESSAGE'; payload: MessagesInterface[] }
  | { type: 'ADD_GROUP_MEMBER'; payload: participantsInterface[] }
  | { type: 'REMOVE_GROUP_MEMBER'; payload: string[] }
  | { type: 'CHANGE_GROUP_AVATAR'; payload: { conversationId: string; newGroupAvatar: string } }

type ConversationContextType = {
  conversations: ConversationInterface[] | null;
  recipientUser: userInterface | null;
  conversation: ConversationInterface | null;
  blockedUsers: userInterface[];
  dispatch: React.Dispatch<ConversationAction>;
  conversationDispatch: React.Dispatch<ConversationAction>;
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
    case 'LOAD_MESSAGE':
      return {
        ...state,
        conversation: state.conversation ? {
          ...state.conversation,
          messages: [...action.payload, ...state.conversation.messages!]
        } : null
      };
    case 'CHANGE_GROUP_AVATAR':
      return {
        ...state,
        conversations: state.conversations ?
          state.conversations.map(c =>
            c._id === action.payload.conversationId ?
              {...c, groupAvatar: action.payload.newGroupAvatar }
              : c
          )
          : state.conversations
      };
    case 'ADD_GROUP_MEMBER':
      return {
        ...state,
        conversation: state.conversation ? {
          ...state.conversation,
          participants: [...state.conversation.participants!, ...action.payload]
        } : null
      };
    case 'REMOVE_GROUP_MEMBER':
      return {
        ...state,
        conversation: state.conversation? {
         ...state.conversation,
          participants: state.conversation.participants!.filter(p => !action.payload.includes(p.user._id))
        } : null
      };
    case 'LEAVE_GROUP':
      return {
        ...state,
        conversations: state.conversations!.filter(c => c._id !== action.payload._id)
      };
    case 'USER_BLOCKED_USERS':
      return {
        ...state,
        blockedUsers: action.payload
      }
    case 'BLOCK_USER':
      return {
        ...state,
        blockedUsers: [...state.blockedUsers!, action.payload]
      }
    case 'UNBLOCK_USER':
      return {
        ...state,
        blockedUsers: state.blockedUsers!.filter(u => u._id !== action.payload._id)
      }
    case 'NEW_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations!]
      }
    default:
      return state;
  }
};

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(conversationReducer, {
    conversations: null,
    recipientUser: null,
    conversation: null,
    blockedUsers: [],
  });

  return (
    <ConversationContext.Provider value={{ ...state, dispatch, conversationDispatch: dispatch }}>
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