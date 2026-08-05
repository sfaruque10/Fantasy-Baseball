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
interface PlayerProps {
  playerID: string;
}
interface PlayerInformation {
  athlete: Athlete;
}
interface Athlete {
  id: string;
  displayName: string;
  jersey: string;
  headshot: Headshot;
  position: Position;
  team: Team;
}
interface Headshot {
  href: string;
}
interface Position {
  displayName: string;
}
interface Team {
  id: string;
  logos: Logos[];
}
interface Logos {
  href: string;
}
interface PlayerResponse {
  statistics: Statistics;
}

interface Statistics {
  displayName: string;
  labels: string[];
  names: string[];
  displayNames: string[];
  splits: Splits[];
}

interface Splits {
  displayName: string;
  stats: string[];
}
function Player() {
  const { playerID } = useLocalSearchParams<{
    playerID: string;
  }>();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [bio, setBio] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchPlayerInfo = async () => {
    setLoading(true);
    try {
      const [statsRes, bioRes] = await Promise.all([
        fetch(
          `https://site.web.api.espn.com/apis/common/v3/sports/baseball/mlb/athletes/${playerID}/overview`,
        ),
        fetch(
          `https://site.web.api.espn.com/apis/common/v3/sports/baseball/mlb/athletes/${playerID}/`,
        ),
      ]);
      const statsData = await statsRes.json();
      const bioData = await bioRes.json();
      setStats(statsData.statistics);
      setBio(bioData.athlete);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!playerID || playerID === "undefined") return;
    fetchPlayerInfo();
  }, [playerID]);
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primaryBlue} size="large" />
      </View>
    );
  }
  return (
    <View style={styles.page}>
      {/* 1. HERO HEADER WITH BIO INFO */}
      <View style={styles.header}>
        {/* <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>◀ BACK</Text>
        </TouchableOpacity> */}

        <View style={styles.bioContainer}>
          <Image
            source={
              bio.headshot?.href || bio.team.logos[0].href
                ? { uri: bio.headshot?.href || bio.team.logos[0].href }
                : undefined
            }
            style={styles.playerImage}
            contentFit="cover"
          />
          <View style={styles.bioTextContainer}>
            <Text style={styles.playerNameText}>
              {bio.displayName?.toUpperCase() || "PLAYER"}
            </Text>
            <Text style={styles.playerSubText}>
              #{bio.jersey || "00"} • {bio.position.displayName || "POSITION"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {loading ? (
          <View style={styles.innerLoading}>
            <ActivityIndicator color={COLORS.primaryBlue} size="large" />
            <Text style={styles.loadingText}>LOADING SEASON STATS...</Text>
          </View>
        ) : (
          stats?.splits.map((split, splitIndex) => (
            <View key={splitIndex} style={styles.splitSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.stripe} />
                <Text style={styles.sectionTitle}>{split.displayName}</Text>
              </View>

              <View style={styles.statGrid}>
                {stats?.displayNames.map((statName, statIndex) => (
                  <View key={statIndex} style={styles.statCard}>
                    <Text style={styles.statLabel}>{statName}</Text>
                    <Text style={styles.statValue}>
                      {split.stats[statIndex] || "0"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* 2. NAVBAR PINNED TO BOTTOM */}
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  innerLoading: {
    marginTop: 50,
    alignItems: "center",
  },
  loadingContainer: { marginTop: 50, alignItems: "center" },
  loadingText: {
    color: COLORS.faint,
    fontFamily: TYPOGRAPHY.subtitle,
    marginTop: 10,
    fontSize: 12,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    backgroundColor: COLORS.card,
    // paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.primaryRed,
  },
  backButton: {
    marginBottom: 15,
  },
  backText: {
    color: COLORS.lightBlue,
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 14,
  },
  bioContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  playerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondaryBlue,
    borderWidth: 2,
    borderColor: COLORS.primaryBlue,
  },
  bioTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  playerNameText: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 26,
    letterSpacing: 1,
  },
  playerSubText: {
    color: COLORS.lightBlue,
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 14,
    textTransform: "uppercase",
  },
  splitSection: {
    marginBottom: 30,
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
    fontFamily: TYPOGRAPHY.title,
    fontSize: 18,
    textTransform: "uppercase",
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 8,
  },
  statCard: {
    backgroundColor: COLORS.cardAlt,
    width: "31.5%",
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    marginBottom: 2,
  },
  statLabel: {
    color: COLORS.faint,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 10,
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  statValue: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 18,
  },
});

export default Player;
