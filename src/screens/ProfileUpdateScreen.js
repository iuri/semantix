import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const phoneRegex = /^\+?[0-9\s().-]{10,}$/;

const schema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().regex(phoneRegex, 'Enter a valid phone number'),
  location: z.string().min(2, 'Location is required'),
});

export default function ProfileUpdateScreen() {
  const navigation = useNavigation();
  const { api } = useAuth();
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      location: '',
    },
  });

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      setServerError('');
      try {
        const response = await api.get('http://localhost:8000/api/profile');
        const data = response?.data || {};
        if (!mounted) return;
        setUserId(data.id || null);
        setValue('first_name', data.first_name || '', { shouldValidate: true });
        setValue('last_name', data.last_name || '', { shouldValidate: true });
        setValue('email', data.email || '', { shouldValidate: true });
        setValue('phone', data.phone || '', { shouldValidate: true });
        setValue('location', data.location || '', { shouldValidate: true });
      } catch (err) {
        if (!mounted) return;
        const message = err?.response?.data?.message || err?.message || 'Failed to load profile';
        setServerError(message);
      }
    };
    loadProfile();
    return () => {
      mounted = false;
    };
  }, [api, setValue]);

  const onSubmit = async (values) => {
    setServerError('');
    setSuccessMessage('');
    if (!userId) {
      setServerError('Missing user id to update. Please reopen the screen.');
      return;
    }
    try {
      await api.put(`http://localhost:8000/api/user/update/${userId}`, values);
      setSuccessMessage('Profile updated successfully');
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 422) {
        const first = err?.response?.data?.errors;
        const message = typeof first === 'string' ? first : 'Validation failed';
        setServerError(message);
        return;
      }
      const message = err?.response?.data?.message || err?.message || 'Failed to update profile';
      setServerError(message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Update Profile</Text>

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

          <Text style={styles.label}>Phone</Text>
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

          {serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}
          {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

          <TouchableOpacity
            style={[styles.button, (!isValid || isSubmitting) && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
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
    marginTop: 10,
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
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 18,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  errorText: {
    color: colors.error,
    marginTop: 4,
  },
  successText: {
    color: '#1f8c46',
    marginTop: 4,
  },
});
