import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import {useTheme} from '../theme/ThemeContext';

const {width} = Dimensions.get('window');

const SplashScreen = ({navigation}: any) => {
  const {colors} = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const wordmarkFade = useRef(new Animated.Value(0)).current;
  const accentWidth = useRef(new Animated.Value(0)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation Sequence
    Animated.sequence([
      // 1. Logo "T" monogram fades in + slides up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // 2. "Transjakarta" wordmark fades in
      Animated.timing(wordmarkFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // 3. Blue accent line scales from center
      Animated.timing(accentWidth, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false, // Width doesn't support native driver
      }),
      // 4. Tagline fades in
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // 5. Wait and then fade out entire screen and navigate
    const timer = setTimeout(() => {
      Animated.timing(screenFade, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace('Home');
      });
    }, 3500);

    return () => clearTimeout(timer);
  }, [
    fadeAnim,
    slideAnim,
    wordmarkFade,
    accentWidth,
    taglineFade,
    screenFade,
    navigation,
  ]);

  return (
    <Animated.View
      style={[
        styles.container,
        {backgroundColor: colors.splashBg, opacity: screenFade},
      ]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.splashBg} />

      <View style={styles.content}>
        {/* Logo Monogram */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}, {scale: scaleAnim}],
            },
          ]}>
          <View style={[styles.logoBox, {borderColor: colors.splashAccent}]}>
            <Text style={[styles.logoText, {color: colors.splashText}]}>Tj</Text>
          </View>
        </Animated.View>

        {/* Wordmark */}
        <Animated.Text
          style={[
            styles.wordmark,
            {color: colors.splashText, opacity: wordmarkFade},
          ]}>
          TRANSJAKARTA
        </Animated.Text>

        {/* Accent Line */}
        <View style={styles.accentContainer}>
          <Animated.View
            style={[
              styles.accentLine,
              {
                backgroundColor: colors.splashAccent,
                width: accentWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '60%'],
                }),
              },
            ]}
          />
        </View>

        {/* Tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            {color: colors.splashText, opacity: taglineFade},
          ]}>
          Connecting Jakarta
        </Animated.Text>
      </View>

      {/* Bottom Decoration */}
      <View style={styles.footer}>
        <Text
          style={[styles.version, {color: colors.splashText, opacity: 0.3}]}>
          v1.0.0
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBox: {
    width: 100,
    height: 80,
    borderWidth: 4,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
  },
  wordmark: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 8,
    marginBottom: 15,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-condensed',
  },
  accentContainer: {
    width: width,
    alignItems: 'center',
    height: 3,
    marginBottom: 15,
  },
  accentLine: {
    height: '100%',
    borderRadius: 2,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '300',
    letterSpacing: 4,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  version: {
    fontSize: 12,
    letterSpacing: 1,
  },
});

export default SplashScreen;
