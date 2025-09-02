// screens/OceanSplashScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const OceanSplashScreen = ({ onFinish }) => {
  // Main animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textScaleAnim = useRef(new Animated.Value(0.5)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  
  // Wave animations
  const wave1Anim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;
  const wave3Anim = useRef(new Animated.Value(0)).current;

  // Bubble animations
  const bubbleAnims = useRef(
    Array.from({ length: 12 }, () => ({
      translateY: new Animated.Value(height + 100),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.5),
    }))
  ).current;

  useEffect(() => {
    // Start wave animations (continuous)
    const startWaveAnimations = () => {
      Animated.loop(
        Animated.timing(wave1Anim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.timing(wave2Anim, {
          toValue: 1,
          duration: 3500,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.timing(wave3Anim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      ).start();
    };

    // Start bubble animations
    const startBubbleAnimations = () => {
      bubbleAnims.forEach((bubble, index) => {
        const delay = index * 200;
        const duration = 2000 + Math.random() * 1500;
        
        setTimeout(() => {
          Animated.loop(
            Animated.sequence([
              Animated.parallel([
                Animated.timing(bubble.translateY, {
                  toValue: -100,
                  duration: duration,
                  useNativeDriver: true,
                }),
                Animated.sequence([
                  Animated.timing(bubble.opacity, {
                    toValue: 0.7,
                    duration: 300,
                    useNativeDriver: true,
                  }),
                  Animated.timing(bubble.opacity, {
                    toValue: 0,
                    duration: duration - 600,
                    useNativeDriver: true,
                  }),
                ]),
                Animated.sequence([
                  Animated.timing(bubble.scale, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                  }),
                  Animated.timing(bubble.scale, {
                    toValue: 1.2,
                    duration: duration - 300,
                    useNativeDriver: true,
                  }),
                ]),
              ]),
              // Reset position
              Animated.timing(bubble.translateY, {
                toValue: height + 100,
                duration: 0,
                useNativeDriver: true,
              }),
            ])
          ).start();
        }, delay);
      });
    };

    // Main animation sequence
    const mainSequence = Animated.sequence([
      // Background fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      
      // Text entrance
      Animated.parallel([
        Animated.spring(textScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacityAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      
      // Hold for display
      Animated.delay(1500),
    ]);

    // Start all animations
    startWaveAnimations();
    setTimeout(startBubbleAnimations, 500);
    mainSequence.start();

    // Finish after duration
    const timer = setTimeout(() => {
      onFinish();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Wave transform interpolations
  const wave1Transform = wave1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 2],
  });

  const wave2Transform = wave2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width * 2],
  });

  const wave3Transform = wave3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 1.5],
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#006994" barStyle="light-content" />
      
      {/* Ocean background gradient */}
      <Animated.View style={[styles.oceanGradient, { opacity: fadeAnim }]}>
        
        {/* Animated waves */}
        <Animated.View
          style={[
            styles.wave,
            styles.wave1,
            { transform: [{ translateX: wave1Transform }] }
          ]}
        />
        <Animated.View
          style={[
            styles.wave,
            styles.wave2,
            { transform: [{ translateX: wave2Transform }] }
          ]}
        />
        <Animated.View
          style={[
            styles.wave,
            styles.wave3,
            { transform: [{ translateX: wave3Transform }] }
          ]}
        />

        {/* Bubbles */}
        {bubbleAnims.map((bubble, index) => (
          <Animated.View
            key={index}
            style={[
              styles.bubble,
              {
                left: (index * 60 + 20) % (width - 40),
                transform: [
                  { translateY: bubble.translateY },
                  { scale: bubble.scale }
                ],
                opacity: bubble.opacity,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Main content */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacityAnim,
              transform: [{ scale: textScaleAnim }],
            },
          ]}
        >
          <Text style={styles.welcomeText}>Bienvenido</Text>
          
          {/* Decorative wave under text */}
          <Animated.View 
            style={[
              styles.textWave,
              {
                opacity: textOpacityAnim,
                transform: [{ scaleX: textScaleAnim }],
              }
            ]} 
          />
        </Animated.View>
      </View>

      {/* Foam effect at bottom */}
      <Animated.View 
        style={[
          styles.foam,
          { opacity: fadeAnim }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#006994',
  },
  oceanGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#006994',
  },
  wave: {
    position: 'absolute',
    width: width * 3,
    height: 120,
    borderRadius: 60,
  },
  wave1: {
    backgroundColor: 'rgba(0, 150, 200, 0.3)',
    top: '20%',
    left: -width,
  },
  wave2: {
    backgroundColor: 'rgba(0, 180, 220, 0.4)',
    top: '40%',
    left: -width,
  },
  wave3: {
    backgroundColor: 'rgba(100, 200, 255, 0.2)',
    top: '60%',
    left: -width,
  },
  bubble: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#fff',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  welcomeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: 20,
  },
  textWave: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 2,
  },
  foam: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
});

export default OceanSplashScreen;