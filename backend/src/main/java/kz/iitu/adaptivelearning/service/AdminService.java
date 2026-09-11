package kz.iitu.adaptivelearning.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kz.iitu.adaptivelearning.dto.AdminDtos.AdminSummary;
import kz.iitu.adaptivelearning.dto.AdminDtos.UserView;
import kz.iitu.adaptivelearning.entity.Role;
import kz.iitu.adaptivelearning.entity.User;
import kz.iitu.adaptivelearning.repository.CourseRepository;
import kz.iitu.adaptivelearning.repository.UserRepository;

@Service
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository users;
    private final CourseRepository courses;

    public AdminService(
            UserRepository users,
            CourseRepository courses
    ) {
        this.users = users;
        this.courses = courses;
    }

    public AdminSummary getSummary() {

        return new AdminSummary(
                users.count(),
                users.countByRole(Role.STUDENT),
                users.countByRole(Role.ADMIN),
                courses.count()
        );
    }

    public List<UserView> getStudents() {

        return users
                .findAllByRoleOrderByCreatedAtDesc(
                        Role.STUDENT
                )
                .stream()
                .map(this::toView)
                .toList();
    }

    public List<UserView> getAllUsers() {

        return users
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toView)
                .toList();
    }

    private UserView toView(User user) {

        return new UserView(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt()
        );
    }
}