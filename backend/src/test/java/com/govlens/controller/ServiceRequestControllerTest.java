package com.govlens.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.govlens.dto.ServiceRequestDTO;
import com.govlens.model.ServiceRequest.Status;
import com.govlens.service.ServiceRequestService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ServiceRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ServiceRequestService service;

    @Test
    @DisplayName("GET /api/requests returns paginated results for authenticated analyst")
    @WithMockUser(roles = "ANALYST")
    void listRequests_asAnalyst_returnsOk() throws Exception {
        ServiceRequestDTO dto = buildSampleDTO();
        when(service.findAll(any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(dto)));

        mockMvc.perform(get("/api/requests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Pothole on Main St"))
                .andExpect(jsonPath("$.content[0].status").value("OPEN"));
    }

    @Test
    @DisplayName("GET /api/requests returns 401 for unauthenticated user")
    void listRequests_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/requests"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/requests creates request and returns 201")
    @WithMockUser(roles = "ANALYST")
    void createRequest_asAnalyst_returns201() throws Exception {
        ServiceRequestDTO input = new ServiceRequestDTO();
        input.setTitle("Broken streetlight");
        input.setCategory("INFRASTRUCTURE");
        input.setPriority(2);
        input.setDepartmentId(1L);

        ServiceRequestDTO created = buildSampleDTO();
        created.setTitle("Broken streetlight");
        when(service.create(any(ServiceRequestDTO.class), anyString())).thenReturn(created);

        mockMvc.perform(post("/api/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Broken streetlight"));
    }

    @Test
    @DisplayName("PUT /api/requests/{id}/status forbidden for ANALYST role")
    @WithMockUser(roles = "ANALYST")
    void updateStatus_asAnalyst_returns403() throws Exception {
        mockMvc.perform(put("/api/requests/1/status")
                        .param("status", "RESOLVED"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PUT /api/requests/{id}/status allowed for MANAGER role")
    @WithMockUser(roles = "MANAGER")
    void updateStatus_asManager_returnsOk() throws Exception {
        ServiceRequestDTO dto = buildSampleDTO();
        dto.setStatus("RESOLVED");
        when(service.updateStatus(anyLong(), any(Status.class), any(), any(), anyString()))
                .thenReturn(dto);

        mockMvc.perform(put("/api/requests/1/status")
                        .param("status", "RESOLVED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"));
    }

    @Test
    @DisplayName("GET /api/requests/{id} returns single request")
    @WithMockUser(roles = "ANALYST")
    void getById_existingId_returnsOk() throws Exception {
        when(service.findById(1L)).thenReturn(buildSampleDTO());

        mockMvc.perform(get("/api/requests/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.category").value("INFRASTRUCTURE"));
    }

    private ServiceRequestDTO buildSampleDTO() {
        ServiceRequestDTO dto = new ServiceRequestDTO();
        dto.setId(1L);
        dto.setTitle("Pothole on Main St");
        dto.setDescription("Large pothole near intersection of Main and 3rd");
        dto.setCategory("INFRASTRUCTURE");
        dto.setPriority(2);
        dto.setStatus("OPEN");
        dto.setDepartmentId(1L);
        dto.setDepartmentName("Public Works");
        dto.setSubmittedBy("analyst1");
        dto.setSubmittedAt(LocalDateTime.now());
        dto.setPriorityScore(65.0);
        return dto;
    }
}
