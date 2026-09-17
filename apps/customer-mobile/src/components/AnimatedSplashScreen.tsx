import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  AccessibilityInfo,
  Dimensions,
  Image,
  Platform
} from "react-native";
import * as SplashScreen from "expo-splash-screen";

interface AnimatedSplashScreenProps {
  isReady: boolean;
  onFinish: () => void;
}

// Garante que a animação rode estritamente UMA vez por instância do aplicativo
let hasShownAnimatedSplash = false;

export function AnimatedSplashScreen({ isReady, onFinish }: AnimatedSplashScreenProps) {
  const [animationDone, setAnimationDone] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    // Se já exibiu a animação nesta instância de execução, encerra imediatamente
    if (hasShownAnimatedSplash) {
      onFinish();
      return () => {
        isMounted.current = false;
      };
    }

    let isReduceMotion = false;
    let animSequence: Animated.CompositeAnimation | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const startAnimation = async () => {
      try {
        isReduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
      } catch {
        isReduceMotion = false;
      }

      // 1. Oculta o splash nativo assim que a camada React Native estiver pronta
      try {
        await SplashScreen.hideAsync();
      } catch {
        // Ignora se o splash nativo já foi ocultado
      }

      if (isReduceMotion) {
        // Modo acessibilidade: sem escala, apenas transição estática rápida
        scaleAnim.setValue(1);
        glowAnim.setValue(0);

        timer = setTimeout(() => {
          if (isMounted.current) {
            setAnimationDone(true);
          }
        }, 500);
        return;
      }

      // Modo padrão: escala sutil de 0.96 para 1.0 com destaque azul suave (~800ms)
      animSequence = Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.0,
          duration: 850,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }),
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 350,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      ]);

      animSequence.start(({ finished }) => {
        if (finished && isMounted.current) {
          setAnimationDone(true);
        }
      });
    };

    void startAnimation();

    return () => {
      isMounted.current = false;
      if (timer) clearTimeout(timer);
      if (animSequence) animSequence.stop();
    };
  }, [onFinish, scaleAnim, glowAnim]);

  // Transição de saída suave por opacidade quando a animação terminar E o app estiver pronto
  useEffect(() => {
    if (!animationDone || !isReady) return;

    Animated.timing(containerOpacity, {
      toValue: 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true
    }).start(({ finished }) => {
      if (finished && isMounted.current) {
        hasShownAnimatedSplash = true;
        onFinish();
      }
    });
  }, [animationDone, isReady, containerOpacity, onFinish]);

  if (hasShownAnimatedSplash) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerOpacity
        }
      ]}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          styles.contentWrapper,
          {
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Halo de destaque azul discreto atrás do símbolo */}
        <Animated.View
          style={[
            styles.glowRing,
            {
              opacity: glowAnim
            }
          ]}
        />

        {/* Símbolo oficial do Grupo J */}
        <Image
          source={require("../../assets/adaptive-icon.png")}
          style={styles.symbolImage}
          resizeMode="contain"
          fadeDuration={0}
        />

        {/* Lettering oficial da marca */}
        <View style={styles.textBlock}>
          <Text style={styles.brandTitle}>GRUPO J</Text>
          <Text style={styles.brandSubtitle}>CLUBE DE BENEFÍCIOS</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const { width } = Dimensions.get("window");
const SYMBOL_SIZE = Math.min(width * 0.38, 150);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00091D",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999999
  },
  contentWrapper: {
    alignItems: "center",
    justifyContent: "center"
  },
  glowRing: {
    position: "absolute",
    width: SYMBOL_SIZE * 1.35,
    height: SYMBOL_SIZE * 1.35,
    borderRadius: SYMBOL_SIZE * 0.35,
    backgroundColor: "#034EFE",
    // Suave difusão no Android e iOS
    ...Platform.select({
      ios: {
        shadowColor: "#034EFE",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 28
      },
      android: {
        elevation: 8
      }
    })
  },
  symbolImage: {
    width: SYMBOL_SIZE,
    height: SYMBOL_SIZE
  },
  textBlock: {
    marginTop: 22,
    alignItems: "center"
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#FFFFFF",
    textTransform: "uppercase"
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 3.5,
    color: "#034EFE",
    textTransform: "uppercase",
    marginTop: 5
  }
});
