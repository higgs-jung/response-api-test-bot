import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI();

export async function POST(request: Request) {
  let requestBody;

  try {
    requestBody = await request.json();
    const { vector_store_id, restaurant_data, call_id } = requestBody;

    if (!vector_store_id || !restaurant_data) {
      return NextResponse.json(
        {
          success: false,
          message: "벡터스토어 ID와 맛집 정보가 필요합니다.",
          call_id: call_id,
        },
        { status: 400 }
      );
    }

    // 현재 시간을 등록일로 추가
    const created_at = new Date().toISOString();

    // 맛집 정보를 문자열로 변환
    const restaurantText =
      `맛집 이름: ${restaurant_data.name}\n` +
      `지역: ${restaurant_data.region}\n` +
      `설명: ${restaurant_data.description}\n` +
      (restaurant_data.details
        ? `상세 정보: ${restaurant_data.details}\n`
        : "") +
      (restaurant_data.keywords?.length
        ? `키워드: ${restaurant_data.keywords.join(", ")}\n`
        : "") +
      `등록일: ${created_at}`;

    // 파일 업로드 형식으로 변환하여 벡터스토어에 추가
    const fileBlob = new Blob([restaurantText], { type: "text/plain" });

    // @ts-ignore - OpenAI API 타입 정의 문제 해결
    const response = await openai.files.create({
      file: new File([fileBlob], "restaurant.txt", { type: "text/plain" }),
      purpose: "assistants",
    });

    // 파일을 벡터스토어에 연결
    await openai.vectorStores.files.create(vector_store_id, {
      file_id: response.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "맛집 정보가 성공적으로 추가되었습니다.",
        data: {
          file_id: response.id,
          restaurant_info: {
            name: restaurant_data.name,
            ...restaurant_data,
            created_at,
          },
        },
        call_id: call_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("맛집 정보 추가 중 오류 발생:", error);

    return NextResponse.json(
      {
        success: false,
        message: "맛집 정보 추가 중 오류가 발생했습니다.",
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
        call_id: requestBody?.call_id,
      },
      { status: 500 }
    );
  }
}
