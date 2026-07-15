package com.busbooking.controller;

import com.busbooking.entity.Feedback;
import com.busbooking.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackRepository.findAllByOrderByIdDesc());
    }

    @PostMapping
    public ResponseEntity<Feedback> createFeedback(@RequestBody Feedback feedback, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        feedback.setEmail(authentication.getName());
        return ResponseEntity.ok(feedbackRepository.save(feedback));
    }
}
