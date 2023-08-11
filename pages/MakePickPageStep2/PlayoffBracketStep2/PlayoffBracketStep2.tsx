import { BracketPlayoffEntryItem, Pool } from '@/api'
import { Info } from '@/assets/icons'
import { PlayoffBracketStep2SeriesLengthPicks } from '@/features/components'

import styles from './PlayoffBracketStep2.module.scss'

export default function PlayoffBracketStep2({
  poolData,
  entry,
}: {
  poolData: Pool<'bracket'>
  entry: BracketPlayoffEntryItem
}) {
  if (!entry) return <div>Loading...</div>
  return (
    <div className={styles.main}>
      <h1>
        Make a PLAYOFF BRACKET pick <Info />
      </h1>
      <h2>step 2/2 - series length</h2>
      <p className={styles.descriptionText}>{poolData.pool_type.description}</p>
      <PlayoffBracketStep2SeriesLengthPicks entry={entry} poolData={poolData} />
    </div>
  )
}
