import React from "react";

class AnimationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Failed to render." };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: "#991B1B", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: 10 }}>
          Render error: {this.state.message}
        </div>
      );
    }
    return this.props.children;
  }
}

const discoveredModules = {
  ...import.meta.glob("../svg-engine/**/animations/**/*.jsx"),
  ...import.meta.glob("../svg-engine/**/*Animation*.jsx"),
  ...import.meta.glob("../svg-engine/**/*Watch*.jsx"),
};

const normalizedEntries = Object.entries(discoveredModules)
  .filter(([path]) => !path.includes("/shared/AnimationPlayer.jsx"))
  .map(([path, load]) => {
    const fileName = path.split("/").pop() || path;
    const title = fileName.replace(/\.jsx$/i, "");
    return { path, title, load };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

function AnimationCard({ title, path, load, commonProps }) {
  const [Component, setComponent] = React.useState(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    load()
      .then((mod) => {
        if (!active) return;
        if (typeof mod?.default === "function") {
          setComponent(() => mod.default);
          setError("");
        } else {
          setError("No default React component export.");
        }
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.message || "Failed to load module.");
      });

    return () => {
      active = false;
    };
  }, [load]);

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: "4px 0 8px" }}>{title}</h3>
      <p style={{ margin: "0 0 8px", color: "#6B7280", fontSize: 12 }}>{path.replace("../", "src/")}</p>

      {error ? (
        <div style={{ color: "#991B1B", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: 10 }}>
          Load error: {error}
        </div>
      ) : Component ? (
        <AnimationErrorBoundary>
          <Component {...commonProps} />
        </AnimationErrorBoundary>
      ) : (
        <div style={{ color: "#6B7280", fontSize: 13 }}>Loading component...</div>
      )}
    </div>
  );
}

const cardStyle = {
  background: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  padding: "12px",
};

export default function AnimationTestPage() {
  const commonProps = {
    onTryItClicked: () => {},
    onContinue: () => {},
    onBack: () => {},
    onComplete: () => {},
    onInteracted: () => {},
    misconceptionTag: "angle_from_surface",
    attempt: 1,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F4F7FF", padding: "20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ margin: "0 0 8px", color: "#1E3A8A" }}>Animation Test Preview</h1>
        <p style={{ margin: "0 0 16px", color: "#4B5563" }}>
          This page is opened by npm run test and auto-renders all discovered animation components.
        </p>
        <p style={{ margin: "0 0 16px", color: "#6B7280", fontSize: 13 }}>
          Found {normalizedEntries.length} animation components.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "14px",
          }}
        >
          {normalizedEntries.map(({ path, title, load }) => (
            <AnimationCard key={path} title={title} path={path} load={load} commonProps={commonProps} />
          ))}
        </div>
      </div>
    </div>
  );
}