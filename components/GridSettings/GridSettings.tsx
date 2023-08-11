import { useRouter } from 'next/router'

import { Cross } from '@/assets/icons'
import { GridSetSettings } from '@/features/components/GridSetSettings'
import { useGetGridSettings } from '@/helpers'

import styles from './GridSettings.module.scss'

export function GridSettings({
  closeSettings,
  customGridId,
}: {
  closeSettings: () => void
  customGridId?: number | null
}) {
  const {
    query: { grid_id, poolId },
  } = useRouter()

  const gridId = customGridId ?? grid_id

  const { gridSettingsData } = useGetGridSettings({
    poolId: Number(poolId),
    gridId: gridId ? Number(gridId) : undefined,
  })

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Grid settings</h3>
      <div className={styles.close} onClick={closeSettings}>
        <Cross width={13} height={13} className={styles.closeIcon} />
      </div>

      <GridSetSettings
        settingsData={gridSettingsData}
        closeSettings={closeSettings}
        customGridId={Number(gridId)}
      />
    </div>
  )
}
