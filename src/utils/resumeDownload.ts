import { ProfileData, SkillItem, ServiceCategory, ServiceItem } from '../data/seed';

export function triggerResumeDownload(
  profile: ProfileData,
  resumePdfDataUrl: string,
  resumeFileName: string,
  skills: SkillItem[],
  categories: ServiceCategory[],
  services: ServiceItem[]
) {
  if (resumePdfDataUrl && resumePdfDataUrl.startsWith('data:')) {
    const link = document.createElement('a');
    link.href = resumePdfDataUrl;
    link.download = resumeFileName || 'Krushna-Kalamkar-Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Generate clean printable HTML Resume document
  const activeSkills = skills.filter((s) => s.active).map((s) => s.name);
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${profile.name} — Résumé</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0B1220;
      background: #FFFFFF;
      max-width: 840px;
      margin: 40px auto;
      padding: 0 28px;
      line-height: 1.6;
    }
    header {
      border-bottom: 3px solid #6D001A;
      padding-bottom: 20px;
      margin-bottom: 28px;
    }
    h1 {
      font-family: Georgia, serif;
      font-size: 34px;
      margin: 0 0 6px 0;
      color: #061E5C;
    }
    .subtitle {
      font-size: 16px;
      font-weight: 600;
      color: #6D001A;
      margin-bottom: 8px;
    }
    .meta {
      font-size: 13px;
      color: #475569;
    }
    h2 {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6D001A;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 6px;
      margin-top: 28px;
    }
    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
    .skill {
      font-size: 13px;
      padding: 4px 10px;
      background: #F4F7FE;
      border: 1px solid #DCE6F5;
      border-radius: 4px;
    }
    .cat-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-top: 12px;
    }
    .cat-box h3 {
      font-size: 15px;
      margin: 0 0 4px 0;
      color: #061E5C;
    }
    .cat-box p {
      font-size: 12px;
      color: #334155;
      margin: 0;
    }
  </style>
</head>
<body>
  <header>
    <h1>${profile.name}</h1>
    <div class="subtitle">${profile.title} · ${profile.subtitleRole} (${profile.experience})</div>
    <div class="meta">
      ${profile.location} · Primary: ${profile.primaryEmail} · Business: ${profile.businessEmail} · Phone: ${profile.phone}
    </div>
  </header>

  <section>
    <h2>Executive Summary</h2>
    <p>${profile.biography}</p>
  </section>

  <section>
    <h2>Core Competencies & Skills</h2>
    <div class="skills">
      ${activeSkills.map((sk) => `<span class="skill">${sk}</span>`).join('')}
    </div>
  </section>

  <section>
    <h2>Leadership & Studio Experience</h2>
    <p><strong>Founder, Developer & AI Engineer — KAVERI DIGITAL SOLUTIONS</strong> (${profile.experience})</p>
    <ul>
      <li>Founded and scaled a full-spectrum digital studio delivering 47 specialized services across Web & Technology, AI & Digital, Creative, Data & Office, Content, and Digital Support.</li>
      <li>Architected responsive web applications, WordPress & e-commerce stores, and practical AI workflow automations for individuals, startups, and businesses.</li>
      <li>Led end-to-end delivery from UI/UX design and full-stack development to SEO, digital marketing, and creative production.</li>
    </ul>
  </section>

  <section>
    <h2>Service Pillars (${services.filter((s) => s.active).length} Active Offerings)</h2>
    <div class="cat-grid">
      ${categories
        .map((c) => {
          const catServices = services
            .filter((s) => s.categoryId === c.id && s.active)
            .map((s) => s.name)
            .join(', ');
          return `<div class="cat-box"><h3>${c.name}</h3><p>${catServices}</p></div>`;
        })
        .join('')}
    </div>
  </section>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Krushna-Kalamkar-Kaveri-Resume.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
