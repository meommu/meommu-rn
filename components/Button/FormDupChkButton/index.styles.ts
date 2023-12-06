// react
import { StyleSheet } from "react-native";

// constants
import { color, font } from "@/constants";

export const styles = StyleSheet.create({
  container: {
    position: "relative",

    backgroundColor: color.g200,

    borderRadius: 4,
  },

  border: {
    position: "absolute",

    width: "100%",
    height: "100%",

    borderWidth: 2,
    borderRadius: 4,
  },

  content: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  contentText: {
    fontSize: 16,
    fontFamily: font.PretendardSemiBold,
  },
});