import {
    getAnalytics,
    logEvent,
    logScreenView
} from '@react-native-firebase/analytics';
import catalog from '../utils/mockMusicData.json';

export const ANALYTICS_STREAM_ID = '2088146498';

const SCREEN_NAMES = Object.freeze({
    Music: 'music_list',
    MusicLetter: 'music_lyrics',
    MusicLetterSearch: 'music_lyrics',
    CipherStack: 'cipher_list',
    MusicCipher: 'music_cipher',
    MusicCipherInHome: 'music_cipher',
    SearchStack: 'search',
    AboutStack: 'about',
    TermsOfUse: 'terms_of_use',
    PrivacyPolicy: 'privacy_policy',
    SpecialPage: 'special',
});

function analyticsInstance() {
    return getAnalytics();
}

function reportAnalyticsError(context, error) {
    console.warn(`Analytics ignorado em ${context}:`, error?.message || error);
}

export async function trackScreenRoute(routeName) {
    const screenName = SCREEN_NAMES[routeName];

    if (!screenName) {
        return;
    }

    try {
        await logScreenView(analyticsInstance(), {
            screen_name: screenName,
            screen_class: screenName,
        });
    } catch (error) {
        reportAnalyticsError('screen_view', error);
    }
}

export async function trackMusicPlay(musicId) {
    const numericMusicId = Number(musicId);
    const track = catalog.find(item => item.number === numericMusicId);

    if (!track) {
        return;
    }

    try {
        await logEvent(analyticsInstance(), 'music_play', {
            music_id: String(track.number),
            music_title: track.title,
        });
    } catch (error) {
        reportAnalyticsError('music_play', error);
    }
}

export { SCREEN_NAMES };
