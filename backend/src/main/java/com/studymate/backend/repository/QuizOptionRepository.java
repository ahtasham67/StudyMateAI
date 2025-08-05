package com.studymate.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.studymate.backend.model.QuizOption;

@Repository
public interface QuizOptionRepository extends JpaRepository<QuizOption, Long> {

    List<QuizOption> findByQuestionIdOrderByOptionNumber(Long questionId);

    Long countByQuestionId(Long questionId);

    void deleteByQuestionId(Long questionId);
}
