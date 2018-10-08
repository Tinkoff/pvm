import React from 'react'

import styles from './slack-release.module.css'

export function Message(props) {
  return (
    <div className={styles.message}>
      {props.lines.map(lineDef => {
        return <span key={lineDef.join(',')}>{lineDef.map(item => {
          if (/^[A-Z]{3,}-\d+$/.test(item)) {
            return <span key={item} className={styles.pLink}>{item}&nbsp;</span>
          }
          return <span key={item}>{item}</span>
        })}</span>
      })}
    </div>
  )
}

export const Release = (props) => {
  return (
    <div className={styles.body}>
      <div className={styles.appTitle}>{props.appTitle}</div>
      <div className={styles.releaseTitle}>{props.releaseTitle}</div>
      <Message lines={props.lines} />
    </div>
  )
}

export const ReleaseWithPackages = (props) => {
  return (
    <div className={styles.body}>
      <div className={styles.appTitle}>{props.appTitle}</div>
      <div className={styles.releaseTitle}>{props.releaseTitle}</div>
      <Message lines={props.lines} />
      <div className={styles.published}>
        <strong>Published packages</strong>
        <ul className={styles.packagesList}>
          {props.packages.map(pkg => {
            return <li key={pkg}>{pkg}</li>
          })}
        </ul>
      </div>
    </div>
  )
}

