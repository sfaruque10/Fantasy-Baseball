import { router } from "expo-router";

import { useState } from "react";

import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { register } from "../services/auth";

import { COLORS, TYPOGRAPHY } from "../constants/theme";

import AsyncStorage from "@react-native-async-storage/async-storage";

function Signup() {
  const [username, onChangeUsername] = useState("");

  const [email, onChangeEmail] = useState("");

  const [password, onChangePassword] = useState("");

  const [reenterPassword, onChangeReenterPassword] = useState("");

  const handleSignup = async () => {
    if (password !== reenterPassword) {
      alert("Passwords do not match!");

      return;
    }

    try {
      const response = await register(username, email, password);

      await AsyncStorage.setItem("token", response.token);

      router.replace("/home");
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        {/* HEADER STRIPE */}
        <View style={styles.stripe} />

        <Text style={styles.title}>SIGN UP</Text>

        <Text style={styles.subtitle}>Build your fantasy dynasty</Text>

        <TextInput
          placeholder="Username"
          placeholderTextColor="#64748B"
          value={username}
          onChangeText={onChangeUsername}
          style={styles.input}
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#64748B"
          value={email}
          onChangeText={onChangeEmail}
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

        <TextInput
          placeholder="Re-Enter Password"
          placeholderTextColor="#64748B"
          secureTextEntry={true}
          value={reenterPassword}
          onChangeText={onChangeReenterPassword}
          style={styles.input}
        />

        <TouchableOpacity onPress={handleSignup} style={styles.redButton}>
          <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Signup;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20,
  },

  card: {
    width: 450,
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

  redButton: {
    backgroundColor: COLORS.primaryRed,
    borderWidth: 2,
    borderColor: COLORS.lightRed,
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
