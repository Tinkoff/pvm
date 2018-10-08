/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from './styles.module.css'

const features = [
  {
    title: <>Any number of packages</>,
    imageUrl: 'img/undraw_dilvers_pkg.svg',
    description: (
      <>
        Pvm supports both multi-package (aka monorepository) and single-package repositories.
      </>
    ),
  },
  {
    title: <></>,
    imageUrl: 'img/undraw_analyze_17kw.svg',
    description: (
      <>
        Covered by tests
      </>
    ),
  },
  {
    title: <>Easy to configure and extend</>,
    imageUrl: 'img/undraw_coding_6mjf.svg',
    description: (
      <>
        Via .pvm.toml file and plugins you can configure and extend behavior of your releasing process.
      </>
    ),
  },
];

function Home() {
  const context = useDocusaurusContext()
  const { siteConfig = {} } = context

  return (
    <Layout
      title={siteConfig.title}
      description={siteConfig.tagline}
    >
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">
            <img src={useBaseUrl('img/pvm.svg')} alt="logo" className={styles.heroLogo }/>
            <span>{siteConfig.title}</span>
          </h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(styles.getStartedBtn, 'button button--secondary button--lg')}
              to={useBaseUrl('docs/book/get-started/overview')}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length && (
          <section className={styles.section}>
            <div className="container text--center margin-bottom--xl">
              <div className="row">
                {features.map(({ imageUrl, title, description }, idx) => (
                  <div
                    key={idx}
                    className={clsx('col col--4', styles.feature)}
                  >
                    {imageUrl && (
                      <div className="text--center">
                        <img
                          className={styles.featureImage}
                          src={useBaseUrl(imageUrl)}
                          alt={title}
                        />
                      </div>
                    )}
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="container text--center">
              <div className="row">
                <div className="col col--4 col--offset-1">
                  <img src={useBaseUrl('img/undraw_Selection_re_poer.svg')} alt="Automatic changelog generation"/>
                  <h3>Automatic changelog generation</h3>
                  <p className="padding-horiz--md">
                    Pvm can automatically maintain changelog for you.
                    You can choose one of built-in renderers or
                    &nbsp;<Link to='https://github.com/conventional-changelog/conventional-changelog'>conventional-changelog</Link>&nbsp;
                    for convert your commit messages to changelogs.
                  </p>
                </div>
                <div className="col col--4 col--offset-2">
                  <img src={useBaseUrl('img/undraw_reminders_697p.svg')} alt="Slack notifications"/>
                  <h3>Slack notifications</h3>
                  <p className="padding-horiz--md">
                    After success release pvm can notify team about published packages with link to updated changelog.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  )
}

export default Home
