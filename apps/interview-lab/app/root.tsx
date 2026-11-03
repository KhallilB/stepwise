import { NotebookSessionProvider } from "./react-lab/notebook-session";
import "@kb.ui/react/styles.css";
import "./app.css";
import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Security-Policy" content="frame-src 'self'" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <NotebookSessionProvider>
      <Outlet />
    </NotebookSessionProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="page">
      <h1>{notFound ? "Page not found" : "Something went wrong"}</h1>
      {!notFound && error instanceof Error && import.meta.env.DEV && <pre>{error.stack}</pre>}
    </main>
  );
}
