import { useLocalSearchParams, useRouter } from "expo-router";

import React, { useEffect, useState } from "react";

import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";

import { getLeagueTeams } from "../../services/leagues";

import { getTeamPlayers } from "../../services/teams";

import { createTrade } from "../../services/trades";

import { COLORS, TYPOGRAPHY } from "../../constants/theme";
import Navbar from "../navbar";

// import Navbar from "../navbar";

export default function CreateTradePage() {
  const { teamId, leagueId } = useLocalSearchParams();

  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [teams, setTeams] = useState<any[]>([]);

  const [myPlayers, setMyPlayers] = useState<any[]>([]);

  const [theirPlayers, setTheirPlayers] = useState<any[]>([]);

  const [targetTeam, setTargetTeam] = useState<number | null>(null);

  const [offeredPlayers, setOfferedPlayers] = useState<number[]>([]);

  const [requestedPlayers, setRequestedPlayers] = useState<number[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const leagueTeams = await getLeagueTeams(Number(leagueId));

        const roster = await getTeamPlayers(Number(teamId));

        setTeams(leagueTeams.filter((team: any) => team.id !== Number(teamId)));

        setMyPlayers(roster);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const chooseOpponent = async (id: number) => {
    try {
      setTargetTeam(id);

      setRequestedPlayers([]);

      const roster = await getTeamPlayers(id);

      setTheirPlayers(roster);
    } catch (err) {
      console.error(err);
    }
  };

  const togglePlayer = (
    playerId: number,
    selected: number[],
    setter: React.Dispatch<React.SetStateAction<number[]>>,
  ) => {
    if (selected.includes(playerId)) {
      setter(selected.filter((id) => id !== playerId));
    } else {
      setter([...selected, playerId]);
    }
  };

  const submitTrade = async () => {
    if (!targetTeam) {
      Alert.alert("Select a team");
      return;
    }

    if (offeredPlayers.length === 0) {
      Alert.alert("Select players to offer");
      return;
    }

    if (requestedPlayers.length === 0) {
      Alert.alert("Select players to request");
      return;
    }

    try {
      setSubmitting(true);

      await createTrade(
        Number(leagueId),
        Number(teamId),
        targetTeam,
        offeredPlayers,
        requestedPlayers,
      );

      Alert.alert("Trade created");

      router.back();
    } catch (err) {
      console.error(err);

      Alert.alert("Failed to create trade");
    } finally {
      setSubmitting(false);
    }
  };

  const renderSelectablePlayer = (
    player: any,
    selected: number[],
    setter: React.Dispatch<React.SetStateAction<number[]>>,
  ) => {
    const active = selected.includes(player.player_id);

    return (
      <TouchableOpacity
        key={player.player_id}
        onPress={() => togglePlayer(player.player_id, selected, setter)}
        style={[styles.selectableCard, active && styles.selectableCardActive]}
      >
        <Text style={styles.playerName}>{player.name}</Text>

        <Text style={styles.playerInfo}>{player.position}</Text>
      </TouchableOpacity>
    );
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
        <View style={styles.section}>
          <View style={styles.stripe} />
          {/* <<<<<<< Updated upstream

          <Text style={styles.title}>
            CREATE TRADE
          </Text>

          <Text style={styles.subtitle}>
            SELECT OPPONENT
          </Text>
======= */}

          <Text style={styles.title}>CREATE TRADE</Text>

          <Text style={styles.subtitle}>SELECT OPPONENT</Text>
          {/* >>>>>>> Stashed changes */}

          {teams.map((team) => (
            <TouchableOpacity
              key={team.id}
              // <<<<<<< Updated upstream
              //               onPress={() =>
              //                 chooseOpponent(team.id)
              //               }
              //               style={[
              //                 styles.selectableCard,
              //                 targetTeam === team.id &&
              //                   styles.selectableCardActive,
              //               ]}
              //             >
              //               <Text style={styles.playerName}>
              //                 {team.name}
              //               </Text>
              // =======
              onPress={() => chooseOpponent(team.id)}
              style={[
                styles.selectableCard,
                targetTeam === team.id && styles.selectableCardActive,
              ]}
            >
              <Text style={styles.playerName}>{team.name}</Text>
              {/* >>>>>>> Stashed changes */}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          {/* <<<<<<< Updated upstream
          <Text style={styles.subtitle}>
            PLAYERS YOU OFFER
          </Text>

          {myPlayers.map((player) =>
            renderSelectablePlayer(
              player,
              offeredPlayers,
              setOfferedPlayers
            )
======= */}
          <Text style={styles.subtitle}>PLAYERS YOU OFFER</Text>

          {myPlayers.map(
            (player) =>
              renderSelectablePlayer(player, offeredPlayers, setOfferedPlayers),
            // >>>>>>> Stashed changes
          )}
        </View>

        {targetTeam && (
          <View style={styles.section}>
            {/* <<<<<<< Updated upstream
            <Text style={styles.subtitle}>
              PLAYERS YOU REQUEST
            </Text>
======= */}
            <Text style={styles.subtitle}>PLAYERS YOU REQUEST</Text>
            {/* >>>>>>> Stashed changes */}

            {theirPlayers.map(
              (player) =>
                renderSelectablePlayer(
                  player,
                  requestedPlayers,
                  // <<<<<<< Updated upstream
                  //                 setRequestedPlayers
                  //               )
                  // =======
                  setRequestedPlayers,
                ),
              // >>>>>>> Stashed changes
            )}
          </View>
        )}

        <TouchableOpacity
          onPress={submitTrade}
          disabled={submitting}
          style={styles.submitButton}
        >
          <Text style={styles.buttonText}>
            {/* <<<<<<< Updated upstream
            {submitting
              ? "SUBMITTING..."
              : "SUBMIT TRADE"}
======= */}
            {submitting ? "SUBMITTING..." : "SUBMIT TRADE"}
            {/* >>>>>>> Stashed changes */}
          </Text>
        </TouchableOpacity>
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

  section: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 18,
  },

  stripe: {
    height: 8,
    backgroundColor: COLORS.primaryRed,
    marginBottom: 16,
  },

  title: {
    color: COLORS.text,
    fontSize: 34,
    fontFamily: TYPOGRAPHY.title,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 20,
  },

  subtitle: {
    color: COLORS.text,
    fontSize: 24,
    fontFamily: TYPOGRAPHY.title,
    letterSpacing: 1,
    marginBottom: 14,
  },

  selectableCard: {
    backgroundColor: COLORS.cardAlt,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },

  selectableCardActive: {
    backgroundColor: "#172554",
    borderColor: COLORS.primaryBlue,
  },

  playerName: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 18,
    letterSpacing: 0.5,
  },

  playerInfo: {
    color: COLORS.muted,
    fontFamily: TYPOGRAPHY.body,
    marginTop: 4,
    fontSize: 15,
  },

  submitButton: {
    backgroundColor: COLORS.primaryRed,
    borderWidth: 2,
    borderColor: COLORS.lightRed,
    padding: 16,
    alignItems: "center",
    marginBottom: 40,
  },

  buttonText: {
    color: "white",
    fontFamily: TYPOGRAPHY.title,
    fontSize: 18,
    letterSpacing: 1,
  },
});
