// react
import { useEffect, useMemo } from "react";
import { useMutation, useQuery } from "react-query";
import { View, Text } from "react-native";
import { useDerivedValue } from "react-native-reanimated";
import { useFormContext } from "react-hook-form";

// redux
import { useDispatch } from "react-redux";
import { shareAiBottomSheetRef } from "@/store/modules/aiBottomSheet";

// components
import { AIBottomSheetHeader } from "./AIBottomSheetHeader";
import { AIBottomSheetBackdrop } from "./AIBottomSheetBackdrop";
import { NavigationButton } from "@/components/Button/NavigationButton";
import { MultiSelectList } from "./MultiSelectList";
import { SentenseInput } from "./SentenseInput";
import { MultiSelectListSkeleton } from "./MultiSelectList/index.skeleton";

// apis
import { apiService } from "@/apis";

// bottom sheet
import BottomSheet, {
  BottomSheetView,
  BottomSheetFooter,
  type BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";

// constants
import { size } from "@/constants";

// hooks
import { useResponsiveBottomSheet, useSwiper, useToast } from "@/hooks";
import Swiper from "react-native-web-swiper";

// styles
import { styles } from "./index.styles";

interface WriteGuideProps {}

export function WriteGuide({}: WriteGuideProps) {
  const { fireToast } = useToast();

  const dispatch = useDispatch();

  const { swiperIndex, swiperRef, handleSwiperIndexChange } = useSwiper(0);

  const { bottomSheetRef, bottomSheetMaxWidthStyle } =
    useResponsiveBottomSheet();

  const { setValue, getValues } = useFormContext<DiaryWriteFormFieldValues>();

  const snapPoints = useMemo(
    () => [
      size.BOTTOM_SHEET_INDICATOR_HEIGHT + size.AI_BOTTOM_SHEET_HEADER_HEIGHT,
      "65%",
      "99%",
    ],
    []
  );

  /**
   * 가이드의 열림/닫힘을 외부 컴포넌트에서도 제어할 수 있도록 bottomSheetRef를 전역 상태로 공유
   */
  useEffect(() => {
    dispatch(shareAiBottomSheetRef(bottomSheetRef));
  }, []);

  /**
   * gpt 일기 생성
   */
  const createGptDiaryMutation = useMutation(
    async (details: string) => {
      const content = await apiService.createGptDiary(details);

      return content;
    },
    {
      onSuccess: (content: string) => {
        console.log("[gpt가 생성한 일기]", content);

        setValue("content", getValues("content") + content);
      },
    }
  );

  /**
   * 가이드에 사용할 데이터
   */
  const { data: guideElements, isLoading } = useQuery(
    ["writeGuide"],
    async () => {
      const guideElements: GuideElement[] = [];

      const guideGuides = await apiService.getGuideGuides();

      /**
       * 1단계 요소 추가
       */
      const guideElement: GuideElement = { type: "list", items: [] };

      for (const { guide, description } of guideGuides) {
        guideElement.items.push({
          isSelect: false,
          sentence: guide,
          description,
        });
      }

      /**
       * 2단계 요소 추가
       */
      guideElements.push(guideElement);

      for (const { id } of guideGuides) {
        const guideDetails = await apiService.getGuideDetails(id);

        const guideElement: GuideElement = { type: "list", items: [] };

        for (const { detail } of guideDetails) {
          guideElement.items.push({ isSelect: false, sentence: detail });
        }

        guideElement.items.push({
          isSelect: false,
          sentence: "나만의 문장 추가하기",
        });

        guideElements.push(guideElement);

        guideElements.push({
          type: "input",
          items: [{ isSelect: false, sentence: "" }],
        });
      }

      /**
       * 3단계 요소 추가
       */
      guideElements.push({
        type: "input",
        items: [{ isSelect: false, sentence: "" }],
      });

      return guideElements;
    }
  );

  const footerTitle = !guideElements
    ? ""
    : swiperIndex === 0
    ? "1단계"
    : swiperIndex === guideElements.length - 1
    ? "3단계"
    : "2단계";

  const headerTitle = !guideElements
    ? "멈무일기 가이드"
    : swiperIndex === 0
    ? "멈무일기 가이드"
    : swiperIndex === guideElements.length - 1
    ? "다른 일상"
    : guideElements[0].items[Math.floor((swiperIndex - 1) / 2)].sentence;

  const headerSubTitle = !guideElements
    ? "오늘 강아지에게 어떤 일상이 있었나요?"
    : swiperIndex === 0
    ? "오늘 강아지에게 어떤 일상이 있었나요?"
    : swiperIndex === guideElements.length - 1
    ? "이외의 다른 일상이 있다면 얘기해주세요"
    : guideElements[0].items[Math.floor((swiperIndex - 1) / 2)].description;

  const handleNextButtonClick = () => {
    if (!guideElements || !swiperRef.current) {
      return;
    }

    const selectedIndexes: number[] = [];

    guideElements[0].items.forEach(({ isSelect }, i) => {
      if (isSelect) {
        selectedIndexes.push(i);
      }
    });

    if (!selectedIndexes.length) {
      fireToast("최소 하나 이상의 가이드를 선택해주세요.", 3000);

      return;
    }

    switch (swiperIndex) {
      /**
       * 1단계
       */
      case 0:
        const nextIndex = selectedIndexes[0] * 2 + 1;

        swiperRef.current.goTo(nextIndex);

        break;

      /**
       * 3단계
       */
      case guideElements.length - 1:
        const sentenses: string[] = [];

        for (let i = 0; i < guideElements.length; i++) {
          if (i === 0) {
            continue;
          }

          const { type, items } = guideElements[i];

          if (type === "list") {
            if (!guideElements[0].items[Math.floor((i - 1) / 2)].isSelect) {
              continue;
            }

            for (let j = 0; j < items.length - 1; j++) {
              const item = items[j];

              if (item.isSelect) {
                sentenses.push(item.sentence);
              }
            }

            if (!items[items.length - 1].isSelect) {
              i++;
            }
          }

          if (type === "input") {
            if (
              i !== guideElements.length - 1 &&
              !guideElements[0].items[Math.floor((i - 1) / 2)].isSelect
            ) {
              continue;
            }

            const item = items[items.length - 1];

            if (item.isSelect) {
              sentenses.push(item.sentence);
            }
          }
        }

        bottomSheetRef.current?.snapToIndex(0);

        createGptDiaryMutation.mutate(sentenses.join("|"));

        break;

      /**
       * 2단계
       */
      default:
        if (guideElements[swiperIndex].type === "list") {
          const { items } = guideElements[swiperIndex];

          const customSentense = items[items.length - 1];

          if (customSentense.isSelect) {
            swiperRef.current.goToNext();

            break;
          }

          const i = Math.floor((swiperIndex - 1) / 2);

          const j = selectedIndexes.indexOf(i);

          const nextIndex = selectedIndexes[j + 1];

          if (nextIndex === undefined) {
            swiperRef.current.goTo(guideElements.length - 1);

            break;
          }

          swiperRef.current.goTo(nextIndex * 2 + 1);
        }

        if (guideElements[swiperIndex].type === "input") {
          const i = Math.floor((swiperIndex - 1) / 2);

          const j = selectedIndexes.indexOf(i);

          const nextIndex = selectedIndexes[j + 1];

          if (nextIndex === undefined) {
            swiperRef.current.goTo(guideElements.length - 1);

            break;
          }

          swiperRef.current.goTo(nextIndex * 2 + 1);
        }

        break;
    }
  };

  const handlePrevButtonClick = () => {
    if (!guideElements || !swiperRef.current) {
      return;
    }

    const selectedIndexes: number[] = [];

    guideElements[0].items.forEach(({ isSelect }, i) => {
      if (isSelect) {
        selectedIndexes.push(i);
      }
    });

    if (!selectedIndexes.length) {
      return;
    }

    switch (swiperIndex) {
      /**
       * 1단계
       */
      case 0:
        // do nothing

        break;

      /**
       * 3단계
       */
      case guideElements.length - 1:
        const prevIndex = selectedIndexes[selectedIndexes.length - 1];

        const prevItems = guideElements[prevIndex * 2 + 1].items;

        const customSentense = prevItems[prevItems.length - 1];

        if (customSentense.isSelect) {
          swiperRef.current.goTo(prevIndex * 2 + 2);
        } else {
          swiperRef.current.goTo(prevIndex * 2 + 1);
        }

        break;

      /**
       * 2단계
       */
      default:
        if (guideElements[swiperIndex].type === "input") {
          swiperRef.current.goToPrev();
        }

        if (guideElements[swiperIndex].type === "list") {
          const i = Math.floor((swiperIndex - 1) / 2);

          const j = selectedIndexes.indexOf(i);

          const prevIndex = selectedIndexes[j - 1];

          if (prevIndex === undefined) {
            swiperRef.current.goTo(0);

            break;
          }

          const prevItems = guideElements[prevIndex * 2 + 1].items;

          const customSentense = prevItems[prevItems.length - 1];

          if (customSentense.isSelect) {
            swiperRef.current.goTo(prevIndex * 2 + 2);
          } else {
            swiperRef.current.goTo(prevIndex * 2 + 1);
          }
        }

        break;
    }
  };

  const AIBottomSheetFooter = ({
    animatedFooterPosition,
  }: BottomSheetFooterProps) => {
    const footerPosition = useDerivedValue(() => {
      return Math.max(
        animatedFooterPosition.value,
        size.AI_BOTTOM_SHEET_HEADER_HEIGHT
      );
    }, []);

    return (
      <BottomSheetFooter
        bottomInset={0}
        animatedFooterPosition={footerPosition}
      >
        <View style={styles.bottomSheetFooter}>
          <Text style={styles.bottomSheetFooterTitle}>{footerTitle}</Text>
          <View style={styles.bottomSheetFooterButtonWrapper}>
            <NavigationButton
              content="이전"
              onPress={handlePrevButtonClick}
              backgroundColor="#373840"
            />
            <NavigationButton content="다음" onPress={handleNextButtonClick} />
          </View>
        </View>
      </BottomSheetFooter>
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      containerStyle={bottomSheetMaxWidthStyle}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.bottomSheetIndicator}
      footerComponent={AIBottomSheetFooter}
      backdropComponent={AIBottomSheetBackdrop}
      enablePanDownToClose={true}
      index={-1}
    >
      <BottomSheetView style={styles.bottomSheetContent}>
        <AIBottomSheetHeader title={headerTitle} subTitle={headerSubTitle} />

        {isLoading && <MultiSelectListSkeleton />}

        {guideElements && (
          <Swiper
            ref={swiperRef}
            onIndexChanged={handleSwiperIndexChange}
            containerStyle={styles.swiperContainer}
            gesturesEnabled={() => false}
            controlsEnabled={false}
          >
            {guideElements.map(({ type, items }, i) => {
              return type === "list" ? (
                <MultiSelectList guideElementItems={items} key={i} />
              ) : (
                <SentenseInput guideElementItems={items} key={i} />
              );
            })}
          </Swiper>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}
