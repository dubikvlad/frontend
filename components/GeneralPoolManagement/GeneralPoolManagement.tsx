import { useRouter } from 'next/router'

import { PoolSettings, PayPoolFee } from '@/assets/icons'
import { routes } from '@/config/constants'
import { CardWithButtonAndIcon } from '@/features/components'

import styles from './GeneralPoolManagement.module.scss'

export default function GeneralPoolManagement() {
  const {
    query: { poolId },
  } = useRouter()

  const tabsContent = [
    {
      title: 'Pool Settings',
      desc: 'Configure your Pool Settings. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchange',
      buttonText: 'Go to page',
      link: routes.account.editPool(Number(poolId)),
      icon: PoolSettings,
    },
    {
      title: 'Pay Pool Fee',
      desc: 'Submit payment for your pool.. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchange',
      buttonText: 'Go to page',
      link: routes.account.commish.payment(Number(poolId)),
      icon: PayPoolFee,
    },
  ]

  return (
    <div className={styles.wrapper}>
      {tabsContent.map((item, i) => (
        <CardWithButtonAndIcon props={item} key={i} />
      ))}
    </div>
  )
}
