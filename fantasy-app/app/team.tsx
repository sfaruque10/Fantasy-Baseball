import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, TYPOGRAPHY } from "../constants/theme";
import Navbar from "./navbar";
// const styles = StyleSheet.create({
//   logo: {
//     width: 447 / 2,
//     height: 325 / 2,
//   },
// });
interface TeamProps {
  teamID: string;
}
interface TeamResponse {
  team: Team;
}
interface Team {
  id: string;
  displayName: string;
  logos: Logo[];
  record: Record;
  nextEvent: NextEvent[];
  standingSummary: string;
}
interface Logo {
  href: string;
}
interface Record {
  items: Items[];
}

interface Items {
  description: string;
  type: string;
  summary: string;
}
interface NextEvent {
  id: string;
  date: string;
  name: string;
  shortName: string;
}
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
}

function Team() {
  const { teamID } = useLocalSearchParams<{ teamID: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [roster, setRoster] = useState<Athletes[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeamInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/${teamID}`,
      );
      const data = await response.json();
      setTeam(data.team);
      //   const team = data.
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoster = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/${teamID}/roster`,
      );
      const rosterData = await response.json();
      setRoster(rosterData.athletes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!teamID || teamID === "undefined") return;
    fetchTeamInfo();
    fetchRoster();
  }, [teamID]);
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primaryBlue} size="large" />
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView style={styles.container}>
        {/* 1. TEAM HEADER */}
        <View style={styles.header}>
          <Image
            source={{ uri: team?.logos[0].href }}
            style={styles.teamLogo}
            contentFit="contain"
          />
          <Text style={styles.teamTitle}>
            {team?.displayName.toUpperCase()}
          </Text>
          {team?.standingSummary && (
            <Text style={styles.standingSummaryText}>
              {team.standingSummary.toUpperCase()}
            </Text>
          )}
          {team?.record?.items && (
            <View style={styles.recordBadge}>
              <Text style={styles.recordText}>
                {team.record.items[0]?.summary}
              </Text>
              <Text style={styles.recordLabel}>OVERALL RECORD</Text>
            </View>
          )}
          {team?.nextEvent?.[0] && (
            <TouchableOpacity
              style={[
                styles.statBox,
                { borderLeftWidth: 1, borderLeftColor: COLORS.border },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/game",
                  params: { gameID: team.nextEvent[0].id },
                })
              }
            >
              <Text style={[styles.nextEventText, { color: COLORS.lightBlue }]}>
                {team.nextEvent[0].shortName} ➔
              </Text>
              <Text style={styles.statLabel}>
                {new Date(team.nextEvent[0].date).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 2. ROSTER SECTIONS */}
        {roster.map((group) => (
          <View key={group.position} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.stripe} />
              <Text style={styles.sectionTitle}>{group.position}</Text>
            </View>

            {group.items.map((player) => (
              <TouchableOpacity
                key={player.id}
                style={styles.playerCard}
                onPress={() =>
                  router.push({
                    pathname: "/player",
                    params: {
                      playerID: player.id,
                    },
                  })
                }
              >
                <View style={styles.playerInfo}>
                  <Text style={styles.jersey}>#{player.jersey || "00"}</Text>
                  <View>
                    <Text style={styles.playerName}>
                      {player.fullName.toUpperCase()}
                    </Text>
                    <Text style={styles.playerMeta}>
                      {player.position.displayName} • {player.displayHeight},{" "}
                      {player.displayWeight}
                    </Text>
                  </View>
                </View>

                <Image
                  style={styles.headshot}
                  source={{ uri: player.headshot?.href || team?.logos[0].href }}
                  contentFit="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: COLORS.card,
    alignItems: "center",
    paddingVertical: 40,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.primaryRed,
  },
  teamLogo: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  teamTitle: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 28,
    letterSpacing: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
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
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 18,
    textTransform: "uppercase",
  },
  recordBadge: {
    backgroundColor: COLORS.secondaryBlue,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recordText: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 20,
    letterSpacing: 1,
  },
  recordLabel: {
    color: COLORS.lightBlue,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 10,
    textTransform: "uppercase",
    marginTop: 2,
  },
  standingSummaryText: {
    color: COLORS.faint, // Use your muted color
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 14,
    marginTop: 4,
    letterSpacing: 1,
  },
  playerCard: {
    backgroundColor: COLORS.cardAlt,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  jersey: {
    color: COLORS.primaryRed,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 20,
    marginRight: 15,
    width: 35,
  },
  playerName: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 16,
  },
  playerMeta: {
    color: COLORS.faint,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 12,
    marginTop: 2,
  },
  headshot: {
    width: 80,
    height: 70,
    backgroundColor: COLORS.secondaryBlue,
  },
  logo: {
    width: 447 / 2,
    height: 325 / 2,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.cardAlt,
    marginTop: 15,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  statBox: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 120,
  },
  statLabel: {
    color: COLORS.lightBlue,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 10,
    textTransform: "uppercase",
    marginTop: 2,
  },
  // recordText: {
  //   color: COLORS.text,
  //   fontFamily: TYPOGRAPHY.title,
  //   fontSize: 18,
  // },
  nextEventText: {
    color: COLORS.lightBlue,
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 14,
    textTransform: "uppercase",
  },
});

export default Team;
