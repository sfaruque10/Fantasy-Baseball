import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";
import { getUserTeams } from "../services/user";
import { COLORS, TYPOGRAPHY } from "../constants/theme";
import Navbar from "./navbar";

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<any>(null);

  const [teams, setTeams] = useState<any[]>([]);

  const [recentTrades, setRecentTrades] = useState<any[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userRes = await API.get("/auth/me");

        setUser(userRes.data);

        const teamData = await getUserTeams();

        setTeams(teamData);

        if (teamData.length > 0) {
          const allTrades = [];

          for (const team of teamData) {
            const tradeRes = await API.get(`/trades/team/${team.id}`);

            allTrades.push(...tradeRes.data);
          }

          const sortedTrades = allTrades.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );

          setRecentTrades(sortedTrades.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem("token");

    router.replace("/");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryRed} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        style={styles.page}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100,
        }}
      >
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <Text style={styles.topBarText}>{user?.username}</Text>
        </View>

        <View style={styles.mainContent}>
          {/* PROFILE CARD */}
          <View style={styles.profileCard}>
            <View style={styles.stripe} />

            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.username?.charAt(0)}</Text>
            </View>

            <Text style={styles.username}>{user?.username}</Text>

            <Text style={styles.subtitle}>Fantasy Baseball Manager</Text>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>EMAIL</Text>

              <Text style={styles.infoText}>{user?.email}</Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/leagues")}
              style={styles.primaryButton}
            >
              <Text style={styles.buttonText}>BROWSE LEAGUES</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={logout} style={styles.redButton}>
              <Text style={styles.buttonText}>LOGOUT</Text>
            </TouchableOpacity>
          </View>

          {/* RIGHT SIDE */}
          <View style={styles.rightSide}>
            {/* TEAMS */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>MY TEAMS</Text>

              {teams.map((team) => (
                <View key={team.id} style={styles.teamCard}>
                  <View style={styles.stripe} />

                  <Text style={styles.teamName}>{team.name}</Text>

                  <Text style={styles.leagueName}>{team.league_name}</Text>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/teams/[id]",
                          params: {
                            id: team.id,
                            leagueId: team.league_id,
                          },
                        })
                      }
                      style={styles.primaryButtonSmall}
                    >
                      <Text style={styles.buttonText}>TEAM</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/leagues/[id]",
                          params: {
                            id: team.league_id,
                          },
                        })
                      }
                      style={styles.secondaryButtonSmall}
                    >
                      <Text style={styles.buttonText}>LEAGUE</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: `/trades/[teamId]`,
                          params: {
                            teamId: team.id,
                            leagueId: team.league_id,
                          },
                        })
                      }
                      style={styles.redButtonSmall}
                    >
                      <Text style={styles.buttonText}>TRADES</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* ACTIVITY */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>

              {recentTrades.map((trade) => (
                <View key={trade.id} style={styles.activityCard}>
                  <Text style={styles.activityTitle}>TRADE</Text>

                  <Text style={styles.activityText}>
                    {trade.from_team_name}
                    {" ↔ "}
                    {trade.to_team_name}
                  </Text>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          trade.status === "accepted"
                            ? COLORS.primaryBlue
                            : trade.status === "rejected"
                              ? COLORS.primaryRed
                              : "#475569",
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {trade.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  topBar: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 20,
  },

  topBarText: {
    color: COLORS.text,
    fontSize: 34,
    fontFamily: TYPOGRAPHY.title,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  mainContent: {
    flexDirection: "row",
    gap: 18,
    alignItems: "flex-start",
  },

  profileCard: {
    width: 250,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 20,
  },

  stripe: {
    height: 8,
    backgroundColor: COLORS.primaryRed,
    marginBottom: 16,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryBlue,
    borderWidth: 3,
    borderColor: COLORS.primaryRed,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 18,
  },

  avatarText: {
    color: "white",
    fontSize: 42,
    fontFamily: TYPOGRAPHY.title,
  },

  username: {
    color: COLORS.text,
    fontSize: 28,
    textAlign: "center",
    fontFamily: TYPOGRAPHY.title,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  subtitle: {
    color: "#93C5FD",
    textAlign: "center",
    marginBottom: 22,
    fontFamily: TYPOGRAPHY.body,
  },

  infoSection: {
    marginBottom: 18,
  },

  infoLabel: {
    color: COLORS.primaryRed,
    fontFamily: TYPOGRAPHY.title,
    marginBottom: 4,
  },

  infoText: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.body,
  },

  rightSide: {
    flex: 1,
  },

  section: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 20,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 30,
    fontFamily: TYPOGRAPHY.title,
    letterSpacing: 1.5,
    marginBottom: 18,
    textTransform: "uppercase",
  },

  teamCard: {
    backgroundColor: COLORS.cardAlt,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 16,
  },

  teamName: {
    color: COLORS.text,
    fontSize: 28,
    fontFamily: TYPOGRAPHY.title,
    textTransform: "uppercase",
  },

  leagueName: {
    color: "#93C5FD",
    fontFamily: TYPOGRAPHY.body,
    marginTop: 6,
    marginBottom: 16,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },

  primaryButton: {
    backgroundColor: COLORS.primaryBlue,
    borderWidth: 2,
    borderColor: COLORS.lightBlue,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
  },

  redButton: {
    backgroundColor: COLORS.primaryRed,
    borderWidth: 2,
    borderColor: COLORS.lightRed,
    padding: 14,
    alignItems: "center",
  },

  primaryButtonSmall: {
    backgroundColor: COLORS.primaryBlue,
    borderWidth: 2,
    borderColor: COLORS.lightBlue,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  secondaryButtonSmall: {
    backgroundColor: COLORS.secondaryBlue,
    borderWidth: 2,
    borderColor: COLORS.lightBlue,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  redButtonSmall: {
    backgroundColor: COLORS.primaryRed,
    borderWidth: 2,
    borderColor: COLORS.lightRed,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  buttonText: {
    color: "white",
    fontFamily: TYPOGRAPHY.title,
    letterSpacing: 1,
  },

  activityCard: {
    backgroundColor: COLORS.cardAlt,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
  },

  activityTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontFamily: TYPOGRAPHY.title,
    marginBottom: 6,
  },

  activityText: {
    color: COLORS.muted,
    fontFamily: TYPOGRAPHY.body,
    marginBottom: 10,
  },

  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
  },

  statusText: {
    color: "white",
    fontFamily: TYPOGRAPHY.title,
    letterSpacing: 0.8,
  },
});
