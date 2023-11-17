// react
import { View, Platform } from "react-native";
import { useQuery } from "react-query";
import { useCallback, useRef } from "react";

// expo
import { router, useLocalSearchParams } from "expo-router";

// components
import { DiaryPresenter } from "../DiaryPresenter";

// constants
import { PATH } from "@/constants";

// apis
import { apiService } from "@/apis";
import axios from "axios";

export function SharedDiaryContainer() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();

  const imageRef = useRef<View | null>(null);

  const { data } = useQuery(
    ["sharedDiaryDetail", uuid],
    async () => {
      const diary = await apiService.getSharedDiaryDetail(uuid || "");

      return diary;
    },
    {
      suspense: true,
    }
  );

  const handleGoBackButtonClick = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(PATH.MAIN);
    }
  }, []);

  const handleEditButtonClick = useCallback(() => {
    /**
     * TODO: 수정, 삭제 바텀 시트 모달 open
     */
  }, []);

  const handleShareButtonClick = useCallback(async () => {
    if (Platform.OS !== "web" || !imageRef.current) {
      return;
    }

    /**
     * View는 웹 환경에서 `div` 태그로 변환되므로 as를 이용하여 형변환 함.
     */
    const $divElement = imageRef.current as unknown as HTMLDivElement;

    const canvas = await apiService.getCanvasWithHtmlWithImage($divElement);

    let link = document.createElement("a");
    link.download = `${uuid}.jpeg`;
    link.href = canvas.toDataURL("image/jpeg");
    link.click();
  }, []);

  if (!data) {
    return null;
  }

  return (
    <DiaryPresenter
      diary={data}
      imageRef={imageRef}
      isShared={true}
      handleEditButtonClick={handleEditButtonClick}
      handleGoBackButtonClick={handleGoBackButtonClick}
      handleShareButtonClick={handleShareButtonClick}
    />
  );
}