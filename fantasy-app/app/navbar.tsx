import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter, usePathname, Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, TYPOGRAPHY } from "../constants/theme";

function Navbar() {
  // type AppRoute = Href<string | object>;
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: "Home", path: "/home" as const, icon: "home-sharp" },
    { name: "Leagues", path: "/leagues" as const, icon: "trophy-sharp" },
    { name: "Profile", path: "/profile" as const, icon: "person-sharp" },
  ];
  return (
    <View style={styles.navBar}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => router.replace(tab.path as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={24}
              color={isActive ? COLORS.lightBlue : COLORS.faint}
            />
            <Text
              style={[
                styles.label,
                { color: isActive ? COLORS.lightBlue : COLORS.faint },
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default Navbar;
const styles = StyleSheet.create({
  navBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
    height: 80,
    paddingBottom: 20,
    justifyContent: "space-around",
    alignItems: "center",
  },
  tab: { alignItems: "center", justifyContent: "center", flex: 1 },
  label: {
    fontFamily: TYPOGRAPHY.subtitle,
    fontSize: 10,
    textTransform: "uppercase",
    marginTop: 4,
  },
});
