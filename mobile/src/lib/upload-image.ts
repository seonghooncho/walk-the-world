import { uploadsApi } from "@/src/lib/api";

interface UploadAsset {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}

export async function uploadImageAsset(domain: string, asset: UploadAsset) {
  const filename = asset.fileName ?? `upload-${Date.now()}.jpg`;
  const contentType = asset.mimeType ?? "image/jpeg";
  const response = await uploadsApi.getPresignedUrl(domain, filename, contentType);

  const uploadResponse = await fetch(response.data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: await (await fetch(asset.uri)).blob(),
  });

  if (!uploadResponse.ok) {
    throw new Error("이미지 업로드에 실패했습니다");
  }

  return response.data;
}
