import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import { api } from "../api";
import ProgressBar from "../components/ProgressBar";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      const data = await api("/courses");

      console.log("Courses from backend:", data);

      if (Array.isArray(data)) {
        setCourses(data);
      } else {
        setCourses([]);
        setError("Backend returned an unexpected response.");
      }
    } catch (err) {
      console.error("Courses loading error:", err);

      setError(
        err?.message ||
          "Courses could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="loader">
        Loading your courses...
      </div>
    );
  }

  return (
    <>
      <header className="page-head">
        <div>
          <span className="eyebrow">
            COURSES
          </span>

          <h1>My Learning Library</h1>

          <p>
            Open a course, study a topic, then take
            the adaptive quiz.
          </p>
        </div>
      </header>

      {error && (
        <div
          style={{
            background: "#fff4f4",
            border: "1px solid #ffd6d6",
            borderRadius: "16px",
            padding: "18px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#b42318",
          }}
        >
          <AlertTriangle size={22} />

          <div style={{ flex: 1 }}>
            <strong>
              Courses could not be loaded
            </strong>

            <div style={{ marginTop: "4px" }}>
              {error}
            </div>
          </div>

          <button
            type="button"
            className="secondary inline"
            onClick={loadCourses}
          >
            <RefreshCw size={17} />
            Retry
          </button>
        </div>
      )}

      {!error && courses.length === 0 && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e1e9f4",
            borderRadius: "18px",
            padding: "30px",
            textAlign: "center",
          }}
        >
          <BookOpen
            size={38}
            style={{
              marginBottom: "12px",
            }}
          />

          <h2>No courses found</h2>

          <p>
            There are currently no courses
            available for this student.
          </p>
        </div>
      )}

      <div className="course-grid">
        {courses.map((course) => (
          <Link
            className="course-card"
            to={`/courses/${course.id}`}
            key={course.id}
          >
            <div className="course-cover">
              <BookOpen size={30} />
              <span>{course.code}</span>
            </div>

            <h2>{course.title}</h2>

            <p>{course.description}</p>

            <div className="course-meta">
              <span>
                {course.topicCount} topics
              </span>

              <strong>
                {course.progressPercent}%
              </strong>
            </div>

            <ProgressBar
              value={course.progressPercent}
            />

            <div className="card-link">
              Continue learning
              <ArrowRight size={17} />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}