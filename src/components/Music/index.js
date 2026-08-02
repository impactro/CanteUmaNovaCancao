import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Image,
    Linking,
    Pressable,
    ScrollView,
    Share,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Entypo, Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Modalize } from 'react-native-modalize';
import {
    setAudioModeAsync,
    useAudioPlayer,
    useAudioPlayerStatus
} from 'expo-audio';
import { Wrapper } from '../../../style';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Slider from '@react-native-community/slider';
import themes from '../../style/themes';
import {
    AuthorMusic,
    AuthorMusicMiniPlayer,
    Container,
    ContainerMiniPlayer,
    ContainerModal,
    ContentHeader,
    ContentMusicName,
    MusicControl,
    MusicLetter,
    MusicName,
    MusicNameMiniPlayer,
    ProgressConstainer,
    ProgressNummber,
    Time,
    WarpperMiniPlayer,
    WrapperMusicName,
    style
} from '../../style/MusicStyle';
import { useToast } from 'react-native-toast-notifications';
import { typeDevice } from '../../utils';
import {
    downloadAudio as downloadAudioToDevice,
    getCachedAudioUri,
    removeDownloadedAudio
} from '../../service/audioCache';
import audioCatalog from '../../service/audioCatalog.cjs';
import { trackMusicPlay } from '../../service/analytics';
import musicPlayAnalyticsCore from '../../service/musicPlayAnalyticsCore.cjs';
import qs from 'qs';
import { SUPPORT_CONTACT_EMAIL } from '../../config/legal';

