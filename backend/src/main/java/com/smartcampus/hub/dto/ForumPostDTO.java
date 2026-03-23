package com.smartcampus.hub.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ForumPostDTO {
    private Long id;
    private String title;
    private String content;
    private String authorName;
    private LocalDateTime createdAt;
    private int likeCount;
    private int commentCount;
}
