import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';

import OceanSplashScreen from './src/screens/OceanSplashScreen';
import Navigation from './src/navigation/Navigation';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Show ocean splash screen first
  if (showSplash) {
    return (
      <>
        <StatusBar style="light" />
        <OceanSplashScreen onFinish={handleSplashFinish} />
      </>
    );
  }

  // Show navigation after splash finishes
  return (
    <>
      <StatusBar style="auto" />
      <Navigation />
    </>
  );
}