export default function Music({ route, navigation }) {
    const {
        musicTxt,
        audio,
        author,
        musicTitle,
        image,
        isCipher,
        cipher,
        isVideo,
        linkVideo,
        numMusic
    } = route.params;

    const { show } = useToast();
    const modalizeRef = useRef(null);
    const menuModalRef = useRef(null);
    const wasPlayingBeforeSeek = useRef(false);
    const musicPlayTracker = useRef(
        new musicPlayAnalyticsCore.MusicPlayExecutionTracker()
    );
    const player = useAudioPlayer(null, { updateInterval: 500 });
    const playerStatus = useAudioPlayerStatus(player);

    const [positionModal, setPositionModal] = useState('');
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [sourceUri, setSourceUri] = useState(null);

    const data = {
        'sonho': require('../../assets/o_sonho.png'),
        'caminhos': require('../../assets/caminhos.png'),
        'undefined': require('../../assets/cunc.png')
    };

    const audioSource = useMemo(() => {
        try {
            if (!audio) {
                return null;
            }

            const path = audioCatalog.normalizeAudioPath(audio);
            return {
                path,
                remoteUri: audioCatalog.resolveAudioUrl(path)
            };
        } catch (error) {
            console.warn('Referência de áudio ignorada:', error.message);
            return null;
        }
    }, [audio]);

    const lockScreenMetadata = useMemo(() => ({
        title: musicTitle,
        artist: author,
        albumTitle: 'Cante uma Nova Canção'
    }), [author, musicTitle]);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable
                    onPress={() => menuModalRef.current?.open()}
                    android_disableSound
                >
                    <View style={[style.headerContainer]}>
                        <View style={[style.headerButton]}>
                            <Entypo name="dots-three-horizontal" size={15} color="#FFF" />
                        </View>
                    </View>
                </Pressable>
            ),
        });
    }, [navigation]);

    useEffect(() => {
        let active = true;

        const prepareAudio = async () => {
            if (!audioSource) {
                return;
            }

            await setAudioModeAsync({
                playsInSilentMode: true,
                shouldPlayInBackground: true,
                interruptionMode: 'doNotMix',
                shouldRouteThroughEarpiece: false
            });

            const localUri = getCachedAudioUri(audioSource.path);
            const nextUri = localUri || audioSource.remoteUri;

            if (!active) {
                return;
            }

            setIsDownloaded(Boolean(localUri));
            setSourceUri(nextUri);
            musicPlayTracker.current.sourceChanged();
            player.replace(nextUri);
        };

        prepareAudio().catch(error => {
            console.error('Não foi possível preparar o áudio:', error);
            show('Não foi possível carregar a música', { type: 'danger' });
        });

        return () => {
            active = false;
            player.clearLockScreenControls();
        };
    }, [audioSource, player, show]);

    const progress = playerStatus.currentTime || 0;
    const duration = playerStatus.duration || 0;
    const typeIcon = playerStatus.playing ? 'pause' : 'play';

    useEffect(() => {
        if (
            playerStatus.playing &&
            musicPlayTracker.current.playbackStarted()
        ) {
            trackMusicPlay(numMusic);
        }
    }, [numMusic, playerStatus.playing]);

    useEffect(() => {
        if (playerStatus.didJustFinish) {
            musicPlayTracker.current.playbackFinished();
        }
    }, [playerStatus.didJustFinish]);

    const activateLockScreenControls = () => {
        player.setActiveForLockScreen(
            true,
            lockScreenMetadata,
            {
                showSeekBackward: true,
                showSeekForward: true
            }
        );
    };

    const playOrPause = async () => {
        if (!audioSource || !sourceUri) {
            show('Esta música não possui áudio disponível', { type: 'warning' });
            return;
        }

        if (playerStatus.playing) {
            player.pause();
            musicPlayTracker.current.playbackPaused();
            return;
        }

        if (duration > 0 && progress >= duration) {
            await player.seekTo(0);
        }

        musicPlayTracker.current.intentToPlay(playerStatus);
        activateLockScreenControls();
        player.play();
    };

    const forwardButton = async () => {
        const nextPosition = duration
            ? Math.min(progress + 10, duration)
            : progress + 10;

        await player.seekTo(nextPosition);
    };

    const backwardButton = async () => {
        await player.seekTo(Math.max(progress - 10, 0));
    };

    const advancedMusic = async ({ status, value }) => {
        if (status === 'start') {
            wasPlayingBeforeSeek.current = playerStatus.playing;
            player.pause();
            musicPlayTracker.current.playbackPaused();
            return;
        }

        await player.seekTo(value);
        musicPlayTracker.current.playbackSeeked(value);

        if (wasPlayingBeforeSeek.current) {
            musicPlayTracker.current.intentToPlay({
                ...playerStatus,
                currentTime: value
            });
            activateLockScreenControls();
            player.play();
        }
    };

    const formatTime = value => {
        const safeValue = Number.isFinite(value) ? value : 0;
        const minutes = Math.floor(safeValue / 60);
        const seconds = Math.floor(safeValue % 60);

        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const ProgressBar = ({ currentProgress = 0, totalDuration = 0 }) => {
        const musicPercent = totalDuration > 0
            ? Math.min((currentProgress / totalDuration) * 100, 100)
            : 0;

        return (
            <View style={style.container}>
                <View style={[style.progress, { width: `${musicPercent}%` }]} />
            </View>
        );
    };

    const copyText = () => {
        const copyMusic = `${musicTitle}\n${author}\n\n${musicTxt}`;

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
            'Deseja copiar?',
            `Você quer copiar a música ${musicTitle} - ${author}?`,
            [
                {
                    text: 'Copiar',
                    onPress: async () => Clipboard.setStringAsync(copyMusic)
                },
                {
                    text: 'Cancelar',
                    style: 'cancel'
                }
            ]
        );
    };

    const goToVideo = () => Linking.openURL(linkVideo);

    const sharingMusic = async () => {
        try {
            let linkShare = `${musicTitle}\n${author}\n\n${musicTxt}`;

            if (typeDevice.Android()) {
                linkShare += '\n\nhttps://play.google.com/store/apps/details?id=br.org.icoc.novacancao';
            }

            await Share.share({
                message: linkShare,
                url: 'https://apple.com/br',
                title: 'Cante Uma Nova Canção'
            });
        } catch (error) {
            show('Não foi possível compartilhar a música', { type: 'danger' });
        }
    };

    const goToCipher = () => {
        navigation.navigate(
            'Home',
            {
                screen: 'MusicCipherInHome',
                params: {
                    numMusic,
                    musicTitle,
                    author,
                    cipher
                },
            }
        );
    };

    const submitProblemfound = async () => {
        try {
            const to = SUPPORT_CONTACT_EMAIL;
            const subject = 'Quero relatar um problema';
            const body = `Olá, \n\nVi um erro na música ${musicTitle} do autor ${author}! \n\n\nRelate o problema aqui ...`;
            const query = qs.stringify({ subject, body, cc: '', bcc: '' });
            const url = `mailto:${to}?${query}`;
            const canOpen = await Linking.canOpenURL(url);

            if (!canOpen) {
                show('Não foi possível abrir o seu app de email', { type: 'danger' });
                return;
            }

            return Linking.openURL(url);
        } catch (error) {
            show('Ops! Houve um erro ao abrir o seu app de email', { type: 'danger' });
        }
    };

    const downloadCurrentAudio = async () => {
        if (!audioSource || isDownloading) {
            return;
        }

        setIsDownloading(true);
        show('Baixando áudio...', { type: 'normal' });

        try {
            player.pause();
            const localUri = await downloadAudioToDevice(audioSource.path);

            setSourceUri(localUri);
            setIsDownloaded(true);
            musicPlayTracker.current.sourceChanged();
            player.replace(localUri);
            show('Áudio disponível para ouvir offline', { type: 'success' });
        } catch (error) {
            console.error('Não foi possível baixar o áudio:', error);
            show('Falha ao baixar o áudio. Tente novamente.', { type: 'danger' });
        } finally {
            setIsDownloading(false);
        }
    };

    const removeCurrentDownload = () => {
        if (!audioSource || isDownloading) {
            return;
        }

        Alert.alert(
            'Remover download?',
            `O áudio de ${musicTitle} voltará a depender da internet.`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            player.pause();
                            await removeDownloadedAudio(audioSource.path);
                            setSourceUri(audioSource.remoteUri);
                            setIsDownloaded(false);
                            musicPlayTracker.current.sourceChanged();
                            player.replace(audioSource.remoteUri);
                            show('Download removido', { type: 'success' });
                        } catch (error) {
                            console.error('Não foi possível remover o download:', error);
                            show('Não foi possível remover o download', { type: 'danger' });
                        }
                    }
                }
            ]
        );
    };

    const dataList = useMemo(() => {
        const list = [
            { id: 1, label: 'Compartilhar', visible: true, icon: 'share', action: sharingMusic },
            {
                id: 3,
                label: 'Ver no YouTube',
                icon: 'logo-youtube',
                visible: Boolean(isVideo),
                action: goToVideo
            },
            {
                id: 4,
                label: 'Ir para cifra',
                icon: 'open',
                visible: Boolean(isCipher),
                action: goToCipher
            },
            {
                id: 5,
                label: 'Relatar um problema',
                icon: 'alert-circle',
                visible: true,
                action: submitProblemfound
            },
        ];

        if (audioSource) {
            list.splice(1, 0, {
                id: 2,
                label: isDownloading
                    ? 'Baixando áudio...'
                    : isDownloaded
                        ? `Remover download - ${musicTitle}`
                        : `Baixar - ${musicTitle}`,
                icon: isDownloaded ? 'trash-outline' : 'download',
                visible: true,
                disabled: isDownloading,
                action: isDownloaded ? removeCurrentDownload : downloadCurrentAudio
            });
        }

        return list;
    }, [
        audioSource,
        isCipher,
        isDownloaded,
        isDownloading,
        isVideo,
        musicTitle
    ]);

    const renderItem = ({ item, separators }) => {
        if (!item.visible) {
            return null;
        }

        return (
            <View>
                <TouchableOpacity
                    key={item.id}
                    onPress={item.action}
                    onShowUnderlay={separators.highlight}
                    onHideUnderlay={separators.unhighlight}
                    activeOpacity={0.4}
                    style={{ width: '100%', opacity: item.disabled ? 0.5 : 1 }}
                    disabled={item.disabled}
                >
                    <View style={[style.modalButtons]}>
                        <View style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <Ionicons name={item.icon} size={20} color="#FFF" />
                            <Text style={[style.textButton]} numberOfLines={1}>
                                {item.label}
                            </Text>
                        </View>
                        <MaterialIcons
                            name="keyboard-arrow-right"
                            size={20}
                            color={themes.dark.colors.primary + '90'}
                        />
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    const renderSeparator = ({ leadingItem }) => (
        leadingItem?.visible ? <View style={[style.separator]} /> : null
    );

    return (
        <Wrapper>
            <ScrollView>
                <Container>
                    <MusicLetter onLongPress={copyText} suppressHighlighting>
                        {musicTxt}
                    </MusicLetter>
                </Container>
            </ScrollView>

            <Modalize
                ref={menuModalRef}
                onOpen={() => {
                    setPositionModal('initial');
                    modalizeRef.current?.close();
                }}
                onClose={() => modalizeRef.current?.open()}
                threshold={50}
                handlePosition="inside"
                adjustToContentHeight
                handleStyle={{ backgroundColor: '#FFFFFF25' }}
                modalStyle={{ backgroundColor: themes.dark.colors.card }}
                flatListProps={{
                    data: dataList,
                    renderItem,
                    ItemSeparatorComponent: renderSeparator,
                    keyExtractor: item => String(item.id),
                }}
            />

            {audioSource && playerStatus.isLoaded &&
                <Modalize
                    ref={modalizeRef}
                    alwaysOpen={60}
                    modalHeight={445}
                    avoidKeyboardLikeIOS
                    velocity={100}
                    threshold={200}
                    handlePosition="inside"
                    withHandle={positionModal === 'top'}
                    withOverlay={false}
                    disableScrollIfPossible
                    tapGestureEnabled
                    useNativeDriver
                    onPositionChange={setPositionModal}
                    scrollViewProps={{
                        scrollEnabled: false,
                        showsVerticalScrollIndicator: false
                    }}
                    modalStyle={{
                        backgroundColor: themes.dark.colors.card,
                        padding: positionModal === 'top' ? 30 : 10,
                    }}
                    handleStyle={{ backgroundColor: 'gray' }}
                    HeaderComponent={
                        positionModal !== 'top' &&
                        <ContainerMiniPlayer>
                            <WarpperMiniPlayer>
                                <Pressable
                                    onPress={() => {
                                        setPositionModal('top');
                                        modalizeRef.current?.open('top');
                                    }}
                                    style={{ width: '85%' }}
                                >
                                    <ContentMusicName>
                                        <Image
                                            style={{ width: 40, height: 40, borderRadius: 8 }}
                                            source={data[image]}
                                        />
                                        <WrapperMusicName>
                                            <MusicNameMiniPlayer numberOfLines={1}>
                                                {musicTitle}
                                            </MusicNameMiniPlayer>
                                            <AuthorMusicMiniPlayer>
                                                {author}
                                            </AuthorMusicMiniPlayer>
                                        </WrapperMusicName>
                                    </ContentMusicName>
                                </Pressable>
                                <TouchableOpacity onPress={playOrPause} style={style.playOrPause}>
                                    <FontAwesome5 name={typeIcon} size={20} color="#fff" />
                                </TouchableOpacity>
                            </WarpperMiniPlayer>
                            <ProgressBar
                                currentProgress={progress}
                                totalDuration={duration}
                            />
                        </ContainerMiniPlayer>
                    }
                >
                    {positionModal === 'top' &&
                        <ContainerModal>
                            <Image
                                style={{ width: 200, height: 200, borderRadius: 8 }}
                                source={data[image]}
                            />
                            <ContentHeader>
                                <MusicName numberOfLines={1}>
                                    {musicTitle}
                                </MusicName>
                                <AuthorMusic>
                                    {author}
                                </AuthorMusic>
                            </ContentHeader>

                            <ProgressConstainer>
                                <View>
                                    <Slider
                                        value={progress}
                                        minimumValue={0}
                                        maximumValue={duration || 1}
                                        maximumTrackTintColor="#FFFFFF50"
                                        minimumTrackTintColor={themes.dark.colors.primary}
                                        thumbTintColor={themes.dark.colors.primary}
                                        onSlidingStart={value => advancedMusic({ status: 'start', value })}
                                        onSlidingComplete={value => advancedMusic({ status: 'completed', value })}
                                    />
                                </View>

                                <ProgressNummber>
                                    <Time> {formatTime(progress)} </Time>
                                    <Time> {formatTime(duration)} </Time>
                                </ProgressNummber>

                                <MusicControl>
                                    <TouchableOpacity onPress={backwardButton}>
                                        <MaterialIcons name="replay-10" size={40} color="#FFF" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={playOrPause}
                                        style={[
                                            style.playAndPause,
                                            { paddingLeft: typeIcon === 'play' ? 3.5 : 0 }
                                        ]}
                                    >
                                        <FontAwesome5 name={typeIcon} size={23} color="#fff" />
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={forwardButton}>
                                        <MaterialIcons name="forward-10" size={40} color="#FFF" />
                                    </TouchableOpacity>
                                </MusicControl>
                            </ProgressConstainer>
                        </ContainerModal>
                    }
                </Modalize>
            }
        </Wrapper>
    );
}
