package kz.iitu.adaptivelearning.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kz.iitu.adaptivelearning.dto.AdminDtos.AdminSummary;
import kz.iitu.adaptivelearning.dto.AdminDtos.StudentDetails;
import kz.iitu.adaptivelearning.dto.AdminDtos.UserView;
import kz.iitu.adaptivelearning.service.AdminService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService admin;

    public AdminController(
            AdminService admin
    ) {
        this.admin = admin;
    }

    @GetMapping("/summary")
    public AdminSummary summary() {

        return admin.getSummary();
    }

    @GetMapping("/students")
    public List<UserView> students() {

        return admin.getStudents();
    }

    @GetMapping("/students/{id}")
    public StudentDetails student(
            @PathVariable Long id
    ) {

        return admin.getStudentDetails(id);
    }

    @GetMapping("/users")
    public List<UserView> users() {

        return admin.getAllUsers();
    }
}