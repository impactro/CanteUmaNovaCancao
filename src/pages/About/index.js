import React from "react";
import { Image, Linking, Pressable, ScrollView, Share, View } from "react-native";
import { AboutButton, Container, Description, VersionApp, Wrapper } from "../../style/AboutStyle";
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
    let counter = 0;

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
        await WebBrowser.openBrowserAsync('https://www.icisp.org.br/');
    }

    const goToSpecialPage = async () => {
        counter++;

        if (counter >= 10) {
            navigation.navigate('SpecialPage');
            counter = 0;
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

    return (
        <Container>
            <ScrollView>
                <Wrapper>
                    <Image
                        style={{ width: 200, height: 200 }}
                        source={require('../../assets/top_logo.png')}
                    />
                    <Description>
                        Seja bem-vindo ao app Cante Uma Nova Canção.{"\n\n"}
                        Estamos muito felizes em ter você por aqui para adorarmos juntos o nosso Deus 😊 {"\n\n"}
                        Esperamos que tenha uma ótima experiência com nosso app! E para que possamos continuar melhorando e evoluindo contamos com seu feedback!
                    </Description>

                    <View>
                        <AboutButton style={
                            ({ pressed }) => [
                                {
                                    backgroundColor: pressed
                                        ? '#24b1ec'
                                        : '#0B97D3'
                                }
                            ]
                        }
                            onPress={() => share()}
                        >
                            <ButtonTitle>Compartilhe</ButtonTitle>
                        </AboutButton>

                        <AboutButton style={
                            ({ pressed }) => [
                                {
                                    backgroundColor: pressed
                                        ? '#24b1ec'
                                        : '#0B97D3'
                                }
                            ]
                        }
                            onPress={() => goToWebsite()}
                        >
                            <ButtonTitle>Visite nossa Igreja</ButtonTitle>
                        </AboutButton>

                        <AboutButton style={
                            ({ pressed }) => [
                                {
                                    backgroundColor: pressed
                                        ? '#24b1ec'
                                        : '#0B97D3'
                                }
                            ]
                        } onPress={() => sendEmail()}>
                            <ButtonTitle>Contato</ButtonTitle>
                        </AboutButton>

                        <AboutButton style={
                            ({ pressed }) => [
                                {
                                    backgroundColor: pressed
                                        ? '#24b1ec'
                                        : '#0B97D3'
                                }
                            ]
                        } onPress={() => goTo('TermsOfUse')}>
                            <ButtonTitle>Termos de Uso</ButtonTitle>
                        </AboutButton>
                        <AboutButton style={
                            ({ pressed }) => [
                                {
                                    backgroundColor: pressed
                                        ? '#24b1ec'
                                        : '#0B97D3'
                                }
                            ]
                        } onPress={() => goTo('PrivacyPolicy')}>
                            <ButtonTitle>Políticas de Privacidade</ButtonTitle>
                        </AboutButton>
                    </View>

                    <Pressable onLongPress={() => goToSpecialPage()}
                        style={
                            ({ pressed }) => [
                                {
                                    backgroundColor: pressed &&
                                        '#00000000'
                                }
                            ]
                        }
                    >
                        <VersionApp>
                            Versão: <B>{appInfo.expo.version}</B> {"\n"}
                            OS: <B>{OsDevice()}</B>{"\n"}
                            Manutenção: <B>{APP_MAINTAINER_NAME}</B>
                            {/* <Text style={{fontSize: 30}}>🎧</Text> */}
                        </VersionApp>
                    </Pressable>
                </Wrapper>
            </ScrollView >
        </Container>
    );
}
