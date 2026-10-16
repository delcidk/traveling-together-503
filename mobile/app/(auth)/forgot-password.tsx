import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Toast from 'react-native-toast-message';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { TextField } from '../../src/components/ui/TextField';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/colors';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Ingresa un correo válido'),
});

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      setLoading(true);
      await resetPassword(data.email);
      Toast.show({
        type: 'success',
        text1: 'Correo enviado',
        text2: 'Revisa tu bandeja de entrada para restablecer tu contraseña',
      });
      router.back();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>RECUPERAR CONTRASEÑA</Text>
        <Text style={styles.subtitle}>Te enviaremos un enlace para que puedas crear una nueva contraseña.</Text>
      </View>

      <View style={styles.form}>
        <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
          <TextField label="Correo electrónico" placeholder="tu@correo.com" keyboardType="email-address" autoCapitalize="none" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.email?.message} />
        )} />

        <Button title="Enviar enlace" onPress={handleSubmit(onSubmit)} loading={loading} style={styles.submitBtn} />
      </View>

      <View style={styles.footer}>
        <Link href="/(auth)/login" style={styles.loginLink}>
          Volver al inicio de sesión
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 60, marginBottom: 40, alignItems: 'center' },
  title: { fontFamily: 'BarlowCondensed_800ExtraBold', fontSize: 32, color: colors.primary, textTransform: 'uppercase', textAlign: 'center' },
  subtitle: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.textMuted, marginTop: 8, textAlign: 'center', paddingHorizontal: 20 },
  form: { backgroundColor: colors.surface, padding: 24, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  submitBtn: { marginTop: 16 },
  footer: { alignItems: 'center', marginTop: 32 },
  loginLink: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: colors.primary },
});
