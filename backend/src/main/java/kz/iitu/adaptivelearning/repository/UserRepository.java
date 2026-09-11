package kz.iitu.adaptivelearning.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import kz.iitu.adaptivelearning.entity.Role;
import kz.iitu.adaptivelearning.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsernameIgnoreCase(String username);

    boolean existsByEmail(String email);

    boolean existsByUsernameIgnoreCase(String username);

    long countByRole(Role role);

    List<User> findAllByRoleOrderByCreatedAtDesc(Role role);

    List<User> findAllByOrderByCreatedAtDesc();
}