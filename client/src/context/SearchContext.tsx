import { createContext, useState, useContext } from 'react';

interface UserResultInterface{
    _id: string;
    username: string;
    userAvatar: string;
}

interface SearchContextType {
  searchResult: UserResultInterface[];
  setSearchResult: React.Dispatch<React.SetStateAction<UserResultInterface[]>>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchResult, setSearchResult] = useState<UserResultInterface[]>([]);

  return (
    <SearchContext.Provider value={{ searchResult, setSearchResult }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
}