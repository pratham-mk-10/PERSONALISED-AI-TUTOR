import React, { useEffect, useState } from "react";
import { useSessionStore, TITLE_TO_TOPIC_ID } from "../../state/sessionStore";
import { getStudentMemory, getTopicsProgress } from "../../services/api";

// Inverse of TITLE_TO_TOPIC_ID, so renderTopicCard can look up a topic's
// backend status by its own dashboard `id` (canonical backend titles carry
// no "1." / "a." numbering prefix, so they can't be matched directly).
const TOPIC_ID_TO_TITLE = Object.fromEntries(
  Object.entries(TITLE_TO_TOPIC_ID).map(([title, id]) => [id, title])
);

const SEVERITY_COLORS = {
  red: "#EF4444",
  yellow: "#F59E0B",
  green: "#22C55E",
};

const SEVERITY_LABELS = {
  red: "Struggling — needs work",
  yellow: "Almost there",
  green: "Mastered",
};

// New nested curriculum structure
const CHAPTERS = [
  {
    id: "light",
    title: "Light: Reflection & Refraction",
    topics: [
      { id: "intro-light", title: "0. What is Light?", type: "topic" },
      { id: "plane-mirror", title: "1. Plane Mirror Basics", type: "topic" },
      { id: "laws-reflection", title: "2. Laws of Reflection", type: "topic" },
      {
        id: "spherical-mirrors-umbrella",
        title: "3. Spherical Mirrors",
        type: "folder",
        subtopics: [
          { id: "real-virtual-images", title: "a. Real vs Virtual Images" },
          { id: "spherical-mirror-basics", title: "b. Spherical Mirror Basics" },
          { id: "spherical-mirror-rules", title: "c. Ray Tracing Rules" },
          { id: "spherical-mirror-image-formation", title: "d. Spherical Mirror Image Formation" },
          { id: "spherical-mirror-uses", title: "e. Uses of Concave and Convex Mirrors" },
          { id: "mirror-formula", title: "f. Mirror Formula" },
        ],
      },
      {
        id: "numericals-umbrella",
        title: "5. Numerical Problems",
        type: "folder",
        subtopics: [
          { id: "numerical-find-v", title: "a. Find v" },
          { id: "numerical-find-m", title: "b. Find Height / Magnification" },
          { id: "numerical-find-f", title: "c. Find f" },
          { id: "numerical-find-u", title: "d. Find u" },
          { id: "numerical-mirror-id", title: "e. Mirror Identification" },
          { id: "numerical-combined", title: "f. Combined Problems" },
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
    setRetestBias,
    progress,
    logout,
  } = useSessionStore();

  const activeChapter = CHAPTERS.find((c) => c.id === currentChapterId) || CHAPTERS[0];
  const [expandedFolders, setExpandedFolders] = useState({
    "spherical-mirrors-umbrella": true,
    "refraction-umbrella": true,
    "numericals-umbrella": true,
  });
  const [memoryData, setMemoryData] = useState(null);
  const [topicsProgress, setTopicsProgress] = useState({});
  const [weakTopicsExpanded, setWeakTopicsExpanded] = useState(false);

  useEffect(() => {
    const studentId = user?.student_id || user?.name || "guest-student";

    let cancelled = false;
    getStudentMemory(studentId).then((data) => {
      if (!cancelled && data?.has_memory) setMemoryData(data);
    });
    getTopicsProgress(studentId).then((data) => {
      if (!cancelled && data?.progress) setTopicsProgress(data.progress);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.name]);

  // Already sorted most-struggled -> least-struggled by the backend.
  const weakTopics = memoryData?.topics || [];
  // {topic_title: "green"|"yellow"|"red"} for every topic attempted so far,
  // completed or not — powers the colored dot on every curriculum card.
  const statusMap = memoryData?.status_map || {};

  const handleRetest = (topicEntry, topicId) => {
    setRetestBias({
      topicId,
      // Every misconception the student tripped on for this topic (up to 3,
      // most-frequent first), so the regenerated quiz can be weighted across
      // all of them instead of just the single most common one.
      tagBreakdown: topicEntry.tag_breakdown || [],
      severity: topicEntry.severity,
    });
    selectTopic(topicId);
    if (onStartTopic) onStartTopic(topicId);
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  let nextTopicId = null;
  for (const item of activeChapter.topics) {
    if (item.type === "folder") {
      for (const sub of item.subtopics) {
        if (topicsProgress[sub.id] !== "completed" && !nextTopicId) {
          nextTopicId = sub.id;
        }
      }
    } else {
      if (topicsProgress[item.id] !== "completed" && !nextTopicId) {
        nextTopicId = item.id;
      }
    }
  }

  const renderTopicCard = (topic, isSubtopic = false) => {
    const stat = progress[topic.id];
    const isActive = currentTopicId === topic.id;
    const isNext = topic.id === nextTopicId;
    const canonicalTitle = TOPIC_ID_TO_TITLE[topic.id];
    const status = canonicalTitle ? statusMap[canonicalTitle] : undefined;
    const dbStatus = topicsProgress[topic.id];

    return (
      <div
        key={topic.id}
        style={{
          ...styles.topicCard,
          marginLeft: isSubtopic ? "40px" : "0px",
          border: isNext ? "1px solid #10B981" : (isActive ? "1px solid #3B82F6" : "1px solid rgba(255, 255, 255, 0.02)"),
          boxShadow: isNext ? "0 0 20px rgba(16, 185, 129, 0.3)" : (isActive ? "0 0 15px rgba(59, 130, 246, 0.3)" : "none"),
        }}
      >
        <div style={styles.topicInfo}>
          <h3 style={styles.topicTitle}>
            {status && (
              <span
                style={{ ...styles.severityDot, backgroundColor: SEVERITY_COLORS[status] }}
                title={SEVERITY_LABELS[status]}
              />
            )}
            {topic.title}
            {isNext && <span style={styles.nextBadge}>Up Next</span>}
            {dbStatus === "completed" && <span style={styles.completedBadge}>Completed</span>}
            {dbStatus === "attempted" && <span style={styles.attemptedBadge}>Attempted</span>}
          </h3>
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

      {weakTopics.length > 0 && (
        <div style={styles.memorySummaryWrap}>
          <button
            style={styles.memorySummaryBtn}
            onClick={() => setWeakTopicsExpanded((v) => !v)}
          >
            <span style={styles.memorySummaryText}>
              You tripped in {weakTopics.length} {weakTopics.length === 1 ? "topic" : "topics"} last
              time — would you like to retry {weakTopics.length === 1 ? "it" : "them"}?
            </span>
            <span
              style={{
                ...styles.memoryChevron,
                transform: weakTopicsExpanded ? "rotate(90deg)" : "rotate(0deg)",
              }}
            >
              ▶
            </span>
          </button>

          {weakTopicsExpanded && (
            <div style={styles.memoryBannerList}>
              {weakTopics.map((topicEntry) => {
                const topicId = TITLE_TO_TOPIC_ID[topicEntry.topic_title];
                if (!topicId) return null;
                return (
                  <div key={topicEntry.topic_title} style={styles.memoryBanner}>
                    <span
                      style={{
                        ...styles.severityDot,
                        backgroundColor: SEVERITY_COLORS[topicEntry.severity] || SEVERITY_COLORS.yellow,
                      }}
                      title={SEVERITY_LABELS[topicEntry.severity]}
                    />
                    <p style={styles.memoryText}>{topicEntry.message}</p>
                    <button
                      style={styles.memoryBtn}
                      onClick={() => handleRetest(topicEntry, topicId)}
                    >
                      Retest now
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
  memorySummaryWrap: {
    maxWidth: "1200px",
    margin: "0 auto 32px auto",
  },
  memorySummaryBtn: {
    display: "flex",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    padding: "18px 24px",
    borderRadius: "16px",
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    border: "1px solid rgba(59, 130, 246, 0.35)",
    cursor: "pointer",
    textAlign: "left",
  },
  memorySummaryText: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#DBEAFE",
    lineHeight: 1.4,
  },
  memoryChevron: {
    flexShrink: 0,
    color: "#60A5FA",
    fontSize: "14px",
    transition: "transform 0.2s",
  },
  memoryBannerList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "12px",
  },
  memoryBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    padding: "18px 24px",
    borderRadius: "16px",
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    border: "1px solid rgba(59, 130, 246, 0.25)",
  },
  severityDot: {
    display: "inline-block",
    flexShrink: 0,
    width: "10px",
    height: "10px",
    borderRadius: "9999px",
    marginRight: "10px",
    verticalAlign: "middle",
  },
  memoryText: {
    flex: 1,
    fontSize: "15px",
    color: "#DBEAFE",
    margin: 0,
    lineHeight: 1.4,
  },
  memoryBtn: {
    flexShrink: 0,
    borderRadius: "9999px",
    border: "none",
    background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
    color: "white",
    fontSize: "14px",
    fontWeight: 600,
    padding: "10px 20px",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)",
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
  nextBadge: {
    fontSize: "12px",
    fontWeight: "600",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    color: "#34D399",
    padding: "2px 8px",
    borderRadius: "9999px",
    marginLeft: "12px",
    verticalAlign: "middle",
  },
  completedBadge: {
    fontSize: "12px",
    fontWeight: "600",
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    color: "#60A5FA",
    padding: "2px 8px",
    borderRadius: "9999px",
    marginLeft: "12px",
    verticalAlign: "middle",
  },
  attemptedBadge: {
    fontSize: "12px",
    fontWeight: "600",
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    color: "#FBBF24",
    padding: "2px 8px",
    borderRadius: "9999px",
    marginLeft: "12px",
    verticalAlign: "middle",
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

