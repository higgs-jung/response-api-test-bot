// 구글 맵스 관련 함수들을 모아둔 파일

export const get_maps_info = async ({
  place_name,
  region,
}: {
  place_name: string;
  region?: string;
}) => {
  console.log("장소명:", place_name);
  console.log("지역:", region);

  const params = new URLSearchParams({
    place_name,
    ...(region ? { region } : {}),
  });

  const res = await fetch(`/api/functions/get_maps_info?${params}`).then(
    (res) => res.json()
  );
  return res;
};

/**
 * 브라우저 위치 정보를 가져오는 함수
 * @returns 위치 정보 객체 (성공/실패 여부, 위도, 경도, 오류 메시지)
 */
export const get_browser_location = async () => {
  try {
    // 브라우저 geolocation API를 프로미스로 래핑
    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("이 브라우저에서는 위치 정보를 지원하지 않습니다."));
          return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        });
      }
    );

    return {
      success: true,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      message: "위치 정보를 성공적으로 가져왔습니다.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
      message: "위치 정보를 가져오는데 실패했습니다.",
    };
  }
};
