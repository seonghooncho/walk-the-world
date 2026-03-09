package com.walkworld.api.domain.s3.controller;

import com.walkworld.api.domain.s3.enums.FileDomain;
import com.walkworld.api.domain.s3.error.S3ErrorCode;
import com.walkworld.api.domain.s3.error.S3Exception;
import com.walkworld.api.domain.s3.service.S3Service;
import com.walkworld.api.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/uploads/v1")
@RequiredArgsConstructor
public class S3Controller {

  private final S3Service s3Service;

  @PostMapping("/presigned-url")
  public ApiResponse<PresignedUrlResponse> getPresignedUrl(
      @RequestParam String domain,
      @RequestParam String filename,
      @RequestParam(defaultValue = "image/jpeg") String contentType) {

    if (!s3Service.isAllowedExtension(filename)) {
      throw new S3Exception(S3ErrorCode.UNSUPPORTED_FILE_TYPE);
    }

    FileDomain fileDomain;
    try {
      fileDomain = FileDomain.valueOf(domain.toUpperCase());
    } catch (IllegalArgumentException e) {
      fileDomain = FileDomain.POSTS; // default fallback
    }

    S3Service.PresignedUpload result =
        s3Service.generateUploadUrl(fileDomain, filename, contentType);
    return ApiResponse.ok(new PresignedUrlResponse(result.key(), result.uploadUrl()));
  }

  public record PresignedUrlResponse(String key, String uploadUrl) {}
}
