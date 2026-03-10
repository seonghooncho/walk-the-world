import { uploadsApi } from "@/lib/api";

export interface UploadedFile {
  key: string;
  uploadUrl: string;
}

export const uploadImageFile = async (
  domain: "posts" | "missions" | "avatars" | "composite" | "chat",
  file: File,
): Promise<UploadedFile> => {
  const response = await uploadsApi.getPresignedUrl(domain, file.name, file.type || "image/jpeg");
  const uploadResponse = await fetch(response.data.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "image/jpeg",
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("이미지 업로드에 실패했습니다");
  }

  return response.data;
};
