import React, { useContext, useEffect, useRef } from 'react';
import Lyrics from '../pages/Lyrics';
import Cipher from '../pages/Cipher';
import Search from '../pages/Search';
import About from '../pages/About';
import Music from '../components/Music';
import themes from '../style/themes';
import MusicCipher from '../components/MusicCipher';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from 'styled-components/native';
import { Dimensions } from 'react-native';
import { typeDevice } from '../utils';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Wrapper } from '../../style';
import * as NavigationBar from 'expo-navigation-bar';
import MusicContext from '../contexts/music';
import ConnectionContext from '../contexts/connection';
import TermsOfUse from '../components/TermsOfUse';
import PrivacyPolicy from '../components/PrivacyPolicy';
import SpecialPage from '../components/SpecialPage';
import { trackScreenRoute } from '../service/analytics';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
    return (
        <Wrapper>
            <Lyrics navigation={navigation} />
        </Wrapper>
    );
}

function CipherScreen({ navigation }) {
    return (
        <Wrapper>
            <Cipher navigation={navigation} />
        </Wrapper >
    );
}

function SearchScreen({ navigation }) {
    return (
        <Wrapper>
            <Search navigation={navigation} />
        </Wrapper>
    );
}

function AboutScreen({ navigation }) {
    return (
        <Wrapper>
            <About navigation={navigation} />
        </Wrapper>
    );
}

function HomeStackMusic({ route }) {
    const widthScreen = Dimensions.get('window').width - 100;

    return (
        <Stack.Navigator screenOptions={{ headerShown: true }}>
            <Stack.Screen
                name="Music"
                component={HomeScreen}
                options={
                    {
                        title: 'Música',
                        headerTitleAlign: 'center'
                    }
                }
            />
            <Stack.Screen
                name="MusicLetter"
                component={Music}
                options={
                    {
                        title: route.params?.params.musicTitle,
                        headerBackTitleVisible: false,
                        headerTitleAlign: 'center',
                        headerTitleStyle: {
                            maxWidth: widthScreen,
                        }
                    }
                }
            />
            <Stack.Screen
                name="MusicCipherInHome"
                component={MusicCipher}
                options={
                    {
                        title: route.params?.params.musicTitle,
                        headerBackTitleVisible: false,
                        headerTitleAlign: 'center',
                        presentation: 'modal'
                    }
                }
            />
        </Stack.Navigator>
    );
}

function SearchScreenStack({ route }) {
    const widthScreen = Dimensions.get('window').width - 100;

    return (
        <Stack.Navigator screenOptions={{ headerShown: true }}>
            <Stack.Screen
                name="SearchStack"
                component={SearchScreen}
                options={
                    {
                        title: 'Buscar',
                        headerTitleAlign: 'center'
                    }
                }
            />
            <Stack.Screen
                name="MusicLetterSearch"
                component={Music}
                options={
                    {
                        title: route.params?.params.musicTitle,
                        headerBackTitleVisible: false,
                        headerTitleAlign: 'center',
                        headerTitleStyle: {
                            width: widthScreen,
                            textAlign: 'center',
                            alignSelf: 'center',
                        }
                    }
                }
            />
        </Stack.Navigator>
    );
}

function CipherScreenStack({ route }) {
    const widthScreen = Dimensions.get('window').width - 100;

    return (
        <Stack.Navigator screenOptions={{ headerShown: true }}>
            <Stack.Screen
                name="CipherStack"
                component={CipherScreen}
                options={
                    {
                        title: 'Cifras',
                        headerTitleAlign: 'center'
                    }
                }
            />
            <Stack.Screen
                name="MusicCipher"
                component={MusicCipher}
                options={
                    {
                        title: route.params?.params.musicTitle,
                        headerBackTitleVisible: false,
                        headerTitleAlign: 'center',
                        headerTitleStyle: {
                            width: widthScreen,
                            textAlign: 'center',
                            alignSelf: 'center',
                        }
                    }
                }
            />
        </Stack.Navigator>
    );
}

