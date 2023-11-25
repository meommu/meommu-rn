// react
import { useCallback, useState } from "react";
import { Text, Pressable } from "react-native";
import { useQuery } from "react-query";

// redux
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { DiaryDateState } from "@/store/modules/diaryDate";

// expo
import { router } from "expo-router";

// apis
import { apiService } from "@/apis";

// components
import { NonIndicatorScrollView } from "@/components/ScrollView/NonIndicatorScrollView";
import { NavigationButton } from "@/components/Button/NavigationButton";
import { DiaryListPlaceholder } from "./DiaryListPlaceholder";
import { DiaryItemSkeleton } from "./DiaryItem/index.skeleton";
import { DiaryItem } from "./DiaryItem";

// hooks
import { useResponsiveBottomSheet } from "@/hooks";
import { useConfirm } from "@/hooks/useConfirm";

// bottom sheet
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";

// styles
import { styles } from "./index.styles";
import axios from "axios";

export function DiaryList() {
  const [menuPressedDiaryId, setMenuPressedDiaryId] = useState(-1);

  const { selectedYear, selectedMonth } = useSelector<
    RootState,
    DiaryDateState
  >((state) => state.diaryDate);

  const { data, isLoading, refetch } = useQuery(
    ["diaryList", selectedYear, selectedMonth],
    async () => {
      return await apiService.getDiaries(selectedYear, selectedMonth);
    }
  );

  const { openConfirm } = useConfirm();

  const diaries = data || [];

  /**
   * bottom sheet
   */
  const {
    bottomSheetRef,
    bottomSheetMaxWidthStyle,
    animatedContentHeight,
    animatedHandleHeight,
    animatedSnapPoints,
    handleContentLayout,
  } = useResponsiveBottomSheet();

  /**
   * event handlers
   */
  const handleKebabMenuButtonClick = (diaryId: number) => () => {
    setMenuPressedDiaryId(diaryId);

    bottomSheetRef.current?.present();
  };

  const handleDiaryEditButtonClick = () => {
    router.push(`/modify/${menuPressedDiaryId}`);
  };

  const handleDiaryDeleteButtonClick = async () => {
    bottomSheetRef.current?.dismiss();

    openConfirm(
      "일기 삭제",
      "삭제시, 해당 일기를 영구적으로 열람할 수 없게 됩니다.",
      async () => {
        /**
         * TODO: 다이어리 아이디 삭제 요청 전송 후 리스트 새로고침
         */
        await axios.delete(`/api/v1/diaries/${menuPressedDiaryId}`);

        refetch();
      },
      "삭제하기",
      "취소"
    );
  };

  /**
   * bottom sheet의 dimmed
   *
   * ※ Web 환경에서는 뒷 배경 클릭시 바텀시트 모달이 닫히지 않음.
   * ※ v5 버전에서 업데이트를 기다려야 할 것 같음.
   */
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        style={[props.style, styles.bottomSheetBackdrop]}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  return (
    <BottomSheetModalProvider>
      <NonIndicatorScrollView style={styles.container}>
        {diaries.map((diary) => {
          return (
            <DiaryItem
              diary={diary}
              key={diary.id}
              handleKebabMenuButtonClick={handleKebabMenuButtonClick(diary.id)}
            />
          );
        })}

        {isLoading &&
          Array(3)
            .fill(null)
            .map((_, i) => {
              return <DiaryItemSkeleton key={i} />;
            })}

        {diaries.length > 0 ? (
          <Text style={styles.listCountText}>{diaries.length}개의 일기</Text>
        ) : (
          <DiaryListPlaceholder />
        )}

        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={animatedSnapPoints}
          contentHeight={animatedContentHeight}
          handleHeight={animatedHandleHeight}
          enableContentPanningGesture={false}
          containerStyle={[
            bottomSheetMaxWidthStyle,
            styles.bottomSheetContainer,
          ]}
          handleIndicatorStyle={styles.handleIndicator}
          backdropComponent={renderBackdrop}
        >
          <BottomSheetView
            onLayout={handleContentLayout}
            style={styles.bottomSheetContent}
          >
            <NavigationButton
              content="일기 수정하기"
              onPress={handleDiaryEditButtonClick}
            />
            <Pressable
              style={styles.deleteDiaryButton}
              onPress={handleDiaryDeleteButtonClick}
            >
              <Text style={styles.deleteDiaryButtonText}>삭제하기</Text>
            </Pressable>
          </BottomSheetView>
        </BottomSheetModal>
      </NonIndicatorScrollView>
    </BottomSheetModalProvider>
  );
}
