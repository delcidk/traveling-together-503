import React from "react";
import { TouchableOpacity, Text, View, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { colors } from "../../theme/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "whatsapp" | "whatsappOutline" | "danger";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button = ({
  title,
  onPress,
  variant = "primary",
  loading,
  disabled,
  icon,
  style,
  textStyle,
}: ButtonProps) => {
  let backgroundColor = colors.primary;
  let textColor = "#fff";
  let borderColor = colors.primary;

  if (variant === "outline") {
    backgroundColor = "transparent";
    textColor = colors.primary;
    borderColor = colors.border;
  } else if (variant === "whatsapp") {
    backgroundColor = colors.whatsapp;
    borderColor = colors.whatsapp;
  } else if (variant === "whatsappOutline") {
    backgroundColor = "transparent";
    textColor = colors.whatsapp;
    borderColor = colors.whatsapp;
  } else if (variant === "danger") {
    backgroundColor = colors.danger;
    borderColor = colors.danger;
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === "outline" || variant === "whatsappOutline" ? 1 : 0,
        },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          {title ? <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text> : null}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    flexDirection: "row",
  },
  text: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  iconContainer: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.7,
  },
});
