import React from 'react';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { EmptyState } from '../../src/components/ui/EmptyState';

export default function AdminScreen() {
  return (
    <ScreenContainer>
      <EmptyState 
        icon="stats-chart-outline"
        title="Panel de Control"
        description="Panel de control en construcción. Aquí irán las estadísticas y gestión de reservaciones y rutas."
      />
    </ScreenContainer>
  );
}
