import React from 'react';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useRouter } from 'expo-router';

export default function MyReservationsScreen() {
  const router = useRouter();
  
  return (
    <ScreenContainer>
      <EmptyState 
        icon="calendar-outline"
        title="Sin reservas todavía"
        description="Explora nuestras rutas y reserva tu próximo viaje."
        actionTitle="Ver rutas disponibles"
        onAction={() => router.push('/(app)/routes')}
      />
    </ScreenContainer>
  );
}
