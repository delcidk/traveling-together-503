import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from "react-native";
import { colors } from "../../theme/colors";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  secureTextEntry?: boolean;
}

export const TextField = ({ label, error, secureTextEntry, ...props }: TextFieldProps) => {
  const [isSecure, setIsSecure] = React.useState(secureTextEntry);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholderTextColor={colors.textSubtle}
          secureTextEntry={isSecure}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity style={styles.toggle} onPress={() => setIsSecure(!isSecure)}>
            <Text style={styles.toggleText}>{isSecure ? "Mostrar" : "Ocultar"}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: colors.primary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: colors.primary,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
  },
  toggle: {
    position: "absolute",
    right: 12,
  },
  toggleText: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: "Poppins_500Medium",
  },
});
