package com.walkworld.api.domain.mission.dto;

import lombok.Data;

@Data
public class MissionCompositeRequest {
    /** S3 object key (pre-signed URL로 업로드 후 전달) */
    private String imageKey;
}
