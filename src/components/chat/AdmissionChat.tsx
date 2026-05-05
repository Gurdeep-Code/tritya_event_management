import Index from "@/pages/Index";
import ThankYou from "@/pages/ThankYou";
import { Route, Routes } from "react-router-dom";

function AdmissionChat() {
  return (
    <Routes>
      <Route index element={<Index />} />
      <Route path="thank-you" element={<ThankYou />} />
    </Routes>
  );
}

export default AdmissionChat;
