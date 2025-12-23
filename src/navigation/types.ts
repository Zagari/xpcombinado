import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  OTP: { email: string };
  Home: undefined;
  Activities: undefined;
  Settings: undefined;
  ActivitiesSettings: undefined;
  ScreenTimeSettings: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type OTPScreenProps = NativeStackScreenProps<RootStackParamList, 'OTP'>;
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type ActivitiesScreenProps = NativeStackScreenProps<RootStackParamList, 'Activities'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;
export type ActivitiesSettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'ActivitiesSettings'>;
export type ScreenTimeSettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'ScreenTimeSettings'>;
