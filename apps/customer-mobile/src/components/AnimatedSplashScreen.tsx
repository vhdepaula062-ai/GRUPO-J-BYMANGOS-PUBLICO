import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Image, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";

interface AnimatedSplashScreenProps {
  isReady: boolean;
  onFinish: () => void;
}

let hasShownAnimatedSplash = false;

export function AnimatedSplashScreen({ isReady, onFinish }: AnimatedSplashScreenProps) {
  const [imageReady, setImageReady] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const scale = useRef(new Animated.Value(0.96)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const mounted = useRef(true);

  // An image failure must not leave the native splash covering the app forever.
  useEffect(() => {
    const fallback = setTimeout(() => setImageReady(true), 1500);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (hasShownAnimatedSplash) {
      onFinish();
      return () => { mounted.current = false; };
    }
    if (!imageReady) return;

    let animation: Animated.CompositeAnimation | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const start = async () => {
      const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled().catch(() => false);
      // The official logo has loaded before the native splash is removed.
      await SplashScreen.hideAsync().catch(() => undefined);
      if (!mounted.current) return;
      if (reduceMotion) {
        scale.setValue(1);
        timer = setTimeout(() => { if (mounted.current) setAnimationDone(true); }, 600);
        return;
      }
      animation = Animated.timing(scale, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      });
      animation.start(({ finished }) => {
        if (finished && mounted.current) setAnimationDone(true);
      });
    };
    void start();
    return () => {
      mounted.current = false;
      if (timer) clearTimeout(timer);
      animation?.stop();
    };
  }, [imageReady, onFinish, scale]);

  useEffect(() => {
    if (!animationDone || !isReady) return;
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true
    }).start(({ finished }) => {
      if (finished && mounted.current) {
        hasShownAnimatedSplash = true;
        onFinish();
      }
    });
  }, [animationDone, isReady, onFinish, opacity]);

  if (hasShownAnimatedSplash) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      <Animated.View style={[styles.content, { transform: [{ scale }] }]}>
        <Image
          source={require("../../assets/brand-horizontal.png")}
          accessibilityLabel="Grupo J — Auto App"
          style={styles.logo}
          resizeMode="contain"
          fadeDuration={0}
          onLoadEnd={() => setImageReady(true)}
          onError={() => setImageReady(true)}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00091D",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999999
  },
  content: {
    width: "100%",
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  logo: {
    width: "100%",
    maxWidth: 360,
    height: 60
  }
});
