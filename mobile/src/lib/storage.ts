import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const getWebStorage = () => {
  if (typeof localStorage === "undefined") {
    return null;
  }
  return localStorage;
};

export async function readSecureValue(key: string) {
  if (Platform.OS === "web") {
    return getWebStorage()?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

export async function writeSecureValue(key: string, value: string) {
  if (Platform.OS === "web") {
    getWebStorage()?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function removeSecureValue(key: string) {
  if (Platform.OS === "web") {
    getWebStorage()?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
