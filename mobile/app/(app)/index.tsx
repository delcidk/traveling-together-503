import React, { useRef, useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  RefreshControl,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { useRoutes } from "../../src/context/RoutesContext";
import { colors } from "../../src/theme/colors";
import { HeroSection } from "../../src/components/home/HeroSection";
import { RoutesCatalog } from "../../src/components/routes/RoutesCatalog";
import { ContactCta } from "../../src/components/home/ContactCta";
import { AppFooter } from "../../src/components/layout/AppFooter";
import {
  GENERAL_QUOTE_MESSAGE,
  buildWhatsAppUrl,
} from "../../src/config/constants";

export default function HomeScreen() {
  const router = useRouter();
  const { loading, refresh } = useRoutes();
  const scrollRef = useRef<ScrollView>(null);
  const [catalogY, setCatalogY] = useState(0);

  const handleSeeServices = () => {
    scrollRef.current?.scrollTo({ y: catalogY, animated: true });
  };

  const handleQuoteWhatsApp = async () => {
    const url = buildWhatsAppUrl(GENERAL_QUOTE_MESSAGE);
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.error("Error al abrir WhatsApp:", err);
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refresh}
          tintColor={colors.primary}
        />
      }
    >
      <HeroSection
        onSeeServices={handleSeeServices}
        onQuote={handleQuoteWhatsApp}
      />

      <View
        style={styles.catalogSection}
        onLayout={(e) => setCatalogY(e.nativeEvent.layout.y)}
      >
        <RoutesCatalog
          onViewDetail={(route) =>
            router.push(`/(app)/routes/${route.id}` as any)
          }
        />
      </View>

      <ContactCta />
      <AppFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  catalogSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
});

