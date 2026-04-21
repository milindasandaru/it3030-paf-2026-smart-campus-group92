package com.smartcampus.hub.repository;

import com.smartcampus.hub.entity.Resource;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ResourceRepository extends JpaRepository<Resource, UUID>, JpaSpecificationExecutor<Resource> {

	Optional<Resource> findByNameIgnoreCase(String name);
}
