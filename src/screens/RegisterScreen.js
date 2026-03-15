import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, ImageBackground, Image } from 'react-native';
import * as Location from 'expo-location';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import Footer from '../components/Footer';

const phoneRegex = /^\+?[0-9\s().-]{10,}$/;
const cpfRegex = /^[0-9]{11}$/;

const registerSchema = z
  .object({
    first_name: z.string().min(2, 'First name is required'),
    last_name: z.string().min(2, 'Last name is required'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().regex(phoneRegex, 'Enter a valid phone number'),
    cpf: z.string().regex(cpfRegex, 'Enter a valid CPF (11 digits)'),
    location: z.string().min(2, 'Location is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register } = useAuth();
  const [serverError, setServerError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      cpf: '',
      location: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values) => {
    setServerError('');
    try {
        await register({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone,
          cpf: values.cpf,
          location: values.location,
          password: values.password,
        });
        Alert.alert('Registration Successful', 'We are going to return to you soon!', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        setServerError('Already registered. Sign in!');
        return;
      }

      const message = err?.response?.data?.message || err?.message || 'Registration failed';
      setServerError(message);
    }
  };

  const handleUseCurrentLocation = async () => {
    setServerError('');
    setGettingLocation(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Enable location access to autofill your address.');
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const geocode = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      const place = geocode?.[0];
      const city = place?.city || place?.subregion;
      const state = place?.region || place?.administrativeArea;

      const formatted = [city, state].filter(Boolean).join(', ');

      if (formatted) {
        setValue('location', formatted, { shouldValidate: true });
      } else {
        setServerError('Unable to format location. Please enter manually.');
      }
    } catch (err) {
      setServerError('Unable to fetch location. Please try again.');
    } finally {
      setGettingLocation(false);
    }
  };



  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ImageBackground source={require('../../assets/semantix-img.png')} style={styles.background} resizeMode="cover">
        <View style={styles.overlay} />
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>

         <Text style={styles.label}>First Name</Text>
         <Controller
           control={control}
           name="first_name"
           render={({ field: { onChange, onBlur, value } }) => (
             <TextInput
               style={[styles.input, errors.first_name && styles.inputError]}
               placeholder="John"
               autoCapitalize="words"
               onBlur={onBlur}
               onChangeText={onChange}
               value={value}
             />
           )}
         />
         {errors.first_name && <Text style={styles.errorText}>{errors.first_name.message}</Text>}

         <Text style={styles.label}>Last Name</Text>
         <Controller
           control={control}
           name="last_name"
           render={({ field: { onChange, onBlur, value } }) => (
             <TextInput
               style={[styles.input, errors.last_name && styles.inputError]}
               placeholder="Doe"
               autoCapitalize="words"
               onBlur={onBlur}
               onChangeText={onChange}
               value={value}
             />
           )}
         />
         {errors.last_name && <Text style={styles.errorText}>{errors.last_name.message}</Text>}

         <Text style={styles.label}>Email</Text>
         <Controller
            control={control}
            name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
         />
         {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

          <Text style={styles.label}>Phone Number</Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                placeholder="+55 11 98888-7777"
                keyboardType="phone-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}

         <Text style={styles.label}>CPF</Text>
         <Controller
           control={control}
           name="cpf"
           render={({ field: { onChange, onBlur, value } }) => (
             <TextInput
               style={[styles.input, errors.cpf && styles.inputError]}
               placeholder="00000000000"
               keyboardType="number-pad"
               onBlur={onBlur}
               onChangeText={onChange}
               value={value}
               maxLength={11}
             />
           )}
         />
         {errors.cpf && <Text style={styles.errorText}>{errors.cpf.message}</Text>}

         <Text style={styles.label}>Location</Text>
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
               style={[styles.input, errors.location && styles.inputError]}
               placeholder="City, State"
               autoCapitalize="words"
               onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.location && <Text style={styles.errorText}>{errors.location.message}</Text>}
          <TouchableOpacity
            style={[styles.locationButton, (gettingLocation || isSubmitting) && styles.locationButtonDisabled]}
            onPress={handleUseCurrentLocation}
            disabled={gettingLocation || isSubmitting}
          >
            {gettingLocation ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text style={styles.locationButtonText}>Use current location</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Password</Text>
          <Controller
           control={control}
           name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="••••••••"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

        <Text style={styles.label}>Confirm Password</Text>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              placeholder="••••••••"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}

        {serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isSubmitting || !isValid}>
          {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign up</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Already have an account? Sign in!</Text>
        </TouchableOpacity>
      </View>
      <Footer />
      </ImageBackground>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 60,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 120,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: colors.text,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  locationButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  locationButtonDisabled: {
    opacity: 0.6,
  },
  locationButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
  },
  errorText: {
    color: colors.error,
    marginTop: 4,
  },
  linkText: {
    color: colors.primary,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
});
