import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "../api";

import {
  Bot,
  Send,
  Sparkles,
  Brain,
  Target,
  Gauge,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

export default function AiTutor() {
  const [topics, setTopics] = useState([]);
  const [topicId, setTopicId] = useState("");

  const [message, setMessage] = useState(
    "What should I study next?"
  );

  const [chat, setChat] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTopics();
  }, []);

  async function loadTopics() {
    try {
      setLoading(true);
      setError("");

      const courses =
        await api("/courses");

      const allTopics = [];

      for (const course of courses) {
        const details =
          await api(`/courses/${course.id}`);

        details.topics.forEach((topic) => {
          allTopics.push({
            ...topic,
            courseTitle: course.title,
          });
        });
      }

      setTopics(allTopics);

      if (allTopics.length > 0) {
        setTopicId(
          String(allTopics[0].id)
        );
      }
    } catch (err) {
      setError(
        err?.message ||
          "Learning context could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedTopic = useMemo(() => {
    return topics.find(
      (topic) =>
        String(topic.id) ===
        String(topicId)
    );
  }, [topics, topicId]);

  const weakTopics = useMemo(() => {
    return topics
      .filter(
        (topic) =>
          Number(topic.masteryScore || 0) < 50
      )
      .sort(
        (a, b) =>
          Number(a.masteryScore || 0) -
          Number(b.masteryScore || 0)
      );
  }, [topics]);

  const selectedLevel =
    getLevel(
      selectedTopic?.masteryScore || 0
    );

  const selectedDifficulty =
    selectedTopic?.difficulty ||
    getDifficulty(
      selectedTopic?.masteryScore || 0
    );

  async function send(event) {
    event.preventDefault();

    const text = message.trim();

    if (!text || busy) return;

    setChat((current) => [
      ...current,
      {
        role: "user",
        text,
      },
    ]);

    setMessage("");
    setBusy(true);
    setError("");

    try {
      const response =
        await api("/ai/chat", {
          method: "POST",

          body: JSON.stringify({
            message: text,

            topicId: topicId
              ? Number(topicId)
              : null,
          }),
        });

      setChat((current) => [
        ...current,
        {
          role: "ai",
          text: response.reply,

          meta: `${response.studentLevel} · ${formatSource(
            response.source
          )}`,

          context:
            response.contextSummary,
        },
      ]);
    } catch (err) {
      setChat((current) => [
        ...current,
        {
          role: "ai",
          text:
            err?.message ||
            "AI Tutor could not respond.",
          error: true,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function quickAsk(text) {
    setMessage(text);
  }

  if (loading) {
    return (
      <div className="loader">
        Loading AI learning context...
      </div>
    );
  }

  return (
    <>
      <header className="page-head">
        <div>
          <span className="eyebrow">
            ADAPTIVE AI TUTOR
          </span>

          <h1>
            Personalized Learning Assistant
          </h1>

          <p>
            AI Tutor adapts explanations to your
            mastery score, learning level,
            difficulty and weak topics.
          </p>
        </div>
      </header>

      {error && (
        <div className="diagnostic-error">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      <div className="ai-layout">
        <section className="card ai-chat">
          <div className="chat-scroll">
            {chat.length === 0 && (
              <div className="ai-welcome">
                <div className="bot-orb">
                  <Bot size={30} />
                </div>

                <span className="eyebrow">
                  PERSONALIZED AI
                </span>

                <h2>
                  How can I help you learn?
                </h2>

                <p>
                  Select a topic. AI Tutor will
                  automatically use your diagnostic
                  and quiz progress.
                </p>

                <div className="ai-quick-actions">
                  <button
                    type="button"
                    onClick={() =>
                      quickAsk(
                        "Explain this topic in simple language with one example."
                      )
                    }
                  >
                    Explain simply
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      quickAsk(
                        "What should I study next based on my current progress?"
                      )
                    }
                  >
                    What next?
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      quickAsk(
                        "Give me a practice task suitable for my current level."
                      )
                    }
                  >
                    Practice task
                  </button>
                </div>
              </div>
            )}

            {chat.map((item, index) => (
              <div
                key={index}
                className={`bubble ${item.role}`}
              >
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {item.text}
                </div>

                {item.meta && (
                  <small>
                    {item.meta}
                  </small>
                )}
              </div>
            ))}

            {busy && (
              <div className="bubble ai">
                <div className="ai-thinking">
                  <Sparkles size={17} />
                  AI is analyzing your learning
                  context...
                </div>
              </div>
            )}
          </div>

          <form
            className="chat-form"
            onSubmit={send}
          >
            <textarea
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value
                )
              }
              placeholder="Ask about the selected topic..."
            />

            <button
              className="primary inline"
              disabled={
                busy ||
                !message.trim()
              }
            >
              <Send size={18} />

              {busy
                ? "Thinking..."
                : "Send"}
            </button>
          </form>
        </section>

        <aside className="card tutor-context">
          <div className="ai-context-header">
            <Sparkles size={24} />

            <div>
              <span className="eyebrow">
                AI LEARNING PROFILE
              </span>

              <h2>
                Learning Context
              </h2>
            </div>
          </div>

          <label className="ai-topic-select">
            Current topic

            <select
              value={topicId}
              onChange={(event) =>
                setTopicId(
                  event.target.value
                )
              }
            >
              {topics.map((topic) => (
                <option
                  key={topic.id}
                  value={topic.id}
                >
                  {topic.courseTitle} —{" "}
                  {topic.title}
                </option>
              ))}
            </select>
          </label>

          {selectedTopic && (
            <>
              <div className="ai-profile-grid">
                <ProfileItem
                  icon={<Brain size={18} />}
                  label="Current level"
                  value={selectedLevel}
                />

                <ProfileItem
                  icon={<Target size={18} />}
                  label="Mastery"
                  value={`${selectedTopic.masteryScore || 0}%`}
                />

                <ProfileItem
                  icon={<Gauge size={18} />}
                  label="Difficulty"
                  value={
                    selectedDifficulty
                  }
                />

                <ProfileItem
                  icon={
                    <BookOpen size={18} />
                  }
                  label="Status"
                  value={
                    formatStatus(
                      selectedTopic.status
                    )
                  }
                />
              </div>

              <div className="ai-context-topic">
                <span>
                  Selected topic
                </span>

                <strong>
                  {selectedTopic.title}
                </strong>

                <small>
                  {selectedTopic.courseTitle}
                </small>
              </div>
            </>
          )}

          <div className="ai-weak-section">
            <div className="ai-weak-heading">
              <AlertTriangle size={18} />
              <strong>
                Weak topics
              </strong>
            </div>

            {weakTopics.length === 0 ? (
              <p className="ai-no-weak">
                No topics below 50% mastery.
              </p>
            ) : (
              <div className="ai-weak-list">
                {weakTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="ai-weak-item"
                  >
                    <span>
                      {topic.title}
                    </span>

                    <strong>
                      {topic.masteryScore || 0}%
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ai-adaptive-note">
            <Sparkles size={18} />

            <p>
              AI automatically changes explanation
              difficulty according to your current
              mastery and diagnostic results.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function ProfileItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="ai-profile-item">
      <div className="ai-profile-icon">
        {icon}
      </div>

      <span>{label}</span>

      <strong>{value}</strong>
    </div>
  );
}

function getLevel(score) {
  const value = Number(score || 0);

  if (value < 50) {
    return "Beginner";
  }

  if (value < 80) {
    return "Intermediate";
  }

  return "Advanced";
}

function getDifficulty(score) {
  const value = Number(score || 0);

  if (value < 50) {
    return "EASY";
  }

  if (value < 80) {
    return "MEDIUM";
  }

  return "HARD";
}

function formatStatus(status) {
  if (!status) {
    return "Not started";
  }

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

function formatSource(source) {
  if (source === "external-llm") {
    return "External AI";
  }

  if (
    source ===
    "built-in-adaptive-tutor"
  ) {
    return "Adaptive Engine";
  }

  return source || "AI Tutor";
}