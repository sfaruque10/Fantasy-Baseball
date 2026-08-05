import { useLocalSearchParams } from "expo-router";

import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";

import { getPlayerById } from "../../services/players";

import {
  COLORS,
  TYPOGRAPHY,
} from "../../constants/theme";

export default function PlayerPage() {
  const { id } = useLocalSearchParams();

  const [player, setPlayer] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const data = await getPlayerById(
          Number(id)
        );

        setPlayer(data);

      } catch (err) {
        console.error(
          "Error fetching player:",
          err
        );

      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primaryRed}
        />
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.notFoundText}>
          Player not found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{
        padding: 20,
      }}
    >
      {/* PLAYER CARD */}
      <View style={styles.playerCard}>
        {/* MLB STRIPE */}
        <View style={styles.stripe} />

        {/* PLAYER HEADER */}
        <View style={styles.headerSection}>
          {/* PLAYER INITIAL */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {player.name?.charAt(0)}
            </Text>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.playerName}>
              {player.name}
            </Text>

            <Text style={styles.playerSubtitle}>
              {player.position}
              {" • "}
              {player.team}
            </Text>
          </View>
        </View>

        {/* DETAILS */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>
            PLAYER DETAILS
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              POSITION
            </Text>

            <Text style={styles.detailValue}>
              {player.position}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              MLB TEAM
            </Text>

            <Text style={styles.detailValue}>
              {player.team}
            </Text>
          </View>

          {player.points !== undefined && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                POINTS
              </Text>

              <Text style={styles.detailValue}>
                {player.points}
              </Text>
            </View>
          )}
        </View>

        {/* STATS SECTION */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>
            SEASON STATS
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>
                HR
              </Text>

              <Text style={styles.statValue}>
                {player.hr ?? 0}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>
                RBI
              </Text>

              <Text style={styles.statValue}>
                {player.rbi ?? 0}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>
                AVG
              </Text>

              <Text style={styles.statValue}>
                {player.avg ?? ".000"}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>
                SB
              </Text>

              <Text style={styles.statValue}>
                {player.sb ?? 0}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
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

  notFoundText: {
    color: COLORS.text,
    fontSize: 24,
    fontFamily: TYPOGRAPHY.title,
    textTransform: "uppercase",
  },

  playerCard: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 24,
  },

  stripe: {
    height: 8,
    backgroundColor: COLORS.primaryRed,
    marginBottom: 22,
  },

  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.primaryBlue,
    borderWidth: 3,
    borderColor: COLORS.primaryRed,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 24,
  },

  avatarText: {
    color: "white",
    fontSize: 44,
    fontFamily: TYPOGRAPHY.title,
  },

  headerInfo: {
    flex: 1,
  },

  playerName: {
    color: COLORS.text,
    fontSize: 40,
    fontFamily: TYPOGRAPHY.title,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },

  playerSubtitle: {
    color: "#93C5FD",
    fontFamily: TYPOGRAPHY.body,
    fontSize: 18,
  },

  detailsSection: {
    backgroundColor: COLORS.cardAlt,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 24,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontFamily: TYPOGRAPHY.title,
    letterSpacing: 1,
    marginBottom: 18,
    textTransform: "uppercase",
  },

  detailRow: {
    marginBottom: 14,
  },

  detailLabel: {
    color: COLORS.primaryRed,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 15,
    letterSpacing: 1,
    marginBottom: 4,
  },

  detailValue: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 18,
  },

  statsSection: {
    backgroundColor: COLORS.cardAlt,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 20,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  statCard: {
    width: 120,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingVertical: 18,
    alignItems: "center",
  },

  statLabel: {
    color: COLORS.primaryRed,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 16,
    letterSpacing: 1,
    marginBottom: 6,
  },

  statValue: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 28,
  },
});