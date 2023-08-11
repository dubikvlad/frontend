import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { MemberPickMaintenance, IssueMulligans } from '@/assets/icons'
import { CardWithButtonAndIcon } from '@/features/components'
import type { CardWithButtonAndIconProps } from '@/features/components/CardWithButtonAndIcon'
import { usePool } from '@/helpers'

import styles from './PickManagement.module.scss'

const MemberPickMaintenanceLazy = dynamic(
  () =>
    import('@/features/components/MemberPickMaintenance').then(
      (mod) => mod.MemberPickMaintenance,
    ),
  { loading: () => <p>Loading...</p> },
)

const IssueMulligansLazy = dynamic(
  () =>
    import('@/features/components/IssueMulligasCommish').then(
      (mod) => mod.IssueMulligasCommish,
    ),
  { loading: () => <p>Loading...</p> },
)

export default function PickManagement() {
  const {
    query: { poolId },
  } = useRouter()

  const [activeTab, setActiveTab] = useState<
    'member-pick-maintenance' | 'issue-mulligans' | null
  >(null)

  const [content, setContent] = useState<CardWithButtonAndIconProps['props'][]>(
    [],
  )

  const { poolData } = usePool(Number(poolId))

  useEffect(() => {
    if (poolData) {
      const content: CardWithButtonAndIconProps['props'][] = []

      if (
        poolData.type === 'pick_em' ||
        poolData.type === 'survivor' ||
        poolData.type === 'bracket' ||
        poolData.type === 'golf_pick_x'
      ) {
        content.push({
          title: 'Member Pick Maintenance',
          desc: `This page shows all of your members, along with their chosen entry count for this year. Members from previous years who have not yet returned will be listed as Participation TBD. You can edit members individually by clicking on their row, or edit multiple members at a time by clicking the 'Edit Mode' button at the top.`,
          buttonText: 'Go to page',
          link: null,
          icon: MemberPickMaintenance,
          action: () => setActiveTab('member-pick-maintenance'),
        })
      }

      // ? пока что pick log страницы нет
      // content.push({
      //   title: 'Pick Log',
      //   desc: `The pick log contains a time stamped copy of your members' picks every time they are submitted. This data is stored separately from your members' current pick submission to ensure redundancy.`,
      //   buttonText: 'Go to page',
      //   link: '#pick-log',
      //   icon: PickLog,
      // })

      if (poolData.type === 'survivor') {
        content.push({
          title: 'Issue Mulligans',
          desc: `Revive a Member after a loss`,
          buttonText: 'Go to page',
          link: null,
          icon: IssueMulligans,
          action: () => setActiveTab('issue-mulligans'),
        })
      }

      setContent(content)
    }
  }, [poolData])

  return (
    <div className={styles.wrapper}>
      {!!content.length && activeTab === null && (
        <div className={styles.cardsWrapper}>
          {content.map((item, i) => (
            <CardWithButtonAndIcon props={item} key={i} />
          ))}
        </div>
      )}

      {activeTab === 'member-pick-maintenance' && <MemberPickMaintenanceLazy />}
      {activeTab === 'issue-mulligans' && <IssueMulligansLazy />}
    </div>
  )
}
