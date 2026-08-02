import React, { useContext, useEffect, useState } from "react";
import { Alert, FlatList, Keyboard, Pressable, Text, TouchableOpacity, View } from "react-native";
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from "../../style/RecentSearchesStyles";
import themes from "../../style/themes";
import SearchesContext from "../../contexts/search";
import { useToast } from "react-native-toast-notifications";

export default function RecentSearches({ searchForRecent }) {
    const { show } = useToast();

    const {
        recentSearches,
        deleteAllSearch,
        deleteSearchById,
    } = useContext(SearchesContext);

    const [isOpenKeyboard, setIsOpenKeyboard] = useState(false);

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            setIsOpenKeyboard(true);
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setIsOpenKeyboard(false);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    const hideKeyboard = () => {
        if (isOpenKeyboard) Keyboard.dismiss();
    }

    const clearAllRecentResearches = async () => {
        deleteAllSearch();

        show('As buscas recentes foram removidas', { type: 'success' });
    }

    const clearSelectedRecentResearches = async (idSearch) => {
        deleteSearchById(idSearch);
    }

    const confirmClean = () => {
        Alert.alert(
            'Atenção!',
            'Você tem certeza que deseja limpar todas as Buscas recentes ?',
            [
                {
                    text: 'Limpar',
                    onPress: () => {
                        clearAllRecentResearches();
                    }
                },
                {
                    text: 'Cancelar',
                    style: 'cancel'
                }
            ]
        );
    }

    const renderItem = ({ item, separators }) => {
        return (
            <TouchableOpacity
                key={item.id}
                onPress={() => searchForRecent(item.search)}
                onShowUnderlay={separators.highlight}
                onHideUnderlay={separators.unhighlight}
                activeOpacity={0.4}
            >
                <View style={[styles.container]}>
                    <View style={[styles.wrapperButton]}>
                        <MaterialCommunityIcons name="clock-time-nine" size={16} color="#FFFFFFA1" />
                        <Text style={[styles.textButton]}>{item.search}</Text>
                    </View>
                    <Pressable onPress={() => clearSelectedRecentResearches(item.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`Remover busca ${item.search}`}
                        style={{ padding: 5 }}>
                        <AntDesign name="close" size={16} color="#FFFFFFA1" />
                    </Pressable>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={[styles.header]}>
                <Text style={[styles.titleHeader]}> Buscas recentes </Text>
                <Pressable onPress={confirmClean} accessibilityRole="button" accessibilityLabel="Limpar buscas recentes">
                    <Text
                        style={[styles.titleHeader, {
                            color: themes.dark.colors.primary, fontSize: 15
                        }]}
                    >
                        Limpar
                    </Text>
                </Pressable>
            </View>
            <FlatList
                data={recentSearches}
                renderItem={renderItem}
                keyExtractor={item => String(item.id)}
                onScrollBeginDrag={hideKeyboard}
                onTouchStart={hideKeyboard}
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}
