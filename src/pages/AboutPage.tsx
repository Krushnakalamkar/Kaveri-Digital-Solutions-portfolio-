import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { PageHero } from '../components/PageHero';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

const areas = [
  ['01', 'Technology', 'Web, software, apps & AI solutions.'],
  ['02', 'Creative', 'Design, video, content & social media.'],
  ['03', 'Digital Support', 'Data, documents, research & business support.'],
];

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { db } = useCMS();

  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <>
      <PageHero
        eyebrow={`ABOUT / ${db.profile.name.toUpperCase()}`}
        title={
          <>
            A little
            <br />
            <em>about me.</em>
          </>
        }
        subtitle={`${db.profile.title} · ${db.profile.location}`}
      />
      <section className="content-section about-page-copy">
        <p className="eyebrow burgundy">{db.profile.title}</p>
        <h2 className="display section-heading">
          Hello, I’m
          <br />
          <em>{db.profile.name}.</em>
        </h2>
        <p className="about-copy">{db.profile.biography}</p>
        <div className="editorial-grid">
          {areas.map(([number, title, text]) => (
            <article className="editorial-item" key={number}>
              <span>{number}</span>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="about-cta">
          <p className="eyebrow">Have an idea to move forward?</p>
          <a
            href="/contact"
            onClick={(e) => handleNav(e, '/contact')}
            className="dark-text-link"
          >
            Start a conversation <ArrowUpRight size={16} />
          </a>
        </div>
      </section>
    </>
  );
};
