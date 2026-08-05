import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { COLORS, TYPOGRAPHY } from "@/constants/theme";
import Navbar from "./navbar";
import { Image } from "expo-image";
interface GameProps {
  gameID: string;
}

interface GameResponse {
  situation: Situation;
  boxscore: Boxscore;
  gameInfo: GameInfo;
  header: Header;
}

interface Situation {
  balls: number;
  strikes: number;
  outs: number;
}

interface Boxscore {
  teams: Teams[];
  players: Players[];
}

interface Header {
  competitions: Competitions[];
}

interface Competitions {
  competitors: Competitors[];
  status: Status;
}
interface Status {
  type: Type;
}

interface Type {
  completed: boolean;
  detail: string; // ex "Bottom 9th"
}
interface Competitors {
  score: string;
  linescores: Linescores[];
}

interface Linescores {
  displayValue: string;
}
interface Teams {
  team: Team;
  // statistics: Statistics;
  homeAway: string;
}

interface Team {
  id: string;
  name: string;
  abbreviation: string;
  displayName: string;
  logo: string;
}
// interface Statistics {}

interface Players {
  statistics: Statistics[];
}
interface Statistics {
  type: string;
  labels: string[];
  athletes: Athletes[];
}
interface Athletes {
  athlete: Athlete;
  position: Position;
  stats: string[];
}
interface Athlete {
  id: string;
  displayName: string;
}
interface Position {
  id: string;
  displayName: string;
  abbreviation: string;
}
interface GameInfo {
  venue: Venue;
}

interface Venue {
  id: string;
  fullName: string;
  shortName: string;
}

