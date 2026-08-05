import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import { createLeague } from "../services/leagues";
import { COLORS, TYPOGRAPHY } from "../constants/theme";
import { useRouter } from "expo-router";
import Navbar from "./navbar";

export default function CreateLeague() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createLeague(name);
      router.replace("/leagues");
    } catch (err: any) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <View style={styles.page}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>Establish League</Text>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.section}>
          {/* Label with Red Stripe */}
          <View style={styles.labelRow}>
            <View style={styles.stripe} />
            <Text style={styles.label}>League Designation</Text>
          </View>

          <TextInput
            placeholder="E.G. THE CHAMPIONS CIRCLE..."
            placeholderTextColor={COLORS.faint}
            value={name}
            onChangeText={setName}
            style={styles.input}
            autoCapitalize="characters"
          />

          <Text style={styles.hint}>
            Establishing a league makes you the Commissioner. You will have
            control over draft starts and roster locks.
          </Text>

          <TouchableOpacity
            style={[styles.createButton, !name.trim() && { opacity: 0.5 }]}
            onPress={handleCreate}
            disabled={!name.trim()}
          >
            <Text style={styles.buttonText}>INITIALIZE LEAGUE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Navbar pinned to bottom */}
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    padding: 20,
    // paddingTop: 50,
  },
  topBarText: {
    color: COLORS.text,
    fontSize: 28,
    fontFamily: TYPOGRAPHY.title,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginTop: 10,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  stripe: {
    width: 4,
    height: 18,
    backgroundColor: COLORS.primaryRed,
    marginRight: 10,
  },
  label: {
    color: COLORS.muted,
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 14,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: COLORS.cardAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 18,
    padding: 15,
    marginBottom: 15,
  },
  hint: {
    color: COLORS.faint,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 25,
  },
  createButton: {
    backgroundColor: COLORS.primaryBlue,
    padding: 18,
    alignItems: "center",
    borderRadius: 2,
  },
  buttonText: {
    color: "white",
    fontFamily: TYPOGRAPHY.title,
    fontSize: 18,
    letterSpacing: 1.5,
  },
});
