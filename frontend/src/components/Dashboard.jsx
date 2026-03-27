import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Dashboard</h1>

      <button
        onClick={() => navigate("/session")}
        className="mt-4 px-4 py-2 bg-green-500 text-white"
      >
        Start Learning
      </button>
    </div>
  );
};

export default Dashboard;