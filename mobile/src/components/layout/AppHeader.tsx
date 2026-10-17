import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Logo } from './Logo';

export const AppHeader = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <Logo />
      <TouchableOpacity 
        style={styles.menuButton} 
        onPress={() => (navigation as any).toggleDrawer()}
      >
        <Ionicons name="menu" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuButton: {
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
});

