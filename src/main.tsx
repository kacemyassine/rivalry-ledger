import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const _parse = JSON.parse;
JSON.parse = function(str, ...args) {
  try {
    return _parse.call(this, str, ...args);
  } catch (e) {
    console.error("JSON.parse failed on:", str);
    throw e;
  }
};

createRoot(document.getElementById("root")!).render(<App />);
