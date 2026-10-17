import React from "react";
import { ScrollView, StyleSheet, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useRoutes } from "../../../src/context/RoutesContext";
import { ApiRoute } from "../../../src/types/route";
import { colors } from "../../../src/theme/colors";
import { RoutesCatalog } from "../../../src/components/routes/RoutesCatalog";

export default function RoutesScreen() {
  const router = useRouter();
  const { loading, refresh } = useRoutes();

  const handleOpenDetail = (route: ApiRoute) => {
    router.push(`/(app)/routes/${route.id}` as any);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refresh}
          tintColor={colors.primary}
        />
      }
    >
      <RoutesCatalog onViewDetail={handleOpenDetail} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
});

