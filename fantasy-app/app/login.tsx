import { useState } from "react";

import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { login } from "../services/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useRouter } from "expo-router";

import { COLORS, TYPOGRAPHY } from "../constants/theme";

function Login() {
  const [identifier, onChangeIdentifier] = useState("");

  const [password, onChangePassword] = useState("");

  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login(identifier, password);

      const token = await AsyncStorage.getItem("token");

      console.log("TOKEN:", token);

      router.replace("/home");
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        {/* HEADER STRIPE */}
        <View style={styles.stripe} />

        <Text style={styles.title}>LOGIN</Text>

        <Text style={styles.subtitle}>Fantasy Baseball Manager</Text>

        <TextInput
          placeholder="Username or Email"
          placeholderTextColor="#64748B"
          value={identifier}
          onChangeText={onChangeIdentifier}
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#64748B"
          secureTextEntry={true}
          value={password}
          onChangeText={onChangePassword}
          style={styles.input}
        />

        <TouchableOpacity onPress={handleLogin} style={styles.primaryButton}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.linkText}>Need an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Login;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20,
  },

  card: {
    width: 420,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 30,
  },

  stripe: {
    height: 8,
    backgroundColor: COLORS.primaryRed,
    marginBottom: 24,
  },

  title: {
    color: COLORS.text,
    fontSize: 42,
    fontFamily: TYPOGRAPHY.title,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  subtitle: {
    color: "#93C5FD",
    fontSize: 16,
    fontFamily: TYPOGRAPHY.body,
    marginBottom: 24,
  },

  input: {
    backgroundColor: COLORS.cardAlt,
    borderWidth: 2,
    borderColor: COLORS.border,
    color: COLORS.text,
    padding: 14,
    marginBottom: 16,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 16,
  },

  primaryButton: {
    backgroundColor: COLORS.primaryBlue,
    borderWidth: 2,
    borderColor: COLORS.lightBlue,
    padding: 14,
    alignItems: "center",
    marginBottom: 16,
  },

  buttonText: {
    color: "white",
    fontFamily: TYPOGRAPHY.title,
    fontSize: 18,
    letterSpacing: 1,
  },

  linkText: {
    color: "#93C5FD",
    textAlign: "center",
    fontFamily: TYPOGRAPHY.body,
    fontSize: 15,
  },
});
