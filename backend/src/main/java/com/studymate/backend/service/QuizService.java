package com.studymate.backend.service;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.studymate.backend.dto.CreateQuizRequest;
import com.studymate.backend.dto.QuizOptionResponse;
import com.studymate.backend.dto.QuizQuestionResponse;
import com.studymate.backend.dto.QuizResponse;
import com.studymate.backend.model.Quiz;
import com.studymate.backend.model.QuizOption;
import com.studymate.backend.model.QuizQuestion;
import com.studymate.backend.model.StudyMaterial;
import com.studymate.backend.model.User;
import com.studymate.backend.repository.QuizRepository;
import com.studymate.backend.repository.StudyMaterialRepository;

@Service
@Transactional
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private StudyMaterialRepository studyMaterialRepository;

    @Autowired
    private DocumentTextExtractorService documentTextExtractorService;

    @Autowired
    private GeminiAIQuizGeneratorService geminiAIQuizGeneratorService;

    @Autowired
    private AIQuizGeneratorService fallbackQuizGeneratorService;

    public QuizResponse createQuiz(CreateQuizRequest request, User user) {
        // Validate study material exists and belongs to user
        Optional<StudyMaterial> studyMaterialOpt = studyMaterialRepository
                .findByIdAndUserId(request.getStudyMaterialId(), user.getId());

        if (!studyMaterialOpt.isPresent()) {
            throw new RuntimeException("Study material not found or access denied");
        }

        StudyMaterial studyMaterial = studyMaterialOpt.get();

        // Create quiz entity
        Quiz quiz = new Quiz();
        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setStudyMaterial(studyMaterial);
        quiz.setUser(user);
        quiz.setTotalQuestions(request.getNumberOfQuestions());
        quiz.setDurationMinutes(request.getDurationMinutes());

        // Save quiz first to get ID
        quiz = quizRepository.save(quiz);

        try {
            // Extract text from study material file
            String extractedText = extractTextFromStudyMaterial(studyMaterial);
            // System.out.println(extractedText);
            
            List<QuizQuestion> generatedQuestions = null;
            
            try {
                // Try to generate quiz questions using real AI service first
                generatedQuestions = geminiAIQuizGeneratorService.generateQuizQuestionsFromText(
                        studyMaterial, extractedText, request.getNumberOfQuestions(), request.getDurationMinutes());
            } catch (Exception aiException) {
                // If AI service fails due to rate limiting or other issues, use fallback
                String errorMessage = aiException.getMessage();
                if (errorMessage != null && (errorMessage.contains("rate limit") || errorMessage.contains("temporarily unavailable"))) {
                    // Use fallback quiz generator for rate limit issues
                    generatedQuestions = fallbackQuizGeneratorService.generateQuestions(
                            studyMaterial, request.getNumberOfQuestions(), request.getDifficulty());
                    
                    // Update quiz description to indicate fallback was used
                    quiz.setDescription(quiz.getDescription() + " [Generated using fallback system due to AI service availability]");
                } else {
                    // Re-throw non-rate-limit exceptions
                    throw aiException;
                }
            }

            // Set the questions to our quiz and update quiz reference for each question
            for (QuizQuestion question : generatedQuestions) {
                question.setQuiz(quiz);
            }
            quiz.setQuestions(generatedQuestions);

            quiz = quizRepository.save(quiz);

        } catch (Exception e) {
            // If all generation methods fail, delete the quiz and throw exception
            quizRepository.delete(quiz);
            throw new RuntimeException("Failed to generate quiz: " + e.getMessage(), e);
        }

        return convertToResponse(quiz);
    }

    /**
     * Extract text from StudyMaterial file data
     */
    private String extractTextFromStudyMaterial(StudyMaterial studyMaterial) throws IOException {
        if (studyMaterial.getFileData() == null || studyMaterial.getFileData().length == 0) {
            throw new IllegalArgumentException("Study material has no file data");
        }

        String contentType = determineContentType(studyMaterial);

        return documentTextExtractorService.extractTextFromBytes(
                studyMaterial.getFileData(),
                contentType,
                studyMaterial.getFileName());
    }

    /**
     * Determine content type from file extension and stored file type
     */
    private String determineContentType(StudyMaterial studyMaterial) {
        String fileName = studyMaterial.getFileName().toLowerCase();

        if (fileName.endsWith(".pdf")) {
            return "application/pdf";
        } else if (fileName.endsWith(".pptx")) {
            return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        }

        // Fallback to stored file type
        switch (studyMaterial.getFileType()) {
            case PDF:
                return "application/pdf";
            case PPTX:
                return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            default:
                throw new IllegalArgumentException("Unsupported file type: " + studyMaterial.getFileType());
        }
    }

    public List<QuizResponse> getUserQuizzes(User user) {
        List<Quiz> quizzes = quizRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return quizzes.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public QuizResponse getQuizById(Long quizId, User user) {
        Optional<Quiz> quizOpt = quizRepository.findByIdAndUserId(quizId, user.getId());
        if (!quizOpt.isPresent()) {
            throw new RuntimeException("Quiz not found or access denied");
        }
        return convertToResponse(quizOpt.get());
    }

    public void deleteQuiz(Long quizId, User user) {
        Optional<Quiz> quizOpt = quizRepository.findByIdAndUserId(quizId, user.getId());
        if (!quizOpt.isPresent()) {
            throw new RuntimeException("Quiz not found or access denied");
        }
        quizRepository.delete(quizOpt.get());
    }

    public List<QuizResponse> searchQuizzes(String searchTerm, User user) {
        List<Quiz> quizzes = quizRepository.findByUserIdAndSearchTerm(user.getId(), searchTerm);
        return quizzes.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private QuizResponse convertToResponse(Quiz quiz) {
        QuizResponse response = new QuizResponse();
        response.setId(quiz.getId());
        response.setTitle(quiz.getTitle());
        response.setDescription(quiz.getDescription());
        response.setStudyMaterialId(quiz.getStudyMaterialId());
        response.setStudyMaterialName(
                quiz.getStudyMaterial() != null ? quiz.getStudyMaterial().getOriginalName() : null);
        response.setTotalQuestions(quiz.getTotalQuestions());
        response.setDurationMinutes(quiz.getDurationMinutes());
        response.setCreatedAt(quiz.getCreatedAt());
        response.setUpdatedAt(quiz.getUpdatedAt());

        if (quiz.getQuestions() != null) {
            List<QuizQuestionResponse> questionResponses = quiz.getQuestions().stream()
                    .map(this::convertQuestionToResponse)
                    .collect(Collectors.toList());
            response.setQuestions(questionResponses);
        }

        return response;
    }

    private QuizQuestionResponse convertQuestionToResponse(QuizQuestion question) {
        QuizQuestionResponse response = new QuizQuestionResponse();
        response.setId(question.getId());
        response.setQuestionNumber(question.getQuestionNumber());
        response.setQuestionText(question.getQuestionText());
        response.setQuestionType(question.getQuestionType());
        response.setPoints(question.getPoints());
        response.setExplanation(question.getExplanation());

        if (question.getOptions() != null) {
            List<QuizOptionResponse> optionResponses = question.getOptions().stream()
                    .map(this::convertOptionToResponse)
                    .collect(Collectors.toList());
            response.setOptions(optionResponses);
        }

        return response;
    }

    private QuizOptionResponse convertOptionToResponse(QuizOption option) {
        return new QuizOptionResponse(
                option.getId(),
                option.getOptionNumber(),
                option.getOptionText(),
                option.getIsCorrect());
    }
}
