package com.govlens.repository;

import com.govlens.model.InsightCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InsightCacheRepository extends JpaRepository<InsightCache, Long> {

    @Query("""
        SELECT ic FROM InsightCache ic
        WHERE ic.insightType = :type
          AND ic.department.id = :deptId
          AND ic.expiresAt > CURRENT_TIMESTAMP
        ORDER BY ic.generatedAt DESC
    """)
    Optional<InsightCache> findLatestValid(@Param("type") String type, @Param("deptId") Long departmentId);

    @Query("""
        SELECT ic FROM InsightCache ic
        WHERE ic.expiresAt > CURRENT_TIMESTAMP
        ORDER BY ic.generatedAt DESC
    """)
    List<InsightCache> findAllValid();
}
