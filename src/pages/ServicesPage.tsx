import React from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { PageHero } from '../components/PageHero';
import { CategoryIcon } from '../components/CategoryIcon';

interface ServicesPageProps {
  slug?: string;
  onNavigate: (path: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ slug, onNavigate }) => {
  const { db } = useCMS();
  const activeServices = db.services.filter((s) => s.active);
  const sortedCategories = [...db.categories].sort((a, b) => a.order - b.order);

  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  if (slug) {
    const matchedCategory = sortedCategories.find((c) => c.slug === slug);
    const matchedService = activeServices.find((s) => s.slug === slug);

    if (matchedCategory) {
      const catServices = activeServices
        .filter((s) => s.categoryId === matchedCategory.id)
        .sort((a, b) => a.order - b.order);

      return (
        <>
          <PageHero
            eyebrow={`SERVICES / ${matchedCategory.name.toUpperCase()}`}
            title={
              <>
                {matchedCategory.name}
                <em>.</em>
              </>
            }
            subtitle={matchedCategory.description}
          />
          <section className="content-section narrow">
            <a
              href="/services"
              onClick={(e) => handleNav(e, '/services')}
              className="dark-text-link"
            >
              <ArrowLeft size={15} /> All services
            </a>
            {matchedCategory.description ? (
              <p className="detail-description">{matchedCategory.description}</p>
            ) : null}
            {catServices.length ? (
              <div className="category-services">
                {catServices.map((item, i) => (
                  <p key={item.id}>
                    <i>{String(i + 1).padStart(2, '0')}</i>
                    <a
                      href={`/services/${item.slug}`}
                      onClick={(e) => handleNav(e, `/services/${item.slug}`)}
                    >
                      {item.name}
                    </a>
                  </p>
                ))}
              </div>
            ) : null}
            <a
              href="/contact"
              onClick={(e) => handleNav(e, '/contact')}
              className="button-primary focus-ring"
            >
              Discuss a project <ArrowUpRight size={16} />
            </a>
          </section>
        </>
      );
    }

    if (matchedService) {
      const parentCat = sortedCategories.find((c) => c.id === matchedService.categoryId);
      return (
        <>
          <PageHero
            eyebrow={`SERVICES / ${parentCat ? parentCat.name.toUpperCase() : 'SERVICE'}`}
            title={
              <>
                {matchedService.name}
                <em>.</em>
              </>
            }
            subtitle={matchedService.description}
          />
          <section className="content-section narrow">
            <a
              href="/services"
              onClick={(e) => handleNav(e, '/services')}
              className="dark-text-link"
            >
              <ArrowLeft size={15} /> All services
            </a>
            {matchedService.description ? (
              <p className="detail-description">{matchedService.description}</p>
            ) : (
              <p className="data-empty-note">Additional service details will be published here.</p>
            )}
            <a
              href={`/contact?service=${encodeURIComponent(matchedService.name)}`}
              onClick={(e) =>
                handleNav(e, `/contact?service=${encodeURIComponent(matchedService.name)}`)
              }
              className="button-primary focus-ring"
            >
              Discuss a project <ArrowUpRight size={16} />
            </a>
          </section>
        </>
      );
    }
  }

  return (
    <>
      <PageHero
        eyebrow="SERVICES / DIGITAL SOLUTIONS"
        title={
          <>
            What I Can Help
            <br />
            <em>You Build.</em>
          </>
        }
        subtitle="A flexible mix of development, AI-led solutions and creative digital support."
      />
      <section className="content-section">
        <div className="section-topline">
          <p className="eyebrow">Services / By category</p>
          <span>FROM KRUSHNA KALAMKAR</span>
        </div>
        <div style={{ paddingTop: 25 }}>
          <div className="category-list">
            {sortedCategories.map((category, index) => {
              const matching = activeServices
                .filter((s) => s.categoryId === category.id)
                .sort((a, b) => a.order - b.order);

              return (
                <details className="category-disclosure" key={category.id}>
                  <summary>
                    <span className="cat-ic">
                      <CategoryIcon icon={category.icon} size={20} />
                    </span>
                    {category.name}
                    <span>{matching.length} SERVICES</span>
                  </summary>
                  {matching.length > 0 ? (
                    <div className="category-services">
                      {matching.map((service, i) => (
                        <p key={service.id || `${index}-${i}`}>
                          <i>{String(i + 1).padStart(2, '0')}</i>
                          <a
                            href={`/services/${service.slug}`}
                            onClick={(e) => handleNav(e, `/services/${service.slug}`)}
                          >
                            {service.name}
                          </a>
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="service-category-note">
                      No services currently available in this category.
                    </p>
                  )}
                  <a
                    href={`/services/${category.slug}`}
                    onClick={(e) => handleNav(e, `/services/${category.slug}`)}
                    className="dark-text-link category-detail-link"
                  >
                    Explore {category.name} <ArrowUpRight size={14} />
                  </a>
                </details>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};
