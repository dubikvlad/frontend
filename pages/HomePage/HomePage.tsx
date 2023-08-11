import classNames from 'classnames'
import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { HomePageBackgroundBanner, More, Star } from '@/assets/icons'
import * as benefitsIcons from '@/assets/icons/benefits-icons'
import * as sportsIcons from '@/assets/icons/sports-icons'
import { homePagePlayer } from '@/assets/img'
import { routes } from '@/config/constants'
import { AccountTabs } from '@/features/components'

import styles from './HomePage.module.scss'

const sportsArr = [
  { title: 'Football', icon: sportsIcons.Football, link: '#' },
  { title: 'College Football', icon: sportsIcons.CollegeFootball, link: '#' },
  { title: 'Baseball', icon: sportsIcons.Baseball, link: '#' },
  { title: 'Basketball', icon: sportsIcons.Basketball, link: '#' },
  {
    title: 'College Basketball',
    icon: sportsIcons.CollegeBasketball,
    link: '#',
  },
  { title: 'Hockey', icon: sportsIcons.Hockey, link: '#' },
  { title: 'Golf', icon: sportsIcons.Golf, link: '#' },
  { title: 'More', icon: More, link: '#' },
]

const benefitsArr = [
  {
    title: 'Easy Setup',
    subtitle:
      'Your pool will be up and running in minutes, ready to invite members.',
    icon: benefitsIcons.EasySetup,
  },
  {
    title: 'No Obligation',
    subtitle:
      'Your pool will be up and running in minutes, ready to invite members.',
    icon: benefitsIcons.NoObligation,
  },
  {
    title: 'Automatic Deadlines',
    subtitle: 'Picks are locked down at the beginning of each week of games.',
    icon: benefitsIcons.AutomaticDeadlines,
  },
  {
    title: 'Real-time Updating',
    subtitle: 'Standings and reports will be updated as games end.',
    icon: benefitsIcons.RealTimeUpdating,
  },
  {
    title: 'Configuration Options',
    subtitle:
      'Lots of scoring and configuration options for the Administrator.',
    icon: benefitsIcons.ConfigurationOptions,
  },
  {
    title: 'Detailed Reporting',
    subtitle: 'Pick summaries, weekly and year-to-date leaderboard, and more.',
    icon: benefitsIcons.DetailedReporting,
  },
]

const sportCategories = [
  'Football',
  'Basketball',
  'College basketball',
  'Golf',
  'Baseball',
  'Hockey',
] as const

type SportCategoriesKeys = typeof sportCategories[number]

type SportCategoriesTabData = {
  [key in SportCategoriesKeys]: {
    title: string
    subtitle: string | null
    description: string
    image: StaticImageData | null
  }
}

const sportCategoriesTabData: SportCategoriesTabData = {
  Football: {
    title: 'RUNNING YOUR NFL POOL HAS NEVER BEEN SO EASY!',
    subtitle: 'Regular season and Playoff formats available',
    description:
      'Choose from 8 different NFL football pool formats, which can be started at any point during the season.',
    image: null,
  },
  Basketball: {
    title: `Keep the excitement going with a season-long NBA pool!`,
    subtitle: `You can start a new pool at any time during the season!`,
    description: `We simplify everything for not just your members, but you as well. Just spend a few minutes setting up your pool, selecting a few options, inviting members and viola! You'll have a full NBA season's worth of fun at your fingertips.`,
    image: null,
  },
  'College basketball': {
    title: `When March rolls around, be confident that your pool host is up to the task`,
    subtitle: null,
    description: `We offer 5 different formats for the Men's NCAA Basketball Tournament. Configurable scoring options are available.`,
    image: null,
  },
  Golf: {
    title: `We've got your Golf pool covered from tee to green!`,
    subtitle: `Multiple pool formats with many pick and scoring options.`,
    description: `Whether you want to run a pool for the Majors or a weekly fantasy pool, we have a format that will meet your needs.`,
    image: null,
  },

  Baseball: {
    title: `The easiest way to run your pool this Baseball Season`,
    subtitle: `You can start a new pool at any time during the season!`,
    description: `While America's past time isn't traditionally associated with office pools, we currently offers four great baseball pool formats to choose from.`,
    image: null,
  },
  Hockey: {
    title: `Make sure you're ready when the puck drops with our NHL Hockey Pools`,
    subtitle: `Regular season and playoff formats available.`,
    description: `Run your Stanley Cup Playoff Bracket pool online this year. Our customizable scoring system allows for flexibility for the Pool Commissioner.`,
    image: null,
  },
}

