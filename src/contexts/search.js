import React, { createContext, useCallback, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import historyCore from '../service/searchHistoryCore.cjs';

const SearchContextData = {
    recentSearches: [],
    getRecentSearchesInMemory: () => { },
    recordRecentSearch: (param) => { },
    deleteAllSearch: () => { },
    deleteSearchById: (param) => { },
}

const SearchesContext = createContext(SearchContextData);

export function SearchProvider({ children }) {
    const [recentSearches, setResentSearchs] = useState([]);
    const recentSearchesRef = useRef([]);
    const loadPromiseRef = useRef(null);

    const commitRecentSearches = useCallback(async (items) => {
        const ordered = historyCore.sortRecentSearches(items);
        recentSearchesRef.current = ordered;
        setResentSearchs(ordered);
        await AsyncStorage.setItem('@SEARCH_MUSIC', JSON.stringify(ordered));
        return ordered;
    }, []);

    const getRecentSearchesInMemory = useCallback(async () => {
        if (!loadPromiseRef.current) {
            const loadPromise = AsyncStorage.getItem('@SEARCH_MUSIC')
                .then(stored => {
                    const parsed = historyCore.parseRecentSearches(stored);
                    recentSearchesRef.current = parsed;
                    setResentSearchs(parsed);
                    return parsed;
                });

            loadPromiseRef.current = loadPromise.catch(error => {
                loadPromiseRef.current = null;
                throw error;
            });
        }

        return loadPromiseRef.current;
    }, []);

    const recordRecentSearch = useCallback(async (search) => {
        await getRecentSearchesInMemory();
        const next = historyCore.upsertRecentSearch(recentSearchesRef.current, search);
        return commitRecentSearches(next);
    }, [commitRecentSearches, getRecentSearchesInMemory]);

    const deleteAllSearch = useCallback(async () => {
        const { hydrationError } = await historyCore.clearAfterHydration(
            getRecentSearchesInMemory(),
            async () => {
                recentSearchesRef.current = [];
                setResentSearchs([]);
                await AsyncStorage.removeItem('@SEARCH_MUSIC');
            }
        );

        if (hydrationError) {
            console.warn('Não foi possível carregar o histórico antes de limpá-lo.', hydrationError);
        }
    }, [getRecentSearchesInMemory]);

    const deleteSearchById = async (id) => {
        await getRecentSearchesInMemory();
        const next = historyCore.removeRecentSearch(recentSearchesRef.current, id);
        await commitRecentSearches(next);
    }

    return (
        <SearchesContext.Provider
            value={{
                recentSearches,
                getRecentSearchesInMemory,
                recordRecentSearch,
                deleteAllSearch,
                deleteSearchById
            }}
        >
            {children}
        </SearchesContext.Provider>
    )

}

export default SearchesContext;
