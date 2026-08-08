import React, { useContext, useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, Image, Keyboard, TouchableWithoutFeedback, Text, Pressable, useWindowDimensions } from "react-native";
import { Container, ListView, SearchButton, SearchInput, styles } from "../../style/SearchStyle";
import { Author, ButtonTitle, Kids, Title } from "../../../style";
import { InfoMusic, List } from "../../style/LyricsStyle";
import themes from "../../style/themes";
import { useToast } from "react-native-toast-notifications";
import MusicContext from "../../contexts/music";
import { formatNameMusic } from "../../utils";
import { AntDesign } from '@expo/vector-icons';
import RecentSearches from "../../components/RecentSearches";
import SearchesContext from "../../contexts/search";
import musicSearchCore from '../../service/musicSearchCore.cjs';
import MusicContentIndicators from '../../components/MusicContentIndicators';
import musicContentCore from '../../service/musicContentCore.cjs';

export default function Search({ navigation }) {
    const { width } = useWindowDimensions();
    const { show } = useToast();

    const {
        allMusics
    } = useContext(MusicContext);

    const {
        recentSearches,
        recordRecentSearch,
        getRecentSearchesInMemory,
    } = useContext(SearchesContext)

    const data = {
        'sonho': require('../../assets/o_sonho.png'),
        'caminhos': require('../../assets/caminhos.png'),
        'undefined': require('../../assets/cunc.png')
    }

    const widthScreen = Math.max(width - 15, 0);

    const [textValue, setTextValue] = useState('');
    const [dataMusic, setDataMusic] = useState([]);
    const [isFocus, setIsFocus] = useState(false);

    useEffect(() => {
        getRecentSearchesInMemory();
    }, [getRecentSearchesInMemory]);

    const searchMusic = () => {
        const message = 'Digite o nome da música para buscar';
        const notFoundMessage = 'Música não encontrada';

        const results = musicSearchCore.searchMusics(allMusics, textValue);
        setDataMusic(results);
        setIsFocus(false);

        if (musicSearchCore.normalizeText(textValue).length <= 1) {
            setDataMusic([]);
            return show(message, { type: 'warning' });
        }

        if (results.length <= 0) {
            return show(notFoundMessage, { type: 'warning' });
        }

        recordRecentSearch(textValue);
        Keyboard.dismiss();
    }

    const findMusics = (value) => musicSearchCore.searchMusics(allMusics, value);

    const gotToMusicText = ({ number, title, music, author, album }) => {
        const { text, audio, cifra, video } = music;
        navigation.navigate(
            'Search',
            {
                screen: 'MusicLetterSearch',
                params: {
                    numMusic: number,
                    musicTxt: text,
                    musicTitle: title,
                    audio: audio,
                    author: author,
                    image: album,
                    isCipher: cifra && 'cifra',
                    isVideo: video && 'video',
                    cipher: cifra,
                    linkVideo: video
                }
            }
        );
    }

    const renderItem = ({ item, separators }) => (
        <TouchableOpacity
            key={item.number}
            onPress={() => gotToMusicText(item)}
            onShowUnderlay={separators.highlight}
            onHideUnderlay={separators.unhighlight}
            activeOpacity={0.4}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${formatNameMusic(item)}. ${musicContentCore.getAccessibilityLabel(item.music)}`}
            accessibilityHint="Abre os detalhes da música"
        >
            <List width={widthScreen}>
                <Image
                    source={data[item.album]}
                    style={{ width: 45, height: 45, borderRadius: 8, marginRight: 10 }}
                />
                <InfoMusic width={widthScreen}>
                    <View style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                        <Title numberOfLines={1}>{formatNameMusic(item)}</Title>
                        <Author numberOfLines={1}>{item.author}</Author>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 3 }}>
                        <MusicContentIndicators music={item.music} />
                        {item.kids && <Kids>Kids</Kids>}
                        {item.natal && <Kids>Natal</Kids>}
                    </View>
                </InfoMusic>
            </List>
        </TouchableOpacity>
    )

    function closeRecentsAndSearch(params) {
        const musicSearched = findMusics(params);
        setTextValue(params);
        setIsFocus(false);
        setDataMusic(musicSearched);
        recordRecentSearch(params);
    }

    function cancelSelection() {
        Keyboard.dismiss();
        setTextValue('');
        setIsFocus(false);
        setDataMusic([]);
    }

    function changeText(value) {
        if (!value.length) setDataMusic([]);
        setTextValue(value);
    }

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <Container>
                <View style={[styles.wrapper]}>
                    <View style={[styles.positionAndAlingCenter, { width: isFocus ? '75%' : '100%' }]}>
                        <SearchInput
                            placeholder={"Pesquisar música ..."}
                            placeholderTextColor={'#c0c0c0'}
                            onChangeText={(text) => changeText(text)}
                            onSubmitEditing={searchMusic}
                            selectionColor={themes.dark.colors.primary}
                            onFocus={() => getRecentSearchesInMemory()}
                            onPressIn={() => setIsFocus(true)}
                            style={{ color: '#FFFF' }}
                            value={textValue}
                        />

                        {textValue.length ?
                            <Pressable
                                onPress={() => {
                                    setTextValue('');
                                    setDataMusic([]);
                                    setIsFocus(true);
                                }}
                                accessibilityRole="button"
                                accessibilityLabel="Limpar pesquisa"
                                style={[styles.pressPosition]}
                            >
                                <View style={[styles.cleanInputIcon]}>
                                    <AntDesign name="closecircle" size={16} color="#FFFFFFA1" />
                                </View>
                            </Pressable>
                            : null
                        }

                    </View>

                    {isFocus &&
                        <Pressable style={{ maxWidth: 90 }} onPress={cancelSelection}>
                            <Text style={[styles.textCancel]} numberOfLines={1} >Cancelar</Text>
                        </Pressable>
                    }
                </View>
                <SearchButton
                    style={
                        ({ pressed }) => [
                            {
                                backgroundColor: pressed
                                    ? '#24b1ec'
                                    : '#0B97D3'
                            },
                        ]
                    }
                    onPress={() => searchMusic()}
                >
                    <ButtonTitle>Pesquisar</ButtonTitle>
                </SearchButton>
                {!isFocus ?
                    <ListView>
                        <FlatList
                            data={dataMusic}
                            renderItem={renderItem}
                            keyExtractor={item => String(item.number)}
                        />
                    </ListView>
                    : <View
                        style={[styles.containerRecentSeaches]}
                    >
                        {recentSearches.length ?
                            <RecentSearches searchForRecent={closeRecentsAndSearch} />
                            : null
                        }
                    </View>
                }
            </Container>
        </TouchableWithoutFeedback>
    )
};
