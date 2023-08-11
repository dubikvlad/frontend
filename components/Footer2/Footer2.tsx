import Link from 'next/link'

import { LogoDark } from '@/assets/icons'
import { routes } from '@/config/constants'

import styles from './Footer2.module.scss'

const menu = [
  { name: 'Terms of Use', link: '/' },
  { name: 'Privacy Policy', link: '/' },
  { name: 'Interest-Based Ads', link: '/' },
  { name: 'Privacy Rights', link: '/' },
  { name: 'Cookie Policy', link: '/' },
  { name: 'Manage Privacy Preferences', link: '/' },
]

export default function Footer2() {
  return (
    <footer className="main-wrapper main-wrapper-without-padding">
      <div className={styles.wrapper}>
        <Link href={routes.index}>
          <LogoDark className={styles.logo} />
        </Link>

        <ul className={styles.menu}>
          {menu.map((item, i) => (
            <li key={i}>
              <Link href={item.link}>{item.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
