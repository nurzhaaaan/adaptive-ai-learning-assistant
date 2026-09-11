import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";

import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

export default function Diagnostic() {
  const { courseId } = useParams();

  const [diagnostic, setDiagnostic] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDiagnostic();
  }, [courseId]);

  async function loadDiagnostic() {
    try {
      setLoading(true);
      setError("");

      const data = await api(
        `/diagnostic/course/${courseId}`
      );

      setDiagnostic(data);
      setAnswers({});
      setResult(null);
    } catch (err) {
      setError(
        err?.message ||
          "Diagnostic test could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(questionId, option) {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: option,
    }));
  }

  async function submit(event) {
    event.preventDefault();

    if (!diagnostic) return;

    if (
      Object.keys(answers).length <
      diagnostic.questions.length
    ) {
      setError("Please answer all questions.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const data = await api(
        `/diagnostic/course/${courseId}/submit`,
        {
          method: "POST",
          body: JSON.stringify({
            answers,
          }),
        }
      );

      setResult(data);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      setError(
        err?.message ||
          "Diagnostic result could not be calculated."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const answeredCount =
    Object.keys(answers).length;

  const completion =
    diagnostic?.questions?.length > 0
      ? Math.round(
          (answeredCount /
            diagnostic.questions.length) *
            100
        )
      : 0;

  if (loading) {
    return (
      <div className="loader">
        Preparing adaptive diagnostic test...
      </div>
    );
  }

  if (error && !diagnostic) {
    return (
      <div className="result-card">
        <AlertTriangle size={48} />

        <span className="eyebrow">
          DIAGNOSTIC ERROR
        </span>

        <h2>
          Diagnostic could not be loaded
        </h2>

        <p>{error}</p>

        <button
          className="primary"
          onClick={loadDiagnostic}
        >
          Try again
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <DiagnosticResult
        result={result}
        courseId={courseId}
        onRetry={loadDiagnostic}
      />
    );
  }

  return (
    <form onSubmit={submit}>
      <header className="page-head">
        <div>
          <span className="eyebrow">
            AI ADAPTIVE ASSESSMENT
          </span>

          <h1>
            {diagnostic.courseTitle} Diagnostic Test
          </h1>

          <p>
            Your answers will be analyzed to determine
            your current knowledge level, weak topics,
            and personalized learning difficulty.
          </p>
        </div>

        <div className="diagnostic-progress-box">
          <Brain size={24} />

          <div>
            <strong>
              {answeredCount} /{" "}
              {diagnostic.questions.length}
            </strong>

            <span>answered</span>
          </div>
        </div>
      </header>

      <div className="diagnostic-overview">
        <div>
          <Target size={20} />
          <span>Knowledge assessment</span>
        </div>

        <div>
          <Brain size={20} />
          <span>Adaptive analysis</span>
        </div>

        <div>
          <Sparkles size={20} />
          <span>Personalized path</span>
        </div>
      </div>

      <div className="diagnostic-progress">
        <div className="diagnostic-progress-header">
          <span>Test completion</span>
          <strong>{completion}%</strong>
        </div>

        <div className="diagnostic-progress-track">
          <div
            className="diagnostic-progress-fill"
            style={{
              width: `${completion}%`,
            }}
          />
        </div>
      </div>

      {error && (
        <div className="diagnostic-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="quiz-list">
        {diagnostic.questions.map(
          (question, index) => (
            <section
              className="question-card"
              key={question.questionId}
            >
              <div className="diagnostic-question-top">
                <span className="eyebrow">
                  {question.topicTitle}
                </span>

                <span className="question-counter">
                  Question {index + 1}
                </span>
              </div>

              <h3>
                {index + 1}. {question.text}
              </h3>

              <div className="options">
                {Object.entries(
                  question.options
                ).map(([key, value]) => {
                  const selected =
                    answers[
                      question.questionId
                    ] === key;

                  return (
                    <label
                      key={key}
                      className={
                        selected
                          ? "option selected"
                          : "option"
                      }
                    >
                      <input
                        type="radio"
                        name={`diagnostic-${question.questionId}`}
                        checked={selected}
                        onChange={() =>
                          selectAnswer(
                            question.questionId,
                            key
                          )
                        }
                      />

                      <span className="letter">
                        {key}
                      </span>

                      <span>{value}</span>
                    </label>
                  );
                })}
              </div>
            </section>
          )
        )}
      </div>

      <button
        className="primary quiz-submit"
        disabled={
          answeredCount <
            diagnostic.questions.length ||
          submitting
        }
      >
        {submitting
          ? "AI is analyzing your answers..."
          : "Finish Diagnostic & Analyze"}
      </button>
    </form>
  );
}

function DiagnosticResult({
  result,
  courseId,
  onRetry,
}) {
  const score = result.overallScore ?? 0;

  const topics = useMemo(() => {
    return [...(result.topicResults || [])].sort(
      (a, b) =>
        a.masteryScore - b.masteryScore
    );
  }, [result.topicResults]);

  const weakTopics = topics.filter(
    (topic) => topic.masteryScore < 50
  );

  const practiceTopics = topics.filter(
    (topic) =>
      topic.masteryScore >= 50 &&
      topic.masteryScore < 80
  );

  const masteredTopics = topics.filter(
    (topic) => topic.masteryScore >= 80
  );

  const levelInfo = getLevelInfo(
    result.calculatedLevel
  );

  return (
    <div className="adaptive-result-page">
      <section className="adaptive-result-hero">
        <div className="adaptive-result-icon">
          <Brain size={38} />
        </div>

        <span className="eyebrow">
          AI ADAPTIVE ANALYSIS COMPLETE
        </span>

        <h1>{score}%</h1>

        <h2>{levelInfo.title}</h2>

        <p>{levelInfo.description}</p>

        <div className="adaptive-level-badge">
          <Sparkles size={18} />

          <span>Learning Level:</span>

          <strong>
            {result.calculatedLevel}
          </strong>
        </div>
      </section>

      <section className="adaptive-summary-grid">
        <ResultMetric
          icon={<Target size={22} />}
          title="Diagnostic Score"
          value={`${score}%`}
          description="Overall knowledge assessment"
        />

        <ResultMetric
          icon={<Brain size={22} />}
          title="Current Level"
          value={result.calculatedLevel}
          description="Calculated automatically"
        />

        <ResultMetric
          icon={<AlertTriangle size={22} />}
          title="Weak Topics"
          value={weakTopics.length}
          description="Require additional review"
        />

        <ResultMetric
          icon={<TrendingUp size={22} />}
          title="Strong Topics"
          value={masteredTopics.length}
          description="Ready for advanced learning"
        />
      </section>

      <section className="adaptive-analysis-card">
        <div className="adaptive-section-heading">
          <div>
            <span className="eyebrow">
              TOPIC ANALYSIS
            </span>

            <h2>
              Your personalized knowledge map
            </h2>
          </div>

          <Brain size={28} />
        </div>

        <div className="adaptive-topic-list">
          {topics.map((topic) => {
            const state = getTopicState(
              topic.masteryScore
            );

            return (
              <div
                className="adaptive-topic-row"
                key={topic.topicId}
              >
                <div className="adaptive-topic-info">
                  <div
                    className={`adaptive-topic-icon ${state.className}`}
                  >
                    {state.icon}
                  </div>

                  <div>
                    <strong>
                      {topic.topicTitle}
                    </strong>

                    <span>
                      {state.label}
                    </span>
                  </div>
                </div>

                <div className="adaptive-topic-score">
                  <div>
                    <span>Mastery</span>

                    <strong>
                      {topic.masteryScore}%
                    </strong>
                  </div>

                  <div className="adaptive-score-track">
                    <div
                      className={`adaptive-score-fill ${state.className}`}
                      style={{
                        width: `${topic.masteryScore}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="adaptive-recommendation-card">
        <div className="adaptive-section-heading">
          <div>
            <span className="eyebrow">
              PERSONALIZED LEARNING PATH
            </span>

            <h2>
              AI Adaptive Recommendation
            </h2>
          </div>

          <Sparkles size={28} />
        </div>

        {weakTopics.length > 0 && (
          <RecommendationBlock
            type="review"
            title="Start with fundamentals"
            icon={
              <AlertTriangle size={22} />
            }
          >
            Adaptive AI detected that{" "}
            <strong>
              {weakTopics
                .map(
                  (topic) =>
                    topic.topicTitle
                )
                .join(", ")}
            </strong>{" "}
            require additional review. The system
            has assigned EASY difficulty for these
            topics.
          </RecommendationBlock>
        )}

        {practiceTopics.length > 0 && (
          <RecommendationBlock
            type="practice"
            title="Continue practicing"
            icon={<BookOpen size={22} />}
          >
            Continue practicing{" "}
            <strong>
              {practiceTopics
                .map(
                  (topic) =>
                    topic.topicTitle
                )
                .join(", ")}
            </strong>{" "}
            with MEDIUM-difficulty exercises.
          </RecommendationBlock>
        )}

        {masteredTopics.length > 0 && (
          <RecommendationBlock
            type="advance"
            title="Ready to advance"
            icon={
              <TrendingUp size={22} />
            }
          >
            You demonstrated strong knowledge in{" "}
            <strong>
              {masteredTopics
                .map(
                  (topic) =>
                    topic.topicTitle
                )
                .join(", ")}
            </strong>
            . Adaptive AI has assigned HARD
            difficulty for future quizzes.
          </RecommendationBlock>
        )}

        <div className="adaptive-engine-explanation">
          <Brain size={24} />

          <div>
            <strong>
              How does the Adaptive Engine work?
            </strong>

            <p>
              Below 50% → EASY + Review. 50–79% →
              MEDIUM + Practice. 80% and above →
              HARD + Advance.
            </p>
          </div>
        </div>

        {result.message && (
          <div className="adaptive-backend-message">
            <CheckCircle2 size={20} />
            <span>{result.message}</span>
          </div>
        )}
      </section>

      <section className="adaptive-next-step">
        <div>
          <span className="eyebrow">
            NEXT STEP
          </span>

          <h2>
            Your personalized path is ready
          </h2>

          <p>
            Topic mastery, status and difficulty
            have been updated automatically.
          </p>
        </div>

        <div className="adaptive-actions">
          <button
            type="button"
            className="secondary inline"
            onClick={onRetry}
          >
            <RotateCcw size={18} />
            Retake
          </button>

          <Link
            className="primary inline"
            to={`/courses/${courseId}`}
          >
            Open Personalized Course
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function ResultMetric({
  icon,
  title,
  value,
  description,
}) {
  return (
    <article className="adaptive-metric-card">
      <div className="adaptive-metric-icon">
        {icon}
      </div>

      <span>{title}</span>

      <strong>{value}</strong>

      <small>{description}</small>
    </article>
  );
}

function RecommendationBlock({
  icon,
  title,
  type,
  children,
}) {
  return (
    <div
      className={`adaptive-recommendation ${type}`}
    >
      <div className="adaptive-recommendation-icon">
        {icon}
      </div>

      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}

function getLevelInfo(level) {
  if (level === "ADVANCED") {
    return {
      title: "Advanced Learner",
      description:
        "Excellent result. Adaptive AI will prioritize challenging activities and advanced topics.",
    };
  }

  if (level === "INTERMEDIATE") {
    return {
      title: "Intermediate Learner",
      description:
        "You have a solid foundation. Adaptive AI will focus on targeted practice and weaker concepts.",
    };
  }

  return {
    title: "Beginner Learner",
    description:
      "Adaptive AI detected areas that should be strengthened first. Your path will begin with foundational material.",
  };
}

function getTopicState(score) {
  if (score >= 80) {
    return {
      label: "Mastered · HARD",
      className: "mastered",
      icon: <CheckCircle2 size={18} />,
    };
  }

  if (score >= 50) {
    return {
      label: "In progress · MEDIUM",
      className: "practice",
      icon: <BookOpen size={18} />,
    };
  }

  return {
    label: "Review required · EASY",
    className: "review",
    icon: <AlertTriangle size={18} />,
  };
}