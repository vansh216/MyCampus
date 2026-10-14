import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import AppLayout from "./components/AppLayout.jsx";
import Timeline from "./pages/Timeline.jsx";
import AddEvent from "./pages/AddEvent.jsx";
import EventJourney from "./pages/EventJourney.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Navigate to="timeline" replace />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="add" element={<AddEvent />} />
        <Route path="events/:id" element={<EventJourney />} />
        
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}