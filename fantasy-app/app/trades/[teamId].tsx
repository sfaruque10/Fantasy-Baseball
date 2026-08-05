import { useLocalSearchParams, useFocusEffect, useRouter } from "expo-router";

import React, { useState, useCallback, useEffect } from "react";

import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import {
  getTradesForTeam,
  acceptTrade,
  rejectTrade,
  Trade,
} from "../../services/trades";

import { COLORS, TYPOGRAPHY } from "../../constants/theme";
import Navbar from "../navbar";

// import Navbar from "../navbar";

export default function TradesPage() {
  const { teamId, leagueId } = useLocalSearchParams();

  const router = useRouter();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrades = async () => {
    try {
      const data = await getTradesForTeam(Number(teamId));

      setTrades(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTrades();
    }, [teamId]),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      loadTrades();
    }, 5000);

    return () => clearInterval(interval);
  }, [teamId]);

  const handleAccept = async (id: number) => {
    try {
      await acceptTrade(id);

      loadTrades();
    } catch (err: any) {
      console.error(err);

      alert(err?.response?.data?.error || "Failed to accept trade");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectTrade(id);

      loadTrades();
    } catch (err: any) {
      console.error(err);

      alert(err?.response?.data?.error || "Failed to reject trade");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryRed} />
      </View>
    );
  }

  return (
    // <<<<<<< Updated upstream
    //     <View style={styles.page}>
    // =======
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* >>>>>>> Stashed changes */}
      <ScrollView
        style={styles.page}
        contentContainerStyle={{
          padding: 20,
          // <<<<<<< Updated upstream
          // =======
          paddingBottom: 100,
          // >>>>>>> Stashed changes
        }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.stripe} />

          {/* <<<<<<< Updated upstream
          <Text style={styles.title}>
            Trades
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname:
                  "/trades/createTrade",
                params: {
                  teamId,
                  leagueId,
                },
              })
            }
            style={styles.primaryButton}
          >
            <Text style={styles.buttonText}>
              CREATE TRADE
            </Text>
          </TouchableOpacity>
        </View>

======= */}
          <Text style={styles.title}>Trades</Text>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/trades/createTrade",
                params: {
                  teamId,
                  leagueId,
                },
              })
            }
            style={styles.primaryButton}
          >
            <Text style={styles.buttonText}>CREATE TRADE</Text>
          </TouchableOpacity>
        </View>

        {/* >>>>>>> Stashed changes */}
        {/* TRADE LIST */}
        {trades.map((trade) => (
          <View
            key={trade.id}
            style={[
              styles.tradeCard,
              {
                borderColor:
                  trade.status === "accepted"
                    ? COLORS.primaryBlue
                    : // <<<<<<< Updated upstream
                      //                     : trade.status ===
                      //                       "rejected"
                      //                     ? COLORS.primaryRed
                      //                     : COLORS.border,
                      // =======
                      trade.status === "rejected"
                      ? COLORS.primaryRed
                      : COLORS.border,
                // >>>>>>> Stashed changes
              },
            ]}
          >
            <View
              style={[
                styles.tradeStripe,
                {
                  backgroundColor:
                    // <<<<<<< Updated upstream
                    //                     trade.status ===
                    //                     "accepted"
                    //                       ? COLORS.primaryBlue
                    //                       : trade.status ===
                    //                         "rejected"
                    //                       ? COLORS.primaryRed
                    //                       : "#64748B",
                    // =======
                    trade.status === "accepted"
                      ? COLORS.primaryBlue
                      : trade.status === "rejected"
                        ? COLORS.primaryRed
                        : "#64748B",
                  // >>>>>>> Stashed changes
                },
              ]}
            />

            {/* <<<<<<< Updated upstream
            <Text style={styles.tradeTitle}>
              TRADE #{trade.id}
            </Text>

            <View style={{ marginBottom: 14 }}>
              <Text style={styles.tradeSectionTitle}>
                OFFERING
              </Text>

              {trade.offered_players.map((player: any) => (
                <Text
                  key={player.id}
                  style={styles.playerText}
                >
                  • {player.name} ({player.position})
                </Text>
              ))}
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={styles.tradeSectionTitle}>
                REQUESTING
              </Text>

              {trade.requested_players.map((player: any) => (
                <Text
                  key={player.id}
                  style={styles.playerText}
                >
                  • {player.name} ({player.position})
                </Text>
              ))}
            </View>

            <Text style={styles.tradeText}>
              {trade.from_team_name}
              {" ↔ "}
              {trade.to_team_name}
            </Text>

======= */}
            <Text style={styles.tradeTitle}>TRADE #{trade.id}</Text>

            <View style={{ marginBottom: 14 }}>
              <Text style={styles.tradeSectionTitle}>OFFERING</Text>

              {trade.offered_players.map((player: any) => (
                <Text key={player.id} style={styles.playerText}>
                  • {player.name} ({player.position})
                </Text>
              ))}
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={styles.tradeSectionTitle}>REQUESTING</Text>

              {trade.requested_players.map((player: any) => (
                <Text key={player.id} style={styles.playerText}>
                  • {player.name} ({player.position})
                </Text>
              ))}
            </View>

            <Text style={styles.tradeText}>
              {trade.from_team_name}
              {" ↔ "}
              {trade.to_team_name}
            </Text>

            {/* >>>>>>> Stashed changes */}
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    // <<<<<<< Updated upstream
                    //                     trade.status ===
                    //                     "accepted"
                    //                       ? COLORS.primaryBlue
                    //                       : trade.status ===
                    //                         "rejected"
                    //                       ? COLORS.primaryRed
                    //                       : "#475569",
                    // =======
                    trade.status === "accepted"
                      ? COLORS.primaryBlue
                      : trade.status === "rejected"
                        ? COLORS.primaryRed
                        : "#475569",
                  // >>>>>>> Stashed changes
                },
              ]}
            >
              <Text style={styles.statusText}>
                {trade.status.toUpperCase()}
              </Text>
            </View>

            {trade.status === "pending" &&
              // <<<<<<< Updated upstream
              //               trade.to_team_id ===
              //                 Number(teamId) && (
              //                 <View style={styles.buttonRow}>
              //                   <TouchableOpacity
              //                     onPress={() =>
              //                       handleAccept(trade.id)
              //                     }
              //                     style={
              //                       styles.primaryButtonSmall
              //                     }
              //                   >
              //                     <Text
              //                       style={styles.buttonText}
              //                     >
              //                       ACCEPT
              //                     </Text>
              //                   </TouchableOpacity>

              //                   <TouchableOpacity
              //                     onPress={() =>
              //                       handleReject(trade.id)
              //                     }
              //                     style={styles.redButtonSmall}
              //                   >
              //                     <Text
              //                       style={styles.buttonText}
              //                     >
              //                       REJECT
              //                     </Text>
              // =======
              trade.to_team_id === Number(teamId) && (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    onPress={() => handleAccept(trade.id)}
                    style={styles.primaryButtonSmall}
                  >
                    <Text style={styles.buttonText}>ACCEPT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleReject(trade.id)}
                    style={styles.redButtonSmall}
                  >
                    <Text style={styles.buttonText}>REJECT</Text>
                    {/* >>>>>>> Stashed changes */}
                  </TouchableOpacity>
                </View>
              )}
          </View>
        ))}
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

  header: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 22,
    marginBottom: 20,
  },

  stripe: {
    height: 8,
    backgroundColor: COLORS.primaryRed,
    marginBottom: 18,
  },

  title: {
    color: COLORS.text,
    fontSize: 34,
    fontFamily: TYPOGRAPHY.title,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 18,
  },

  tradeCard: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    padding: 20,
    marginBottom: 16,
  },

  tradeStripe: {
    height: 6,
    marginBottom: 14,
  },

  tradeTitle: {
    color: COLORS.text,
    fontSize: 26,
    fontFamily: TYPOGRAPHY.title,
    letterSpacing: 1,
    marginBottom: 8,
  },

  tradeText: {
    color: COLORS.muted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 17,
    marginBottom: 12,
  },

  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 18,
  },

  statusText: {
    color: "white",
    fontFamily: TYPOGRAPHY.title,
    letterSpacing: 1,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },

  primaryButton: {
    backgroundColor: COLORS.primaryBlue,
    borderWidth: 2,
    borderColor: COLORS.lightBlue,
    padding: 14,
    alignItems: "center",
  },

  primaryButtonSmall: {
    backgroundColor: COLORS.primaryBlue,
    borderWidth: 2,
    borderColor: COLORS.lightBlue,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  redButtonSmall: {
    backgroundColor: COLORS.primaryRed,
    borderWidth: 2,
    borderColor: COLORS.lightRed,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  buttonText: {
    color: "white",
    fontFamily: TYPOGRAPHY.title,
    letterSpacing: 1,
  },

  tradeSectionTitle: {
    color: COLORS.primaryRed,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 16,
    letterSpacing: 1,
    marginBottom: 6,
  },

  playerText: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 15,
    marginBottom: 4,
  },
});
