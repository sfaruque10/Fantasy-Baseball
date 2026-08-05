import { router } from "expo-router";
import { Button, Text, View } from "react-native";

function CreateTeam() {
  //   const fetchPositionPlayers = async (position: string) => {};
  return (
    <View>
      <Text>Catchers</Text>
      <Button
        title="Catcher"
        onPress={() =>
          router.push({
            pathname: "/positionPlayer",
            params: { position: "Catcher" }, // need to pass teamid
          })
        }
      />
      <Button
        title="Catcher"
        onPress={() =>
          router.push({
            pathname: "/positionPlayer",
            params: { position: "Catcher" },
          })
        }
      />
      <Button
        title="First Base"
        onPress={() =>
          router.push({
            pathname: "/positionPlayer",
            params: { position: "First Baseman" },
          })
        }
      />
      <Button
        title="Second Base"
        onPress={() =>
          router.push({
            pathname: "/positionPlayer",
            params: { position: "Second Baseman" },
          })
        }
      />
      <Button
        title="Short Stop"
        onPress={() =>
          router.push({
            pathname: "/positionPlayer",
            params: { position: "Shortstop" },
          })
        }
      />
      <Button
        title="Third Base"
        onPress={() =>
          router.push({
            pathname: "/positionPlayer",
            params: { position: "Third Baseman" },
          })
        }
      />
      <Button
        title="Infielder"
        onPress={() =>
          router.push({
            pathname: "/positionPlayer",
            params: { position: "Infielder" },
          })
        }
      />
      <Button
        title="Infielder"
        onPress={() =>
          router.push({
            pathname: "/positionPlayer",
            params: { position: "Infielder" },
          })
        }
      />
      <Button
        title="Outfielder"
        onPress={() =>
          router.push({
            pathname: "/positionPlayer",
            params: { position: "Outfielder" },
          })
        }
      />
      <Button
        title="Outfielder"
        onPress={() =>
          router.push({
            pathname: "/positionPlayer",
            params: { position: "Outfielder" },
          })
        }
      />
      <Button
        title="Outfielder"
        onPress={() =>
          router.push({
            pathname: "/positionPlayer",
            params: { position: "Outfielder" },
          })
        }
      />
      <Button
        title="Outfielder"
        onPress={() =>
          router.push({
            pathname: "/positionPlayer",
            params: { position: "Outfielder" },
          })
        }
      />
      <Button
        title="Outfielder"
        onPress={() =>
          router.push({
            pathname: "/positionPlayer",
            params: { position: "Outfielder" },
          })
        }
      />
      <Button title="Utility (Any Hitter)" />
    </View>
  );
}

export default CreateTeam;
