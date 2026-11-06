import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { useAuth } from '../../src/context/AuthContext';
import { RoutesProvider } from '../../src/context/RoutesContext';
import { AppHeader } from '../../src/components/layout/AppHeader';
import { colors } from '../../src/theme/colors';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from 'expo-router/drawer';

function CustomDrawerContent(props: any) {
  const { logout, user, userProfile, profileError } = useAuth();
  const displayName = userProfile?.nombre || user?.displayName || 'Usuario';
  const displayEmail = userProfile?.email || user?.email || '';

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <TouchableOpacity
          style={styles.userInfo}
          activeOpacity={0.7}
          onPress={() => props.navigation.navigate('profile')}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>{displayEmail}</Text>
            {profileError ? (
              <Text style={styles.syncWarning}>Sincronización pendiente</Text>
            ) : null}
          </View>
        </TouchableOpacity>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AppLayout() {
  const { isAdmin } = useAuth();

  return (
    <RoutesProvider>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          header: () => <AppHeader />,
          drawerPosition: 'right',
          drawerActiveTintColor: colors.primary,
          drawerInactiveTintColor: colors.textMuted,
          drawerLabelStyle: { fontFamily: 'Poppins_500Medium', fontSize: 16 },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'Inicio',
            title: 'Inicio',
          }}
        />
        <Drawer.Screen
          name="routes"
          options={{
            drawerLabel: 'Rutas Disponibles',
            title: 'Rutas',
          }}
        />
        <Drawer.Screen
          name="my-reservations"
          options={{
            drawerLabel: 'Mis Reservas',
            title: 'Mis Reservas',
            drawerItemStyle: isAdmin ? { display: 'none' } : undefined,
          }}
          redirect={isAdmin}
        />
        <Drawer.Screen
          name="admin"
          options={{
            drawerLabel: 'Panel de Control',
            title: 'Panel de Control',
            drawerItemStyle: !isAdmin ? { display: 'none' } : undefined,
          }}
          redirect={!isAdmin}
        />
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: 'Mi Perfil',
            title: 'Mi Perfil',
          }}
        />
      </Drawer>
    </RoutesProvider>
  );
}

const styles = StyleSheet.create({
  userInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: colors.primary,
  },
  userName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: colors.primary,
  },
  userEmail: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textMuted,
  },
  syncWarning: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: colors.danger,
    marginTop: 2,
  },
  logoutButton: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  logoutText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: colors.danger,
  },
});
