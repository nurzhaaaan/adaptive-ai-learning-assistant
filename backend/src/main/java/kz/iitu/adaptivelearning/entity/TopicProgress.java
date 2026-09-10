package kz.iitu.adaptivelearning.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "topic_progress", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "topic_id"}))
public class TopicProgress {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id")
    private User user;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "topic_id")
    private Topic topic;
    @Column(nullable = false) private Integer masteryScore = 0;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Difficulty currentDifficulty = Difficulty.EASY;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private ProgressStatus status = ProgressStatus.NOT_STARTED;
    @Column(nullable = false) private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Topic getTopic() { return topic; }
    public void setTopic(Topic topic) { this.topic = topic; }
    public Integer getMasteryScore() { return masteryScore; }
    public void setMasteryScore(Integer masteryScore) { this.masteryScore = masteryScore; }
    public Difficulty getCurrentDifficulty() { return currentDifficulty; }
    public void setCurrentDifficulty(Difficulty currentDifficulty) { this.currentDifficulty = currentDifficulty; }
    public ProgressStatus getStatus() { return status; }
    public void setStatus(ProgressStatus status) { this.status = status; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
