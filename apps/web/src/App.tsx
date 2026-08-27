import { useState } from "react";
import { FolderPanel } from "./FolderPanel";
import { createApiClient } from "./api/client";
import {
  folderListResponseSchema,
  folderResponseSchema,
} from "@english-learning/contracts";

export const App = () => {
  const [notice, setNotice] = useState("Ready to learn.");
  return (
    <div className="app-shell">
      <header className="app-header">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <div className="header-inner">
          <a className="brand" href="#main" aria-label="English Learning home">
            <span className="brand-mark" aria-hidden="true">
              Aa
            </span>
            <span>
              <h1 className="brand-title">English Learning</h1>
              <small>Learn a little every day</small>
            </span>
          </a>
          <nav aria-label="Primary navigation">
            <a className="nav-link nav-link-active" href="#folders">
              Folders
            </a>
            <a className="nav-link" href="#dashboard">
              Dashboard
            </a>
          </nav>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <section className="hero" aria-labelledby="welcome-title">
          <div className="hero-copy">
            <span className="eyebrow">Your learning space</span>
            <h1 id="welcome-title">Build vocabulary that stays with you.</h1>
            <p>
              Organize new words, practice with flashcards, and turn every study
              session into visible progress.
            </p>
            <div className="hero-actions">
              <a className="button-link" href="#folders">
                Explore folders
              </a>
              <button
                className="button-secondary"
                type="button"
                onClick={() => setNotice("Your folders are ready.")}
              >
                View folders
              </button>
            </div>
            <p className="hero-status" role="status" aria-live="polite">
              <span aria-hidden="true" />
              {notice}
            </p>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="word-card word-card-back">
              <span>Practice</span>
              <strong>confidence</strong>
            </div>
            <div className="word-card word-card-front">
              <span>Word of the day</span>
              <strong>curiosity</strong>
              <em>/ˌkjʊəriˈɒsəti/</em>
              <p>A strong desire to learn or know something.</p>
            </div>
          </div>
        </section>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Library</span>
            <h2>Your vocabulary folders</h2>
          </div>
          <p>Create a folder for every topic, course, or learning goal.</p>
        </div>
        <FolderPanel api={createFolderApi()} />
      </main>
      <footer className="app-footer">
        <p>English Learning</p>
        <span>Small steps. Lasting progress.</span>
      </footer>
    </div>
  );
};

/* c8 ignore start -- browser wiring is exercised by integration smoke tests. */
const createFolderApi = () => {
  const client = createApiClient(`${window.location.origin}/api/v1`);
  return {
    list: async () =>
      (await client.request("folders", folderListResponseSchema)).data.folders,
    create: async (name: string) => {
      const response = await client.request("folders", folderResponseSchema, {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      return response.data;
    },
  };
};
/* c8 ignore stop */
