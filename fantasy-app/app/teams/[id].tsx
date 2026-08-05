import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Button,
  RefreshControl,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { getTeamById, Team, syncTeamPoints } from "../../services/teams";
import { getCurrentUser } from "@/services/user";
import API from "../../services/api";
import { getLeagueTeams } from "@/services/leagues";
import { COLORS, TYPOGRAPHY } from "../../constants/theme";
import Navbar from "../navbar";
import { Stack } from "expo-router";
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  topBar: {
    backgroundColor: COLORS.card,
    padding: 20,
    // paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topBarText: {
    color: COLORS.text,
    fontSize: 26,
    fontFamily: TYPOGRAPHY.title,
    textTransform: "uppercase",
  },
  ownerText: {
    color: COLORS.lightBlue,
    fontSize: 12,
    fontFamily: TYPOGRAPHY.body,
  },
  scoreBoard: {
    backgroundColor: COLORS.cardAlt,
    margin: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primaryBlue,
  },
  scoreLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontFamily: TYPOGRAPHY.subtitle,
    letterSpacing: 1,
  },
  scoreValue: {
    color: COLORS.text,
    fontSize: 36,
    fontFamily: TYPOGRAPHY.title,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondaryBlue,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginTop: 15,
  },
  redStripe: {
    width: 5,
    height: "100%",
    backgroundColor: COLORS.primaryRed,
    marginRight: 10,
  },
  categoryHeaderText: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 16,
    letterSpacing: 1,
  },
  playerCard: {
    backgroundColor: COLORS.card,
    padding: 15,
    marginHorizontal: 15,
    marginTop: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 16,
  },
  playerPosition: { color: COLORS.faint, fontSize: 12 },
  playerPoints: {
    color: COLORS.lightBlue,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 20,
  },
  actionRow: { flexDirection: "row", marginTop: 10, gap: 10 },
  swapButton: {
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 2,
  },
  dropButton: {
    borderWidth: 1,
    borderColor: COLORS.primaryRed,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 2,
  },
  buttonText: { color: "white", fontFamily: TYPOGRAPHY.title, fontSize: 12 },
  emptySlot: {
    marginHorizontal: 15,
    padding: 15,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 2,
    alignItems: "center",
  },
  emptyText: { color: COLORS.faint, fontFamily: TYPOGRAPHY.body, fontSize: 12 },
  tradeButton: {
    backgroundColor: COLORS.primaryBlue,
    margin: 20,
    padding: 18,
    alignItems: "center",
    borderRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background, // #060B16
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText: {
    color: COLORS.lightBlue, // #60A5FA
    fontFamily: TYPOGRAPHY.subtitle, // Oswald_600SemiBold
    fontSize: 14,
    marginTop: 20,
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  errorText: {
    color: COLORS.primaryRed, // #C8102E
    fontFamily: TYPOGRAPHY.title, // Oswald_700Bold
    fontSize: 18,
    textTransform: "uppercase",
  },
});
interface TeamPlayer {
  id: number;
  player_id: number;
  name: string;
  position: string;
  team: string;
  slot: string; // The database column that saves "First Base", "Infielder", etc.
  points: number;
}

const getDraftStatus = (totalPicks: number, numTeams: number) => {
  if (numTeams === 0) return { round: 1, pickingTeamIndex: 0 };
  const round = Math.floor(totalPicks / numTeams) + 1;
  const pickInRound = (totalPicks % numTeams) + 1;

  // Reverse order on even rounds
  const pickingTeamIndex =
    round % 2 !== 0 ? pickInRound - 1 : numTeams - pickInRound;

  return { round, pickingTeamIndex };
};

