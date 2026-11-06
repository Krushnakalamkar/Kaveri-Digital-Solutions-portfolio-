import React from 'react';

interface PageHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
}

export const PageHero: React.FC<PageHeroProps> = ({ eyebrow, title, subtitle }) => {
  return (
    <section className="page-hero">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </section>
  );
};
