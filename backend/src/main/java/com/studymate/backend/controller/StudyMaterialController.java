package com.studymate.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.studymate.backend.dto.StudyFolderDTO;
import com.studymate.backend.dto.StudyMaterialResponse;
import com.studymate.backend.model.StudyMaterial;
import com.studymate.backend.model.User;
import com.studymate.backend.service.StudyMaterialService;

@RestController
@RequestMapping("/study-materials")
@CrossOrigin(origins = "*", maxAge = 3600)
public class StudyMaterialController {

    @Autowired
    private StudyMaterialService studyMaterialService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "folderId", required = false) Long folderId,
            @AuthenticationPrincipal User user) {
        try {
            Long userId = user.getId();

            StudyMaterial savedMaterial = studyMaterialService.saveFile(file, subject, description, folderId, userId);
            StudyMaterialResponse response = convertToResponse(savedMaterial);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Upload failed: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<StudyMaterialResponse>> getAllMaterials(@AuthenticationPrincipal User user) {
        try {
            Long userId = user.getId();

            List<StudyMaterial> materials = studyMaterialService.getUserMaterials(userId);
            List<StudyMaterialResponse> responses = materials.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/folder/{folderId}")
    public ResponseEntity<List<StudyMaterialResponse>> getMaterialsInFolder(
            @PathVariable Long folderId,
            @AuthenticationPrincipal User user) {
        try {
            Long userId = user.getId();

            List<StudyMaterial> materials = studyMaterialService.getMaterialsInFolder(folderId, userId);
            List<StudyMaterialResponse> responses = materials.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/unorganized")
    public ResponseEntity<List<StudyMaterialResponse>> getUnorganizedMaterials(@AuthenticationPrincipal User user) {
        try {
            Long userId = user.getId();

            List<StudyMaterial> materials = studyMaterialService.getMaterialsWithoutFolder(userId);
            List<StudyMaterialResponse> responses = materials.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id, @AuthenticationPrincipal User user) {
        try {
            Long userId = user.getId();

            StudyMaterial material = studyMaterialService.getMaterialById(id, userId);

            if (material == null) {
                return ResponseEntity.notFound().build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", material.getOriginalName());
            headers.setContentLength(material.getFileData().length);

            return new ResponseEntity<>(material.getFileData(), headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable Long id, @AuthenticationPrincipal User user) {
        try {
            Long userId = user.getId();

            boolean deleted = studyMaterialService.deleteMaterial(id, userId);

            if (deleted) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Delete failed: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<StudyMaterialResponse>> searchMaterials(
            @RequestParam("q") String query,
            @AuthenticationPrincipal User user) {
        try {
            Long userId = user.getId();

            List<StudyMaterial> materials = studyMaterialService.searchMaterials(query, userId);
            List<StudyMaterialResponse> responses = materials.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    private StudyMaterialResponse convertToResponse(StudyMaterial material) {
        StudyMaterialResponse response = new StudyMaterialResponse();
        response.setId(material.getId());
        response.setFileName(material.getFileName());
        response.setOriginalName(material.getOriginalName());
        response.setFileType(material.getFileType().toString());
        response.setFileSize(material.getFileSize());
        response.setSubject(material.getSubject());
        response.setDescription(material.getDescription());
        response.setCreatedAt(material.getCreatedAt());
        response.setUpdatedAt(material.getUpdatedAt());

        // Include folder information if material is in a folder
        if (material.getFolder() != null) {
            StudyFolderDTO folderDTO = new StudyFolderDTO();
            folderDTO.setId(material.getFolder().getId());
            folderDTO.setName(material.getFolder().getName());
            folderDTO.setDescription(material.getFolder().getDescription());
            response.setFolder(folderDTO);
        }

        return response;
    }
}