export default function TeamPage() {
  const { id, leagueId } = useLocalSearchParams();
  const router = useRouter();

  const [team, setTeam] = useState<Team | null>(null);
  const [league, setLeague] = useState<any>(null);
  const [allLeagueTeams, setAllLeagueTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [selectedBenchPlayer, setSelectedBenchPlayer] =
    useState<TeamPlayer | null>(null);
  const [swappingPlayer, setSwappingPlayer] = useState<TeamPlayer | null>(null);
  const [currentUser, setCurrentUser] = useState<number | null>(null);
  const [leagueDraftedIds, setLeagueDraftedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setTeam(null);
      setPlayers([]);
      setLoading(true);
      const fetchTeamData = async () => {
        if (!id || !leagueId) return;
        try {
          console.log(`Switching to Team ID: ${id}`);
          const [
            teamData,
            rosterRes,
            userIdData,
            leagueRosterRes,
            leagueTeams,
            leagueDetails,
          ] = await Promise.all([
            getTeamById(Number(id)),
            API.get(`/teams/${id}/players`),
            getCurrentUser(),
            API.get(`/leagues/${leagueId}/drafted-players`),
            getLeagueTeams(Number(leagueId)),
            API.get(`/leagues/${leagueId}`),
          ]);

          setTeam(teamData);
          setPlayers(rosterRes.data);
          setLeagueDraftedIds(leagueRosterRes.data);
          setCurrentUser(userIdData.id);
          setLeague(leagueDetails.data);
          setAllLeagueTeams(
            leagueTeams.sort((a: any, b: any) => a.draft_order - b.draft_order),
          );
          setLoading(false);
        } catch (err) {
          console.error("Error fetching team data:", err);
          setLoading(false);
        }
      };
      fetchTeamData();
      return () => {
        setTeam(null);
        setPlayers([]);
      };
    }, [id, leagueId]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    console.log("Refreshing started...");

    try {
      // 1. Tell backend to pull new stats from ESPN and update the DB
      await syncTeamPoints(Number(id));

      // 2. Fetch the UPDATED data from the database
      // We fetch both so the Season Total (team) and Roster (players) match
      const [rosterRes, updatedTeamData] = await Promise.all([
        API.get(`/teams/${id}/players`),
        getTeamById(Number(id)),
      ]);

      // 3. Update local state to trigger a re-render
      setPlayers(rosterRes.data);
      setTeam(updatedTeamData);

      console.log("Sync UI Update Complete");
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setRefreshing(false);
    }
  };
  useEffect(() => {
    if (refreshing || !league?.draft) return;
    const pollData = async () => {
      try {
        // await syncTeamPoints(Number(id));
        const leagueRosterRes = await API.get(
          `/leagues/${leagueId}/drafted-players`,
        );

        const rosterRes = await API.get(`/teams/${id}/players`);
        const completionRes = await API.get(
          `/leagues/${leagueId}/check-completion`,
        );
        setLeagueDraftedIds(leagueRosterRes.data);
        setPlayers(rosterRes.data);
        if (completionRes.data.finished && league?.draft) {
          console.log("Draft completion detected!");

          // Fetch fresh league details to update league.draft to 'false'
          // and league.draft_complete to 'true'
          const updatedLeague = await API.get(`/leagues/${leagueId}`);
          setLeague(updatedLeague.data);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    // Poll every 3 seconds (3000ms)
    const interval = setInterval(pollData, 3000);

    return () => clearInterval(interval);
  }, [id, leagueId, refreshing, league?.draft]);

  const handleAddPlayerNav = (positionName: string) => {
    // const currentIds = players.map((p) => p.player_id);

    router.push({
      pathname: "/positionPlayer",
      params: {
        position: positionName,
        teamId: id,
        lID: leagueId,
        existingIds: JSON.stringify(leagueDraftedIds),
      },
    });
  };
  const handleDropPlayer = async (player_id: number) => {
    const message = "Are you sure you want to drop this player?";

    // Cross-platform confirmation
    const confirmed = Platform.OS === "web" ? window.confirm(message) : true; // For mobile, you'd ideally use Alert.alert here

    if (confirmed) {
      try {
        // This hits your backend route: router.delete("/:id/players/:playerId")
        await API.delete(`/teams/${id}/players/${player_id}`);

        // Refresh the local roster state
        const rosterRes = await API.get(`/teams/${id}/players`);
        setPlayers(rosterRes.data);

        console.log("Player dropped successfully");
      } catch (err) {
        console.error("Drop failed:", err);
        alert("Failed to drop player.");
      }
    }
  };
  const { round, pickingTeamIndex } = getDraftStatus(
    leagueDraftedIds.length,
    allLeagueTeams.length,
  );
  const teamOnClock = allLeagueTeams[pickingTeamIndex];
  const isUserTurn = currentUser === teamOnClock?.user_id;
  const isViewingOwnTeam = currentUser === team?.user_id;
  console.log("Current User:", currentUser, typeof currentUser);
  console.log(
    "Team on Clock UserID:",
    teamOnClock?.user_id,
    typeof teamOnClock?.user_id,
  );
  console.log("Is it turn?", currentUser === teamOnClock?.user_id);

  // const renderSlot = (label: string, searchPos: string, index: number = 0) => {
  //   const matchingPlayers = players.filter((p) => p.slot === label);
  //   const player = matchingPlayers[index];
  //   const isOwner = currentUser === team?.user_id;

  //   if (player) {
  //     return (
  //       <View key={`${player.id}-${index}`}>
  //         <Text>
  //           {label}: {player.name} ({player.position})
  //         </Text>
  //       </View>
  //     );
  //   }

  //   if (isOwner) {
  //     return (
  //       <View key={`${label}-${index}`}>
  //         <Button
  //           title={`Add ${label}`}
  //           onPress={() => handleAddPlayerNav(searchPos)}
  //         />
  //       </View>
  //     );
  //   }

  //   return null;
  // };

  // const updateSlot = async (player_id: number, slot: string) => {
  //   try {
  //     await API.patch(`/teams/${id}/players`, {
  //       team_id: Number(id),
  //       player_id,
  //       slot,
  //     });

  //     // refresh roster
  //     const rosterRes = await API.get(`/teams/${id}/players`);
  //     setPlayers(rosterRes.data);
  //   } catch (err) {
  //     console.error("Slot update failed:", err);
  //   }
  // };
  const updateSlot = async (player_id: number, newSlot: string) => {
    try {
      // 1. Define the capacity for each slot type
      const slotCapacities: { [key: string]: number } = {
        Catcher: 2,
        Infielder: 6,
        Outfielder: 5,
        Pitcher: 9,
        "Designated Hitter": 1,
        Bench: 5,
      };

      // 2. Count how many players are currently in the target slot
      const playersInTargetSlot = players.filter((p) => p.slot === newSlot);
      const capacity = slotCapacities[newSlot] || 1;

      // 3. If the slot is full, bump the first player we find in that slot to the Bench
      if (newSlot !== "Bench" && playersInTargetSlot.length >= capacity) {
        const playerToBump = playersInTargetSlot[0]; // Bumps the first one in the list

        await API.patch(`/teams/${id}/players`, {
          team_id: Number(id),
          player_id: playerToBump.player_id,
          slot: "Bench",
        });
      }

      // 4. Move the new player into the slot
      await API.patch(`/teams/${id}/players`, {
        team_id: Number(id),
        player_id: player_id,
        slot: newSlot,
      });

      // 5. Refresh Roster
      const rosterRes = await API.get(`/teams/${id}/players`);
      setPlayers(rosterRes.data);
    } catch (err) {
      console.error("Swap failed:", err);
    }
  };
  // const performSwap = async (starterToReplace: TeamPlayer) => {
  //   if (!selectedBenchPlayer) return;

  //   // 1. Safety Check: Verify position eligibility before hitting the API
  //   const isEligible = isValidForSlot(
  //     selectedBenchPlayer.position,
  //     starterToReplace.slot,
  //   );

  //   if (!isEligible) {
  //     alert(
  //       `${selectedBenchPlayer.name} (${selectedBenchPlayer.position}) cannot play ${starterToReplace.slot}!`,
  //     );
  //     return;
  //   }

  //   try {
  //     // 2. Move the Starter to the Bench
  //     await API.patch(`/teams/${id}/players`, {
  //       team_id: Number(id),
  //       player_id: starterToReplace.player_id,
  //       slot: "Bench",
  //     });

  //     // 3. Move the Selected Bench Player to the Starter's Slot
  //     await API.patch(`/teams/${id}/players`, {
  //       team_id: Number(id),
  //       player_id: selectedBenchPlayer.player_id,
  //       slot: starterToReplace.slot,
  //     });

  //     // 4. Reset state and refresh
  //     setSelectedBenchPlayer(null);
  //     const rosterRes = await API.get(`/teams/${id}/players`);
  //     setPlayers(rosterRes.data);

  //     alert(
  //       `Swapped ${selectedBenchPlayer.name} with ${starterToReplace.name}`,
  //     );
  //   } catch (err) {
  //     console.error("Swap error:", err);
  //     alert("An error occurred while swapping players.");
  //   }
  // };
  // const performSwap = async (playerA: TeamPlayer, playerB: TeamPlayer) => {
  //   const aCanGoToB = isValidForSlot(playerA.position, playerB.slot);
  //   const bCanGoToA = isValidForSlot(playerB.position, playerA.slot);
  //   if (!aCanGoToB || !bCanGoToA) {
  //     alert(
  //       `Invalid Swap: ${playerA.position} and ${playerB.position} are not compatible for these slots.`,
  //     );
  //     return;
  //   }
  //   try {
  //     // Move Player A to Player B's slot
  //     await API.patch(`/teams/${id}/players`, {
  //       team_id: Number(id),
  //       player_id: playerA.player_id,
  //       slot: playerB.slot,
  //     });

  //     // Move Player B to Player A's slot
  //     await API.patch(`/teams/${id}/players`, {
  //       team_id: Number(id),
  //       player_id: playerB.player_id,
  //       slot: playerA.slot,
  //     });

  //     setSwappingPlayer(null); // Reset
  //     const rosterRes = await API.get(`/teams/${id}/players`);
  //     setPlayers(rosterRes.data);
  //     alert(`Swapped ${playerA.name} and ${playerB.name}`);
  //   } catch (err) {
  //     console.error("Swap failed", err);
  //   }
  // };
  const performSwap = async (
    playerA: TeamPlayer,
    playerB?: TeamPlayer | null,
    targetSlot?: string,
  ) => {
    if (playerB) {
      // --- SCENARIO 1: TRADING PLACES ---
      const aCanGoToB = isValidForSlot(playerA.position, playerB.slot);
      const bCanGoToA = isValidForSlot(playerB.position, playerA.slot);

      if (!aCanGoToB || !bCanGoToA) {
        alert(`Invalid Swap: Positions not compatible for these slots.`);
        return;
      }

      try {
        // Step 1: Move Player A to B's slot
        await API.patch(`/teams/${id}/players`, {
          team_id: Number(id),
          player_id: playerA.player_id,
          slot: playerB.slot,
        });

        // Step 2: Move Player B to A's slot
        await API.patch(`/teams/${id}/players`, {
          team_id: Number(id),
          player_id: playerB.player_id,
          slot: playerA.slot,
        });

        alert(`Swapped ${playerA.name} and ${playerB.name}`);
      } catch (err) {
        console.error("Swap failed", err);
      }
    } else if (targetSlot) {
      // --- SCENARIO 2: MOVING INTO A HOLE ---
      const canGoToHole = isValidForSlot(playerA.position, targetSlot);

      if (!canGoToHole) {
        alert(
          `Invalid Move: ${playerA.name} (${playerA.position}) cannot play ${targetSlot}.`,
        );
        return;
      }

      try {
        // Just move Player A to the empty slot
        await API.patch(`/teams/${id}/players`, {
          team_id: Number(id),
          player_id: playerA.player_id,
          slot: targetSlot,
        });

        alert(`Moved ${playerA.name} to ${targetSlot}`);
      } catch (err) {
        console.error("Move failed", err);
      }
    }

    // --- REFRESH UI ---
    setSwappingPlayer(null); // Reset selection
    const rosterRes = await API.get(`/teams/${id}/players`);
    setPlayers(rosterRes.data);
  };
  // // Inside TeamPage pollData function
  // const pollData = async () => {
  //   try {
  //     const [leagueRosterRes, rosterRes, completionRes] = await Promise.all([
  //       API.get(`/leagues/${leagueId}/drafted-players`),
  //       API.get(`/teams/${id}/players`),
  //       API.get(`/leagues/${leagueId}/check-completion`), // 🔥 New completion check
  //     ]);

  //     setLeagueDraftedIds(leagueRosterRes.data);
  //     setPlayers(rosterRes.data);

  //     // 🔥 If backend says draft is finished, but our local state thinks it's still going
  //     if (completionRes.data.finished && league?.draft) {
  //       // Re-fetch league to update state and unlock swapping
  //       const leagueDetails = await API.get(`/leagues/${leagueId}`);
  //       setLeague(leagueDetails.data);
  //       console.log("Draft complete! Rosters unlocked.");
  //     }
  //   } catch (err) {
  //     console.error("Polling error:", err);
  //   }
  // };

  // const isValidForSlot = (playerPos: string, slot: string) => {
  //   if (slot === "Bench" || slot === "Any") return true;
  //   const isPitcher = [
  //     "Pitcher",
  //     "Relief Pitcher",
  //     "Starting Pitcher",
  //     "RP",
  //   ].includes(playerPos);
  //   if (slot === "Pitcher") return isPitcher;
  //   if (isPitcher) return false;
  //   const isOutfielder = [
  //     "Left Fielder",
  //     "Right Fielder",
  //     "Center Fielder",
  //     "Outfielder",
  //   ].includes(playerPos);
  //   // Infielder accepts multiple positions
  //   if (slot === "Infielder") {
  //     return [
  //       "First Baseman",
  //       "Second Baseman",
  //       "Third Baseman",
  //       "Shortstop",
  //     ].includes(playerPos);
  //   }

  //   if (slot === "Outfielder") return isOutfielder;
  //   if (isPitcher) return false;
  //   if (slot === "Catcher") return ["Catcher", "C"].includes(playerPos);
  //   // if (slot === "Pitcher") return playerPos === "Pitcher";

  //   return playerPos === slot;
  // };
  const isValidForSlot = (playerPos: string, slot: string) => {
    if (slot === "Bench" || slot === "Any") return true;

    const isPitcher = [
      "Pitcher",
      "Relief Pitcher",
      "Starting Pitcher",
      "RP",
      "SP",
      "P",
    ].includes(playerPos);

    // 1. Pitcher Slot Rule
    if (slot === "Pitcher") return isPitcher;

    // 2. Hitter Slot Rule: If they are a pitcher, they cannot hit (C, INF, OF, DH)
    if (isPitcher) return false;

    // 3. Designated Hitter Rule: Any non-pitcher can be a DH
    if (slot === "Designated Hitter") return true;

    const isOutfielder = [
      "Left Fielder",
      "Right Fielder",
      "Center Fielder",
      "Outfielder",
      "OF",
    ].includes(playerPos);

    // 4. Infielder accepts multiple positions
    if (slot === "Infielder") {
      return [
        "First Baseman",
        "Second Baseman",
        "Third Baseman",
        "Shortstop",
        "1B",
        "2B",
        "3B",
        "SS",
      ].includes(playerPos);
    }

    if (slot === "Outfielder") return isOutfielder;
    if (slot === "Catcher") return ["Catcher", "C"].includes(playerPos);

    return playerPos === slot;
  };
  const renderSlot = (label: string, searchPos: string, index: number = 0) => {
    const player = players.filter((p) => p.slot === label)[index];

    if (player) {
      const isThisSelected = swappingPlayer?.player_id === player.player_id;
      const canSwapHere =
        swappingPlayer &&
        !isThisSelected &&
        swappingPlayer.slot !== label &&
        isValidForSlot(swappingPlayer.position, label);

      return (
        <View key={`${player.id}-${index}`} style={styles.playerCard}>
          <View style={styles.playerInfo}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/player",
                  params: { playerID: player.player_id }, // Just the ID is enough now!
                })
              }
            >
              <Text style={[styles.playerName, { color: COLORS.lightBlue }]}>
                {player.name.toUpperCase()} ➔
              </Text>
            </TouchableOpacity>
            <Text style={styles.playerPosition}>
              {label} • {player.position}
            </Text>

            {isViewingOwnTeam && (
              <View style={styles.actionRow}>
                {/* SWAP BUTTON (Disabled during draft) */}
                {!league?.draft && (
                  <TouchableOpacity
                    style={[
                      styles.swapButton,
                      {
                        backgroundColor: canSwapHere
                          ? "orange"
                          : isThisSelected
                            ? COLORS.primaryRed
                            : COLORS.primaryBlue,
                      },
                    ]}
                    onPress={() => {
                      if (canSwapHere) performSwap(swappingPlayer, player);
                      else setSwappingPlayer(isThisSelected ? null : player);
                    }}
                  >
                    <Text style={styles.buttonText}>
                      {isThisSelected
                        ? "CANCEL"
                        : canSwapHere
                          ? `CONFIRM`
                          : "SWAP"}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* DROP BUTTON (Only after draft is complete) */}
                {league?.draft_complete && (
                  <TouchableOpacity
                    style={styles.dropButton}
                    onPress={() => handleDropPlayer(player.player_id)}
                  >
                    <Text
                      style={[styles.buttonText, { color: COLORS.lightRed }]}
                    >
                      DROP
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.playerPoints}>
              {Number(player.points || 0).toFixed(1)}
            </Text>
            <Text
              style={{
                color: COLORS.faint,
                fontSize: 10,
                fontFamily: TYPOGRAPHY.body,
              }}
            >
              PTS
            </Text>
          </View>
        </View>
      );
    }

    // --- LOGIC FOR EMPTY SLOTS ---
    const isFreeAgency = league?.draft_complete;
    const isMyTurnToDraft = league?.draft && isUserTurn;
    const isRosterFull = players.length >= 28;
    const isPlayerSelected = swappingPlayer !== null;
    const canSwapIntoThisHole =
      swappingPlayer &&
      isValidForSlot(swappingPlayer.position, label) &&
      swappingPlayer.slot !== label;
    // YOUR ORIGINAL CONDITIONALS:
    if (league?.draft && isUserTurn && isViewingOwnTeam) {
      return (
        <TouchableOpacity
          key={`${label}-${index}`}
          style={styles.emptySlot}
          onPress={() => handleAddPlayerNav(searchPos)}
        >
          <Text
            style={[
              styles.emptyText,
              { color: COLORS.lightBlue, fontFamily: TYPOGRAPHY.subtitle },
            ]}
          >
            + DRAFT {label.toUpperCase()}
          </Text>
        </TouchableOpacity>
      );
    }

    if (isViewingOwnTeam && (isMyTurnToDraft || isFreeAgency)) {
      if (canSwapIntoThisHole) {
        return (
          <TouchableOpacity
            key={`${label}-${index}`}
            style={[
              styles.emptySlot,
              { borderColor: "orange", borderStyle: "solid" },
            ]}
            onPress={() => performSwap(swappingPlayer, null, label)} // null because target is empty
          >
            <Text style={[styles.emptyText, { color: "orange" }]}>
              ➔ MOVE {swappingPlayer.name.toUpperCase()} HERE
            </Text>
          </TouchableOpacity>
        );
      }
      if (swappingPlayer && swappingPlayer.slot === label) {
        return (
          <View key={`${label}-${index}`} style={styles.emptySlot}>
            <Text style={styles.emptyText}>{label.toUpperCase()} EMPTY</Text>
          </View>
        );
      }
      if (isRosterFull) {
        return (
          <View
            key={`${label}-${index}`}
            style={[styles.emptySlot, { opacity: 0.5 }]}
          >
            <Text style={[styles.emptyText, { color: COLORS.faint }]}>
              {label.toUpperCase()} EMPTY (ROSTER FULL 28/28)
            </Text>
          </View>
        );
      }
      return (
        <TouchableOpacity
          key={`${label}-${index}`}
          style={styles.emptySlot}
          onPress={() => handleAddPlayerNav(searchPos)}
        >
          <Text
            style={[
              styles.emptyText,
              { color: isFreeAgency ? "#28a745" : COLORS.lightBlue },
            ]}
          >
            +{" "}
            {isFreeAgency
              ? `ADD ${label.toUpperCase()}`
              : `DRAFT ${label.toUpperCase()}`}
          </Text>
        </TouchableOpacity>
      );
    }

    // FALLBACK VIEW
    return (
      <View key={`${label}-${index}`} style={styles.emptySlot}>
        <Text style={styles.emptyText}>
          {label.toUpperCase()}:{" "}
          {league?.draft
            ? "WAITING..."
            : league?.draft_complete
              ? "EMPTY"
              : "DRAFT NOT STARTED"}
        </Text>
      </View>
    );
  };

  const benchPlayers = players.filter(
    (p) =>
      p.slot === "Bench" ||
      p.slot === "Any"
  );

  const MIN_BENCH_SLOTS = 5;

  const totalBenchSlots = Math.max(
    MIN_BENCH_SLOTS,
    benchPlayers.length
  );
  const totalPoints = players
    .filter((p) => p.slot !== "Bench") // Only sum up starters
    .reduce((sum, player) => sum + (Number(player.points) || 0), 0);

  const totalDailyPoints = players
    .filter((p) => p.slot !== "Bench")
    .reduce((sum, player) => sum + (Number(player.points) || 0), 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
      </View>
    );
  }

  // ONLY check for !team once loading is false
  if (!team) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: COLORS.text }}>Team Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primaryBlue}
          />
        }
      >
        {/* 1. TEAM HEADER */}
        <View style={styles.topBar}>
          <Text style={styles.topBarText}>{team.name}</Text>
          <Text style={styles.ownerText}>
            OWNER: {team.username?.toUpperCase()}
          </Text>
        </View>

        {/* 2. SCOREBOARD SECTION */}
        <View style={styles.scoreBoard}>
          <View>
            <Text style={styles.scoreLabel}>SEASON TOTAL</Text>
            <Text style={styles.scoreValue}>
              {Number(team.total_season_points || 0).toFixed(1)}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.scoreLabel}>TODAY'S ACTIVE</Text>
            <Text
              style={[
                styles.scoreValue,
                { fontSize: 24, color: COLORS.lightBlue },
              ]}
            >
              {totalDailyPoints.toFixed(1)}
            </Text>
            <TouchableOpacity
              onPress={onRefresh}
              disabled={refreshing}
              style={{ marginTop: 5 }}
            >
              <Text
                style={{
                  color: COLORS.faint,
                  fontSize: 10,
                  fontFamily: TYPOGRAPHY.subtitle,
                }}
              >
                {refreshing ? "SYNCING..." : "SYNC NOW ↻"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. ROSTER GROUPS */}
        <View style={styles.categoryHeader}>
          <View style={styles.redStripe} />
          <Text style={styles.categoryHeaderText}>CATCHERS</Text>
        </View>
        {renderSlot("Catcher", "Catcher", 0)}
        {renderSlot("Catcher", "Catcher", 1)}

        <View style={styles.categoryHeader}>
          <View style={styles.redStripe} />
          <Text style={styles.categoryHeaderText}>INFIELD</Text>
        </View>
        {[0, 1, 2, 3, 4, 5].map((i) => renderSlot("Infielder", "Infielder", i))}

        <View style={styles.categoryHeader}>
          <View style={styles.redStripe} />
          <Text style={styles.categoryHeaderText}>OUTFIELD</Text>
        </View>
        {[0, 1, 2, 3, 4].map((i) => renderSlot("Outfielder", "Outfielder", i))}

        <View style={styles.categoryHeader}>
          <View style={styles.redStripe} />
          <Text style={styles.categoryHeaderText}>UTILITY</Text>
        </View>
        {renderSlot("Designated Hitter", "Designated Hitter")}

        <View style={styles.categoryHeader}>
          <View style={styles.redStripe} />
          <Text style={styles.categoryHeaderText}>PITCHERS</Text>
        </View>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) =>
          renderSlot("Pitcher", "Pitcher", i),
        )}

        {/* 4. BENCH SECTION */}
        <View
          style={[
            styles.categoryHeader,
            { backgroundColor: COLORS.cardAlt, marginTop: 30 },
          ]}
        >
          <View
            style={[styles.redStripe, { backgroundColor: COLORS.primaryBlue }]}
          />
          <Text style={styles.categoryHeaderText}>BENCH</Text>
        </View>

        {Array.from({
          length: totalBenchSlots,
        }).map((_, i) => {
          const player = benchPlayers[i];

          if (!player) {
            return (
              <View
                key={`empty-bench-${i}`}
                style={styles.emptySlot}
              >
                <Text style={styles.emptyText}>
                  EMPTY BENCH SLOT
                </Text>
              </View>
            );
          }
          const isThisSelected =
            swappingPlayer?.player_id === player.player_id;

          const canSwapHere =
            swappingPlayer &&
            !isThisSelected &&
            swappingPlayer.slot !== "Bench" &&
            swappingPlayer.slot !== "Any" &&
            isValidForSlot(player.position, swappingPlayer.slot);

          return (
            <View key={`bench-${player.player_id}`} style={styles.playerCard}>
              <View style={styles.playerInfo}>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/player",
                      params: { playerID: player.player_id }, // Just the ID is enough now!
                    })
                  }
                >
                  <Text
                    style={[
                      styles.playerName,
                      {
                        color: COLORS.lightBlue,
                      },
                    ]}
                  >
                    {player.name.toUpperCase()} ➔
                  </Text>
                </TouchableOpacity>

                <Text style={styles.playerPosition}>
                  BENCH • {player.position}
                </Text>

                {isViewingOwnTeam && (
                  <View style={styles.actionRow}>
                    {/* SWAP BUTTON (Visible if not drafting) */}
                    {!league?.draft && (
                      <TouchableOpacity
                        style={[
                          styles.swapButton,
                          canSwapHere && { backgroundColor: "orange" },
                          isThisSelected && { backgroundColor: "red" },
                        ]}
                        onPress={() => {
                          if (canSwapHere)
                            performSwap(swappingPlayer, player);
                          else
                            setSwappingPlayer(isThisSelected ? null : player);
                        }}
                      >
                        <Text style={styles.buttonText}>
                          {isThisSelected
                            ? "CANCEL"
                            : canSwapHere
                              ? "SWAP HERE"
                              : "SWAP"}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* 🔥 DROP BUTTON (Added: Only visible after draft) */}
                    {league?.draft_complete && (
                      <TouchableOpacity
                        style={styles.dropButton}
                        onPress={() => handleDropPlayer(player.player_id)}
                      >
                        <Text
                          style={[
                            styles.buttonText,
                            { color: COLORS.lightRed },
                          ]}
                        >
                          DROP
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
              <Text style={styles.playerPoints}>
                {Number(player.points || 0).toFixed(1)}
              </Text>
            </View>
          );
        })}
        {isViewingOwnTeam &&
          (league?.draft_complete || (league?.draft && isUserTurn)) && (
            <View style={{ marginTop: 5 }}>
              {players.length >= 28 ? (
                /* State: Roster is Full */
                <View style={[styles.emptySlot, { opacity: 0.5 }]}>
                  <Text style={styles.emptyText}>
                    BENCH FULL (ROSTER 28/28)
                  </Text>
                </View>
              ) : (
                /* State: Room for Free Agent */
                <TouchableOpacity
                  style={styles.emptySlot}
                  onPress={() => handleAddPlayerNav("Any")}
                >
                  <Text
                    style={[
                      styles.emptyText,
                      {
                        color: league?.draft_complete
                          ? "#28a745"
                          : COLORS.lightBlue,
                      },
                    ]}
                  >
                    +{" "}
                    {league?.draft_complete
                      ? "ADD FREE AGENT TO BENCH"
                      : "DRAFT TO BENCH"}{" "}
                    ({players.length}/28)
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        <TouchableOpacity
          style={styles.tradeButton}
          onPress={() =>
            router.push({
              pathname: "/trades/[teamId]",
              params: { teamId: String(id), leagueId: leagueId },
            })
          }
        >
          <Text style={[styles.buttonText, { fontSize: 16 }]}>
            OPEN TRADE CENTER
          </Text>
        </TouchableOpacity>

        {/* Spacer to prevent Navbar overlapping content */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <Navbar />
    </View>
  );
}
