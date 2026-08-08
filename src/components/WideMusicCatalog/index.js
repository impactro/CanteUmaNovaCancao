import React, { useContext, useMemo, useRef } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    VirtualizedList
} from 'react-native';
import { useScrollToTop } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MusicContext from '../../contexts/music';
import MusicContentIndicators from '../MusicContentIndicators';
import musicContentCore from '../../service/musicContentCore.cjs';
import themes from '../../style/themes';
import { formatNameMusic } from '../../utils';

const images = {
    sonho: require('../../assets/o_sonho.png'),
    caminhos: require('../../assets/caminhos.png'),
    undefined: require('../../assets/cunc.png')
};

export default function WideMusicCatalog({ onSelect, selectedNumber }) {
    const { allMusics } = useContext(MusicContext);
    const listRef = useRef(null);
    useScrollToTop(listRef);

    const catalog = useMemo(() => (
        [...allMusics]
            .filter(item => item.number)
            .sort((left, right) => left.number - right.number)
    ), [allMusics]);

    const renderItem = ({ item }) => {
        const selected = item.number === selectedNumber;

        return (
            <TouchableOpacity
                onPress={() => onSelect(item)}
                activeOpacity={0.55}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Abrir ${formatNameMusic(item)}. ${musicContentCore.getAccessibilityLabel(item.music)}`}
                accessibilityHint="Mostra a música na área principal"
            >
                <View style={[styles.item, selected && styles.selectedItem]}>
                    <Image source={images[item.album]} style={styles.cover} />
                    <View style={styles.description}>
                        <Text style={styles.title} numberOfLines={1}>
                            {formatNameMusic(item)}
                        </Text>
                        <Text style={styles.author} numberOfLines={1}>
                            {item.author}
                        </Text>
                        <MusicContentIndicators music={item.music} />
                    </View>
                    {selected && (
                        <Ionicons
                            name="chevron-forward"
                            size={18}
                            color={themes.dark.colors.primary}
                            accessibilityElementsHidden
                        />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading} accessibilityRole="header">
                Catálogo
            </Text>
            <VirtualizedList
                ref={listRef}
                data={catalog}
                initialNumToRender={25}
                renderItem={renderItem}
                getItemCount={data => data.length}
                getItem={(data, index) => data[index]}
                keyExtractor={item => String(item.number)}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themes.dark.colors.card,
        borderRightColor: themes.dark.colors.primary + '35',
        borderRightWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 8,
        paddingTop: 8
    },
    heading: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        paddingHorizontal: 8
    },
    item: {
        alignItems: 'center',
        borderRadius: 8,
        flexDirection: 'row',
        minHeight: 72,
        paddingHorizontal: 8,
        paddingVertical: 7
    },
    selectedItem: {
        backgroundColor: themes.dark.colors.primary + '22',
        borderColor: themes.dark.colors.primary + '70',
        borderWidth: 1
    },
    cover: {
        borderRadius: 7,
        height: 44,
        marginRight: 9,
        width: 44
    },
    description: {
        flex: 1,
        gap: 2,
        minWidth: 0
    },
    title: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600'
    },
    author: {
        color: themes.dark.colors.primary,
        fontSize: 12
    }
});
