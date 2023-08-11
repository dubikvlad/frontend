import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'

import { MonthLeftArrow } from '@/assets/icons'
import { leaguesByPoolType, routes } from '@/config/constants'
import { useAdaptiveBreakpoints } from '@/helpers'

import styles from './StartNewPoolDescriptionBlock.module.scss'

type StartNewPoolDescriptionBlockProps = {
  title: string
  description: string
  tournamentExternalId: number | string
}

export function StartNewPoolDescriptionBlock({
  title = '',
  description = '',
  tournamentExternalId,
}: StartNewPoolDescriptionBlockProps) {
  const { isBreakpointPassed } = useAdaptiveBreakpoints(['xl', 'sm'])

  const isXlBreakpointPassed = isBreakpointPassed('xl')
  const isSmBreakpointPassed = isBreakpointPassed('sm')

  const image: StaticImageData | undefined =
    leaguesByPoolType[String(tournamentExternalId)]

  return (
    <div className={styles.descriptionWrapper}>
      <div className={styles.descriptionBlock}>
        {isSmBreakpointPassed && (
          <Link
            href={routes.poolCreating.index}
            className={styles.smLink}
          ></Link>
        )}

        <div className={styles.titleWrapper}>
          {isSmBreakpointPassed && (
            <MonthLeftArrow className={styles.leftArrow} />
          )}
          {image && (
            <Image
              src={image.src}
              width={image.width}
              height={image.height}
              alt="League image"
            />
          )}
          <p className={styles.title}>{title}</p>
          {isXlBreakpointPassed && !isSmBreakpointPassed && (
            <Link href={routes.poolCreating.index}>Select other pool</Link>
          )}
        </div>

        {!isSmBreakpointPassed && (
          <div className={styles.descriptionBlockWrapper}>
            <p
              className={styles.descriptionText}
              dangerouslySetInnerHTML={{ __html: description }}
            ></p>

            {!isXlBreakpointPassed && (
              <Link href={routes.poolCreating.index}>
                <button className="button button-blue-outline fit">
                  Select other pool
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
