import React, { useState } from "react";
import { useSessionStore } from "../../state/sessionStore";

// New nested curriculum structure
const CHAPTERS = [
  {
    id: "light",
    title: "Light: Reflection & Refraction",
    topics: [
      { id: "plane-mirror", title: "1. Plane Mirror Basics", type: "topic" },
      { id: "laws-reflection", title: "2. Laws of Reflection", type: "topic" },
      {
        id: "spherical-mirrors-umbrella",
        title: "3. Spherical Mirrors",
        type: "folder",
        subtopics: [
          { id: "spherical-mirror-basics", title: "a. Spherical Mirror Basics" },
          { id: "spherical-mirror-rules", title: "b. Ray Tracing Rules" },
          { id: "spherical-mirror-image-formation", title: "c. Spherical Mirror Image Formation" },
          { id: "mirror-formula", title: "d. Mirror Formula (Numerical Section)" },
        ],
      },
      {
        id: "refraction-umbrella",
        title: "4. Refraction of Light",
        type: "folder",
        subtopics: [
          { id: "refraction-intro",        title: "a. Introduction to Refraction  ✅" },
          { id: "refraction-snells-law",   title: "b. Laws of Refraction (Snell's Law)  ✅" },
          { id: "refraction-glass-slab",   title: "c. Refraction Through a Glass Slab  ✅" },
          { id: "refraction-lenses",       title: "d. Spherical Lenses  ✅" },
          { id: "refraction-lens-images",  title: "e. Image Formation by Lenses  ✅" },
          { id: "refraction-lens-formula", title: "f. Lens Formula & Power  ✅" },
        ],
      },
    ],
  },
];

export default function Dashboard({ onStartTopic }) {
  const {
    user,
    currentChapterId,
    currentTopicId,
    selectChapter,
    selectTopic,
    progress,
    logout,
  } = useSessionStore();

  const activeChapter = CHAPTERS.find((c) => c.id === currentChapterId) || CHAPTERS[0];
  const [expandedFolders, setExpandedFolders] = useState({ "spherical-mirrors-umbrella": true, "refraction-umbrella": true });

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const renderTopicCard = (topic, isSubtopic = false) => {
    const stat = progress[topic.id];
    const isActive = currentTopicId === topic.id;

    return (
      <div
        key={topic.id}
        style={{
          ...styles.topicCard,
          marginLeft: isSubtopic ? "40px" : "0px",
          border: isActive ? "1px solid #3B82F6" : "1px solid rgba(255, 255, 255, 0.02)",
          boxShadow: isActive ? "0 0 15px rgba(59, 130, 246, 0.3)" : "none",
        }}
      >
        <div style={styles.topicInfo}>
          <h3 style={styles.topicTitle}>{topic.title}</h3>
          {stat ? (
            <p style={styles.topicMeta}>
              Attempts: {stat.attempts} · Best score: {stat.bestScore}%
            </p>
          ) : (
            <p style={styles.topicMeta}>Not attempted yet</p>
          )}
        </div>

        <div style={styles.topicActions}>
          <button
            style={styles.primaryBtn}
            onClick={() => {
              selectTopic(topic.id);
              if (onStartTopic) onStartTopic(topic.id);
            }}
          >
            Start Session
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        {user && (
          <div style={styles.avatarBox}>
            <div style={styles.avatarCircle}>
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div style={styles.userName}>{user.name}</div>
              {user.className && (
                <div style={styles.userMeta}>Class {user.className}</div>
              )}
            </div>
          </div>
        )}
        <div style={styles.headerRight}>
          <div>
            <h1 style={styles.title}>Personalised AI Tutor</h1>
            <p style={styles.subtitle}>Chapters &amp; Topics</p>
          </div>
          <button style={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {/* Chapters list */}
        <aside style={styles.sidebar}>
          <h2 style={styles.sectionTitle}>Chapters</h2>
          {CHAPTERS.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => selectChapter(chapter.id)}
              style={{
                ...styles.chapterBtn,
                backgroundColor:
                  activeChapter && activeChapter.id === chapter.id
                    ? "rgba(59, 130, 246, 0.2)"
                    : "transparent",
                color:
                  activeChapter && activeChapter.id === chapter.id
                    ? "#60A5FA"
                    : "#9CA3AF",
                border:
                  activeChapter && activeChapter.id === chapter.id
                    ? "1px solid #3B82F6"
                    : "1px solid transparent",
              }}
            >
              {chapter.title}
            </button>
          ))}
        </aside>

        {/* Topics & progress */}
        <section style={styles.content}>
          <h2 style={styles.sectionTitle}>Curriculum</h2>
          <div style={styles.topicList}>
            {activeChapter.topics.map((item) => {
              if (item.type === "folder") {
                const isExpanded = expandedFolders[item.id];
                return (
                  <React.Fragment key={item.id}>
                    <div
                      style={styles.folderCard}
                      onClick={() => toggleFolder(item.id)}
                    >
                      <h3 style={styles.folderTitle}>
                        <span style={{ marginRight: "12px", display: "inline-block", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                          ▶
                        </span>
                        {item.title}
                      </h3>
                      <p style={styles.folderMeta}>{item.subtopics.length} Subtopics</p>
                    </div>
                    {isExpanded &&
                      item.subtopics.map((subtopic) =>
                        renderTopicCard(subtopic, true)
                      )}
                  </React.Fragment>
                );
              } else {
                return renderTopicCard(item, false);
              }
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0B0F19",
    color: "#FFFFFF",
    padding: "24px",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
    paddingBottom: "20px",
    borderBottom: "1px solid rgba(255,255,255,0.02)",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#FFFFFF",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "15px",
    color: "#9CA3AF",
    marginTop: 4,
  },
  avatarBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatarCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "9999px",
    background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "20px",
    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
  },
  userName: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#FFFFFF",
  },
  userMeta: {
    fontSize: "13px",
    color: "#9CA3AF",
  },
  logoutBtn: {
    border: "1px solid rgba(255,255,255,0.02)",
    background: "rgba(255,255,255,0.05)",
    color: "#FFFFFF",
    padding: "8px 16px",
    borderRadius: "9999px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  main: {
    display: "flex",
    gap: "40px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sidebar: {
    width: "280px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#FFFFFF",
    marginBottom: "20px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  chapterBtn: {
    width: "100%",
    textAlign: "left",
    padding: "14px 16px",
    borderRadius: "12px",
    marginBottom: "12px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 600,
    transition: "all 0.2s ease-in-out",
  },
  content: {
    flex: 1,
  },
  topicList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  topicCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: "16px",
    padding: "24px 30px",
    transition: "all 0.3s ease",
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#F8FAFC",
    margin: "0 0 8px 0",
  },
  topicMeta: {
    fontSize: "14px",
    color: "#94A3B8",
    margin: 0,
  },
  topicActions: {
    display: "flex",
    gap: "12px",
  },
  primaryBtn: {
    borderRadius: "9999px",
    border: "none",
    background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
    color: "white",
    fontSize: "15px",
    fontWeight: 600,
    padding: "12px 24px",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  folderCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderRadius: "16px",
    padding: "20px 30px",
    cursor: "pointer",
    border: "1px solid rgba(255, 255, 255, 0.02)",
    transition: "all 0.2s ease",
  },
  folderTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#F8FAFC",
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  folderMeta: {
    fontSize: "14px",
    color: "#94A3B8",
    margin: 0,
    fontWeight: 500,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: "4px 12px",
    borderRadius: "9999px",
  },
};

