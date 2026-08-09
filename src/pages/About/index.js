import React, { useRef } from "react";
import { Linking, Pressable, ScrollView, Share } from "react-native";
import { AboutButton, Actions, BrandImage, Container, Description, VersionApp, Wrapper } from "../../style/AboutStyle";
import { OsDevice, typeDevice } from "../../utils";
import { B, ButtonTitle } from "../../../style";
import appInfo from "../../../app.json";
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import qs from 'qs';
import { useToast } from "react-native-toast-notifications";
import { APP_MAINTAINER_NAME, SUPPORT_CONTACT_EMAIL } from '../../config/legal';

export default function About({ navigation }) {
    const { show } = useToast();
    const specialPageCounter = useRef(0);

    const share = async () => {
        try {
            if (typeDevice.mobile()) {
                const linkShare =
                    'Venha e Cante Uma Nova Canção com a gente!!' +
                    `${typeDevice.Android()
                        ? '\n\n https://play.google.com/store/apps/details?id=br.org.icoc.novacancao'
                        : ''
                    }`;
                await Share.share({
                    message: linkShare,
                    url: 'https://apple.com/br',
                    title: 'Cante Uma Nova Canção'
                });
                // if (result.action === Share.sharedAction) {
                //     if (result.activityType) {
                //         // shared with activity type of result.activityType
                //     } else {
                //         // shared
                //     }
                // } else if (result.action === Share.dismissedAction) {
                //     // dismissed
                // }
                return;
            }
        } catch (error) {
            alert(error.message);
        }
    }

    const goToWebsite = async () => {
        await WebBrowser.openBrowserAsync('https://crania.ia.br/');
    }

    const goToSpecialPage = async () => {
        specialPageCounter.current += 1;

        if (specialPageCounter.current >= 10) {
            navigation.navigate('SpecialPage');
            specialPageCounter.current = 0;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const goTo = (screen) => {
        navigation.navigate(screen);
    }

    async function sendEmail() {
        try {
            const to = SUPPORT_CONTACT_EMAIL;

            const query = qs.stringify({
                subject: 'Cante Uma Nova Canção',
                body: '',
                cc: '',
                bcc: ''
            });

            let url = `mailto:${to}?${query}`;

            const canOpen = await Linking.canOpenURL(url);

            if (!canOpen) {
                show('Não foi possível abrir o seu app de email', { type: 'danger' });
                return;
            }

            return Linking.openURL(url);

        } catch (error) {
            show('Ops! Houve um erro ao abrir o seu app de email', { type: 'danger' });
        }
    }

    const actions = [
        { title: 'Compartilhe', onPress: share, hint: 'Abre as opções de compartilhamento' },
        { title: 'Conheça a CrânIA', onPress: goToWebsite, hint: 'Abre o site da CrânIA' },
        { title: 'Contato', onPress: sendEmail, hint: 'Abre seu aplicativo de email' },
        { title: 'Termos de Uso', onPress: () => goTo('TermsOfUse'), hint: 'Abre os termos de uso' },
        { title: 'Políticas de Privacidade', onPress: () => goTo('PrivacyPolicy'), hint: 'Abre a política de privacidade' },
    ];

    return (
        <Container>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <Wrapper>
                    <BrandImage
                        source={require('../../assets/top_logo.png')}
                        resizeMode="contain"
                        accessible
                        accessibilityLabel="Cante Uma Nova Canção"
                    />
                    <Description>
                        Seja bem-vindo ao app Cante Uma Nova Canção.{"\n\n"}
                        Estamos muito felizes em ter você por aqui para adorarmos juntos o nosso Deus 😊 {"\n\n"}
                        Redesenvolvido por CrânIA EcoSystem e mantido por Fábio Souza, o aplicativo preserva sua história enquanto continua evoluindo. Esperamos que você tenha uma ótima experiência e contamos com seu feedback!
                    </Description>

                    <Actions>
                        {actions.map(action => (
                            <AboutButton
                                key={action.title}
                                onPress={action.onPress}
                                accessibilityRole="button"
                                accessibilityLabel={action.title}
                                accessibilityHint={action.hint}
                                style={({ pressed }) => ({
                                    opacity: pressed ? 0.78 : 1,
                                    transform: [{ scale: pressed ? 0.99 : 1 }],
                                })}
                            >
                                <ButtonTitle>{action.title}</ButtonTitle>
                            </AboutButton>
                        ))}
                    </Actions>

                    <Pressable
                        onLongPress={goToSpecialPage}
                        accessibilityRole="text"
                        accessibilityLabel={`Versão ${appInfo.expo.version}. Redesenvolvido por CrânIA EcoSystem. Mantido por ${APP_MAINTAINER_NAME}.`}
                    >
                        <VersionApp>
                            Versão: <B>{appInfo.expo.version}</B> {"\n"}
                            OS: <B>{OsDevice()}</B>{"\n"}
                            Redesenvolvido por: <B>CrânIA EcoSystem</B>{"\n"}
                            Mantido por: <B>{APP_MAINTAINER_NAME}</B>{"\n"}
                            Site: <B>crania.ia.br</B>
                            {/* <Text style={{fontSize: 30}}>🎧</Text> */}
                        </VersionApp>
                    </Pressable>
                </Wrapper>
            </ScrollView >
        </Container>
    );
}
