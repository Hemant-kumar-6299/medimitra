package com.medinear.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class TestController {

    @GetMapping({"/", "/api/test/health"})
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "MediNear Backend - Emergency Medicine Finder");
        response.put("timestamp", LocalDateTime.now());
        response.put("message", "MediNear backend is running");
        return ResponseEntity.ok(response);
    }
}
