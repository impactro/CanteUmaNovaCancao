import React, { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "react-native-toast-notifications";
import { getAllMusics } from "../service/http";

const MusicContextData = {
    allMusics: [],
    allCiphers: [],
    refreshing: false,
    getMusics: () => { },
    getStorageMusic: () => { },
    getStorageCipher: () => { },
}

const MusicContext = createContext(MusicContextData);

export function MusicProvider({ children }) {
    const toast = useToast();

    const [allMusics, setAllMusics] = useState([]);
    const [allCiphers, setAllCiphers] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const getMusics = async () => {
        try {
            setRefreshing(true);
            const response = await getAllMusics();
            setAllMusics(response);
            await storageMusic(response);

            setRefreshing(false);
        } catch (error) {
            setRefreshing(false);
            toast.show('Não foi possível carregar as músicas', { type: 'danger' });
        }
    }

    const storageMusic = async (data) => {
        try {
            await AsyncStorage.setItem('@ALL_MUSICS', JSON.stringify(data));
        } catch (error) {
            toast.show('Não foi possível armazenar as musicas no dispositivo', { type: 'danger' });
        }
    }

    const getStorageMusic = async () => {
        try {
            const localCatalog = await getAllMusics();
            setAllMusics(localCatalog);
            await storageMusic(localCatalog);
        } catch (error) {
            toast.show('Não foi possível carregar o catálogo local', { type: 'danger' });
            setAllMusics([]);
        }
    }

    const getStorageCipher = async () => {
        setRefreshing(true);
        const localCatalog = allMusics.length ? allMusics : await getAllMusics();
        const ciphers = localCatalog.filter(cipher => cipher.music.cifra);

        setAllCiphers(ciphers);
        setRefreshing(false);

    }

    return (
        <MusicContext.Provider
            value={{
                allMusics,
                allCiphers,
                refreshing,
                getMusics,
                getStorageMusic,
                getStorageCipher
            }}
        >
            {children}
        </MusicContext.Provider>

    )
}

export default MusicContext
