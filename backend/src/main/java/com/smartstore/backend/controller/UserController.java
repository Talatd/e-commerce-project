package com.smartstore.backend.controller;

import com.smartstore.backend.model.User;
import com.smartstore.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable @org.springframework.lang.NonNull Long id, @RequestBody User userDetails) {
        User user = userRepository.findById(id).orElseThrow();
        user.setFullName(userDetails.getFullName());
        user.setEmail(userDetails.getEmail());
        user.setRole(userDetails.getRole());
        user.setEnabled(userDetails.isEnabled());
        return userRepository.save(user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable @org.springframework.lang.NonNull Long id) {
        userRepository.deleteById(id);
    }

    @PostMapping("/{id}/ban")
    public User banUser(@PathVariable @org.springframework.lang.NonNull Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setEnabled(false);
        return userRepository.save(user);
    }
}
