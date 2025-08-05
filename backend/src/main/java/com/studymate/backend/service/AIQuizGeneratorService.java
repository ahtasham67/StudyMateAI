package com.studymate.backend.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

import org.springframework.stereotype.Service;

import com.studymate.backend.model.QuizOption;
import com.studymate.backend.model.QuizQuestion;
import com.studymate.backend.model.QuizQuestion.QuestionType;
import com.studymate.backend.model.StudyMaterial;

@Service
public class AIQuizGeneratorService {

    private final Random random = new Random();

    public List<QuizQuestion> generateQuestions(StudyMaterial studyMaterial,
            Integer numberOfQuestions,
            String difficulty) {
        List<QuizQuestion> questions = new ArrayList<>();

        // For now, we'll generate mock questions based on the study material
        // In a real implementation, this would use AI to analyze the PDF/PPTX content
        String subject = studyMaterial.getSubject() != null ? studyMaterial.getSubject() : "General";
        String filename = studyMaterial.getOriginalName();

        for (int i = 1; i <= numberOfQuestions; i++) {
            QuizQuestion question = generateMockQuestion(i, subject, filename, difficulty);
            questions.add(question);
        }

        return questions;
    }

    private QuizQuestion generateMockQuestion(int questionNumber, String subject,
            String filename, String difficulty) {
        QuizQuestion question = new QuizQuestion();
        question.setQuestionNumber(questionNumber);
        question.setPoints(getDifficultyPoints(difficulty));

        // Generate different types of questions
        QuestionType[] questionTypes = { QuestionType.MULTIPLE_CHOICE, QuestionType.TRUE_FALSE };
        QuestionType selectedType = questionTypes[random.nextInt(questionTypes.length)];
        question.setQuestionType(selectedType);

        switch (selectedType) {
            case MULTIPLE_CHOICE:
                generateMultipleChoiceQuestion(question, subject, filename, difficulty);
                break;
            case TRUE_FALSE:
                generateTrueFalseQuestion(question, subject, filename, difficulty);
                break;
            default:
                generateMultipleChoiceQuestion(question, subject, filename, difficulty);
        }

        return question;
    }

    private void generateMultipleChoiceQuestion(QuizQuestion question, String subject,
            String filename, String difficulty) {
        // Mock multiple choice questions based on subject
        List<String> sampleQuestions = getSampleQuestions(subject, difficulty);
        String questionText = sampleQuestions.get(random.nextInt(sampleQuestions.size()));

        question.setQuestionText(questionText + " (Based on: " + filename + ")");
        question.setExplanation("This question is generated from the study material content.");

        // Generate 4 options with one correct answer
        List<QuizOption> options = new ArrayList<>();
        List<String> sampleOptions = getSampleOptions(subject);

        int correctOption = random.nextInt(4) + 1;

        for (int i = 1; i <= 4; i++) {
            QuizOption option = new QuizOption();
            option.setQuestion(question);
            option.setOptionNumber(i);
            option.setOptionText(sampleOptions.get((i - 1) % sampleOptions.size()));
            option.setIsCorrect(i == correctOption);
            options.add(option);
        }

        question.setOptions(options);
    }

    private void generateTrueFalseQuestion(QuizQuestion question, String subject,
            String filename, String difficulty) {
        List<String> trueFalseQuestions = getTrueFalseQuestions(subject, difficulty);
        String questionText = trueFalseQuestions.get(random.nextInt(trueFalseQuestions.size()));

        question.setQuestionText(questionText + " (Based on: " + filename + ")");
        question.setExplanation("This statement is evaluated based on the study material content.");

        // Generate True/False options
        List<QuizOption> options = new ArrayList<>();
        boolean correctAnswer = random.nextBoolean();

        QuizOption trueOption = new QuizOption();
        trueOption.setQuestion(question);
        trueOption.setOptionNumber(1);
        trueOption.setOptionText("True");
        trueOption.setIsCorrect(correctAnswer);
        options.add(trueOption);

        QuizOption falseOption = new QuizOption();
        falseOption.setQuestion(question);
        falseOption.setOptionNumber(2);
        falseOption.setOptionText("False");
        falseOption.setIsCorrect(!correctAnswer);
        options.add(falseOption);

        question.setOptions(options);
    }

    private int getDifficultyPoints(String difficulty) {
        switch (difficulty.toUpperCase()) {
            case "EASY":
                return 1;
            case "MEDIUM":
                return 2;
            case "HARD":
                return 3;
            default:
                return 2;
        }
    }

    private List<String> getSampleQuestions(String subject, String difficulty) {
        List<String> questions = new ArrayList<>();

        switch (subject.toLowerCase()) {
            case "mathematics":
            case "math":
                questions.addAll(Arrays.asList(
                        "What is the derivative of x²?",
                        "Which theorem relates to right triangles?",
                        "What is the integral of sin(x)?",
                        "How do you solve quadratic equations?"));
                break;
            case "science":
            case "physics":
                questions.addAll(Arrays.asList(
                        "What is Newton's first law of motion?",
                        "How is energy conserved in physical systems?",
                        "What determines the frequency of a wave?",
                        "How do electromagnetic fields interact?"));
                break;
            case "history":
                questions.addAll(Arrays.asList(
                        "What caused the Industrial Revolution?",
                        "When did World War II end?",
                        "Who was the first President of the United States?",
                        "What were the main causes of the Civil War?"));
                break;
            default:
                questions.addAll(Arrays.asList(
                        "What is the main concept discussed in this material?",
                        "Which principle is most important in this topic?",
                        "How does this concept apply in practice?",
                        "What are the key characteristics of this subject?"));
        }

        return questions;
    }

    private List<String> getSampleOptions(String subject) {
        List<String> options = new ArrayList<>();

        switch (subject.toLowerCase()) {
            case "mathematics":
            case "math":
                options.addAll(Arrays.asList("2x", "x", "x²", "1", "0", "∞", "π", "e"));
                break;
            case "science":
            case "physics":
                options.addAll(Arrays.asList(
                        "Force equals mass times acceleration",
                        "Energy cannot be created or destroyed",
                        "Objects at rest stay at rest",
                        "Every action has an equal and opposite reaction"));
                break;
            default:
                options.addAll(Arrays.asList(
                        "Option A - First possibility",
                        "Option B - Second possibility",
                        "Option C - Third possibility",
                        "Option D - Fourth possibility",
                        "None of the above",
                        "All of the above"));
        }

        return options;
    }

    private List<String> getTrueFalseQuestions(String subject, String difficulty) {
        List<String> questions = new ArrayList<>();

        switch (subject.toLowerCase()) {
            case "mathematics":
            case "math":
                questions.addAll(Arrays.asList(
                        "The derivative of a constant is zero",
                        "All triangles have three sides",
                        "Pi is exactly equal to 3.14",
                        "The square root of 16 is 4"));
                break;
            case "science":
            case "physics":
                questions.addAll(Arrays.asList(
                        "Light travels faster than sound",
                        "Water boils at 100°C at sea level",
                        "The Earth is flat",
                        "Gravity affects all objects equally"));
                break;
            default:
                questions.addAll(Arrays.asList(
                        "This concept is fundamental to the subject",
                        "The material covers advanced topics",
                        "Understanding this requires prior knowledge",
                        "This principle applies in most situations"));
        }

        return questions;
    }
}
