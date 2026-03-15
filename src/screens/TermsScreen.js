import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function TermsScreen() {
  const navigation = useNavigation();

  const handleAccept = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Terms & Conditions</Text>

        <Text style={styles.paragraph}>
          By using this application you agree to comply with the following terms and conditions. Please read them
          carefully before proceeding.
        </Text>

        <Text style={styles.heading}>1. Use of Service</Text>
        <Text style={styles.paragraph}>
          You agree to use the service only for lawful purposes and in compliance with all applicable local laws and
          regulations. Unauthorized use may result in suspension or termination of your account.
        </Text>

        <Text style={styles.heading}>2. Privacy</Text>
        <Text style={styles.paragraph}>
          We collect and process data as described in our Privacy Policy. By continuing to use the service, you consent to
          such processing and warrant that all data provided by you is accurate.
        </Text>

        <Text style={styles.heading}>3. Accounts and Security</Text>
        <Text style={styles.paragraph}>
          You are responsible for maintaining the confidentiality of your credentials and for all activities under your
          account. Notify us immediately of any unauthorized use or security breach.
        </Text>

        <Text style={styles.heading}>4. Limitations of Liability</Text>
        <Text style={styles.paragraph}>
          The service is provided on an "as is" basis without warranties of any kind. We shall not be liable for any
          indirect, incidental, or consequential damages arising from your use of the service.
        </Text>

        <Text style={styles.heading}>5. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We may update these terms from time to time. Continued use of the service after changes constitutes acceptance
          of the revised terms.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleAccept}>
          <Text style={styles.buttonText}>I Accept</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#222',
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
    color: '#333',
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#0a84ff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
