import React from 'react';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  
  return (
    <ScreenContainer>
      <EmptyState 
        icon="home-outline"
        title="Inicio"
        description="Pantalla de inicio en construcción. Aquí irán el hero, botones principales y estadísticas de la web."
        actionTitle="Ver Rutas"
        onAction={() => router.push('/(app)/routes')}
      />
    </ScreenContainer>
  );
}
