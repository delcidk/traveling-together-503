import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, SafeAreaView, View } from "react-native";
import { colors } from "../../theme/colors";

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
}

export const ScreenContainer = ({ children, scroll = true }: ScreenContainerProps) => {
  const content = scroll ? (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
