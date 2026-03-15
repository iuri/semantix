import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Image, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';
import Footer from '../components/Footer';

const SKIP_DELAY_MS = 3000;
const GIF_DURATION_MS = 5000;

export default function SplashVideoScreen() {
  const navigation = useNavigation();
  const [isReady, setIsReady] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const [hasError, setHasError] = useState(false);
  const loadingOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const skipTimer = setTimeout(() => setCanSkip(true), SKIP_DELAY_MS);
    const finishTimer = setTimeout(() => goNext(), GIF_DURATION_MS);

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(loadingOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(loadingOpacity, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(finishTimer);
      loop.stop();
    };
  }, []);

  const goNext = () => {
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      {!hasError ? (
         <Video
          style={styles.video}
          source={require('../../assets/video-2.mp4')}
          resizeMode="cover"
          isMuted={true}
          isLooping={false}
          shouldPlay={true}
          onReadyForDisplay={() => setIsReady(true)}
          onError={(e) => {
            console.warn('Video error', e);
            setHasError(true);
          }}
        />
      ) : (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Unable to load splash image.</Text>
        </View>
      )}
      

      {!isReady && !hasError && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Animated.Text style={[styles.loadingText, { opacity: loadingOpacity }]}>Loading...</Animated.Text>
        </View>
      )}

      {canSkip && (
        <TouchableOpacity style={styles.skipButton} onPress={goNext}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {!hasError && (
        <Footer />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  logo: {
    position: 'absolute',
    width: 200,
    height: 200,
    bottom: 40,
    alignSelf: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  loadingText: {
    marginTop: 12,
    color: '#fff',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
  },
  skipText: {
    color: 'white',
    fontWeight: '600',
  },
  errorBox: {
    padding: 16,
    backgroundColor: '#222',
    borderRadius: 8,
  },
  errorText: {
    color: '#fff',
  },
});
