import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function Footer() {
  return (
    <View style={styles.footer} pointerEvents="none">
      <Image source={require('../../assets/semantix-logo.png')} style={styles.footerLogo} resizeMode="contain" />
      <Text style={styles.footerText}>© 2024 semantix. All rights reserved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    marginTop: 12,
  },
  footerLogo: {
    width: 140,
    height: 60,
  },
  footerText: {
    marginTop: 6,
    color: '#fff',
    fontSize: 12,
  },
});