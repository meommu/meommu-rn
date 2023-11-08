// react
import { View, Text, StyleSheet, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "react-query";

// expo
import { router } from "expo-router";

// constants
import { VIEW_NAME } from "@/constants";

// components
import { GoBackButton } from "@/components/Button/GoBackButton";
import { Header } from "@/components/Layout/Header";

// apis
import { apiService } from "@/apis";

export default function Setting() {
  const { data, isLoading } = useQuery(
    [],
    async () => {
      return await apiService.getLoginInfo();
    },
    { retry: 0 }
  );

  console.log("[user info data]", data);

  const handleLogoutButtonClick = () => {
    AsyncStorage.removeItem("accessToken");

    router.replace(VIEW_NAME.HOME);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Header title="설정" left={<GoBackButton />} />

        {!isLoading && data && (
          <View style={styles.profile}>
            <View style={styles.profileImage}>
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>me</Text>
              </View>
            </View>

            <View style={styles.profileContent}>
              <Text style={styles.profileContentName}>{data.name}</Text>
              <Text style={styles.profileContentEmail}>{data.email}</Text>
            </View>
          </View>
        )}

        <View style={styles.sign}>
          <Pressable
            style={styles.signButton}
            onPress={handleLogoutButtonClick}
          >
            <Text style={styles.signButtonText}>로그아웃</Text>
          </Pressable>

          <View style={styles.splitBar} />

          <Pressable style={styles.signButton}>
            <Text style={styles.signButtonText}>회원 탈퇴</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  content: {
    flex: 1,
    margin: 20,
    position: "relative",
  },

  profile: {
    marginTop: 20,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 30,
    position: "relative",
    overflow: "hidden",
  },

  profileImagePlaceholder: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#8579F1",
  },

  profileImagePlaceholderText: {
    fontSize: 26,
    fontFamily: "yeonTheLand",
    fontWeight: "normal",
    color: "white",
  },

  profileContent: {
    gap: 4,
  },

  profileContentName: {
    color: "#1A1A1A",
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
  },

  profileContentEmail: {
    fontFamily: "Pretendard-Regular",
    fontSize: 12,
    color: "#808080",
  },

  sign: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
  },

  signButton: {
    width: "50%",
  },

  signButtonText: {
    color: "#ABB0BA",
    fontSize: 14,
    fontFamily: "Pretendard-Regular",
    textAlign: "center",
  },

  splitBar: {
    borderWidth: 1,
    borderColor: "#ABB0BA",
  },
});
