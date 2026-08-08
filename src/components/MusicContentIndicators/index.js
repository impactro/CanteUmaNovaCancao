import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styled, { useTheme } from 'styled-components/native';
import musicContentCore from '../../service/musicContentCore.cjs';

const ICONS = {
    audio: 'music-note',
    lyrics: 'text-box-outline',
    cipher: 'music-clef-treble',
    link: 'link-variant'
};

const IndicatorRow = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
`;

const Indicator = styled.View`
    width: 22px;
    height: 22px;
    border-radius: 11px;
    align-items: center;
    justify-content: center;
    background-color: ${({ theme }) => theme.background};
`;

const Legend = styled.View`
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 3px 10px 5px;
`;

const LegendItem = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 3px;
`;

const LegendText = styled.Text`
    color: ${({ theme }) => theme.color};
    font-size: 11px;
`;

export default function MusicContentIndicators({ music }) {
    const theme = useTheme();
    const availableContent = musicContentCore.getAvailableContent(music);

    if (!availableContent.length) {
        return null;
    }

    return (
        <IndicatorRow accessibilityLabel={musicContentCore.getAccessibilityLabel(music)}>
            {availableContent.map(({ key, label }) => (
                <Indicator
                    key={key}
                    accessible
                    accessibilityRole="image"
                    accessibilityLabel={label}
                >
                    <MaterialCommunityIcons
                        accessible={false}
                        name={ICONS[key]}
                        size={15}
                        color={theme.colors.primary}
                    />
                </Indicator>
            ))}
        </IndicatorRow>
    );
}

export function MusicContentLegend() {
    const theme = useTheme();

    return (
        <Legend accessibilityLabel="Legenda dos conteúdos disponíveis">
            {musicContentCore.CONTENT_DEFINITIONS.map(({ key, label }) => (
                <LegendItem key={key} accessible accessibilityLabel={label}>
                    <MaterialCommunityIcons
                        accessible={false}
                        name={ICONS[key]}
                        size={13}
                        color={theme.colors.primary}
                    />
                    <LegendText>{label}</LegendText>
                </LegendItem>
            ))}
        </Legend>
    );
}