function AboutScreenStack({ route }) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: true }}>
            <Stack.Screen
                name="AboutStack"
                component={AboutScreen}
                options={
                    {
                        title: 'Mais',
                        headerTitleAlign: 'center'
                    }
                }
            />
            <Stack.Screen
                name="TermsOfUse"
                component={TermsOfUse}
                options={
                    {
                        title: 'Termos de Uso',
                        headerBackTitleVisible: false,
                        headerTitleAlign: 'center',
                        presentation: 'modal',
                    }
                }
            />
            <Stack.Screen
                name="PrivacyPolicy"
                component={PrivacyPolicy}
                options={
                    {
                        title: 'Políticas de Privacidade',
                        headerBackTitleVisible: false,
                        headerTitleAlign: 'center',
                        presentation: 'modal',
                    }
                }
            />
            <Stack.Screen
                name="SpecialPage"
                component={SpecialPage}
                options={
                    {
                        title: 'Especial',
                        headerBackTitleVisible: false,
                        headerTitleAlign: 'center',
                        presentation: 'modal',
                    }
                }
            />
        </Stack.Navigator>
    );
}

export default function Router() {
    const navigationRef = useRef(null);
    const routeNameRef = useRef(null);
    const {
        getStorageMusic
    } = useContext(MusicContext);

    const {
        getNetworkStateAsync
    } = useContext(ConnectionContext);

    let heightScreen = null;

    useEffect(() => {
        getNetworkStateAsync();
        getStorageMusic();
    }, [])

    const trackCurrentScreen = () => {
        const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

        if (!currentRouteName) {
            return;
        }

        if (routeNameRef.current !== currentRouteName) {
            trackScreenRoute(currentRouteName);
            routeNameRef.current = currentRouteName;
        }
    };

    if (Dimensions.get('window').height < 600) {
        heightScreen = Dimensions.get('window').height - 510;
    }

    if (typeDevice.Android()) {
        NavigationBar.setButtonStyleAsync("light");
        NavigationBar.setBackgroundColorAsync("#1A1A1A");
    }

    return (
        <ThemeProvider theme={themes.dark}>
            <StatusBar translucent={true} style={themes.dark.barColor} />
            <NavigationContainer
                ref={navigationRef}
                theme={themes.dark}
                onReady={trackCurrentScreen}
                onStateChange={trackCurrentScreen}
            >
                <Tab.Navigator
                    backBehavior='history'
                    sceneContainerStyle={{ backgroundColor: themes.dark.background }}
                    screenOptions={({ route }) => ({
                        tabBarHideOnKeyboard: typeDevice.Android(),
                        tabBarLabelPosition: 'below-icon',
                        tabBarLabelStyle: {
                            position: 'relative',
                            bottom: 4,
                            width: '100%'
                        },
                        tabBarIconStyle: {
                            bottom: -1,
                            position: 'relative'
                        },
                        tabBarIcon: ({ focused, color, size }) => {
                            let iconName;

                            const actions = {
                                'Home': () => iconName = focused ? 'musical-notes' : 'musical-notes-outline',
                                'Cipher': () => iconName = focused ? 'book' : 'book-outline',
                                'Search': () => iconName = focused ? 'search' : 'search-outline',
                                'About': () => iconName = focused ? 'menu' : 'menu-outline',
                            }

                            actions[route.name]();

                            return <Ionicons name={iconName} size={size} color={color} />;
                        },
                        tabBarActiveTintColor: '#0B97D3',
                        tabBarInactiveTintColor: 'gray',
                        tabBarStyle: {
                            flex: heightScreen ? null : 0.08,
                            height: heightScreen
                        },
                    })}
                >
                    <Tab.Screen name="Home" component={HomeStackMusic} options={{ headerShown: false, title: 'Música' }} />
                    <Tab.Screen name="Cipher" component={CipherScreenStack} options={{ headerShown: false, title: 'Cifras' }} />
                    <Tab.Screen name="Search" component={SearchScreenStack} options={{ headerShown: false, title: 'Buscar' }} />
                    <Tab.Screen name="About" component={AboutScreenStack} options={{ headerShown: false, title: 'Mais', gestureEnabled: false }} />
                </Tab.Navigator>
            </NavigationContainer>
        </ThemeProvider>
    )
}
