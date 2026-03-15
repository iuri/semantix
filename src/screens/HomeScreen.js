import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

export default function HomeScreen() {
  const { logout, token, api } = useAuth();
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      try {
        const response = await api.get('http://localhost:8000/api/profile');
        if (!mounted) return;
        setFirstName(response?.data?.first_name || '');
      } catch (err) {
        if (!mounted) return;
        setFirstName('');
      }
    };
    loadProfile();
    return () => {
      mounted = false;
    };
  }, [api]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Home',
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerProfileButton}
          onPress={() => setShowMenu(true)}
          accessibilityLabel="Menu"
        >
          <Feather name="menu" size={22} color="#0a84ff" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity style={styles.headerIconButton} onPress={logout} accessibilityLabel="Logout">
          <Feather name="log-out" size={22} color="#d00" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, logout]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome{firstName ? ` ${firstName},` : ''}</Text>
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Terms')}>
          <Text style={styles.linkButtonText}>Read Terms & Conditions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gameButton} onPress={() => navigation.navigate('WordAssociationGame')}>
          <Text style={styles.gameButtonText}>Start Word Association Game    </Text>
          <Feather name="play-circle" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.gameButton} onPress={() => navigation.navigate('MentalLoadGame')}>
          <Text style={styles.gameButtonText}>Start Mental Load Game              </Text>
          <Feather name="play-circle" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('ChatBot')}>
          <Text style={styles.chatButtonText}>Chat with AI Assistant</Text>
          <Feather name="message-circle" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.subtitle}>You are logged in.</Text>
        <Text style={styles.tokenLabel}>Token:</Text>
        <Text style={styles.tokenValue} numberOfLines={2} ellipsizeMode="middle">
          {token}
        </Text>
      </View>

      <Footer />

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowMenu(false)}>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); navigation.navigate('WordAssociationGame'); }}>
              <Feather name="play-circle" size={20} color="#0a84ff" />
              <Text style={styles.menuItemText}>Semantix</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); navigation.navigate('MentalLoadGame'); }}>
              <Feather name="play-circle" size={20} color="#0a84ff" />
              <Text style={styles.menuItemText}>MentalLoad</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); navigation.navigate('ChatBot'); }}>
              <Feather name="message-circle" size={20} color="#0a84ff" />
              <Text style={styles.menuItemText}>Chat Bot</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); navigation.navigate('ProfileUpdate'); }}>
              <Feather name="user" size={20} color="#0a84ff" />
              <Text style={styles.menuItemText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: '#444',
  },
  tokenLabel: {
    marginTop: 16,
    fontWeight: '600',
  },
  tokenValue: {
    marginTop: 6,
    color: '#222',
    textAlign: 'center',
  },
  secondaryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#0a84ff',
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  headerIconButton: {
    padding: 8,
    marginRight: 4,
  },
  headerProfileButton: {
    padding: 8,
    marginLeft: 4,
  },
  linkButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  linkButtonText: {
    color: '#0a84ff',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  gameButton: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  gameButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  chatButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a84ff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuItemText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#111',
  },
});
