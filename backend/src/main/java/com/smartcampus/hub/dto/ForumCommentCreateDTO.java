package com.smartcampus.hub.dto;

import lombok.Data;

@Data
public class ForumCommentCreateDTO {
    private String content;
    private Long parentId;  // optional - for future threaded replies
}