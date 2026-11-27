package kz.iitu.adaptivelearning.entity;
import jakarta.persistence.*;
import java.util.*;
@Entity
@Table(name="academic_profiles")
public class AcademicProfile {
 @Id public Long userId;
 @Column(length=20,nullable=false) public String mode;
 @Column(length=200) public String university;
 @Column(length=160) public String major;
 public Integer studyYear;
 @Column(length=300) public String goal;
 @ElementCollection
 @CollectionTable(name="academic_enrollments",joinColumns=@JoinColumn(name="user_id"))
 @Column(name="course_id",nullable=false)
 public Set<Long> courseIds=new HashSet<>();
}
