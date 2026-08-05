import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { joinLeague, getAvailableLeagues } from "../services/leagues";
import { COLORS, TYPOGRAPHY } from "../constants/theme";
import { useRouter } from "expo-router";
import Navbar from "./navbar";

export default function JoinLeague() {
  const [name, setName] = useState("");
  const [availableLeagues, setAvailableLeagues] = useState<any[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<any>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const data = await getAvailableLeagues();
        setAvailableLeagues(data);
      } catch (err) {
        console.error("Error loading leagues:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeagues();
  }, []);
  // if (loading) return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator color={COLORS.primaryBlue} size="large" />
  //     </View>
  //   );
  const handleJoin = async () => {
    if (!selectedLeague || !name) {
      alert("Please enter a team name and select a league.");
      return;
    }
    try {
      await joinLeague(name, selectedLeague.name);
      router.replace("/leagues");
    } catch (err: any) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.inputContainer,
            isFocused && {
              backgroundColor: "#1E293B",
              borderColor: COLORS.primaryBlue,
              borderWidth: 2,
            },
          ]}
        >
          <TextInput
            placeholder="Enter Team Name"
            placeholderTextColor={COLORS.faint}
            value={name}
            onChangeText={setName}
            style={styles.inputText}
          />
        </View>
        <FlatList
          data={availableLeagues}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const isSelected = selectedLeague?.id === item.id;
            return (
              <TouchableOpacity
                onPress={() => setSelectedLeague(item)}
                style={[
                  styles.leagueCard,
                  isSelected && styles.leagueCardSelected,
                ]}
              >
                {isSelected && <View style={styles.selectionIndicator} />}
                <Text style={styles.leagueName}>{item.name}</Text>
                <Text style={styles.leagueSubText}>
                  Owner: {item.owner_name} | Teams: {item.current_teams}/16
                </Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={{ color: COLORS.faint, fontFamily: TYPOGRAPHY.body }}>
              No open leagues found.
            </Text>
          }
        />
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.joinButton,
              (!selectedLeague || !name) && styles.joinButtonDisabled,
            ]}
            onPress={handleJoin}
            disabled={!selectedLeague || !name}
          >
            <Text style={styles.joinButtonText}>
              {selectedLeague
                ? `JOIN: ${selectedLeague.name}`
                : "SELECT A LEAGUE"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 20,
  },

  // The Header of the whole page
  headerSection: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.primaryRed,
    padding: 24,
    paddingTop: 40,
    marginBottom: 20,
  },

  headerTitle: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 32,
    textTransform: "uppercase",
    letterSpacing: 2,
  },

  // Section Headers (Step 1, Step 2)
  formLabelSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 10,
  },

  formLabelStripe: {
    width: 6,
    height: 24,
    backgroundColor: COLORS.primaryBlue,
    marginRight: 10,
  },

  formLabelText: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 18,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Input Box
  inputContainer: {
    backgroundColor: COLORS.cardAlt,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 30,
  },

  inputText: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 18,
  },

  // League Cards in the list
  leagueCard: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 12,
    position: "relative",
    overflow: "hidden",
  },

  leagueCardSelected: {
    borderColor: COLORS.lightBlue,
    backgroundColor: COLORS.cardAlt,
  },

  selectionIndicator: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: COLORS.primaryBlue,
  },

  leagueName: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 22,
    textTransform: "uppercase",
  },

  leagueSubText: {
    color: COLORS.faint,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 14,
    marginTop: 4,
  },

  // Bottom Action Button
  footer: {
    padding: 20,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  joinButton: {
    backgroundColor: COLORS.primaryBlue,
    borderWidth: 2,
    borderColor: COLORS.lightBlue,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  joinButtonDisabled: {
    backgroundColor: COLORS.secondaryBlue,
    borderColor: COLORS.border,
    opacity: 0.5,
  },

  joinButtonText: {
    color: "white",
    fontFamily: TYPOGRAPHY.title,
    fontSize: 20,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
