package com.smartcampus.hub.repository;

import com.smartcampus.hub.entity.Resource;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<Resource, UUID> {

	Optional<Resource> findByNameIgnoreCase(String name);
}
