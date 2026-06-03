import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router";
import "./styles/globals.css";
import { Signup } from "./Signup.tsx";
import { Layout } from "./Layout.tsx";
import PrivacyPolicyPage from "./PrivacyPolicy.tsx";
import TermsOfService from "./TermsOfService.tsx";
import Backoffice from "./Backoffice.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<App />} />
        <Route path="/contact" element={<Signup />} />
        <Route path="/backoffice" element={<Backoffice />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
