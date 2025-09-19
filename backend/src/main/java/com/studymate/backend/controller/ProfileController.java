package com.studymate.backend.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.studymate.backend.dto.ProfileUpdateRequest;
import com.studymate.backend.model.User;
import com.studymate.backend.service.UserService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(user);
    }

    @PutMapping
    public ResponseEntity<User> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ProfileUpdateRequest request) {

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setUniversityName(request.getUniversityName());
        user.setCurrentTerm(request.getCurrentTerm());
        user.setAcademicYear(request.getAcademicYear());
        user.setMajor(request.getMajor());
        user.setYearOfStudy(request.getYearOfStudy());

        User updatedUser = userService.save(user);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/photo")
    public ResponseEntity<User> uploadProfilePhoto(
            @AuthenticationPrincipal User user,
            @RequestParam("photo") MultipartFile file) {

        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().build();
            }

            // Check file size (5MB max)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().build();
            }

            // Store image as binary data in database
            user.setProfilePhotoData(file.getBytes());
            user.setProfilePhotoContentType(contentType);

            // Set a flag URL to indicate photo exists (for frontend compatibility)
            user.setProfilePhotoUrl("/api/profile/photo/" + user.getId());

            User updatedUser = userService.save(user);
            return ResponseEntity.ok(updatedUser);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/photo/{userId}")
    public ResponseEntity<byte[]> getProfilePhoto(@PathVariable Long userId) {
        try {
            User user = userService.findById(userId);
            if (user == null || user.getProfilePhotoData() == null) {
                return ResponseEntity.notFound().build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(user.getProfilePhotoContentType()));
            headers.setContentLength(user.getProfilePhotoData().length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(user.getProfilePhotoData());

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
