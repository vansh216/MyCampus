import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import AppLayout from "./components/AppLayout.jsx";
import Timeline from "./pages/Timeline.jsx";
import ComingNext from "./components/ComingNext.jsx";
import AddEvent from "./pages/AddEvent.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Navigate to="timeline" replace />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="events/:id" element={<ComingNext title="Event journey" />} />
        <Route path="add" element={<AddEvent />} />
        
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}