import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { addPlayerToTeam } from "@/services/teams";
import API from "@/services/api";
import { COLORS, TYPOGRAPHY } from "@/constants/theme";
import Navbar from "./navbar";
interface RosterResponse {
  athletes: Athletes[];
}
interface Athletes {
  position: string;
  items: Items[];
}

interface Items {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  displayWeight: string;
  displayHeight: string;
  age: number;
  headshot: Headshot;
  jersey: string;
  position: Position;
}
interface Headshot {
  href: string;
}
interface Position {
  displayName: string;
  abbreviation: string;
  parent: Parent;
}

interface Parent {
  id: string;
  displayName: string;
}

function PositionPlayer() {
  const { position, teamId, lID, existingIds } = useLocalSearchParams<{
    position: string;
    teamId: string;
    lID: string;

    existingIds: string;
  }>();

  const router = useRouter();
  const [positionPlayers, setPositionPlayers] = useState<Items[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const alreadyAdded = existingIds ? JSON.parse(existingIds) : [];
  const [alreadyAdded, setAlreadyAdded] = useState<number[]>(
    existingIds ? JSON.parse(existingIds) : [],
  );
  const fetchPlayer = async () => {
    setIsLoading(true);
    try {
      const teamIds = Array.from({ length: 30 }, (_, i) => i + 1);

      const batchSize = 10;
      let allResponses: RosterResponse[] = [];

      for (let i = 0; i < teamIds.length; i += batchSize) {
        const batch = teamIds.slice(i, i + batchSize);
        const batchResponses = await Promise.all(
          batch.map((id) =>
            fetch(
              `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/${id}/roster`,
            ).then((res) => res.json()),
          ),
        );
        allResponses = [...allResponses, ...batchResponses];
      }

      const playersFromAllTeams = allResponses.flatMap(
        (data: RosterResponse) => {
          const target = position.toLowerCase().trim();

          const groupsToGrab = data.athletes?.filter((group: Athletes) => {
            const groupName = group.position.toLowerCase().trim();
            if (target === "any") return true;
            if (target === "designated hitter" || target === "dh") {
              return [
                "catchers",
                "catcher",
                "infielders",
                "infield",
                "outfielders",
                "outfield",
                "designated hitter",
                "designated hitters",
              ].includes(groupName);
            }

            const isInfield = [
              "first baseman",
              "second baseman",
              "third baseman",
              "shortstop",
              "infielder",
            ].includes(target);
            const isOutfield = ["outfielder"].includes(target);
            const isCatcher = target === "catcher";
            const isPitcher = target === "pitcher";

            return (
              groupName.includes(target) ||
              (isInfield &&
                (groupName === "infielders" || groupName === "infield")) ||
              (isOutfield &&
                (groupName === "outfielders" || groupName === "outfield")) ||
              (isCatcher &&
                (groupName === "catchers" || groupName === "catcher")) ||
              (isPitcher &&
                (groupName === "pitchers" || groupName === "pitcher"))
            );
          });

          const items = groupsToGrab
            ? groupsToGrab.flatMap((g) => g.items)
            : [];

          let targetAbbreviation = "";
          if (target === "first baseman") targetAbbreviation = "1B";
          else if (target === "second baseman") targetAbbreviation = "2B";
          else if (target === "third baseman") targetAbbreviation = "3B";
          else if (target === "shortstop") targetAbbreviation = "SS";
          else if (target === "catcher") targetAbbreviation = "C";

          return items.filter((player: any) => {
            if (target === "any") return true;
            if (
              target === "infielder" ||
              target === "outfielder" ||
              target === "catcher"
            )
              return true;

            const playerAbbreviation = player.position?.abbreviation;

            if (target === "designated hitter" || target === "dh") {
              return playerAbbreviation === "DH" || playerAbbreviation !== "P";
            }

            if (target === "pitcher") return true;

            return playerAbbreviation === targetAbbreviation;
          });
        },
      );

      setPositionPlayers(playersFromAllTeams);
    } catch (error) {
      console.error("Failed to fetch players:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const filteredPlayers = positionPlayers.filter((player) =>
    player.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const handleAddPlayer = async (player: Items) => {
    if (isSubmitting) return;
    const isPitcher =
      // player.parent.displayName === "P" ||
      player.position.parent.displayName === "Pitcher" ||
      player.position.parent?.displayName?.toLowerCase().includes("pitchers");
    const target = position.toLowerCase().trim();
    if (target !== "any" && target !== "bench") {
      if (target === "pitcher" && !isPitcher) {
        alert("You cannot put a Hitter in a Pitcher slot.");
        return;
      }
      if (target !== "pitcher" && isPitcher) {
        alert("You cannot put a Pitcher in a Hitter slot.");
        return;
      }
    }
    setIsSubmitting(true);
    try {
      const slotToSave = target === "any" ? "Bench" : position;
      await addPlayerToTeam(Number(teamId), player, Number(lID), slotToSave);
      router.back();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchPlayer();
  }, [position]);

  useEffect(() => {
    const pollDraftedPlayers = async () => {
      try {
        const res = await API.get(`/leagues/${lID}/drafted-players`);
        setAlreadyAdded(res.data); // Updates the array with newly drafted player IDs
      } catch (error) {
        console.error("Failed to poll drafted players:", error);
      }
    };

    const intervalId = setInterval(pollDraftedPlayers, 5000);

    return () => clearInterval(intervalId);
  }, [lID]);

  return (
    <View style={styles.page}>
      {/* 1. HEADER */}
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>{position} Recruitment</Text>
      </View>

      <View style={styles.container}>
        {/* 2. SEARCH SECTION */}
        <View style={styles.searchSection}>
          <TextInput
            placeholder="SEARCH BY PLAYER NAME..."
            placeholderTextColor={COLORS.faint}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            autoCapitalize="characters"
          />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* 3. SECTION HEADER */}
          <View style={styles.sectionHeader}>
            <View style={styles.stripe} />
            <Text style={styles.sectionTitle}>Available Athletes</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primaryBlue}
              style={{ marginTop: 40 }}
            />
          ) : filteredPlayers.length > 0 ? (
            filteredPlayers.map((player) => {
              const isDuplicate = alreadyAdded.includes(Number(player.id));

              return (
                <View key={player.id} style={styles.playerCard}>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>
                      {player.fullName.toUpperCase()}
                    </Text>
                    <Text style={styles.playerSubText}>
                      #{player.jersey || "00"} •{" "}
                      {player.position?.abbreviation || position}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/player",
                          params: {
                            playerID: player.id,
                          },
                        })
                      }
                      style={{ marginTop: 5 }}
                    >
                      <Text
                        style={{
                          color: COLORS.lightBlue,
                          fontFamily: TYPOGRAPHY.body,
                          fontSize: 12,
                        }}
                      >
                        VIEW PROFILE ➔
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {isDuplicate ? (
                    <View style={styles.lockedBadge}>
                      <Text style={styles.lockedText}>DRAFTED</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.addButton,
                        isSubmitting && { opacity: 0.5 },
                      ]}
                      onPress={() => handleAddPlayer(player)}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.buttonText}>+ ADD</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No eligible players found.</Text>
          )}
        </ScrollView>
      </View>

      <Navbar />
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    backgroundColor: COLORS.card,
    padding: 20,
    // paddingTop: 60,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  topBarText: {
    color: COLORS.text,
    fontSize: 24,
    fontFamily: TYPOGRAPHY.title,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  container: { flex: 1, padding: 20 },
  searchSection: { marginBottom: 25 },
  searchInput: {
    backgroundColor: COLORS.cardAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 16,
    padding: 15,
    borderRadius: 4,
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
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 16,
    textTransform: "uppercase",
  },
  playerCard: {
    backgroundColor: COLORS.card,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  playerInfo: { flex: 1 },
  playerName: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 16,
  },
  playerSubText: { color: COLORS.faint, fontSize: 12, marginTop: 2 },
  addButton: {
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 2,
  },
  lockedBadge: {
    backgroundColor: COLORS.secondaryBlue,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lockedText: {
    color: COLORS.faint,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 12,
  },
  buttonText: { color: "white", fontFamily: TYPOGRAPHY.title, fontSize: 12 },
  emptyText: {
    color: COLORS.faint,
    textAlign: "center",
    marginTop: 40,
    fontFamily: TYPOGRAPHY.body,
  },
});

export default PositionPlayer;