function Game() {
  const { gameID } = useLocalSearchParams<{ gameID: string }>();
  const [game, setGame] = useState<GameResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchGame = async () => {
    try {
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary?event=${gameID}`,
        // `https://sports.core.api.espn.com/v2/sports/baseball/leagues/mlb/events/${gameID}`,
      );
      const data = await response.json();
      setGame(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!gameID || gameID === "undefined") return;
    fetchGame();
    const interval = setInterval(fetchGame, 30000);
    return () => clearInterval(interval);
  }, [gameID]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primaryBlue} size="large" />
      </View>
    );
  }
  const homeTeam = game?.boxscore.teams.find((t) => t.homeAway === "home");
  const awayTeam = game?.boxscore.teams.find((t) => t.homeAway === "away");

  return (
    <View style={styles.page}>
      {/* 1. SCOREBOARD HERO */}
      <View style={styles.header}>
        {/* <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>◀ BACK</Text>
        </TouchableOpacity> */}

        <View style={styles.scoreboard}>
          <View style={styles.teamContainer}>
            <View style={styles.logoWrapper}>
              <Image
                source={{ uri: awayTeam?.team.logo }}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
            <Text style={styles.teamAbbr}>
              {awayTeam?.team.abbreviation || "AWY"}
            </Text>
          </View>

          <View style={styles.scoreContainer}>
            <Text
              style={[
                styles.inningText,
                game?.header?.competitions[0].status.type.completed && {
                  color: COLORS.primaryRed,
                },
              ]}
            >
              {game?.header?.competitions[0].status.type.completed
                ? "FINAL"
                : game?.header?.competitions[0].status.type.detail.toUpperCase()}
            </Text>

            <Text style={styles.liveScore}>
              {game?.header?.competitions[0].competitors[1].score || "0"} -{" "}
              {game?.header?.competitions[0].competitors[0].score || "0"}
            </Text>
            {!game?.header?.competitions[0].status.type.completed && (
              <View style={styles.situationRow}>
                <Text style={styles.outsText}>
                  {game?.situation?.outs} OUTS
                </Text>
                <Text style={styles.countText}>
                  {game?.situation?.balls}-{game?.situation?.strikes}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.teamContainer}>
            <View style={styles.logoWrapper}>
              <Image
                source={{ uri: homeTeam?.team.logo }}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
            <Text style={styles.teamAbbr}>
              {homeTeam?.team.abbreviation || "HME"}
            </Text>
          </View>
        </View>
        {/* Home Team Row */}
        <View style={styles.lineScoreRow}>
          <View style={styles.lineScoreLabelCell} />
          {(
            game?.header?.competitions[0]?.competitors[1]?.linescores || []
          ).map((_, i) => (
            <Text key={i} style={styles.lineScoreCell}>
              {i + 1}
            </Text>
          ))}
          {/* 🔥 Match width with the boldScore below */}
          <Text
            style={[
              styles.lineScoreCell,
              styles.finalScoreColumn,
              { fontFamily: TYPOGRAPHY.title },
            ]}
          >
            R
          </Text>
        </View>

        {/* 2. AWAY TEAM ROW */}
        <View style={styles.lineScoreRow}>
          <Text style={styles.lineScoreLabelCell}>
            {awayTeam?.team.abbreviation}
          </Text>
          {game?.header?.competitions[0]?.competitors[1]?.linescores?.map(
            (ls, i) => (
              <Text key={i} style={styles.lineScoreCell}>
                {ls.displayValue}
              </Text>
            ),
          )}
          <Text
            style={[
              styles.lineScoreCell,
              styles.finalScoreColumn,
              styles.boldScore,
            ]}
          >
            {game?.header.competitions[0].competitors[1].score}
          </Text>
        </View>

        {/* 3. HOME TEAM ROW */}
        <View style={styles.lineScoreRow}>
          <Text style={styles.lineScoreLabelCell}>
            {homeTeam?.team.abbreviation}
          </Text>
          {(
            game?.header?.competitions[0]?.competitors[1]?.linescores || []
          ).map((_, i) => {
            const homeInning =
              game?.header?.competitions[0]?.competitors[0]?.linescores[i];
            const isCompleted =
              game?.header.competitions[0].status.type.completed;
            const showX = isCompleted && !homeInning;
            return (
              <Text key={i} style={styles.lineScoreCell}>
                {homeInning ? homeInning.displayValue : showX ? "X" : "-"}
              </Text>
            );
          })}
          {/* 🔥 Use the finalScoreColumn style */}
          <Text
            style={[
              styles.lineScoreCell,
              styles.finalScoreColumn,
              styles.boldScore,
            ]}
          >
            {game?.header.competitions[0].competitors[0].score}
          </Text>
        </View>

        <Text style={styles.venueText}>
          {game?.gameInfo.venue.fullName.toUpperCase()}
        </Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {game?.boxscore.players.map((teamData, teamIdx) => {
          // Determine which team name to show
          const teamInfo = game.boxscore.teams[teamIdx].team;

          return (
            <View key={teamInfo.id} style={{ marginBottom: 30 }}>
              {/* TEAM HEADER */}
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.stripe,
                    {
                      backgroundColor:
                        teamIdx === 0 ? COLORS.primaryRed : COLORS.primaryBlue,
                    },
                  ]}
                />
                <Text style={styles.sectionTitle}>
                  {teamInfo.displayName.toUpperCase()}
                </Text>
              </View>

              {/* STAT CATEGORIES (Batting then Pitching) */}
              {teamData.statistics.map((statGroup, groupIdx) => {
                // Skip fielding/info groups, focus on batting and pitching
                if (
                  statGroup.type !== "batting" &&
                  statGroup.type !== "pitching"
                )
                  return null;

                return (
                  <View key={groupIdx} style={{ marginBottom: 20 }}>
                    <Text style={styles.statTypeHeader}>
                      {statGroup.type.toUpperCase()}
                    </Text>

                    {/* TABLE HEADER LABELS */}
                    <View style={styles.playerRowHeader}>
                      <Text style={[styles.columnLabel, { flex: 1 }]}>
                        PLAYER
                      </Text>
                      {statGroup.labels.slice(0, 5).map((label, i) => (
                        <Text key={i} style={styles.columnLabelCenter}>
                          {label}
                        </Text>
                      ))}
                    </View>

                    {/* ALL PLAYERS IN THIS GROUP */}
                    {statGroup.athletes.map((playerStat, pIdx) => (
                      <TouchableOpacity
                        key={pIdx}
                        style={styles.playerRow}
                        onPress={() =>
                          router.push({
                            pathname: "/player",
                            params: { playerID: playerStat.athlete.id },
                          })
                        }
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.playerName}>
                            {playerStat.athlete.displayName}
                          </Text>
                          <Text style={styles.playerPositionMini}>
                            {playerStat.position.abbreviation}
                          </Text>
                        </View>

                        <View style={styles.statLine}>
                          {playerStat.stats.slice(0, 5).map((val, i) => (
                            <Text key={i} style={styles.statItem}>
                              {val}
                            </Text>
                          ))}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  container: { flex: 1, padding: 20 },
  header: {
    backgroundColor: COLORS.card,
    // paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.primaryRed,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    left: 10,
    top: 60,
    zIndex: 999,
    padding: 10,
  },
  backText: {
    color: COLORS.lightBlue,
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 14,
  },
  scoreboard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 10,
  },
  teamContainer: { alignItems: "center", width: 90 },
  logoWrapper: {
    width: 64, // Slightly larger than the image
    height: 64,
    backgroundColor: "white", // Or COLORS.text for a stark contrast
    borderRadius: 32, // Perfect circle
    justifyContent: "center",
    alignItems: "center",
    padding: 8, // Space between logo and edge of circle
    borderWidth: 2,
    borderColor: COLORS.primaryBlue, // Accent border to match your theme
    marginBottom: 5,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  teamAbbr: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 18,
    marginTop: 5,
  },
  scoreContainer: { alignItems: "center" },
  liveScore: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 42,
    letterSpacing: 2,
  },
  inningText: {
    color: COLORS.lightBlue,
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 2,
    textTransform: "uppercase",
  },

  situationRow: { flexDirection: "row", gap: 10, marginTop: -5 },
  outsText: {
    color: COLORS.primaryRed,
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 12,
  },
  countText: { color: COLORS.faint, fontFamily: TYPOGRAPHY.body, fontSize: 12 },
  venueText: {
    color: COLORS.faint,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 10,
    marginTop: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 20,
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
  playerRow: {
    backgroundColor: COLORS.cardAlt,
    padding: 15,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  playerName: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 14,
  },
  lineScoreContainer: {
    backgroundColor: COLORS.cardAlt,
    padding: 12,
    marginTop: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 20,
  },
  lineScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
  },
  lineScoreLabelCell: {
    width: 50,
    color: COLORS.faint,
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 14,
  },
  lineScoreHeaderCell: {
    flex: 1,
    textAlign: "center",
    color: COLORS.muted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 10,
  },
  lineScoreCell: {
    width: 30,
    textAlign: "center",
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 14,
  },
  finalScoreColumn: {
    width: 45, // Set this slightly wider than inning cells
    marginLeft: 10, // Add a little gap before the final score
  },
  boldScore: {
    color: COLORS.lightBlue,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 16,
    textAlign: "center",
  },
  statLine: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 12,
    width: 35, // Fixed width for alignment
    textAlign: "center",
  },
  statTypeHeader: {
    color: COLORS.lightBlue,
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 10,
    letterSpacing: 1,
  },
  playerRowHeader: {
    flexDirection: "row",
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  columnLabel: {
    color: COLORS.faint,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 10,
  },
  columnLabelCenter: {
    color: COLORS.faint,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 10,
    width: 35,
    textAlign: "center",
  },
  playerPositionMini: {
    color: COLORS.faint,
    fontSize: 10,
    fontFamily: TYPOGRAPHY.body,
  },
});

export default Game;
