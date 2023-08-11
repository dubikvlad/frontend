import classNames from 'classnames'
import Link from 'next/link'

import { PickemIcon } from '@/assets/icons'

import styles from './CardWithButtonAndIcon.module.scss'

export type CardWithButtonAndIconProps = {
  props: {
    title: string
    desc: string
    buttonText: string
    link?: string | null
    action?: () => void
    icon?: ({
      width,
      height,
      fill,
    }: {
      width?: number
      height?: number
      fill?: string
    }) => JSX.Element
  }
}

export function CardWithButtonAndIcon({ props }: CardWithButtonAndIconProps) {
  const Icon = props?.icon
  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        <p>{props.title}</p>
        {Icon ? <Icon height={50} /> : <PickemIcon />}
      </div>

      <p className={styles.description}>{props.desc}</p>

      <div className={styles.buttonWrapper}>
        {props.link ? (
          <Link
            href={props.link}
            className={styles.button}
            onClick={props.action}
          >
            <button className="button button-blue-light">
              {props.buttonText}
            </button>
          </Link>
        ) : (
          <button
            className={classNames('button', 'button-blue-light', styles.button)}
            onClick={props.action}
          >
            {props.buttonText}
          </button>
        )}
      </div>
    </div>
  )
}
