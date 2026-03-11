import { apiFetch } from "@/src/lib/api/client";

export const uploadsApi = {
  getPresignedUrl: (domain: string, filename: string, contentType = "image/jpeg") => {
    const qs = new URLSearchParams({ domain, filename, contentType });
    return apiFetch<{ key: string; uploadUrl: string }>(`/api/uploads/v1/presigned-url?${qs}`, { method: "POST" });
  },
};
