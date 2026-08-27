import { useState } from "react";
import { FolderPanel } from "./FolderPanel";

export const App = () => {
  const [notice, setNotice] = useState("Ready to learn.");
  return (
    <div className="app-shell">
      <header className="app-header">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <h1>English Learning</h1>
        <nav aria-label="Primary navigation">
          <a href="#folders">Folders</a>
          <a href="#dashboard">Dashboard</a>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <FolderPanel
          api={{
            list: async () => [],
            create: async (name) => ({
              id: name,
              name,
              vocabularyCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
          }}
        />
        <section aria-labelledby="welcome-title">
          <h2 id="welcome-title">Build your vocabulary</h2>
          <p>Choose a folder to review words, practice, and track progress.</p>
          <button
            type="button"
            onClick={() => setNotice("Your folders are ready.")}
          >
            View folders
          </button>
          <p role="status" aria-live="polite">
            {notice}
          </p>
        </section>
      </main>
    </div>
  );
};
