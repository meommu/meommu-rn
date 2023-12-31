// react
import type { MutableRefObject } from "react";
import Swiper from "react-native-web-swiper";
import { useFormContext } from "react-hook-form";

// components
import { Header } from "@/components/Layout/Header";
import { CaretLeftButton } from "@/components/Button/CaretLeftButton";
import { WriteFormStepOne } from "@/pages/Write/WritePresenter/WriteForm/WriteFormStepOne";
import { WriteFormStepTwo } from "@/pages/Write/WritePresenter/WriteForm/WriteFormStepTwo";
import { NavigationButton } from "@/components/Button/NavigationButton";
import { Footer } from "@/components/Layout/Footer";
import { Popover } from "@/components/Overlay/Popover";
import { WriteGuide } from "../components/WriteGuide";
import { DatePicker } from "../components/DatePicker";
import { FixedRelativeView } from "@/components/Layout/FixedRelativeView";
import { CompleteButton } from "@/components/Button/CompleteButton";

// constants
import { size } from "@/constants";

// styles
import { styles } from "./index.styles";

interface WritePresenterProps {
  swiperRef: MutableRefObject<Swiper | null>;
  handleSwiperIndexChange: (index: number) => void;

  /**
   * 하단의 버튼을 클릭했을 때 실행될 함수
   */
  handleBottomButtonClick: () => void;

  /**
   * 완료 버튼을 클릭했을 때 실행될 함수
   */
  handleFinishButtonClick: () => void;

  /**
   * 뒤로가기 버튼 클릭 시 실행될 함수
   */
  handleGoBackButtonClick: () => void;

  /**
   * 바텀 버튼을 누를 수 있는지 여부를 반환하는 함수
   */
  isBottomButtonActive: () => boolean;

  /**
   * 현재 swiper가 첫 단계의 슬라이드인지 반환하는 함수
   */
  isStepOneSlide: () => boolean;

  /**
   * `완료` 버튼을 눌러 서버로 post 요청이 전송된 상태인지를 구분하기 위한 변수
   */
  isLoading: boolean;
}

export function WritePresenter({
  swiperRef,
  handleBottomButtonClick,
  handleFinishButtonClick,
  handleGoBackButtonClick,
  handleSwiperIndexChange,
  isBottomButtonActive,
  isStepOneSlide,
  isLoading,
}: WritePresenterProps) {
  const { setValue, getValues } = useFormContext<DiaryWriteFormFieldValues>();

  return (
    <FixedRelativeView style={styles.container}>
      <Header
        style={styles.header}
        title={isStepOneSlide() ? "누구의 일기인가요?" : "일기쓰기"}
        left={<CaretLeftButton onPress={handleGoBackButtonClick} />}
        right={
          !isStepOneSlide() && (
            <CompleteButton
              onPress={handleFinishButtonClick}
              disabled={isLoading}
            />
          )
        }
      />

      <Swiper
        ref={swiperRef}
        onIndexChanged={handleSwiperIndexChange}
        controlsEnabled={false}
        gesturesEnabled={() => false}
        springConfig={{
          tension: 0,
        }}
      >
        <WriteFormStepOne />
        <WriteFormStepTwo />
      </Swiper>

      <Footer style={styles.footer}>
        <NavigationButton
          content={isStepOneSlide() ? "다음" : "멈무일기 가이드"}
          onPress={handleBottomButtonClick}
          disabled={!isBottomButtonActive()}
        />
      </Footer>

      {!isStepOneSlide() && (
        <Popover
          id="guide"
          content="빠르게 쓸 수 있도록 도와드릴게요"
          bottom={
            size.FOOTER_PADDING_BOTTOM + size.NAVIGATION_BUTTON_HEIGHT + 24
          }
        />
      )}

      <WriteGuide setValue={setValue} getValues={getValues} />
      <DatePicker setValue={setValue} />
    </FixedRelativeView>
  );
}
