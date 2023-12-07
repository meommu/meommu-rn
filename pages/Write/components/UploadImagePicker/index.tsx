// react
import { useRef } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  Platform,
  ActivityIndicator,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import { useMutation } from "react-query";
import { type UseFormGetValues, type UseFormSetValue } from "react-hook-form";

// redux
import { useSelector } from "react-redux";
import { type RootState } from "@/store";
import { type LayoutState } from "@/store/modules/layout";

// expo
import * as ImagePicker from "expo-image-picker";

// components
import { LoadImage } from "@/components/Widget/LoadImage";
import { ImageRemoveButton } from "@/components/Button/ImageRemoveButton";
import { DraggableHorizontalScrollView } from "@/components/ScrollView/DraggableHorizontalScrollView";

// utils
import { b64ToBlob } from "@/utils";

// constants
import { IMAGE_CATEGORY } from "@/constants";

// apis
import { apiService } from "@/apis";

// svgs
import Camera from "@/assets/svgs/camera.svg";

// hooks
import { useToast } from "@/hooks";

// styles
import { styles } from "./index.styles";

interface ImagePickerProps {
  /**
   * value < 0 : 업로드 중인 이미지
   * value >= 0 : 업로드 된 이미지
   */
  imageIds: number[];

  setValue: UseFormSetValue<DiaryWriteFormFieldValues>;

  getValues: UseFormGetValues<DiaryWriteFormFieldValues>;
}

export function UploadImagePicker({
  imageIds,
  setValue,
  getValues,
}: ImagePickerProps) {
  const { fireToast } = useToast();

  const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();

  const index = useRef(-1);

  const indexToB64 = useRef<Map<number, string>>(new Map());

  const uploadImageMutation = useMutation(
    async ({ formData }: { loadingImageId: number; formData: FormData }) => {
      const imageId = await apiService.uploadImage(formData);

      return imageId;
    },
    {
      onSuccess: (imageId, { loadingImageId }) => {
        const imageIds = getValues("imageIds");

        const i = imageIds.indexOf(loadingImageId);

        if (i === -1) {
          return;
        }

        const newImageIds = [...imageIds];

        newImageIds.splice(i, 1, imageId);

        setValue("imageIds", newImageIds);
      },
      onError: (_, { loadingImageId }) => {
        const imageIds = getValues("imageIds");

        const i = imageIds.indexOf(loadingImageId);

        if (i === -1) {
          return;
        }

        const newImageIds = [...imageIds];

        newImageIds.splice(i, 1);

        setValue("imageIds", newImageIds);
      },
    }
  );

  const handleImagePick = async () => {
    if (!status?.granted) {
      const permission = await requestPermission();

      if (!permission.granted) {
        return;
      }
    }

    if (uploadImageMutation.isLoading) {
      fireToast("다른 이미지가 업로드 중입니다.", 3000);

      return;
    }

    if (imageIds.length >= 5) {
      fireToast("이미지는 최대 5개까지 추가할 수 있습니다.", 3000);

      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: false,
      base64: true,
    });

    if (result.canceled) {
      return;
    }

    const formData = new FormData();

    const { base64, uri } = result.assets[0];

    /**
     * 폼 요소 생성
     */
    if (Platform.OS === "web") {
      const fileExtension = uri.split(";")[0].split("/")[1];
      const fileName = `image.${fileExtension}`;
      const contentType = `image/${fileExtension}`;

      const blob = b64ToBlob(base64, contentType);
      const file = new File([blob], fileName, { type: contentType });

      formData.append("category", IMAGE_CATEGORY.DIARY_IMAGE);
      formData.append("images", file);
    } else {
      const fileExtension = uri.slice(uri.lastIndexOf(".") + 1);
      const fileName = `image.${fileExtension}`;
      const contentType = `image/${fileExtension}`;

      formData.append("category", IMAGE_CATEGORY.DIARY_IMAGE);
      // @ts-ignore
      formData.append("images", { uri, name: fileName, type: contentType });
    }

    /**
     * 로딩 중 표시할 요소를 위한 데이터 생성
     */
    const loadingImageId = index.current;

    indexToB64.current.set(loadingImageId, "data:image/jpeg;base64," + base64);

    setValue("imageIds", [...imageIds, loadingImageId]);

    index.current--;

    uploadImageMutation.mutate({ loadingImageId, formData });
  };

  const handleImageRemoveButtonClick = (imageId: number) => () => {
    const index = imageIds.indexOf(imageId);

    const newImageIds = [...imageIds];

    newImageIds.splice(index, 1);

    setValue("imageIds", newImageIds);
  };

  const { width } = useSelector<RootState, LayoutState>(
    (state) => state.layout
  );

  const sideLength = (width - 7 * 2) / 5;

  const itemLayoutStyle: StyleProp<ViewStyle> = {
    width: sideLength,
    height: sideLength,
    padding: 7,
  };

  return (
    <DraggableHorizontalScrollView>
      <View style={styles.list} onStartShouldSetResponder={() => true}>
        <View style={itemLayoutStyle}>
          <View style={styles.item}>
            <Pressable style={styles.uploader} onPress={handleImagePick}>
              <Camera />

              <Text style={styles.uploaderText}>{imageIds.length} / 5</Text>
            </Pressable>
          </View>
        </View>

        {[...imageIds].reverse().map((imageId, i) => {
          if (imageId < 0) {
            const base64 = indexToB64.current.get(imageId);

            return (
              <View style={itemLayoutStyle} key={`loadingImageId${i}`}>
                <View style={styles.item}>
                  <Image style={styles.loadingImage} source={{ uri: base64 }} />
                  <View style={styles.dimmed} />
                  <ActivityIndicator
                    style={styles.activityIndicator}
                    size={"large"}
                  />
                </View>
              </View>
            );
          }

          return (
            <View style={itemLayoutStyle} key={`imageId${imageId}`}>
              <View style={styles.item}>
                <LoadImage imageId={imageId} />

                <Pressable
                  onPress={handleImageRemoveButtonClick(imageId)}
                  style={styles.imageRemover}
                >
                  <ImageRemoveButton />
                </Pressable>
              </View>
            </View>
          );
        })}

        {Array(5 - imageIds.length)
          .fill(null)
          .map((_, i) => {
            return (
              <View style={itemLayoutStyle} key={i}>
                <View style={styles.item} />
              </View>
            );
          })}
      </View>
    </DraggableHorizontalScrollView>
  );
}