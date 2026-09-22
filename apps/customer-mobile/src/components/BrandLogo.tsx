import React from "react";
import {Image,StyleSheet,View} from "react-native";
/** Original horizontal artwork on its contrast-safe brand background. */
export function BrandLogo() {
  return <View style={styles.frame}>
    <Image source={require("../../assets/brand-horizontal.png")} accessibilityLabel="Grupo J — Auto App"
      style={styles.image} resizeMode="contain" fadeDuration={0} />
  </View>;
}
const styles=StyleSheet.create({
  frame:{width:"100%",maxWidth:272,alignSelf:"center",backgroundColor:"#00091D",padding:12,borderRadius:12,marginBottom:20},
  image:{width:"100%",height:42}
});
