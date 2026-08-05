import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  ScrollView,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Navbar from "./navbar";
import { COLORS, TYPOGRAPHY } from "@/constants/theme";
import { Image } from "expo-image";
import { URL } from "@/services/api";

interface Team {
  id: string;
  displayName: string;
  abbreviation: string;
  logos: Logos[];
}
interface Logos {
  href: string;
}
interface TeamWrapper {
  team: Team;
}

interface TeamResponse {
  sports: {
    leagues: {
      teams: TeamWrapper[];
    }[];
  }[];
}
// live game scores
interface GameResponse {
  events: Events[];
}

interface Events {
  id: string;
  competitions: Competitions[];
}

interface Competitions {
  id: string;
  date: string;
  competitors: Competitors[];
  venue: Venue;
  status: Status;
}

interface Competitors {
  team: TeamDetail;
  score: string;
  linescores: Linescores[];
  statistics: Statistics[];
}

interface TeamDetail {
  id: string;
  abbreviation: string;
  name: string;
  logo: string;
}

interface Linescores {
  displayValue: string;
  period: number;
}

interface Statistics {
  name: string;
  abbreviation: string;
  displayValue: string;
}

interface Venue {
  id: string;
  fullName: string;
  address: Address;
}

interface Address {
  city: string;
  state: string;
  // country: string;
}

interface Status {
  displayClock: string;
  period: number;
  type: Type;
}

interface Type {
  id: string;
  name: string;
  state: string;
  detail: string;
}

function Home() {
  const [teams, setTeams] = useState<TeamWrapper[]>([]);
  const [games, setGames] = useState<Events[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const initialDataLoad = async () => {
    setLoading(true); // Spinner ON
    try {
      const [teamsRes, gamesRes] = await Promise.all([
        fetch(`${URL}api/mlb/teams`),
        fetch(`${URL}api/mlb/scoreboard`),
      ]);

      const teamsData: TeamResponse = await teamsRes.json();
      const gamesData: GameResponse = await gamesRes.json();

      setTeams(teamsData.sports[0].leagues[0].teams);
      setGames(gamesData.events);
    } catch (error) {
      console.error("Initial load error:", error);
    } finally {
      setLoading(false); // Spinner OFF forever
    }
  };

  const silentGamesUpdate = async () => {
    try {
      const response = await fetch(`${URL}api/mlb/scoreboard`);
      const data: GameResponse = await response.json();
      // React only updates the Game Cards, the rest of the page stays still
      setGames(data.events);
    } catch (error) {
      console.error("Background sync error:", error);
    }
  };

  useEffect(() => {
    initialDataLoad();

    const interval = setInterval(() => {
      console.log("Refreshing live scores silently...");
      silentGamesUpdate(); // Call the silent version here
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primaryBlue} size="large" />
      </View>
    );
  } // return (
  //   <View
  //     style={{
  //       flex: 1,
  //       justifyContent: "center",
  //       alignItems: "center",
  //     }}
  //   >
  //     <Text>Home</Text>
  //     {/* <FlatList data={teams} keyExtractor={(item) => item.team.id} /> */}
  //   </View>
  // );
  return (
    <View style={styles.page}>
      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MLB CENTRAL</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* 2. Live Scores Ticker */}
        <View style={styles.sectionHeader}>
          <View style={styles.stripe} />
          <Text style={styles.sectionTitle}>Live Scoreboard</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tickerScroll}
        >
          {[...games]
            .sort((a, b) => {
              const statePriority: { [key: string]: number } = {
                in: 1,
                pre: 2,
                post: 3,
              };

              const stateA = a.competitions[0].status.type.state;
              const stateB = b.competitions[0].status.type.state;

              return (
                (statePriority[stateA] || 4) - (statePriority[stateB] || 4)
              );
            })
            .map((game) => {
              const team1 = game.competitions[0].competitors[1];
              const team0 = game.competitions[0].competitors[0];
              const isFinal = game.competitions[0].status.type.state === "post";

              return (
                <TouchableOpacity
                  key={game.id}
                  style={styles.gameCard}
                  onPress={() =>
                    router.push({
                      pathname: "/game",
                      params: { gameID: game.id },
                    })
                  }
                >
                  {/* ... rest of your existing card JSX ... */}
                  <View style={styles.gameRow}>
                    <View style={styles.teamLogoContainer}>
                      <Image
                        source={{ uri: team1.team.logo }}
                        style={styles.tickerLogo}
                        contentFit="contain"
                      />
                      <Text style={styles.tickerTeam}>
                        {team1.team.abbreviation}
                      </Text>
                    </View>
                    <Text style={styles.tickerScore}>{team1.score}</Text>
                  </View>

                  <View style={styles.gameRow}>
                    <View style={styles.teamLogoContainer}>
                      <Image
                        source={{ uri: team0.team.logo }}
                        style={styles.tickerLogo}
                        contentFit="contain"
                      />
                      <Text style={styles.tickerTeam}>
                        {team0.team.abbreviation}
                      </Text>
                    </View>
                    <Text style={styles.tickerScore}>{team0.score}</Text>
                  </View>

                  <Text
                    style={[
                      styles.gameStatus,
                      isFinal && { color: COLORS.primaryRed },
                    ]}
                  >
                    {isFinal
                      ? "FINAL"
                      : game.competitions[0].status.type.detail}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>

        {/* 3. Team Directory */}
        <View style={styles.sectionHeader}>
          <View style={styles.stripe} />
          <Text style={styles.sectionTitle}>League Directory</Text>
        </View>

        {teams.map((item) => (
          <TouchableOpacity
            key={item.team.id}
            style={styles.teamListItem}
            onPress={() =>
              router.push({
                pathname: "/team",
                params: { teamID: item.team.id },
              })
            }
          >
            <View style={styles.listTeamInfo}>
              {/* Note: Standard MLB team API often has logos nested in logos[0].href */}
              <Image
                source={{
                  uri: item.team.logos[0].href,
                }}
                style={styles.listLogo}
                contentFit="contain"
              />
              <View>
                <Text style={styles.teamListAbbr}>
                  {item.team.abbreviation}
                </Text>
                <Text style={styles.teamListName}>{item.team.displayName}</Text>
              </View>
            </View>
            <Text style={styles.arrow}>➔</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
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
  header: {
    backgroundColor: COLORS.card,
    // paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 28,
    letterSpacing: 2,
  },
  content: { flex: 1, padding: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
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
  tickerScroll: { marginBottom: 30 },
  gameCard: {
    backgroundColor: COLORS.card,
    width: 160, // Widened slightly to fit logos
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
  },
  gameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  teamLogoContainer: { flexDirection: "row", alignItems: "center" },
  tickerLogo: { width: 20, height: 20, marginRight: 8 },
  tickerTeam: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 16,
  },
  tickerScore: {
    color: COLORS.lightBlue,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 18,
  },
  gameStatus: {
    color: COLORS.faint,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
  },
  teamListItem: {
    backgroundColor: COLORS.cardAlt,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primaryBlue,
  },
  listTeamInfo: { flexDirection: "row", alignItems: "center" },
  listLogo: { width: 40, height: 40, marginRight: 15 },
  teamListAbbr: {
    color: COLORS.lightBlue,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 12,
  },
  teamListName: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 16,
    textTransform: "uppercase",
  },
  arrow: { color: COLORS.primaryBlue, fontSize: 18 },
});

export default Home;
// https://espnapi.com/
// https://github.com/pseudo-r/Public-ESPN-API?tab=readme-ov-file
// https://www.prizepicks.com/playbook-article/how-to-play-prizepicks-mlb-fantasy-scoring-system
