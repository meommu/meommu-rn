import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { Router } from "./src/Router";
import { VIEW_NAME } from "./src/constants";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [startView, setStartView] = useState<VIEW_NAME | null>(null);

  const [fontsLoaded] = useFonts({
    "Pretendard-SemiBold": require("./assets/fonts/Pretendard-SemiBold.otf"),
  });

  const chkLogin = async (): Promise<boolean> => {
    /**
     * TODO: 로그인 확인 로직 추가
     */
    return false;
  };

  const chkOnBoardingIsEnd = async (): Promise<boolean> => {
    /**
     * TODO: 온보딩 종료 여부 확인 로직 추가
     */
    return false;
  };

  const initial = async (): Promise<void> => {
    if (await chkLogin()) {
      setStartView(VIEW_NAME.MAIN);

      SplashScreen.hideAsync();

      return;
    }

    if (await chkOnBoardingIsEnd()) {
      setStartView(VIEW_NAME.HOME);

      SplashScreen.hideAsync();

      return;
    }

    setStartView(VIEW_NAME.ON_BOARDING);

    SplashScreen.hideAsync();

    return;
  };

  useEffect(() => {
    if (fontsLoaded) {
      initial();
    }
  }, [fontsLoaded]);

  if (!startView) {
    return null;
  }

  return <Router initialRouterName={startView} />;
}
