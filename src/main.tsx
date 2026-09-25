import ReactDOM from "react-dom/client";
import App from "@/app";
import "@/app/styles/App.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found in index.html");

ReactDOM.createRoot(container).render(<App />);
