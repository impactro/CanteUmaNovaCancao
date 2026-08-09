import React from "react";
import { styles } from "../../../style/LoaderScreenStyle";
import { Image, View } from "react-native";

export default function Loader() {
    return (
        <View style={styles.container}>
            <Image
                accessibilityLabel="Livro aberto da CrânIA"
                resizeMode="contain"
                source={require('../../../assets/crania_book_splash.png')}
                style={styles.image}
            />
        </View>
    );
}
