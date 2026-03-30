export function buildHtml(sallyApiUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sally Lite | Same sharp feedback, simpler to run</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      background: #0a0a0a;
      color: #e0e0e0;
      min-height: 100vh;
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    /* Hero banner */
    .hero {
      max-width: 1100px;
      margin: 0 auto 0;
      padding: 2rem 1.5rem 0;
    }
    .hero-img {
      width: 100%;
      border-radius: 10px;
      display: block;
    }

    /* Header */
    .header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .header-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      margin-bottom: 0.3rem;
    }
    .header-title img {
      width: 36px;
      height: 36px;
      image-rendering: pixelated;
    }
    .header h1 {
      font-size: 1.8rem;
      color: #e8503a;
      margin: 0;
    }
    .header h1 span { color: #e0e0e0; }
    .header p {
      color: #666;
      font-size: 0.85rem;
    }
    .header .tagline {
      color: #ccc;
      font-size: 1rem;
      font-style: italic;
      margin-top: 0.6rem;
      line-height: 1.5;
    }

    /* Quota badge */
    .quota-bar {
      display: none;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    .quota-bar.visible { display: flex; }
    .quota-badge {
      padding: 0.3rem 0.8rem;
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 4px;
      font-size: 0.75rem;
      color: #888;
    }
    .quota-badge .count { color: #e8503a; font-weight: 600; }
    .quota-badge.exhausted { border-color: #ef444444; }
    .quota-badge.exhausted .count { color: #ef4444; }

    /* GitHub URL input — primary */
    .github-section {
      margin-bottom: 1.5rem;
    }
    .github-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #e8503a;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 0.5rem;
    }
    .github-input {
      width: 100%;
      padding: 1rem 1.2rem;
      background: #111;
      border: 2px solid #e8503a33;
      border-radius: 10px;
      color: #e0e0e0;
      font-family: inherit;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .github-input:focus { border-color: #e8503a; }
    .github-input::placeholder { color: #444; }
    .github-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 0.75rem;
    }
    .btn-roast-repo {
      padding: 0.7rem 2rem;
      background: linear-gradient(135deg, #e8503a, #c44030);
      border: none;
      border-radius: 6px;
      color: white;
      font-family: inherit;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-roast-repo:hover { opacity: 0.9; }
    .btn-roast-repo:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Divider with Sally quip */
    .paste-divider {
      text-align: center;
      margin: 2rem 0 1.5rem;
      position: relative;
    }
    .paste-divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #1a1a1a;
    }
    .paste-divider span {
      position: relative;
      background: #0a0a0a;
      padding: 0 1rem;
      color: #555;
      font-size: 0.78rem;
      font-style: italic;
    }

    /* Editor */
    .editor-wrap {
      position: relative;
      margin-bottom: 1rem;
    }
    .filename-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-bottom: none;
      border-radius: 8px 8px 0 0;
    }
    .filename-bar input {
      background: transparent;
      border: none;
      color: #999;
      font-family: inherit;
      font-size: 0.8rem;
      outline: none;
      width: 200px;
    }
    .filename-bar input::placeholder { color: #444; }
    .filename-bar .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot-red { background: #ff5f56; }
    .dot-yellow { background: #ffbd2e; }
    .dot-green { background: #27c93f; }

    textarea {
      width: 100%;
      min-height: 300px;
      padding: 1rem;
      background: #111;
      border: 1px solid #2a2a2a;
      border-top: none;
      border-radius: 0 0 8px 8px;
      color: #e0e0e0;
      font-family: inherit;
      font-size: 0.85rem;
      line-height: 1.6;
      resize: vertical;
      outline: none;
      tab-size: 2;
    }
    textarea:focus { border-color: #e8503a44; }
    textarea::placeholder { color: #333; }

    /* Button */
    .actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .btn-roast {
      padding: 0.7rem 2rem;
      background: linear-gradient(135deg, #e8503a, #c44030);
      border: none;
      border-radius: 6px;
      color: white;
      font-family: inherit;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-roast:hover { opacity: 0.9; }
    .btn-roast:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .status {
      color: #666;
      font-size: 0.8rem;
    }
    .status.error { color: #ef4444; }
    .limit-cta {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      padding: 0.6rem 1.2rem;
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      border: 1px solid #f59e0b44;
      border-radius: 8px;
      color: #f59e0b;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: border-color 0.2s, transform 0.2s;
      text-decoration: none;
    }
    .limit-cta:hover {
      border-color: #f59e0b;
      transform: translateY(-1px);
    }
    .limit-cta .arrow { font-size: 1.1rem; animation: bounce 1.5s infinite; }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(3px); }
    }

    /* Results */
    .results { display: none; }
    .results.visible { display: block; }

    .result-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .verdict-card, .burncard-card {
      background: #111;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      aspect-ratio: 9 / 16;
    }
    .verdict-card {
      overflow: hidden;
      position: relative;
    }
    .burncard-card {
      padding: 0;
      overflow: hidden;
      background: transparent;
      border: none;
    }
    .burncard-card #shareWrap {
      flex: 1;
    }
    .burncard-card #shareWrap a {
      display: block;
      height: 100%;
    }
    .burncard-card #shareWrap img {
      width: 100%;
      height: auto;
      display: block;
    }
    .share-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6rem 1rem;
      background: rgba(0,0,0,0.85);
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 2;
    }
    .burncard-card {
      position: relative;
    }
    .share-label {
      color: #666;
      font-size: 0.75rem;
    }
    .share-x-btn {
      display: inline-block;
      padding: 0.4rem 1rem;
      background: #000;
      border: 1px solid #333;
      border-radius: 20px;
      color: #fff;
      font-size: 0.78rem;
      font-weight: 600;
      text-decoration: none;
      transition: background 0.2s, border-color 0.2s;
    }
    .share-x-btn:hover {
      background: #1a1a1a;
      border-color: #555;
    }
    .roast-preview-wrap {
      position: relative;
      overflow: hidden;
      flex: 1;
      margin-top: 0.5rem;
    }
    .roast-preview {
      color: #ccc;
      font-size: 0.85rem;
      line-height: 1.7;
    }
    .roast-fade {
      display: none;
    }
    .verdict-expand {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 2.5rem 0.75rem 1rem;
      background: linear-gradient(transparent, #111 60%);
      color: #e8503a;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: color 0.2s;
      z-index: 2;
    }
    .verdict-collapse {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.75rem;
      color: #e8503a;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      border-top: 1px solid #2a2a2a;
      transition: color 0.2s;
    }
    .verdict-expand:hover, .verdict-collapse:hover {
      color: #ff6b4a;
    }
    .expand-icon {
      transition: transform 0.3s;
    }
    .expand-icon.rotated {
      transform: rotate(180deg);
    }
    .full-review {
      display: none;
      margin-top: 1.5rem;
      padding: 1.5rem;
      background: #111;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
    }
    .full-review.open {
      display: block;
    }
    .verdict-collapse {
      margin-top: 1.5rem;
      border-top: 1px solid #2a2a2a;
      border-radius: 0;
    }
    .copy-review-bar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1rem;
    }
    .copy-review-btn {
      padding: 0.4rem 1rem;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 6px;
      color: #aaa;
      font-family: inherit;
      font-size: 0.75rem;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .copy-review-btn:hover {
      background: #222;
      color: #fff;
    }
    .cta-card {
      text-decoration: none;
      border-color: #d9770655 !important;
      box-shadow: 0 0 24px rgba(217, 119, 6, 0.15);
      transition: box-shadow 0.3s, border-color 0.3s;
    }
    .cta-card .tool-card-img {
      aspect-ratio: 3 / 1;
    }
    .cta-card .tool-card-img img {
      object-fit: cover;
      object-position: center center;
    }
    .cta-card:hover {
      border-color: #f59e0b88 !important;
      box-shadow: 0 0 36px rgba(245, 158, 11, 0.3);
      transform: none;
    }
    .cta-card .tool-label { color: #f59e0b !important; }
    .cta-card .tool-card-name { color: #f59e0b; }
    .cta-card-badge {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-radius: 4px;
      color: #000;
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.08em;
    }
    .cta-card-list {
      list-style: none;
      padding: 0;
      margin: 0.5rem 0 0;
    }
    .cta-card-list li {
      color: #bbb;
      font-size: 0.78rem;
      padding: 0.3rem 0;
      border-bottom: 1px solid #1a1a1a;
    }
    .cta-card-list li::before {
      content: "\\2713 ";
      color: #f59e0b;
      margin-right: 0.4rem;
    }
    .cta-card-btn {
      display: block;
      text-align: center;
      margin-top: auto;
      padding: 0.7rem 1.5rem;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-radius: 8px;
      color: #000;
      font-family: inherit;
      font-size: 0.9rem;
      font-weight: 700;
    }

    .result-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .result-header h2 {
      color: #e8503a;
      font-size: 1.1rem;
    }
    .score-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .score-low { background: #ef444422; color: #ef4444; }
    .score-mid { background: #eab30822; color: #eab308; }
    .score-high { background: #22c55e22; color: #22c55e; }

    .score-bar {
      height: 6px;
      background: #1a1a1a;
      border-radius: 3px;
      margin-bottom: 1.5rem;
      overflow: hidden;
    }
    .score-bar-fill {
      height: 100%;
      border-radius: 3px;
      background: linear-gradient(90deg, #e8503a, #c44030);
      transition: width 0.6s ease-out;
    }

    .roast-text {
      padding: 1rem;
      background: #111;
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      line-height: 1.7;
      color: #ccc;
      font-size: 0.85rem;
    }

    .section-title {
      color: #e8503a;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }

    .issue {
      padding: 0.75rem;
      background: #111;
      border: 1px solid #2a2a2a;
      border-radius: 6px;
      margin-bottom: 0.5rem;
      font-size: 0.8rem;
    }
    .issue-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.3rem;
    }
    .severity {
      padding: 0.1rem 0.4rem;
      border-radius: 3px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .sev-critical { background: #ef444433; color: #ef4444; }
    .sev-major { background: #eab30833; color: #eab308; }
    .sev-minor { background: #66666633; color: #888; }
    .issue-title { color: #e0e0e0; font-weight: 500; }
    .issue-desc { color: #888; margin-top: 0.25rem; }
    .issue-fix { color: #22c55e; margin-top: 0.25rem; }

    /* Share button */
    .share-btn {
      display: inline-block;
      margin-top: 1.5rem;
      padding: 0.6rem 1.5rem;
      background: linear-gradient(135deg, #e8503a, #c44030);
      border-radius: 6px;
      color: white;
      font-family: inherit;
      font-size: 0.8rem;
      font-weight: 600;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .share-btn:hover { opacity: 0.85; }

    /* Sneer highlight */
    .sneer-hero {
      margin: 1.5rem 0;
      padding: 1rem 1.25rem;
      background: #111;
      border: 1px solid #1a1a1a;
      border-left: 3px solid #e8503a;
      border-radius: 8px;
      color: #ccc;
      font-size: 0.95rem;
      font-style: italic;
      line-height: 1.6;
    }

    .endquotes {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .endquote {
      flex: 1;
      padding: 0.75rem;
      background: #111;
      border: 1px solid #2a2a2a;
      border-radius: 6px;
      font-size: 0.8rem;
      line-height: 1.5;
    }
    .endquote-label {
      font-size: 0.7rem;
      color: #666;
      margin-bottom: 0.3rem;
    }
    .bright { color: #22c55e; }
    .sneer { color: #ef4444; }

    /* (old CTA removed — split into cta-intro, suite-header, tool-grid, cta-bottom) */

    /* CTA intro */
    .cta-intro {
      text-align: center;
      margin-top: 3rem;
      padding: 2rem 1.5rem;
      background: linear-gradient(135deg, #e8503a11, #c4403011);
      border: 1px solid #e8503a33;
      border-radius: 12px;
    }
    .cta-intro h3 { color: #e8503a; margin-bottom: 0.5rem; font-size: 1.2rem; }
    .cta-intro p { color: #888; font-size: 0.85rem; line-height: 1.5; }
    .cta-install {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      margin-top: 1.25rem;
    }
    .cta-install-cmd {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      background: #0d0d0d;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 0.6rem 1rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      color: #f59e0b;
      cursor: pointer;
      transition: border-color 0.2s;
    }
    .cta-install-cmd:hover { border-color: #f59e0b; }
    .cta-install-cmd .prompt { color: #555; user-select: none; }
    .cta-install-steps {
      display: flex;
      gap: 1.5rem;
      margin-top: 0.25rem;
    }
    .cta-step {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: #666;
      font-size: 0.75rem;
    }
    .cta-step-num {
      background: #e8503a;
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* Suite header */
    .suite-header {
      text-align: center;
      margin: 3rem 0 2rem;
    }
    .suite-header h2 {
      color: #fff;
      font-size: 1.6rem;
      font-weight: 700;
      margin-bottom: 0.4rem;
    }
    .suite-header p {
      color: #555;
      font-size: 0.85rem;
    }

    /* Bento grid — asymmetric, editorial, premium */
    .tool-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-auto-rows: auto;
      gap: 1rem;
      margin-bottom: 2.5rem;
    }
    .tool-card {
      position: relative;
      background: #0f0f0f;
      border: 1px solid rgba(232, 80, 58, 0.15);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 0 30px 4px rgba(232, 80, 58, 0.08);
    }
    .tool-card:hover {
      border-color: rgba(232, 80, 58, 0.6);
      transform: scale(1.03);
      box-shadow: 0 0 50px 10px rgba(232, 80, 58, 0.2);
      z-index: 2;
    }
    .tool-card.hero { grid-column: span 2; }
    .tool-card-img {
      aspect-ratio: 1 / 1;
      overflow: hidden;
    }
    .tool-card.hero .tool-card-img {
      aspect-ratio: 2 / 1;
    }
    .tool-card-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 30%;
      display: block;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .tool-card:hover .tool-card-img img {
      transform: scale(1.05);
    }
    .tool-label {
      display: block;
      text-align: center;
      padding: 0.5rem 0;
      font-family: inherit;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #e8503a;
      text-shadow: 0 0 12px rgba(232, 80, 58, 0.6);
      background: #0a0a0a;
    }
    .tool-card-body {
      padding: 0.85rem 1rem 1rem;
    }
    .tool-card-top {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.25rem;
    }
    .tool-card-num {
      color: #e8503a;
      font-size: 0.55rem;
      font-weight: 800;
      background: #e8503a1a;
      border: 1px solid #e8503a33;
      padding: 0.1rem 0.35rem;
      border-radius: 3px;
      letter-spacing: 0.05em;
    }
    .tool-card-name {
      color: #fff;
      font-weight: 700;
      font-size: 0.95rem;
    }
    .tool-card-cmd {
      display: inline-block;
      color: #22c55e;
      font-size: 0.6rem;
      font-weight: 500;
      margin-bottom: 0.4rem;
      background: #22c55e0d;
      border: 1px solid #22c55e22;
      padding: 0.15rem 0.4rem;
      border-radius: 3px;
    }
    .tool-card-desc {
      color: #999;
      font-size: 0.7rem;
      line-height: 1.6;
    }
    .tool-card.hero .tool-card-name { font-size: 1.15rem; }
    .tool-card.hero .tool-card-desc { font-size: 0.78rem; }
    .tool-card.hero .tool-card-cmd { font-size: 0.68rem; }

    /* CTA bottom button */
    .cta-bottom {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    .cta-bottom a {
      display: inline-block;
      padding: 1rem 3rem;
      background: linear-gradient(135deg, #e8503a, #c44030);
      border: none;
      border-radius: 8px;
      color: white;
      font-weight: 700;
      text-decoration: none;
      font-family: inherit;
      font-size: 1rem;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 0 30px rgba(232, 80, 58, 0.3);
    }
    .cta-bottom a:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 50px rgba(232, 80, 58, 0.5);
    }

    @media (max-width: 600px) {
      .tool-grid { grid-template-columns: 1fr; }
      .tool-card.hero { grid-column: span 1; }
      .tool-card.hero .tool-card-img { aspect-ratio: 1 / 1; }
    }

    .deploy-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.25rem;
      padding: 1rem 1.5rem;
      margin-bottom: 1.5rem;
    }
    .deploy-sally {
      width: 100px;
      height: auto;
    }
    .deploy-content p {
      color: #999;
      font-size: 0.8rem;
      margin-bottom: 0.6rem;
    }
    .deploy-content a img {
      height: 40px;
      transition: opacity 0.2s;
    }
    .deploy-content a img:hover {
      opacity: 0.85;
    }

    .footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #1a1a1a;
      color: #444;
      font-size: 0.7rem;
    }
    .cta-sally {
      width: 120px;
      height: auto;
      margin-bottom: 0.75rem;
      image-rendering: pixelated;
    }
    .footer a { color: #555; text-decoration: none; }
    .footer a:hover { color: #e8503a; }

    @media (max-width: 600px) {
      .container { padding: 1rem; }
      .endquotes { flex-direction: column; }
      .result-cards { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="hero">
    <img src="/sally-banner.png" alt="Cynical Sally" class="hero-img">
  </div>
  <div class="container">
    <div class="header">
      <div class="header-title">
        <img src="/sally-head.png" alt="Sally">
        <h1>Sally <span>Lite</span></h1>
      </div>
      <p>Paste your code. Get roasted. No mercy.</p>
      <p class="tagline">"Because 'You're absolutely right' is probably absolutely wrong."</p>
    </div>

    <div class="deploy-section">
      <img src="/sallyxrender.png" alt="Sally x Render" class="deploy-sally">
      <div class="deploy-content">
        <p>Deploy your own Sally Lite on Render for free.</p>
        <a href="https://dashboard.render.com/blueprint/new?repo=https%3A%2F%2Fgithub.com%2Fw1ckedxt%2Fcynicalsally-lite?utm_source=sally_website&utm_medium=referral&utm_campaign=cynical_sally" target="_blank">
          <img src="https://render.com/images/deploy-to-render-button.svg" alt="Deploy to Render">
        </a>
      </div>
    </div>

    <div class="quota-bar" id="quotaBar">
      <span class="quota-badge" id="quotaBadge"><span class="count" id="quotaCount"></span></span>
    </div>

    <div class="github-section">
      <div class="github-label">Roast a GitHub repo</div>
      <input type="text" class="github-input" id="githubUrl" placeholder="https://github.com/owner/repo" spellcheck="false">
      <div class="github-actions">
        <button class="btn-roast-repo" id="roastRepoBtn" onclick="roastGithub()">Roast This Repo</button>
        <span class="status" id="githubStatus"></span>
      </div>
    </div>

    <div class="paste-divider">
      <span>Too scared to show me the whole thing? Fine. Paste a snippet.</span>
    </div>

    <div class="editor-wrap">
      <div class="filename-bar">
        <span class="dot dot-red"></span>
        <span class="dot dot-yellow"></span>
        <span class="dot dot-green"></span>
        <input type="text" id="filename" placeholder="filename.ts (optional)">
      </div>
      <textarea id="code" placeholder="// Paste your code here...&#10;// Sally will review it with zero filter.&#10;&#10;function example() {&#10;  var x = 1&#10;  return x&#10;}" spellcheck="false"></textarea>
    </div>

    <div class="actions">
      <button class="btn-roast" id="roastBtn" onclick="roast()">Roast My Code</button>
      <span class="status" id="status"></span>
    </div>

    <div class="results" id="results">
      <div class="result-cards">
        <div class="verdict-card">
          <div class="result-header">
            <h2>&#9760; Sally's Verdict</h2>
            <span class="score-badge" id="scoreBadge"></span>
          </div>
          <div class="score-bar"><div class="score-bar-fill" id="scoreBar"></div></div>
          <div class="sneer-hero" id="sneerHero"></div>
          <div class="roast-preview-wrap">
            <div class="roast-preview" id="roastPreview"></div>
            <div class="roast-fade"></div>
          </div>
          <div class="verdict-expand" id="verdictExpand" onclick="toggleFullReview()">
            <span class="expand-icon" id="expandIcon">&#9660;</span> Read full review
          </div>
        </div>
        <div class="burncard-card">
          <div id="shareWrap"></div>
          <div class="share-actions">
            <span class="share-label">Click card for full size</span>
            <a id="shareXBtn" href="#" target="_blank" class="share-x-btn">Share on &#120143; &rarr;</a>
          </div>
        </div>
      </div>

      <div class="full-review" id="fullReview">
        <div class="copy-review-bar">
          <button class="copy-review-btn" onclick="copyReview()">Copy full review</button>
        </div>
        <div class="roast-text" id="roastText"></div>
        <div id="issuesSection">
          <div class="section-title">Issues</div>
          <div id="issuesList"></div>
        </div>
        <div id="fixesSection" style="margin-top:1rem">
          <div class="section-title">Actionable Fixes</div>
          <div id="fixesList"></div>
        </div>
        <div class="endquotes">
          <div class="endquote">
            <div class="endquote-label">&#10024; Bright Side</div>
            <div class="bright" id="brightSide"></div>
          </div>
          <div class="endquote">
            <div class="endquote-label">&#128293; Hardest Sneer</div>
            <div class="sneer" id="hardestSneer"></div>
          </div>
        </div>
        <div class="verdict-collapse" onclick="toggleFullReview()">
          <span>&#9650;</span> Collapse review
        </div>
      </div>
    </div>

    <div class="cta-intro" id="fullSuite">
      <img src="/sally-head.png" alt="Sally" class="cta-sally">
      <h3>Want the full experience?</h3>
      <p>The full CLI unlocks more reviews, git diff support, and Full Truth deep analysis. Straight in your terminal.</p>
      <div class="cta-install">
        <div class="cta-install-cmd" onclick="navigator.clipboard.writeText('npm install -g cynicalsally').then(function(){this.querySelector('.copy-hint').textContent='Copied!'}.bind(this))">
          <span class="prompt">$</span> npm install -g cynicalsally <span class="copy-hint" style="color:#555;font-size:0.7rem;margin-left:0.3rem">click to copy</span>
        </div>
        <div class="cta-install-steps">
          <span class="cta-step"><span class="cta-step-num">1</span> Install via npm</span>
          <span class="cta-step"><span class="cta-step-num">2</span> Get brutally honest insights in your workflow</span>
        </div>
      </div>
    </div>

    <div class="suite-header">
      <h2>&#128293; Full Suite Tools</h2>
      <p>6 specialized tools. One brutally honest engineer. Zero filter.</p>
    </div>

    <div class="tool-grid">
      <div class="tool-card hero">
        <div class="tool-card-img"><img src="/tool-prreview.png" alt="Sally at her desk, gold nameplate reading PR REVIEW" loading="lazy"></div>
        <span class="tool-label">PR Review</span>
        <div class="tool-card-body">
          <div class="tool-card-top"><span class="tool-card-num">#1</span> <span class="tool-card-name">PR Review</span></div>
          <div class="tool-card-cmd">$ sally review-pr [pr]</div>
          <div class="tool-card-desc">I review your PR like a senior engineer who has time, opinions, and absolutely no reason to be polite about that nested ternary you snuck in on line 47.</div>
        </div>
      </div>
      <div class="tool-card">
        <div class="tool-card-img"><img src="/tool-explain.png" alt="Sally at her desk, gold nameplate reading EXPLAIN" loading="lazy"></div>
        <span class="tool-label">Explain</span>
        <div class="tool-card-body">
          <div class="tool-card-top"><span class="tool-card-num">#2</span> <span class="tool-card-name">Explain</span></div>
          <div class="tool-card-cmd">$ sally explain [file]</div>
          <div class="tool-card-desc">I read the spaghetti someone left in your codebase and translate it into plain English &mdash; just the cold, clear truth of what it actually does.</div>
        </div>
      </div>
      <div class="tool-card">
        <div class="tool-card-img"><img src="/tool-refactor.png" alt="Sally at her desk, gold nameplate reading REFACTOR" loading="lazy"></div>
        <span class="tool-label">Refactor</span>
        <div class="tool-card-body">
          <div class="tool-card-top"><span class="tool-card-num">#3</span> <span class="tool-card-name">Refactor</span></div>
          <div class="tool-card-cmd">$ sally refactor [file]</div>
          <div class="tool-card-desc">I show you the before, I show you the after, and I explain why one of them is going to haunt your 3am on-call rotation.</div>
        </div>
      </div>
      <div class="tool-card">
        <div class="tool-card-img"><img src="/tool-brainstorm.png" alt="Sally at her desk, gold nameplate reading BRAINSTORM" loading="lazy"></div>
        <span class="tool-label">Brainstorm</span>
        <div class="tool-card-body">
          <div class="tool-card-top"><span class="tool-card-num">#4</span> <span class="tool-card-name">Brainstorm</span></div>
          <div class="tool-card-cmd">$ sally brainstorm ["idea"]</div>
          <div class="tool-card-desc">Pitch me your architecture idea and I'll tell you the three ways it falls apart at scale &mdash; consider it cheaper than a post-mortem.</div>
        </div>
      </div>
      <div class="tool-card">
        <div class="tool-card-img"><img src="/tool-frontend.png" alt="Sally at her desk, gold nameplate reading FRONTEND" loading="lazy"></div>
        <span class="tool-label">Frontend</span>
        <div class="tool-card-body">
          <div class="tool-card-top"><span class="tool-card-num">#5</span> <span class="tool-card-name">Frontend Review</span></div>
          <div class="tool-card-cmd">$ sally frontend [file]</div>
          <div class="tool-card-desc">I'll tell you why your component re-renders on every keystroke and why your z-index is load-bearing.</div>
        </div>
      </div>
      <div class="tool-card hero">
        <div class="tool-card-img"><img src="/tool-marketing.png" alt="Sally at her desk, gold nameplate reading MARKETING" loading="lazy"></div>
        <span class="tool-label">Marketing</span>
        <div class="tool-card-body">
          <div class="tool-card-top"><span class="tool-card-num">#6</span> <span class="tool-card-name">Marketing Review</span></div>
          <div class="tool-card-cmd">$ sally marketing ["copy"]</div>
          <div class="tool-card-desc">Run your copy by me before your customers do, because they won't be this constructive about it.</div>
        </div>
      </div>
      <a href="https://github.com/w1ckedxt/cynicalsally-cli" target="_blank" class="tool-card cta-card">
        <div class="tool-card-img"><img src="/fullsuitebanner.png" alt="Sally Full Suite" loading="lazy"></div>
        <span class="tool-label" style="color:#f59e0b">FULL SUITE</span>
        <div class="tool-card-body">
          <div class="tool-card-top"><span class="cta-card-badge">PRO</span> <span class="tool-card-name">Get the Full Suite</span></div>
          <ul class="cta-card-list">
            <li>6 specialized CLI tools</li>
            <li>Unlimited daily reviews</li>
            <li>0&ndash;10 scorecard + evidence-backed issues</li>
            <li>Step-by-step actionable fixes</li>
            <li>Downloadable PDF reports</li>
            <li>SuperClub: Chrome Extension + web access</li>
            <li>No ads, no sugarcoating</li>
          </ul>
          <div class="cta-card-btn">Get Sally CLI &rarr;</div>
        </div>
      </a>
    </div>

    <div class="deploy-section" style="margin-top:2.5rem">
      <p>Deploy your own Sally Lite on Render for free.</p>
      <a href="https://dashboard.render.com/blueprint/new?repo=https%3A%2F%2Fgithub.com%2Fw1ckedxt%2Fcynicalsally-lite?utm_source=sally_website&utm_medium=referral&utm_campaign=cynical_sally" target="_blank">
        <img src="https://render.com/images/deploy-to-render-button.svg" alt="Deploy to Render">
      </a>
    </div>

    <div class="footer">
      <p>Powered by <a href="https://cynicalsally.com" target="_blank">CynicalSally</a> &middot; Running on <a href="https://render.com" target="_blank">Render</a></p>
    </div>
  </div>

  <script>
    function showLimitCta(statusEl, msg) {
      statusEl.innerHTML = '';
      statusEl.className = 'status error';
      var text = document.createElement('div');
      text.textContent = msg;
      statusEl.appendChild(text);
      var cta = document.createElement('a');
      cta.className = 'limit-cta';
      cta.href = '#fullSuite';
      cta.innerHTML = 'See the Full Suite <span class="arrow">&#8595;</span>';
      cta.onclick = function(e) {
        e.preventDefault();
        document.getElementById('fullSuite').scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      statusEl.appendChild(cta);
    }

    function copyReview() {
      var el = document.getElementById('fullReview');
      var text = el.innerText.replace('Copy full review', '').replace('Collapse review', '').trim();
      navigator.clipboard.writeText(text).then(function() {
        var btn = document.querySelector('.copy-review-btn');
        btn.textContent = 'Copied!';
        setTimeout(function() { btn.textContent = 'Copy full review'; }, 2000);
      });
    }

    function toggleFullReview() {
      var el = document.getElementById('fullReview');
      var icon = document.getElementById('expandIcon');
      var isOpen = el.classList.contains('open');
      if (isOpen) {
        el.classList.remove('open');
        icon.classList.remove('rotated');
      } else {
        el.classList.add('open');
        icon.classList.add('rotated');
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // Quips: fetched from backend, cached in memory
    // Minimal fallback so quips work even before backend deploys the endpoint
    let cachedQuips = ["Sally is reading your code...", "One moment..."];
    let quipInterval = null;

    // Fetch real quips from backend in background — replaces fallback once loaded
    fetch('/api/quips')
      .then(r => r.json())
      .then(data => { if (data.quips && data.quips.length > 0) cachedQuips = data.quips; })
      .catch(() => {});

    function startQuips(statusEl) {
      let i = Math.floor(Math.random() * cachedQuips.length);
      statusEl.textContent = cachedQuips[i];
      statusEl.className = 'status';
      quipInterval = setInterval(() => {
        i = (i + 1) % cachedQuips.length;
        statusEl.textContent = cachedQuips[i];
      }, 3000);
    }

    function stopQuips() {
      if (quipInterval) { clearInterval(quipInterval); quipInterval = null; }
    }

    async function roast() {
      const code = document.getElementById('code').value.trim();
      const filename = document.getElementById('filename').value.trim();
      lastSubject = filename || 'your pasted code';
      const btn = document.getElementById('roastBtn');
      const status = document.getElementById('status');
      const results = document.getElementById('results');

      if (!code) {
        status.textContent = 'Paste some code first.';
        status.className = 'status error';
        return;
      }

      btn.disabled = true;
      results.className = 'results';
      startQuips(status);

      try {
        const res = await fetch('/api/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, filename }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong');

        stopQuips();
        renderResult(data);
        showQuota(data.quota);
        results.className = 'results visible';
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
        status.textContent = '';
      } catch (err) {
        stopQuips();
        if (err.message && err.message.match(/out of|limit|quota/i)) {
          showLimitCta(status, err.message);
        } else {
          status.textContent = err.message;
          status.className = 'status error';
        }
      } finally {
        btn.disabled = false;
      }
    }

    async function roastGithub() {
      const url = document.getElementById('githubUrl').value.trim();
      // Extract repo name for burncard subject
      const repoMatch = url.match(/github\\.com\\/([^/]+\\/[^/]+)/);
      lastSubject = repoMatch ? repoMatch[1] : 'GitHub repo';
      const btn = document.getElementById('roastRepoBtn');
      const status = document.getElementById('githubStatus');
      const results = document.getElementById('results');

      if (!url) {
        status.textContent = 'Paste a GitHub URL first.';
        status.className = 'status error';
        return;
      }

      btn.disabled = true;
      results.className = 'results';
      startQuips(status);

      try {
        const res = await fetch('/api/review-github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong');

        stopQuips();
        renderResult(data);
        showQuota(data.quota);
        results.className = 'results visible';
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
        status.textContent = '';
      } catch (err) {
        stopQuips();
        if (err.message && err.message.match(/out of|limit|quota/i)) {
          showLimitCta(status, err.message);
        } else {
          status.textContent = err.message;
          status.className = 'status error';
        }
      } finally {
        btn.disabled = false;
      }
    }

    let lastSubject = '';

    function renderResult(data) {
      const { data: d, voice, meta } = data;

      // Sneer hero — prominent quote right after score
      var sneerEl = document.getElementById('sneerHero');
      if (voice.hardest_sneer) {
        sneerEl.textContent = '"' + voice.hardest_sneer + '"';
        sneerEl.style.display = 'block';
      } else {
        sneerEl.style.display = 'none';
      }

      // Burncard PNG — inline, clickable opens /card/:id landing page
      try {
        var shareWrap = document.getElementById('shareWrap');
        var cardSubject = lastSubject || 'your code';
        var burncardUrl = '${sallyApiUrl}/api/v1/share-card?source=cli&lang=en'
          + '&sneer=' + encodeURIComponent(voice.hardest_sneer || '')
          + '&score=' + (d.score ? d.score.toFixed(1) : '')
          + '&subject=' + encodeURIComponent(cardSubject);
        var link = document.createElement('a');
        link.href = burncardUrl;
        link.target = '_blank';
        link.style.cssText = 'display:block;cursor:pointer';
        // Cache card URL so clicks don't create duplicates
        var _cachedCardUrl = null;
        var _cardCreating = null;
        function getOrCreateCard() {
          if (_cachedCardUrl) return Promise.resolve(_cachedCardUrl);
          if (_cardCreating) return _cardCreating;
          var cardBody = {
            sneer: voice.hardest_sneer || '',
            score: d.score || undefined,
            lang: 'en',
            style: 'classic',
            subject: cardSubject,
            inputType: 'url',
            premium: false,
            source: 'cli',
          };
          if (voice.voiceBase64) {
            cardBody.burnOptions = [{ tone: 'savage', text: voice.hardest_sneer || '', voiceBase64: voice.voiceBase64 }];
            cardBody.activeIndex = 0;
          }
          _cardCreating = fetch('/api/card', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cardBody),
          })
            .then(function(r) { return r.json(); })
            .then(function(data) { _cachedCardUrl = data.url || burncardUrl; return _cachedCardUrl; })
            .catch(function() { _cachedCardUrl = burncardUrl; return _cachedCardUrl; });
          return _cardCreating;
        }
        link.onclick = function(e) {
          e.preventDefault();
          getOrCreateCard().then(function(url) { window.open(url, '_blank'); });
        };
        var img = document.createElement('img');
        img.src = burncardUrl;
        img.alt = 'Cynical Sally CLI Burncard';
        img.style.cssText = 'width:100%;display:block';
        img.onerror = function() { link.style.display = 'none'; };
        link.appendChild(img);
        shareWrap.innerHTML = '';
        shareWrap.appendChild(link);

        // Voice note player (if backend returned audio)
        if (voice.voiceBase64) {
          var vnWrap = document.createElement('div');
          vnWrap.style.cssText = 'margin-top:8px;display:flex;align-items:center;gap:8px;background:rgba(37,211,102,0.1);border:1px solid rgba(37,211,102,0.2);border-radius:12px;padding:8px 12px;cursor:pointer';
          var vnAudio = new Audio('data:audio/mpeg;base64,' + voice.voiceBase64);
          var vnPlaying = false;
          var vnBtn = document.createElement('button');
          vnBtn.style.cssText = 'width:32px;height:32px;border-radius:50%;background:#25D366;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0';
          vnBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 14 14" fill="white"><path d="M3 1.5v11l9.5-5.5z"/></svg>';
          var vnBars = document.createElement('div');
          vnBars.style.cssText = 'flex:1;display:flex;align-items:center;gap:2px;height:24px';
          var barHeights = [0.4,0.7,0.5,0.9,0.6,0.8,1.0,0.7,0.5,0.8,0.6,0.4,0.7,0.9,0.5];
          barHeights.forEach(function(h) {
            var bar = document.createElement('div');
            bar.style.cssText = 'flex:1;border-radius:99px;background:rgba(37,211,102,0.3);height:' + (h * 100) + '%;min-width:2px';
            bar.className = 'vn-bar';
            vnBars.appendChild(bar);
          });
          var vnTime = document.createElement('span');
          vnTime.style.cssText = 'font-family:monospace;font-size:11px;color:#94a3b8;width:32px;text-align:right;flex-shrink:0';
          vnTime.textContent = '0:00';
          vnAudio.addEventListener('loadedmetadata', function() {
            var s = Math.floor(vnAudio.duration); vnTime.textContent = Math.floor(s/60) + ':' + String(s%60).padStart(2,'0');
          });
          vnAudio.addEventListener('ended', function() {
            vnPlaying = false;
            vnBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 14 14" fill="white"><path d="M3 1.5v11l9.5-5.5z"/></svg>';
            vnBars.querySelectorAll('.vn-bar').forEach(function(b) { b.style.background = 'rgba(37,211,102,0.3)'; });
          });
          vnWrap.onclick = function() {
            if (vnPlaying) { vnAudio.pause(); vnPlaying = false; vnBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 14 14" fill="white"><path d="M3 1.5v11l9.5-5.5z"/></svg>'; }
            else { vnAudio.play(); vnPlaying = true; vnBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 14 14" fill="white"><rect x="2" y="1" width="3.5" height="12" rx="1"/><rect x="8.5" y="1" width="3.5" height="12" rx="1"/></svg>'; }
          };
          var vnAnimFrame;
          function vnUpdateBars() {
            if (!vnPlaying) return;
            var progress = vnAudio.currentTime / (vnAudio.duration || 1);
            var bars = vnBars.querySelectorAll('.vn-bar');
            bars.forEach(function(b, i) { b.style.background = (i / bars.length <= progress) ? '#25D366' : 'rgba(37,211,102,0.3)'; });
            var e = Math.floor(vnAudio.currentTime); vnTime.textContent = Math.floor(e/60) + ':' + String(e%60).padStart(2,'0');
            vnAnimFrame = requestAnimationFrame(vnUpdateBars);
          }
          vnAudio.addEventListener('play', function() { vnUpdateBars(); });
          vnAudio.addEventListener('pause', function() { cancelAnimationFrame(vnAnimFrame); });
          vnWrap.appendChild(vnBtn);
          vnWrap.appendChild(vnBars);
          vnWrap.appendChild(vnTime);
          shareWrap.appendChild(vnWrap);

          // MP3 download button
          var mp3Btn = document.createElement('a');
          mp3Btn.href = 'data:audio/mpeg;base64,' + voice.voiceBase64;
          mp3Btn.download = 'sally-burn.mp3';
          mp3Btn.style.cssText = 'display:inline-flex;align-items:center;gap:4px;margin-top:6px;padding:4px 10px;font-size:10px;color:#94a3b8;background:#1e293b;border:1px solid #334155;border-radius:6px;text-decoration:none';
          mp3Btn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> MP3';
          shareWrap.appendChild(mp3Btn);
        }

        // Build X/Twitter share URL — create card link for share
        var tweetScore = d.score ? d.score.toFixed(1) + '/10' : '';
        var tweetSneer = voice.hardest_sneer || '';
        // Create card for X share async — reuse cached card URL
        (function() {
          getOrCreateCard()
            .then(function(shareLink) {
              var tweetText = 'Sally roasted my code: ' + tweetScore + '\\n\\n"' + tweetSneer + '"\\n\\nGet roasted: cynicalsally.com';
              var xUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweetText) + '&url=' + encodeURIComponent(shareLink);
              var xBtn = document.getElementById('shareXBtn');
              if (xBtn) { xBtn.href = xUrl; }
            })
            .catch(function() {
              var tweetText = 'Sally roasted my code: ' + tweetScore + '\\n\\n"' + tweetSneer + '"\\n\\nGet roasted: cynicalsally.com\\n\\nMy burncard:';
              var xUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweetText) + '&url=' + encodeURIComponent(burncardUrl);
              var xBtn = document.getElementById('shareXBtn');
              if (xBtn) { xBtn.href = xUrl; }
            });
        })();
      } catch (e) {
        console.error('[share]', e);
      }

      // Score
      const score = d.score;
      const badge = document.getElementById('scoreBadge');
      badge.textContent = score + '/10';
      badge.className = 'score-badge ' + (score < 4 ? 'score-low' : score < 7 ? 'score-mid' : 'score-high');
      document.getElementById('scoreBar').style.width = (score * 10) + '%';

      // Roast — render as sections if messages available, fallback to plain text
      var roastHtml = '';
      if (d.messages && d.messages.length > 0) {
        roastHtml = d.messages.map(m => {
          if (m.type === 'intro') {
            return '<p style="margin-bottom:1rem;color:#ccc;font-size:0.9rem">' + escapeHtml(m.text) + '</p>';
          }
          if (m.type === 'observation' && m.title) {
            return '<div style="margin-bottom:1.25rem">'
              + '<h4 style="color:#e8503a;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.4rem">' + escapeHtml(m.title) + '</h4>'
              + '<p style="color:#bbb;line-height:1.7">' + escapeHtml(m.text) + '</p>'
              + '</div>';
          }
          if (m.type === 'final') {
            return '<div style="margin-top:1rem;padding-top:1rem;border-top:1px solid #2a2a2a">'
              + '<p style="color:#e0e0e0;font-weight:500;line-height:1.7">' + escapeHtml(m.text) + '</p>'
              + '</div>';
          }
          return '<p style="margin-bottom:0.75rem;color:#bbb">' + escapeHtml(m.text) + '</p>';
        }).join('');
      } else {
        roastHtml = voice.roast
          .split('\\n\\n')
          .map(p => '<p style="margin-bottom:0.75rem">' + escapeHtml(p) + '</p>')
          .join('');
      }
      document.getElementById('roastText').innerHTML = roastHtml;
      document.getElementById('roastPreview').innerHTML = roastHtml;

      // Issues
      const issuesList = document.getElementById('issuesList');
      issuesList.innerHTML = '';
      if (d.issues && d.issues.length > 0) {
        d.issues.forEach(issue => {
          const sevClass = issue.severity === 'critical' ? 'sev-critical' : issue.severity === 'major' ? 'sev-major' : 'sev-minor';
          issuesList.innerHTML += '<div class="issue">'
            + '<div class="issue-header">'
            + '<span class="severity ' + sevClass + '">' + escapeHtml(issue.severity) + '</span>'
            + '<span class="issue-title">' + escapeHtml(issue.title) + '</span>'
            + '</div>'
            + (issue.description ? '<div class="issue-desc">' + escapeHtml(issue.description) + '</div>' : '')
            + (issue.fix ? '<div class="issue-fix">&#10003; ' + escapeHtml(issue.fix) + '</div>' : '')
            + '</div>';
        });
      }

      // Fixes
      const fixesList = document.getElementById('fixesList');
      fixesList.innerHTML = '';
      if (d.actionable_fixes && d.actionable_fixes.length > 0) {
        d.actionable_fixes.forEach(fix => {
          fixesList.innerHTML += '<div class="issue" style="border-left:2px solid #22c55e">&#10003; ' + escapeHtml(fix) + '</div>';
        });
      }

      // Bright side + sneer
      document.getElementById('brightSide').textContent = voice.bright_side || '';
      document.getElementById('hardestSneer').textContent = voice.hardest_sneer || '';
    }

    function showQuota(quota) {
      const bar = document.getElementById('quotaBar');
      const badge = document.getElementById('quotaBadge');
      const count = document.getElementById('quotaCount');
      if (!quota || quota.remaining === undefined) return;

      const remaining = Math.max(0, quota.remaining);
      const limit = quota.limit;
      count.textContent = remaining + '/' + limit + ' reviews left today';
      badge.className = remaining === 0 ? 'quota-badge exhausted' : 'quota-badge';
      bar.className = 'quota-bar visible';
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Tab support in textarea
    document.getElementById('code').addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 2;
      }
    });
  </script>
</body>
</html>`;
}
