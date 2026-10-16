import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export const AppHeader = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="bus" size={16} color="#fff" />
        </View>
        <Text style={styles.logoText}>TRAVELING TOGETHER </Text>
        <Text style={styles.logoTextGray}>503</Text>
      </View>
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    padding: 4,
    marginRight: 8,
  },
  logoText: {
    fontFamily: 'BarlowCondensed_800ExtraBold',
    fontSize: 18,
    color: colors.primary,
  },
  logoTextGray: {
    fontFamily: 'BarlowCondensed_800ExtraBold',
    fontSize: 18,
    color: colors.textMuted,
  },
  menuButton: {
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
});
