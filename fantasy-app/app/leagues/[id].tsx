import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  getLeagueDetails,
  getLeagueTeams,
  lockLeaguePermanently,
  startLeagueDraft,
  League,
  Team,
} from "../../services/leagues";
import { getCurrentUser } from "@/services/user";
import { COLORS, TYPOGRAPHY } from "@/constants/theme";
import Navbar from "../navbar";

const LeagueDetailsScreen = () => {
  const { id } = useLocalSearchParams();

  const [league, setLeagueDetails] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null); // Track user
  const [loading, setLoading] = useState(true);
  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [leagueData, teamData, userData] = await Promise.all([
        getLeagueDetails(Number(id)),
        getLeagueTeams(Number(id)),
        getCurrentUser(),
      ]);

      setLeagueDetails(leagueData);
      setTeams(teamData);
      if (userData) setCurrentUserId(userData.id);
    } catch (err) {
      console.error("Error fetching league data:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      console.log("Background league refresh triggered...");
      fetchData(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [id]);

  const handleToggleLock = async () => {
    try {
      const response = await lockLeaguePermanently(Number(id));

      // Extract the first object from the response array
      const updatedRow = Array.isArray(response) ? response[0] : response;

      if (updatedRow) {
        setLeagueDetails((prev) => {
          if (!prev) return updatedRow;
          return {
            ...prev,
            ...updatedRow, // This specifically updates team_add
          };
        });

        Alert.alert(
          "Success",
          updatedRow.team_add ? "League Unlocked" : "League Locked",
        );
      }
    } catch (err) {
      console.error("Toggle error:", err);
      Alert.alert("Error", "Could not update league status");
    }
  };
  const handleStartDraft = async () => {
    try {
      const response = await startLeagueDraft(Number(id));
      const updatedRow = Array.isArray(response) ? response[0] : response;

      if (updatedRow) {
        setLeagueDetails((prev) =>
          prev ? { ...prev, ...updatedRow } : updatedRow,
        );
        // Refresh teams to get the new randomized draft order
        const updatedTeams = await getLeagueTeams(Number(id));
        setTeams(updatedTeams);

        Alert.alert("Success", "Draft has officially started!");
      }
    } catch (err) {
      Alert.alert(
        "Error",
        "Check if league is locked and you have at least 2 teams.",
      );
    }
  };
  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
      </View>
    );
  console.log(teams);
  if (!league) return <Text>League not found</Text>;
  const isOwner = currentUserId === league.owner_id;
  console.log(isOwner, currentUserId, league.owner_id);
  const isLocked = league.team_add === false;
  console.log(isLocked, league.team_add);

  const teamsByDraftOrder = [...teams].sort(
    (a, b) => a.draft_order - b.draft_order,
  );
  const teamsByStandings = [...teams].sort(
    (a, b) => (b.total_season_points || 0) - (a.total_season_points || 0),
  );

  return (
    <View style={styles.page}>
      {/* TOP BAR / HEADER */}
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>{league.name}</Text>
        <Text style={styles.ownerText}>
          OWNER: {league.owner_name?.toUpperCase()}
        </Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* LEAGUE STATUS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.stripe,
                {
                  backgroundColor: isLocked
                    ? COLORS.primaryRed
                    : COLORS.primaryBlue,
                },
              ]}
            />
            <Text style={styles.sectionTitle}>League Status</Text>
          </View>
          <Text style={styles.statusText}>
            {league.team_add
              ? "OPEN (JOINING ALLOWED)"
              : "LOCKED (JOINING DISABLED)"}
          </Text>

          {isOwner && !isLocked && (
            <TouchableOpacity
              style={styles.redButton}
              onPress={() => {
                if (Platform.OS === "web") {
                  if (window.confirm("Lock league? No more teams can join."))
                    handleToggleLock();
                } else {
                  Alert.alert("Permanent Action", "Lock league?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Lock Forever",
                      onPress: handleToggleLock,
                      style: "destructive",
                    },
                  ]);
                }
              }}
            >
              <Text style={styles.buttonText}>LOCK LEAGUE PERMANENTLY</Text>
            </TouchableOpacity>
          )}

          {isOwner &&
            isLocked &&
            !league.draft &&
            !league.draft_complete &&
            teams.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={[styles.statusText, { marginBottom: 10 }]}>
                  All teams in? Start the draft!
                </Text>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleStartDraft}
                >
                  <Text style={styles.buttonText}>START DRAFT MODE</Text>
                </TouchableOpacity>
              </View>
            )}
        </View>

        {/* DRAFT PROGRESS NAVIGATION */}
        {league.draft && (
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              const userTeam = teams.find((t) => t.user_id === currentUserId);
              if (userTeam) {
                router.push({
                  pathname: `/teams/[id]`,
                  params: { id: userTeam.id, leagueId: id },
                });
              } else {
                Alert.alert("Error", "You don't have a team in this league.");
              }
            }}
          >
            <Text style={styles.actionCardTitle}>DRAFT IS IN PROGRESS!</Text>
            <Text style={styles.actionCardSub}>
              GO TO YOUR TEAM'S DRAFT ROOM ➔
            </Text>
          </TouchableOpacity>
        )}

        {/* DRAFT COMPLETE NAVIGATION */}
        {league.draft_complete && (
          <TouchableOpacity
            style={[
              styles.actionCard,
              { backgroundColor: COLORS.cardAlt, borderColor: COLORS.border },
            ]}
            onPress={() => {
              const userTeam = teams.find((t) => t.user_id === currentUserId);
              if (userTeam) {
                router.push({
                  pathname: `/teams/[id]`,
                  params: { id: userTeam.id, leagueId: id },
                });
              } else {
                Alert.alert(
                  "Notice",
                  "You are viewing this league as a guest.",
                );
              }
            }}
          >
            <Text style={[styles.actionCardTitle, { color: COLORS.muted }]}>
              SEASON IS ACTIVE - DRAFT COMPLETE
            </Text>
            <Text style={styles.actionCardSub}>GO TO MY ROSTER ➔</Text>
          </TouchableOpacity>
        )}

        {/* DRAFT ORDER vs STANDINGS LIST */}
        {!league.draft_complete ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.stripe} />
              <Text style={styles.sectionTitle}>Teams (Draft Order)</Text>
            </View>
            {teams.map((team) => (
              <TouchableOpacity
                key={team.id}
                style={styles.teamRow}
                onPress={() =>
                  router.push({
                    pathname: `/teams/[id]`,
                    params: { id: team.id, leagueId: id },
                  })
                }
              >
                <Text style={styles.draftRank}>{team.draft_order + 1}</Text>
                <Text style={styles.teamNameText}>{team.name}</Text>
                <Text style={styles.teamOwnerText}>@{team.username}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.stripe} />
              <Text style={styles.sectionTitle}>League Standings</Text>
            </View>

            <View style={styles.tableHeader}>
              <Text style={[styles.columnLabel, { width: 35 }]}>#</Text>
              <Text style={[styles.columnLabel, { flex: 1 }]}>TEAM</Text>
              <Text style={[styles.columnLabel, { textAlign: "right" }]}>
                POINTS
              </Text>
            </View>

            {teamsByStandings.map((team, index) => (
              <TouchableOpacity
                key={team.id}
                style={styles.standingRow}
                onPress={() =>
                  router.push({
                    pathname: `/teams/[id]`,
                    params: { id: team.id, leagueId: id },
                  })
                }
              >
                <Text style={styles.rankText}>{index + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.teamNameText}>{team.name}</Text>
                  <Text style={styles.teamOwnerText}>@{team.username}</Text>
                </View>
                <Text style={styles.pointsText}>
                  {Number(team.total_season_points || 0).toFixed(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  topBar: {
    backgroundColor: COLORS.card,
    padding: 20,
    // paddingTop: 60,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  topBarText: {
    color: COLORS.text,
    fontSize: 28,
    fontFamily: TYPOGRAPHY.title,
    textTransform: "uppercase",
  },
  ownerText: {
    color: COLORS.lightBlue,
    fontSize: 12,
    fontFamily: TYPOGRAPHY.body,
    marginTop: 4,
  },
  container: { flex: 1, padding: 20 },
  section: { marginBottom: 30 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  stripe: {
    width: 4,
    height: 20,
    backgroundColor: COLORS.primaryBlue,
    marginRight: 10,
  },
  sectionTitle: {
    color: COLORS.muted,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 18,
    textTransform: "uppercase",
  },
  statusText: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 16,
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: COLORS.primaryBlue,
    padding: 16,
    alignItems: "center",
    borderRadius: 4,
  },
  redButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.primaryRed,
    padding: 16,
    alignItems: "center",
    borderRadius: 4,
  },
  buttonText: {
    color: "white",
    fontFamily: TYPOGRAPHY.title,
    fontSize: 14,
    letterSpacing: 1,
  },
  actionCard: {
    backgroundColor: COLORS.secondaryBlue,
    padding: 20,
    borderRadius: 8,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.lightBlue,
  },
  actionCardTitle: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 20,
    marginBottom: 4,
  },
  actionCardSub: {
    color: COLORS.lightBlue,
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 12,
  },
  teamRow: {
    backgroundColor: COLORS.cardAlt,
    padding: 15,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  draftRank: {
    color: COLORS.lightBlue,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 20,
    marginRight: 15,
    width: 25,
  },
  teamNameText: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 16,
    textTransform: "uppercase",
  },
  teamOwnerText: {
    color: COLORS.faint,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 12,
    marginLeft: 10,
  },
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  columnLabel: {
    color: COLORS.faint,
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 12,
  },
  standingRow: {
    backgroundColor: COLORS.card,
    padding: 15,
    marginBottom: 2,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rankText: {
    color: COLORS.muted,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 18,
    width: 30,
  },
  pointsText: {
    color: COLORS.primaryBlue,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 20,
  },
});
export default LeagueDetailsScreen;
