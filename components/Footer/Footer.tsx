import classNames from 'classnames'
import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'

import { PoolTypesResponseData } from '@/api'
import { LogoDark } from '@/assets/icons'
import { nflPools, nbaPools, nhlPools, mlbPools, golfPools } from '@/assets/img'
import { routes } from '@/config/constants'
import { useGetPoolTypes } from '@/helpers'

import styles from './Footer.module.scss'

const addMenu = [
  { name: 'Terms of Use', link: '/' },
  { name: 'Privacy Policy', link: '/' },
  { name: 'Interest-Based Ads', link: '/' },
  { name: 'Privacy Rights', link: '/' },
  { name: 'Cookie Policy', link: '/' },
  { name: 'Manage Privacy Preferences', link: '/' },
]

const icons = {
  NFL: nflPools,
  NBA: nbaPools,
  NHL: nhlPools,
  MLB: mlbPools,
  PGA: golfPools,
}

export default function Footer() {
  const { poolTypesData } = useGetPoolTypes()

  function handling(titleArr: string[]) {
    const arr = titleArr.reduce<{
      [key: string]: {
        id: number | 'other'
        sportId: number | 'other'
        arr: PoolTypesResponseData[]
      }
    }>((acc, title) => {
      const poolType = poolTypesData.find(
        (item) => item.tournament.name === title,
      )

      if (!poolType) return acc

      acc[poolType.tournament.name] = {
        id: poolType.tournament.id,
        sportId: poolType.sport.id,
        arr: poolTypesData.filter((item) => item.tournament.name === title),
      }

      return acc
    }, {})

    arr['Other'] = {
      id: 'other',
      sportId: 'other',
      arr: poolTypesData.filter(
        (item) => !titleArr.includes(item.tournament.name),
      ),
    }

    return arr
  }

  const obj = handling(['NFL', 'NBA', 'NHL', 'MLB', 'PGA'])

  return (
    <footer className="main-wrapper">
      <div className={styles.footer}>
        <div className={styles.footerWrapper}>
          <div className={styles.columns}>
            {Object.entries(obj).map(([key, menuItem]) => {
              const img: StaticImageData | undefined =
                icons[key as keyof typeof icons]

              return (
                <div
                  className={classNames(styles.column, { [styles.wide]: !img })}
                  key={key}
                >
                  {img && (
                    <div>
                      <Image src={img.src} alt={key} width={24} height={24} />
                    </div>
                  )}

                  <div className={styles.list}>
                    <div>
                      <span className={styles.title}>
                        <Link
                          href={`${routes.poolCreating.index}${
                            menuItem.sportId !== 'other'
                              ? `?sport=${menuItem.sportId}`
                              : ''
                          }`}
                        >
                          {key} pools
                        </Link>
                      </span>
                    </div>

                    <div className={styles.linksWrapper}>
                      {menuItem.arr.map((link, i) => (
                        <Link
                          href={routes.poolCreating.step2(link.id)}
                          className={styles.link}
                          key={i}
                        >
                          {link.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className={styles.separator} />
          <div className={styles.bottom}>
            <Link href={routes.index}>
              <LogoDark className={styles.logo} />
            </Link>

            <div className={styles.addMenu}>
              {addMenu.map((item, i) => (
                <Link href={item.link} key={i} className={styles.addLink}>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
