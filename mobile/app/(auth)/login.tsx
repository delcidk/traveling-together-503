import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
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

const LoginSchema = z.object({
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof LoginSchema>;

export default function LoginScreen() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error al iniciar sesión',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>INICIAR SESIÓN</Text>
        <Text style={styles.subtitle}>Bienvenido de vuelta a Traveling Together 503</Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Correo electrónico"
              placeholder="tu@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Contraseña"
              placeholder="••••••••"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        <Link href="/(auth)/forgot-password" style={styles.forgotPassword}>
          ¿Olvidaste tu contraseña?
        </Link>

        <Button 
          title="Ingresar" 
          onPress={handleSubmit(onSubmit)} 
          loading={loading} 
          style={styles.submitBtn}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No tienes cuenta? </Text>
        <Link href="/(auth)/register" style={styles.registerLink}>
          Regístrate aquí
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 60,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'BarlowCondensed_800ExtraBold',
    fontSize: 32,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  forgotPassword: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: -4,
    marginBottom: 24,
  },
  submitBtn: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.textMuted,
  },
  registerLink: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: colors.primary,
  },
});
