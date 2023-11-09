// react
import { useEffect, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useQuery } from "react-query";

// redux
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { DiaryDateState } from "@/store/modules/diaryDate";
import {
  applyCurrentBySelected,
  changeCurrentYearMonth,
  changeSelectedYearMonth,
  updateDiariesThumbnailImage,
} from "@/store/modules/diaryDate";

// components
import { SText } from "./Text/SText";
import { MonthPicker } from "@/components/MonthPicker";
import { NavigationButton } from "@/components/Button/NavigationButton";

// hooks
import { useDyanmicStyle } from "@/hooks";

// svgs
import ArrowDropDown from "@/assets/svgs/arrow-drop-down.svg";

// constants
import { size, zIndex } from "@/constants";

// apis
import { apiService } from "@/apis";

// utils
import { createYearMonthKey } from "@/utils";

// bottom sheets
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
  useBottomSheetDynamicSnapPoints,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

export function MonthPickerOpenController() {
  const dispatch = useDispatch();

  const { currentMonth, currentYear } = useSelector<RootState, DiaryDateState>(
    (state) => state.diaryDate
  );

  /**
   * diary date
   */
  const { data } = useQuery(
    [],
    async () => {
      return await apiService.getDiariesSummary();
    },
    {
      retry: 0,
      suspense: true,
    }
  );

  useEffect(() => {
    if (!data || !data.length) {
      return;
    }

    /**
     * 최신 일기가 존재하는 년, 월 추출
     */
    const latestDate = data
      .map(({ date }) => new Date(date))
      .sort((a, b) => {
        return a > b ? -1 : 1;
      })[0];

    const year = latestDate.getFullYear();
    const month = latestDate.getMonth() + 1;

    dispatch(changeCurrentYearMonth(year, month));
    dispatch(changeSelectedYearMonth(year, month));

    /**
     * 년, 월에 존재하는 일기들의 대표 이미지 추출
     */
    const yearMonthToImageId: Map<string, number> = new Map();

    data.forEach(({ date, imageIds }) => {
      if (!imageIds.length) {
        return;
      }

      yearMonthToImageId.set(createYearMonthKey(new Date(date)), imageIds[0]);
    });

    dispatch(updateDiariesThumbnailImage(yearMonthToImageId));
  }, [data]);

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const initialSnapPoints = useMemo(() => ["CONTENT_HEIGHT"], []);

  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints(initialSnapPoints);

  const handleDatePickButtonClick = () => {
    dispatch(applyCurrentBySelected());

    bottomSheetRef.current?.dismiss();
  };

  const handleSheetOpen = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  /**
   * bottom sheet의 반응형 너비 계산
   */
  const { width, height } = useWindowDimensions();

  const bottomSheetMaxWidthStyle = useDyanmicStyle(() => {
    const maxWidth =
      Platform.OS === "web" && width >= size.LAPTOP_WIDTH
        ? (9 * height) / 16
        : "100%";

    return { maxWidth };
  }, [width, height]);

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
      <Pressable style={styles.monthPicker} onPress={handleSheetOpen}>
        <Text style={styles.monthPickerText}>
          {currentYear}년 {currentMonth}월
        </Text>
        <ArrowDropDown />
      </Pressable>

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={animatedSnapPoints}
        contentHeight={animatedContentHeight}
        handleHeight={animatedHandleHeight}
        enableContentPanningGesture={false}
        containerStyle={[bottomSheetMaxWidthStyle, styles.bottomSheetContainer]}
        handleIndicatorStyle={styles.handleIndicator}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView onLayout={handleContentLayout}>
          <MonthPicker />
          <NavigationButton
            content="확인"
            style={styles.chooseMonthButton}
            onPress={handleDatePickButtonClick}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
}

export function MonthPickerOpenControllerSkeleton() {
  return (
    <View style={styles.monthPicker}>
      <SText style={styles.monthPickerText} textLength={7} />
    </View>
  );
}

const styles = StyleSheet.create({
  monthPicker: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },

  monthPickerText: {
    fontFamily: "yeonTheLand",
    color: "#89899C",
  },

  /**
   * bottom sheet
   */
  bottomSheetBackdrop: {
    zIndex: zIndex.bottomSheetBackdrop,
  },

  bottomSheetContainer: {
    marginHorizontal: "auto",
    zIndex: zIndex.bottomSheetContainer,
  },

  handleIndicator: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    width: "10%",
  },

  chooseMonthButton: {
    padding: 20,
  },
});