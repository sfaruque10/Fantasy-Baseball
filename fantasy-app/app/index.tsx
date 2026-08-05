import { router } from "expo-router";

import { TouchableOpacity, Text, View, StyleSheet } from "react-native";

import { COLORS, TYPOGRAPHY } from "../constants/theme";

export default function Index() {
  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <View style={styles.stripe} />

        <Text style={styles.title}>AMERICA'S FAVORITE FANTASY PASTIME</Text>

        <Text style={styles.subtitle}>Fantasy Baseball Manager</Text>

        <TouchableOpacity
          onPress={() => router.push("/login")}
          style={styles.primaryButton}
        >
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/signup")}
          style={styles.redButton}
        >
          <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20,
  },

  card: {
    width: 500,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 36,
    alignItems: "center",
  },

  stripe: {
    height: 10,
    width: "100%",
    backgroundColor: COLORS.primaryRed,
    marginBottom: 28,
  },

  title: {
    color: COLORS.text,
    fontSize: 52,
    fontFamily: TYPOGRAPHY.title,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
    textAlign: "center",
  },

  subtitle: {
    color: "#93C5FD",
    fontSize: 18,
    fontFamily: TYPOGRAPHY.body,
    marginBottom: 36,
  },

  primaryButton: {
    width: "100%",
    backgroundColor: COLORS.primaryBlue,
    borderWidth: 2,
    borderColor: COLORS.lightBlue,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },

  redButton: {
    width: "100%",
    backgroundColor: COLORS.primaryRed,
    borderWidth: 2,
    borderColor: COLORS.lightRed,
    padding: 16,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontFamily: TYPOGRAPHY.title,
    letterSpacing: 1,
  },
});
