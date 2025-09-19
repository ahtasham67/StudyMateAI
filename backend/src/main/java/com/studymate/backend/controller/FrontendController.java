package com.studymate.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller to handle React frontend routing
 * Serves index.html for all non-API routes
 */
@Controller
public class FrontendController {

    /**
     * Forward all non-API routes to React frontend
     * This handles React Router client-side routing
     */
    @GetMapping(value = {"/{path:[^\\.]*}", "/{path:^(?!api).*}/{subpath:[^\\.]*}"})
    public String forward() {
        return "forward:/index.html";
    }
}