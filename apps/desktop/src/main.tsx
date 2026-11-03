import { NotebookSessionProvider } from "../../interview-lab/app/react-lab/notebook-session";
import "@kb.ui/react/styles.css";
import "../../stepwise/app/app.css";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { installLocalCoach } from "./native";

Object.defineProperty(window, "__INTERVIEW_DESKTOP__", { value: true });
installLocalCoach();
const router = createBrowserRouter([
  {
    path: "/",
    lazy: async () => ({ Component: (await import("../../stepwise/app/routes/library")).default }),
  },
  { path: "/problems/:slug", lazy: () => import("./problem-screen") },
  { path: "/react-lab/:id?", lazy: () => import("./lab-screen") },
  {
    path: "/profile",
    lazy: async () => ({ Component: (await import("@interview/platform/profile")).ProfilePage }),
  },
  {
    path: "/local-model",
    lazy: async () => ({ Component: (await import("./LocalModel")).LocalModel }),
  },
]);
const root = document.getElementById("root");
if (!root) throw new Error("Practice root missing.");
createRoot(root).render(
  <NotebookSessionProvider>
    <RouterProvider router={router} />
  </NotebookSessionProvider>,
);
