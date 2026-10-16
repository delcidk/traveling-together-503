import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Toast from 'react-native-toast-message';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { TextField } from '../../src/components/ui/TextField';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/colors';

const RegisterSchema = z.object({
  nombre: z.string().min(2, 'Ingresa tu nombre completo'),
  email: z.string().email('Ingresa un correo válido'),
  telefono: z.string().optional().refine(val => !val || /^[\d\+\s\-]{8,15}$/.test(val), {
    message: 'Teléfono inválido',
  }),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof RegisterSchema>;

export default function RegisterScreen() {
  const { register: authRegister } = useAuth();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { nombre: '', email: '', telefono: '', password: '', confirmPassword: '' }
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);
      await authRegister(data.email, data.password, data.nombre, data.telefono);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error al registrar',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>CREAR CUENTA</Text>
        <Text style={styles.subtitle}>Únete para reservar tus próximos viajes</Text>
      </View>

      <View style={styles.form}>
        <Controller control={control} name="nombre" render={({ field: { onChange, onBlur, value } }) => (
          <TextField label="Nombre completo" placeholder="Juan Pérez" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.nombre?.message} />
        )} />

        <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
          <TextField label="Correo electrónico" placeholder="tu@correo.com" keyboardType="email-address" autoCapitalize="none" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.email?.message} />
        )} />

        <Controller control={control} name="telefono" render={({ field: { onChange, onBlur, value } }) => (
          <TextField label="Teléfono (opcional)" placeholder="+503 7000-0000" keyboardType="phone-pad" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.telefono?.message} />
        )} />

        <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
          <TextField label="Contraseña" placeholder="••••••••" secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} error={errors.password?.message} />
        )} />

        <Controller control={control} name="confirmPassword" render={({ field: { onChange, onBlur, value } }) => (
          <TextField label="Confirmar Contraseña" placeholder="••••••••" secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} error={errors.confirmPassword?.message} />
        )} />

        <Button title="Registrarme" onPress={handleSubmit(onSubmit)} loading={loading} style={styles.submitBtn} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
        <Link href="/(auth)/login" style={styles.loginLink}>
          Inicia sesión aquí
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 40, marginBottom: 30, alignItems: 'center' },
  title: { fontFamily: 'BarlowCondensed_800ExtraBold', fontSize: 32, color: colors.primary, textTransform: 'uppercase' },
  subtitle: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.textMuted, marginTop: 8, textAlign: 'center' },
  form: { backgroundColor: colors.surface, padding: 24, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  submitBtn: { marginTop: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32, marginBottom: 20 },
  footerText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.textMuted },
  loginLink: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: colors.primary },
});