const commentsArr = [
  [
    {
      title: 'Anita Clark',
      text: `We've run both a March Madness and a Pro Football Pool through UPOOL. It's easy to set-up and easy for the players to use (with over 1000 players, that was very important to us). But what I was most impressed with compared to other sites we have used, is the quick response we received if we had any questions or concerns. Top notch service.`,
      stars: 5,
      image: null,
    },
    {
      title: 'Anita Clark',
      text: `We've run both a March Madness and a Pro Football Pool through UPOOL. It's easy to set-up and easy for the players to use (with over 1000 players, that was very important to us). But what I was most impressed with compared to other sites we have used, is the quick response we received if we had any questions or concerns. Top notch service.`,
      stars: 3,
      image: null,
    },
    {
      title: 'Anita Clark',
      text: `We've run both a March Madness and a Pro Football Pool through UPOOL. It's easy to set-up and easy for the players to use (with over 1000 players, that was very important to us). But what I was most impressed with compared to other sites we have used, is the quick response we received if we had any questions or concerns. Top notch service.`,
      stars: 4,
      image: null,
    },
  ],
  [
    {
      title: 'Anita Clark',
      text: `We've run both a March Madness and a Pro Football Pool through UPOOL. It's easy to set-up and easy for the players to use (with over 1000 players, that was very important to us). But what I was most impressed with compared to other sites we have used, is the quick response we received if we had any questions or concerns. Top notch service.`,
      stars: 4,
      image: null,
    },
    {
      title: 'Anita Clark',
      text: `We've run both a March Madness and a Pro Football Pool through UPOOL. It's easy to set-up and easy for the players to use (with over 1000 players, that was very important to us). But what I was most impressed with compared to other sites we have used, is the quick response we received if we had any questions or concerns. Top notch service.`,
      stars: 5,
      image: null,
    },
  ],
]

export function HomePage() {
  const [isActive, setIsActive] = useState(sportCategories[0])

  const sportCategoriesActiveTabData = sportCategoriesTabData[isActive]

  return (
    <div className={styles.wrapper}>
      <div className={styles.section1}>
        <div className={styles.section1Info}>
          <h1>Welcome to the home of competition</h1>

          <p>
            Enjoy the sports you already love more — simply by mercilessly
            beating your friends, family, and loved ones in the Internet&apos;s
            favorite sports pools.
          </p>

          <Link href={routes.poolCreating.index}>
            <button className="button button-blue-light">Get started</button>
          </Link>
        </div>

        <div className={styles.homePageImagesWrapper}>
          <HomePageBackgroundBanner />

          <div className={styles.homePagePlayerWrapper}>
            <Image
              src={homePagePlayer.src}
              width={homePagePlayer.width}
              height={homePagePlayer.height}
              alt="Player"
              priority
            />
          </div>
        </div>
      </div>

      <div className={styles.sectionWrapper}>
        <div className={styles.section2}>
          {sportsArr.map((sport) => {
            const Icon = sport.icon

            return (
              <Link
                key={sport.title}
                href={sport.link}
                className={styles.sportWrapper}
              >
                <div className={styles.sportIconWrapper}>
                  <Icon />
                </div>
                <p>{sport.title}</p>
              </Link>
            )
          })}
        </div>

        <div className={styles.section3}>
          <h3>Our benefits</h3>

          <div className={styles.benefitsWrapper}>
            {benefitsArr.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div key={benefit.title} className={styles.benefitItem}>
                  <Icon />

                  <div>
                    <p>{benefit.title}</p>
                    <p>{benefit.subtitle}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className={styles.section4}>
          <h3>Sport categories and pool formats</h3>

          <div className={styles.sportCategoriesTabsWrapper}>
            <AccountTabs
              tabsData={sportCategories}
              isActive={isActive}
              setIsActive={setIsActive}
            />
          </div>

          <div className={styles.sportCategoriesTabDataWrapper}>
            {!!sportCategoriesActiveTabData && (
              <>
                <div>
                  <h4>{sportCategoriesActiveTabData.title}</h4>

                  {!!sportCategoriesActiveTabData.subtitle && (
                    <p className={styles.sportCategoriesSubtitle}>
                      {sportCategoriesActiveTabData.subtitle}
                    </p>
                  )}

                  <p className={styles.sportCategoriesDescription}>
                    {sportCategoriesActiveTabData.description}
                  </p>

                  <div className={styles.sportCategoriesButtonsWrapper}>
                    <button className="button button-blue-light">
                      Start a Pool
                    </button>
                    <p>Learn More</p>
                  </div>
                </div>

                <div className={styles.sportCategoriesImageWrapper}>
                  {!!sportCategoriesActiveTabData.image ? (
                    <Image
                      src={sportCategoriesActiveTabData.image.src}
                      width={sportCategoriesActiveTabData.image.width}
                      height={sportCategoriesActiveTabData.image.height}
                      alt={sportCategoriesActiveTabData.title}
                    />
                  ) : (
                    <div></div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className={styles.section5}>
          <h3>Read what our users say about us</h3>

          <div className={styles.commentsWrapper}>
            {commentsArr.map((comments, i) => (
              <div
                key={i}
                className={classNames(styles.commentsWrapperItem, {
                  [styles.commentsWrapperItemEven]: (i + 1) % 2 === 0,
                })}
              >
                {comments.map((comment, j) => (
                  <div key={j} className={styles.commentItem}>
                    <div className={styles.commentItemInfo}>
                      <div className={styles.commentItemAvatar}></div>

                      <div className={styles.commentItemNameAndStars}>
                        <p>{comment.title}</p>

                        <div>
                          {Array(5)
                            .fill(0)
                            .map((_, index) => (
                              <div
                                key={index}
                                className={classNames(styles.commentItemStar, {
                                  [styles.commentItemStarActive]:
                                    index + 1 <= comment.stars,
                                })}
                              >
                                <Star />
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    <p className={styles.commentItemText}>{comment.text}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
