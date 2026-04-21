package com.smartcampus.hub.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.smartcampus.hub.dto.ResourceResponseDTO;
import com.smartcampus.hub.config.CorsProperties;
import com.smartcampus.hub.SmartCampusHubApplication;
import com.smartcampus.hub.service.ResourceService;
import com.smartcampus.hub.util.ResourceStatus;
import com.smartcampus.hub.util.ResourceType;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ResourceController.class)
@Import(com.smartcampus.hub.security.SecurityConfig.class)
@ContextConfiguration(classes = SmartCampusHubApplication.class)
class ResourceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ResourceService resourceService;

        @MockBean
        private CorsProperties corsProperties;

    @Test
    @WithMockUser(roles = "USER")
    void getAllShouldReturnResourcesForAuthenticatedUsers() throws Exception {
                when(corsProperties.allowedOrigins()).thenReturn(List.of("http://localhost:5173"));

        ResourceResponseDTO response = new ResourceResponseDTO(
                1L,
                "Lecture Hall 1",
                ResourceType.LECTURE_HALL,
                "Main lecture hall",
                "Building A",
                120,
                ResourceStatus.ACTIVE,
                "Mon-Fri 08:00-17:00",
                LocalDateTime.of(2026, 4, 21, 9, 0),
                LocalDateTime.of(2026, 4, 21, 9, 10));

        when(resourceService.findAll(eq(ResourceType.LECTURE_HALL), eq(50), eq(150), eq("Building A"), eq(ResourceStatus.ACTIVE), eq("lecture")))
                .thenReturn(List.of(response));

        mockMvc.perform(get("/api/resources")
                        .param("type", "LECTURE_HALL")
                        .param("capacityMin", "50")
                        .param("capacityMax", "150")
                        .param("location", "Building A")
                        .param("status", "ACTIVE")
                        .param("search", "lecture"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Lecture Hall 1"))
                .andExpect(jsonPath("$[0].type").value("LECTURE_HALL"))
                .andExpect(jsonPath("$[0].location").value("Building A"))
                .andExpect(jsonPath("$[0].capacity").value(120))
                .andExpect(jsonPath("$[0].status").value("ACTIVE"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createShouldAllowAdminUsers() throws Exception {
        when(corsProperties.allowedOrigins()).thenReturn(List.of("http://localhost:5173"));

        ResourceResponseDTO response = new ResourceResponseDTO(
                2L,
                "New Lab",
                ResourceType.LAB,
                "Newly created lab",
                "Building B",
                40,
                ResourceStatus.ACTIVE,
                "Mon-Fri 08:00-18:00",
                LocalDateTime.of(2026, 4, 21, 11, 0),
                LocalDateTime.of(2026, 4, 21, 11, 0));

        when(resourceService.create(any())).thenReturn(response);

        mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "New Lab",
                                  "type": "LAB",
                                  "description": "Newly created lab",
                                  "location": "Building B",
                                  "capacity": 40,
                                  "status": "ACTIVE",
                                  "availabilityWindows": "Mon-Fri 08:00-18:00"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.name").value("New Lab"))
                .andExpect(jsonPath("$.type").value("LAB"))
                .andExpect(jsonPath("$.location").value("Building B"))
                .andExpect(jsonPath("$.capacity").value(40))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteShouldReturnNoContentForAdminUsers() throws Exception {
        when(corsProperties.allowedOrigins()).thenReturn(List.of("http://localhost:5173"));

        mockMvc.perform(delete("/api/resources/3"))
                .andExpect(status().isNoContent());

        verify(resourceService).delete(3L);
    }
}