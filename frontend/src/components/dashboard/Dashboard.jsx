import React from "react";
import { useSessionStore } from "../../state/sessionStore";

// Simple static curriculum for now
const CHAPTERS = [
	{
		id: "light",
		title: "Light: Reflection & Refraction",
		topics: [
			{ id: "First-law-of-reflection", title: "First Law of Reflection" },
			{ id: "Second-law-of-reflection", title: "Second Law of Reflection" },
			{ id: "plane-mirror", title: "Plane Mirror Basics" },
			{ id: "refraction-intro", title: "Introduction to Refraction" },
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

	const activeChapter = CHAPTERS.find((c) => c.id === currentChapterId) || null;

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
										? "#2563EB"
										: "#EFF6FF",
								color:
									activeChapter && activeChapter.id === chapter.id
										? "#FFFFFF"
										: "#1E3A8A",
							}}
						>
							{chapter.title}
						</button>
					))}
				</aside>

				{/* Topics & progress */}
				<section style={styles.content}>
					<h2 style={styles.sectionTitle}>Topics</h2>
					{!activeChapter ? (
						<p style={styles.placeholderText}>
							Select a chapter to see its topics.
						</p>
					) : (
						<div style={styles.topicGrid}>
							{activeChapter.topics.map((topic) => {
							const stat = progress[topic.id];
							const isActive = currentTopicId === topic.id;
							return (
								<div key={topic.id} style={styles.topicCard}>
									<h3 style={styles.topicTitle}>{topic.title}</h3>
									{stat ? (
										<p style={styles.topicMeta}>
											Attempts: {stat.attempts} · Best score: {stat.bestScore}%
										</p>
									) : (
										<p style={styles.topicMeta}>Not attempted yet</p>
									)}
									<div style={styles.topicActions}>
										<button
											style={{
												...styles.primaryBtn,
												opacity: 1,
												cursor: "pointer",
											}}
											onClick={() => {
												selectTopic(topic.id);
												if (onStartTopic) onStartTopic(topic.id);
											}}
										>
											Start session
										</button>
										<button
											style={{
												...styles.secondaryBtn,
												borderColor: isActive ? "#2563EB" : "#D1D5DB",
												color: isActive ? "#2563EB" : "#4B5563",
											}}
											onClick={() => selectTopic(topic.id)}
										>
											Set as current
										</button>
									</div>
									</div>
								);
							})}
						</div>
					)}
				</section>
			</main>
		</div>
	);
}

const styles = {
	page: {
		minHeight: "100vh",
		backgroundColor: "#F3F4F6",
		padding: "24px",
		fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: "20px",
	},
	headerRight: {
		display: "flex",
		alignItems: "center",
		gap: "16px",
	},
	title: {
		fontSize: "24px",
		color: "#111827",
		margin: 0,
	},
	subtitle: {
		fontSize: "14px",
		color: "#6B7280",
		marginTop: 4,
	},
	avatarBox: {
		display: "flex",
		alignItems: "center",
		gap: "10px",
	},
	avatarCircle: {
		width: "40px",
		height: "40px",
		borderRadius: "9999px",
		backgroundColor: "#2563EB",
		color: "#FFFFFF",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		fontWeight: 700,
		fontSize: "18px",
	},
	userName: {
		fontSize: "14px",
		fontWeight: 600,
		color: "#111827",
	},
	userMeta: {
		fontSize: "12px",
		color: "#6B7280",
	},
	logoutBtn: {
		border: "1px solid #E5E7EB",
		background: "#F9FAFB",
		padding: "6px 10px",
		borderRadius: 9999,
		fontSize: "12px",
		cursor: "pointer",
	},
	main: {
		display: "flex",
		gap: "20px",
	},
	sidebar: {
		width: "260px",
	},
	sectionTitle: {
		fontSize: "16px",
		fontWeight: 600,
		color: "#111827",
		marginBottom: "12px",
	},
	chapterBtn: {
		width: "100%",
		textAlign: "left",
		padding: "10px 12px",
		borderRadius: "8px",
		border: "none",
		marginBottom: "8px",
		cursor: "pointer",
		fontSize: "14px",
		fontWeight: 500,
	},
	content: {
		flex: 1,
	},
	topicGrid: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
		gap: "16px",
	},
	topicCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: "10px",
		padding: "14px",
		boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
		border: "1px solid #E5E7EB",
	},
	topicTitle: {
		fontSize: "15px",
		fontWeight: 600,
		color: "#111827",
		marginBottom: 6,
	},
	topicMeta: {
		fontSize: "12px",
		color: "#6B7280",
		marginBottom: 10,
	},
	placeholderText: {
		fontSize: "14px",
		color: "#6B7280",
	},
	topicActions: {
		display: "flex",
		gap: "8px",
	},
	primaryBtn: {
		flex: 1,
		borderRadius: "9999px",
		border: "none",
		backgroundColor: "#2563EB",
		color: "white",
		fontSize: "13px",
		fontWeight: 500,
		padding: "8px 10px",
		cursor: "pointer",
	},
	secondaryBtn: {
		flex: 1,
		borderRadius: "9999px",
		border: "1px solid #D1D5DB",
		backgroundColor: "#FFFFFF",
		fontSize: "13px",
		fontWeight: 500,
		padding: "8px 10px",
		cursor: "pointer",
	},
};

