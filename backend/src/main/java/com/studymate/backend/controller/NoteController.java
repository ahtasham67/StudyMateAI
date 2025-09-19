package com.studymate.backend.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.studymate.backend.model.Note;
import com.studymate.backend.model.StudyFolder;
import com.studymate.backend.model.User;
import com.studymate.backend.repository.NoteRepository;
import com.studymate.backend.repository.StudyFolderRepository;

import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private StudyFolderRepository studyFolderRepository;

    @GetMapping
    public ResponseEntity<List<Note>> getAllNotes(@AuthenticationPrincipal User user) {
        List<Note> notes = noteRepository.findByUserOrderByUpdatedAtDesc(user);
        return ResponseEntity.ok(notes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        Optional<Note> note = noteRepository.findById(id);
        if (note.isPresent() && note.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.ok(note.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Note> createNote(@Valid @RequestBody Note note, @AuthenticationPrincipal User user) {
        note.setUser(user);

        // Handle folder association if provided
        if (note.getFolder() != null && note.getFolder().getId() != null) {
            Optional<StudyFolder> folder = studyFolderRepository.findByIdAndUserId(
                    note.getFolder().getId(), user.getId());
            if (folder.isPresent()) {
                note.setFolder(folder.get());
            } else {
                note.setFolder(null); // Invalid folder, set to null
            }
        }

        Note savedNote = noteRepository.save(note);
        return ResponseEntity.ok(savedNote);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable Long id,
            @Valid @RequestBody Note noteDetails,
            @AuthenticationPrincipal User user) {
        Optional<Note> optionalNote = noteRepository.findById(id);
        if (optionalNote.isPresent() && optionalNote.get().getUser().getId().equals(user.getId())) {
            Note note = optionalNote.get();
            note.setTitle(noteDetails.getTitle());
            note.setContent(noteDetails.getContent());
            note.setSubject(noteDetails.getSubject());
            note.setCategory(noteDetails.getCategory());
            note.setUpdatedAt(LocalDateTime.now());

            // Handle folder association if provided
            if (noteDetails.getFolder() != null && noteDetails.getFolder().getId() != null) {
                Optional<StudyFolder> folder = studyFolderRepository.findByIdAndUserId(
                        noteDetails.getFolder().getId(), user.getId());
                if (folder.isPresent()) {
                    note.setFolder(folder.get());
                } else {
                    note.setFolder(null); // Invalid folder, set to null
                }
            } else {
                note.setFolder(null); // No folder specified, set to null
            }

            Note updatedNote = noteRepository.save(note);
            return ResponseEntity.ok(updatedNote);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id, @AuthenticationPrincipal User user) {
        Optional<Note> note = noteRepository.findById(id);
        if (note.isPresent() && note.get().getUser().getId().equals(user.getId())) {
            noteRepository.delete(note.get());
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/subject/{subject}")
    public ResponseEntity<List<Note>> getNotesBySubject(@PathVariable String subject,
            @AuthenticationPrincipal User user) {
        List<Note> notes = noteRepository.findByUserAndSubjectOrderByUpdatedAtDesc(user, subject);
        return ResponseEntity.ok(notes);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Note>> getNotesByCategory(@PathVariable String category,
            @AuthenticationPrincipal User user) {
        List<Note> notes = noteRepository.findByUserAndCategoryOrderByUpdatedAtDesc(user, category);
        return ResponseEntity.ok(notes);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Note>> searchNotes(@RequestParam String keyword,
            @AuthenticationPrincipal User user) {
        List<Note> notes = noteRepository.searchByKeyword(user, keyword);
        return ResponseEntity.ok(notes);
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<String>> getDistinctSubjects(@AuthenticationPrincipal User user) {
        List<String> subjects = noteRepository.findDistinctSubjectsByUser(user);
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getDistinctCategories(@AuthenticationPrincipal User user) {
        List<String> categories = noteRepository.findDistinctCategoriesByUser(user);
        return ResponseEntity.ok(categories);
    }
}
