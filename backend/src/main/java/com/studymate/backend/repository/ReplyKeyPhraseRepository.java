package com.studymate.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.studymate.backend.model.ReplyKeyPhrase;
import com.studymate.backend.model.ThreadReply;

@Repository
public interface ReplyKeyPhraseRepository extends JpaRepository<ReplyKeyPhrase, Long> {

    List<ReplyKeyPhrase> findByReply(ThreadReply reply);

    Optional<ReplyKeyPhrase> findByKeyPhraseAndReply(String keyPhrase, ThreadReply reply);

    @Query("SELECT rkp FROM ReplyKeyPhrase rkp WHERE rkp.reply.thread.id = :threadId")
    List<ReplyKeyPhrase> findByThreadId(@Param("threadId") Long threadId);

    @Query("SELECT rkp.keyPhrase, SUM(rkp.frequency) as totalFreq FROM ReplyKeyPhrase rkp " +
            "WHERE rkp.reply.thread.id = :threadId " +
            "GROUP BY rkp.keyPhrase " +
            "ORDER BY totalFreq DESC")
    List<Object[]> findTopKeyPhrasesByThread(@Param("threadId") Long threadId);

    @Query("SELECT rkp FROM ReplyKeyPhrase rkp WHERE rkp.keyPhrase LIKE %:searchTerm%")
    List<ReplyKeyPhrase> searchByKeyPhrase(@Param("searchTerm") String searchTerm);
}
