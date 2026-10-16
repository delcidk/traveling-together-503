import React from "react";
import { View, Text, Image, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

interface PhotoPlaceholderProps {
  imageUrl?: string;
  placeholderText?: string;
  aspectRatio?: number;
  height?: number;
  style?: ViewStyle;
}

export const PhotoPlaceholder = ({
  imageUrl,
  placeholderText = "Foto de la ruta",
  aspectRatio = 16 / 9,
  height,
  style,
}: PhotoPlaceholderProps) => {
  const containerStyle: ViewStyle = {
    ...(height ? { height } : { aspectRatio }),
  };

  if (imageUrl) {
    return (
      <View style={[styles.container, containerStyle, style]}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.placeholder, containerStyle, style]}>
      <Ionicons name="image-outline" size={36} color={colors.textSubtle} />
      {placeholderText ? (
        <Text style={styles.placeholderText}>{placeholderText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  placeholderText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.textMuted,
    marginTop: 6,
    textAlign: "center",
  },
});
