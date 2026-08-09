import React, { useRef } from 'react';
import { FlatList } from 'react-native';
import { Container, FilterButton, FilterContainer, TextButton } from '../../style/FilterStyle';

export default function Filter({ listHandler, filterOrder }) {
    const flatListRef = useRef(null);

    const renderItem = ({ item, separators, index }) => {
        const pressed = () => {
            listHandler(item);

            flatListRef.current?.scrollToIndex({
                animated: true,
                index: index,
                viewOffset: 1,
                viewPosition: 0.5
            });
        }

        return <FilterContainer>
            <FilterButton
                selected={item.selected}
                onPress={pressed}
                accessibilityRole="button"
                accessibilityLabel={`Filtrar por ${item.title}`}
                accessibilityState={{ selected: item.selected }}
                hitSlop={4}
                style={({ pressed: isPressed }) => ({ opacity: isPressed ? 0.72 : 1 })}
            >
                <TextButton selected={item.selected}>
                    {item.title}
                </TextButton>
            </FilterButton>
        </FilterContainer>
    }

    return (
        <Container>
            <FlatList
                ref={flatListRef}
                data={filterOrder}
                horizontal
                renderItem={renderItem}
                keyExtractor={item => item.type}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 2 }}
                onScrollToIndexFailed={({ index }) => {
                    flatListRef.current?.scrollToOffset({
                        animated: true,
                        offset: Math.max(index * 72, 0),
                    });
                }}
            />
        </Container>
    );
}
