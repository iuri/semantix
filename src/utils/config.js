import Constants from 'expo-constants';

export const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:8000/api';
export const SPLASH_VIDEO_URL = Constants.expoConfig?.extra?.splashVideoUrl || 'https://cdn.example.com/splash.mp4';

