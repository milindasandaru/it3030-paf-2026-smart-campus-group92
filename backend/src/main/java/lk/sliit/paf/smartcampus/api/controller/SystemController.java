package lk.sliit.paf.smartcampus.api.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SystemController {

	@GetMapping("/health")
	public Map<String, String> health() {
		return Map.of(
			"service", "smart-campus-api",
			"status", "UP"
		);
	}

	@GetMapping("/info")
	public Map<String, String> info() {
		return Map.of(
			"name", "Smart Campus API",
			"version", "0.1.0",
			"message", "Project baseline is ready for feature development."
		);
	}
}