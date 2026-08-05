import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { getLeagues, League } from "../services/leagues";
import { useRouter } from "expo-router";
import Navbar from "./navbar";
import { COLORS, TYPOGRAPHY } from "../constants/theme";

const LeaguesScreen = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const data = await getLeagues();
        setLeagues(data);
      } catch (err) {
        console.error("Error fetching leagues:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, []);

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primaryBlue} size="large" />
      </View>
    );

  return (
    <View style={styles.page}>
      {/* 1. Styled Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>Your Leagues</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* 2. Action Buttons Section */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.primaryButtonSmall}
            onPress={() => router.push("/createLeague")}
          >
            <Text style={styles.buttonText}>+ CREATE NEW</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButtonSmall}
            onPress={() => router.push("/joinLeague")}
          >
            <Text style={styles.buttonText}>JOIN LEAGUE</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Section Header with Stripe */}
        <View style={styles.sectionHeader}>
          <View style={styles.stripe} />
          <Text style={styles.sectionTitle}>Current Leagues</Text>
        </View>

        {/* 4. League List */}
        {leagues.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              You haven't joined any leagues yet.
            </Text>
          </View>
        ) : (
          leagues.map((league) => (
            <TouchableOpacity
              key={league.id}
              style={styles.leagueCard}
              onPress={() => router.push(`/leagues/${league.id}`)}
            >
              <View>
                <Text style={styles.leagueName}>{league.name}</Text>
                {/* <Text style={styles.leagueOwner}>
                  COMMISSIONER: {league.owner_name?.toUpperCase()}
                </Text> */}
              </View>
              <View style={styles.arrowContainer}>
                <Text style={{ color: COLORS.primaryBlue, fontSize: 20 }}>
                  ➔
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Navbar stays at the very bottom */}
      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  container: { flex: 1, padding: 20 },

  topBar: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    padding: 20,
    // paddingTop: 20,
  },
  topBarText: {
    color: COLORS.text,
    fontSize: 28,
    fontFamily: TYPOGRAPHY.title,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  primaryButtonSmall: {
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    flex: 0.48,
    alignItems: "center",
  },
  secondaryButtonSmall: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    flex: 0.48,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 14,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  stripe: {
    width: 4,
    height: 20,
    backgroundColor: COLORS.primaryRed,
    marginRight: 10,
  },
  sectionTitle: {
    color: COLORS.muted,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 18,
    textTransform: "uppercase",
  },

  leagueCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
  },
  leagueName: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 20,
    textTransform: "uppercase",
  },
  leagueOwner: {
    color: COLORS.faint,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 12,
    marginTop: 4,
  },
  emptyCard: {
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.border,
  },
  emptyText: { color: COLORS.faint, fontFamily: TYPOGRAPHY.body },
  arrowContainer: { paddingLeft: 10 },
});

export default LeaguesScreen;
