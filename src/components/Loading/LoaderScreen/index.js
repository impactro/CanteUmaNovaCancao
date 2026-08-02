import React, { useEffect, useRef } from "react";
import { styles } from "../../../style/LoaderScreenStyle";
import { Animated, View } from "react-native";

export default function Loader() {
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(progress, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            {
                iterations: 4,
                resetBeforeIteration: true,
            }
        );

        animation.start();

        return () => animation.stop();
    }, [progress]);

    return (
        <View
            style={[styles.container]}
        >
            <Animated.Image
                style={[{
                    width: '50%',
                    height: '100%',
                    opacity: progress,
                    transform: [{
                        translateY: progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-30, 0],
                        }),
                    }],
                }]}
                source={require('../../../assets/splash_logo.png')}
            />
        </View>
    )
}
