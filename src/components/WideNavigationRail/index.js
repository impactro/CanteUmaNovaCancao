import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import adaptiveLayoutCore from '../../service/adaptiveLayoutCore.cjs';
import themes from '../../style/themes';

const icons = {
    Home: ['musical-notes-outline', 'musical-notes'],
    Cipher: ['book-outline', 'book'],
    Search: ['search-outline', 'search'],
    About: ['menu-outline', 'menu']
};

export default function WideNavigationRail({ state, descriptors, navigation }) {
    const insets = useSafeAreaInsets();

    return (
        <View
            accessibilityRole="tablist"
            style={[
                styles.container,
                {
                    paddingBottom: Math.max(insets.bottom, 8),
                    paddingTop: Math.max(insets.top, 8)
                }
            ]}
        >
            {state.routes.map((route, index) => {
                const focused = state.index === index;
                const options = descriptors[route.key].options;
                const label = options.tabBarLabel ?? options.title ?? route.name;
                const iconName = icons[route.name]?.[focused ? 1 : 0] ?? 'ellipse-outline';

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true
                    });

                    if (!focused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => navigation.emit({
                    type: 'tabLongPress',
                    target: route.key
                });

                return (
                    <Pressable
                        key={route.key}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: focused }}
                        accessibilityLabel={options.tabBarAccessibilityLabel ?? String(label)}
                        style={({ pressed }) => [
                            styles.item,
                            focused && styles.focusedItem,
                            pressed && styles.pressedItem
                        ]}
                    >
                        <Ionicons
                            name={iconName}
                            size={25}
                            color={focused ? themes.dark.colors.primary : 'gray'}
                        />
                        <Text
                            numberOfLines={1}
                            style={[styles.label, focused && styles.focusedLabel]}
                        >
                            {label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'stretch',
        backgroundColor: themes.dark.colors.card,
        borderRightColor: '#FFFFFF18',
        borderRightWidth: StyleSheet.hairlineWidth,
        bottom: 0,
        justifyContent: 'center',
        left: 0,
        position: 'absolute',
        top: 0,
        width: adaptiveLayoutCore.NAVIGATION_RAIL_WIDTH,
        zIndex: 20
    },
    item: {
        alignItems: 'center',
        borderRadius: 10,
        justifyContent: 'center',
        marginHorizontal: 8,
        marginVertical: 4,
        minHeight: 68,
        paddingHorizontal: 4,
        paddingVertical: 7
    },
    focusedItem: {
        backgroundColor: themes.dark.colors.primary + '18'
    },
    pressedItem: {
        opacity: 0.65
    },
    label: {
        color: 'gray',
        fontSize: 11,
        marginTop: 4
    },
    focusedLabel: {
        color: themes.dark.colors.primary,
        fontWeight: '600'
    }
});
