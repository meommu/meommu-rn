// react
import { useState } from "react";
import { RefreshControl, Text } from "react-native";
import { useQuery, useQueryClient } from "react-query";

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
import { DiaryListPlaceholder } from "./DiaryListPlaceholder";
import { DiaryItemSkeleton } from "./DiaryItem/index.skeleton";
import { DiaryItem } from "./DiaryItem";
import { NavigationButton } from "@/components/Button/NavigationButton";
import { TransparentButton } from "@/components/Button/TransparentButton";
import { ResponsiveBottomSheetModal } from "@/components/Layout/ResponsiveBottomSheetModal";
import { Footer } from "@/components/Layout/Footer";

// hooks
import { useConfirm } from "@/hooks";

// bottom sheet
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

// styles
import { styles } from "./index.styles";

export function DiaryList() {
  const queryClient = useQueryClient();

  const [menuPressedDiaryId, setMenuPressedDiaryId] = useState(-1);
  const [bottomSheetIsOpen, setBottomSheetIsOpen] = useState({ value: false });

  const { selectedYear, selectedMonth } = useSelector<
    RootState,
    DiaryDateState
  >((state) => state.diaryDate);

  const { openConfirm } = useConfirm();

  /**
   * 다이어리 일기정보 불러오기
   */
  const { data, isLoading, isFetching, refetch } = useQuery(
    ["diaryList", selectedYear, selectedMonth],
    async () => {
      return await apiService.getDiaries(selectedYear, selectedMonth);
    }
  );

  const diaries = data || [];

  /**
   * event handlers
   */
  const handleKebabMenuButtonClick = (diaryId: number) => () => {
    setMenuPressedDiaryId(diaryId);
    setBottomSheetIsOpen({ value: true });
  };

  const handleDiaryEditButtonClick = () => {
    router.push(`/modify/${menuPressedDiaryId}`);
  };

  const handleDiaryDeleteButtonClick = async () => {
    setBottomSheetIsOpen({ value: false });

    openConfirm(
      "일기 삭제",
      "삭제시, 해당 일기를 영구적으로 열람할 수 없게 됩니다.",
      async () => {
        await apiService.deleteDiary(menuPressedDiaryId.toString());

        await queryClient.invalidateQueries(["diariesSummary"]);

        refetch();
      },
      "삭제하기",
      "취소"
    );
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <BottomSheetModalProvider>
      <NonIndicatorScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={async () => {
              setIsRefreshing(true);

              await refetch();

              setIsRefreshing(false);
            }}
          />
        }
      >
        {isLoading || isFetching ? (
          Array(3)
            .fill(null)
            .map((_, i) => {
              return <DiaryItemSkeleton key={i} />;
            })
        ) : diaries.length > 0 ? (
          <>
            {diaries.map((diary) => {
              return (
                <DiaryItem
                  diary={diary}
                  key={diary.id}
                  handleKebabMenuButtonClick={handleKebabMenuButtonClick(
                    diary.id
                  )}
                />
              );
            })}
            <Text style={styles.listCountText}>{diaries.length}개의 일기</Text>
          </>
        ) : (
          <DiaryListPlaceholder />
        )}
      </NonIndicatorScrollView>

      <ResponsiveBottomSheetModal
        isOpen={bottomSheetIsOpen}
        setIsOpen={setBottomSheetIsOpen}
      >
        <Footer style={styles.bottomSheetContent}>
          <NavigationButton
            content="일기 수정하기"
            onPress={handleDiaryEditButtonClick}
          />

          <TransparentButton
            content="일기 삭제하기"
            onPress={handleDiaryDeleteButtonClick}
          />
        </Footer>
      </ResponsiveBottomSheetModal>
    </BottomSheetModalProvider>
  );
}