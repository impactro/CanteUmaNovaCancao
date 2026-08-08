import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Image, TouchableOpacity, useWindowDimensions, View, VirtualizedList } from 'react-native';
import { Container, InfoMusic, List, Wrapper } from '../../style/LyricsStyle';
import { Author, Kids, Title } from '../../../style';
import Filter from '../../components/Filter';
// import mockMusicData from '../../utils/mockMusicData.json';
import MusicContext from '../../contexts/music';
import LoadingIndicator from '../../components/Loading';
import { formatNameMusic } from '../../utils';
import { useScrollToTop } from '@react-navigation/native';
import MusicContentIndicators, { MusicContentLegend } from '../../components/MusicContentIndicators';
import musicContentCore from '../../service/musicContentCore.cjs';

export default function Lyrics({ navigation }) {
    const { width } = useWindowDimensions();
    const {
        allMusics,
        refreshing,
        getStorageMusic,
        getMusics,
    } = useContext(MusicContext);

    const filters = [
        { title: 'Todos', type: 'all', selected: true },
        { title: 'Igreja de Cristo Internacional', type: 'ICI', selected: false },
        { title: 'Coração Audaz', type: 'audaz', selected: false },
        { title: 'Kids', type: 'kids', selected: false },
        { title: 'Natal', type: 'natal', selected: false },
    ];

    const widthScreen = Math.max(width - 10, 0);
    const listRef = useRef(null);

    const [newOrder, setNewOrder] = useState('all');
    const [filterOrder] = useState(filters);
    const [music, setMusic] = useState({});
    const [refreshingManually, setRefreshingManually] = useState(false);

    useScrollToTop(listRef);

    useEffect(() => {
        if (!allMusics.length)
            getStorageMusic();
    }, [allMusics])

    useEffect(() => {
        orderList(newOrder);
    }, [newOrder, allMusics]);

    const gotToMusicText = ({ number, title, music, author, album }) => {
        const { text, audio, cifra, video } = music;

        navigation.navigate(
            'Home',
            {
                screen: 'MusicLetter',
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

    const data = {
        'sonho': require('../../assets/o_sonho.png'),
        'caminhos': require('../../assets/caminhos.png'),
        'undefined': require('../../assets/cunc.png')
    }

    const changeOrder = useCallback((order) => {
        setNewOrder(order.type);
        filterOrder.forEach((element) => {
            if (element.type === order.type) {
                element.selected = !element.selected
            } else {
                element.selected = false;
            }
        });
    }, [filterOrder])

    const orderList = (params) => {
        if (!allMusics.length) return;

        const action = {
            'all': () => {
                setMusic(
                    allMusics.filter(i => i.number)
                        .sort((a, b) => a.number - b.number)
                );
            },
            'audaz': () => {
                setMusic(
                    allMusics
                        .filter(i => i.author.includes('Audaz'))
                        .sort((a, b) => a.album.localeCompare(b.album))
                );
            },
            'ICI': () => {
                setMusic(
                    allMusics
                        .filter(i => i.author.includes('Igreja'))
                        .sort((a, b) => a.number - b.number)
                );
            },
            'kids': () => {
                setMusic(
                    allMusics
                        .filter(i => i.kids)
                        .sort((a, b) => a.number - b.number)
                );
            },
            'natal': () => {
                setMusic(
                    allMusics
                        .filter(i => i.natal)
                        .sort((a, b) => a.number - b.number)

                );
            }
        }

        action[params]();
    }

    const cachedMusics = useMemo(() => music, [music])

    const keyExtractor = (item) => item.number;

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
            <Wrapper>
                <List>
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
            </Wrapper>
        </TouchableOpacity>
    )

    const getItemCount = data => data.length;

    const getItem = (data, index) => {
        return data[index];
    }

    const filter = useCallback(() => (
        <>
            <Filter listHandler={changeOrder} filterOrder={filterOrder} />
            <MusicContentLegend />
        </>
    ), [filterOrder]);

    const onRefresh = useCallback(async () => {
        setRefreshingManually(true);
        getMusics();
        getStorageMusic();
        refreshing && setRefreshingManually(false);
    }, [refreshing, allMusics]);

    return (
        <Container>
            {allMusics.length && music.length ?
                <VirtualizedList
                    ref={listRef}
                    ListHeaderComponent={filter}
                    data={cachedMusics}
                    initialNumToRender={50}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    getItemCount={getItemCount}
                    getItem={getItem}
                    onRefresh={onRefresh}
                    refreshing={!!refreshing && refreshingManually}
                />
                :
                <LoadingIndicator />
            }
        </Container>
    );
};
