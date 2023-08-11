import path from 'path'

import classNames from 'classnames'
import domtoimage from 'dom-to-image'
import jsPDF from 'jspdf'
import getConfig from 'next/config'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ConvertToPDF, Logo, QrCodeArrow } from '@/assets/icons'
import { golfTournamentLogo } from '@/assets/img'
import {
  dateFormattingEvent,
  generateParticipantImagePath,
  getHourAndMinute,
  rf,
  routes,
} from '@/config/constants'
import { useGrid, useMessage, usePool } from '@/helpers'

import styles from './GridPDFPage.module.scss'

import type { Options } from 'qr-code-styling'

const SquaresGridLazy = dynamic(
  () =>
    import('@/features/components/SquaresGrid/SquaresGrid').then(
      (mod) => mod.SquaresGrid,
    ),
  { loading: () => <p>Loading...</p> },
)

const {
  publicRuntimeConfig: { appUrl },
} = getConfig()

type UpperContainerTitle =
  | string
  | { x: { name: string; image: string }; y: { name: string; image: string } }

export type GridPDFPageProps = { poolId: number; gridId: number }

export function GridPDFPage({ poolId, gridId }: GridPDFPageProps) {
  const { push } = useRouter()

  const pdfWrapperRef = useRef<HTMLDivElement>(null)
  const gridWrapper = useRef<HTMLDivElement>(null)

  const [qrCodeRef, setQrCodeRef] = useState<HTMLDivElement | null>(null)

  const qrCodeRefCallback = useCallback((node: HTMLDivElement) => {
    if (node !== null) setQrCodeRef(node)
  }, [])

  // библиотека 'qr-code-styling' выдает ошибку при работе,
  // с next js, это связано с серверным рендерингом,
  // из-за этого я не могу напрямую импортировать переменные
  // и классы из этой библиотеки (типы к этому не относятся)
  type QRCodeStylingType = {
    update(options?: Partial<Options>): void
    append(container?: HTMLElement): void
  }

  const [qrCode, setQrCode] = useState<null | QRCodeStylingType>(null)

  useEffect(() => {
    async function importQRCodeStyling() {
      const QRCodeStyling = (await import('qr-code-styling')).default

      const qrCode = new QRCodeStyling({
        width: 120,
        height: 120,
        dotsOptions: { type: 'dots' },
        cornersSquareOptions: { type: 'extra-rounded' },
        cornersDotOptions: { type: 'square' },
        data: '/',
      })

      setQrCode(qrCode)
    }
    importQRCodeStyling()
  }, [])

  useEffect(() => {
    if (qrCodeRef && qrCode) {
      qrCode.append(qrCodeRef)
    }
  }, [qrCodeRef, qrCode])

  useEffect(() => {
    if (qrCode) {
      qrCode.update({
        data: path.normalize(
          `${appUrl}/${routes.account.makePick.index(poolId, {
            grid_id: gridId,
          })}`,
        ),
      })
    }
  }, [qrCode, poolId, gridId])

  const { poolData } = usePool(poolId)

  const { gridData } = useGrid({
    poolId: poolData?.id,
    gridId:
      poolData?.type === 'squares' || poolData?.type === 'golf_squares'
        ? gridId
        : undefined,
  })

  // проверяет пул на тип
  useEffect(() => {
    if (
      poolData &&
      poolData.type !== 'squares' &&
      poolData.type !== 'golf_squares'
    ) {
      push(routes.account.overview(poolData.id))
    }
  }, [poolData, push])

  const [convertToPdfIsLoading, setConvertToPdfIsLoading] = useState(false)
  const [error, setError] = useMessage()

  const [title, startDate] = useMemo(() => {
    let title: UpperContainerTitle = ''
    let startDate = ''

    if (
      gridData &&
      poolData?.type === 'golf_squares' &&
      'golf_tournament' in gridData
    ) {
      title = gridData.golf_tournament.name
      startDate = gridData.golf_tournament.start_date
    } else {
      if (gridData && 'event' in gridData) {
        title = {
          x: {
            name: gridData.x_axis_participant.name,
            image: generateParticipantImagePath(
              gridData.x_axis_participant.external_id,
            ),
          },
          y: {
            name: gridData.y_axis_participant.name,
            image: generateParticipantImagePath(
              gridData.y_axis_participant.external_id,
            ),
          },
        }

        startDate = gridData.event.start_date
      }
    }

    return [title, startDate]
  }, [gridData, poolData?.type])

  if (!gridData) return null

  async function convertToPdf() {
    if (!pdfWrapperRef.current) return

    try {
      setConvertToPdfIsLoading(true)

      // 210mm - ширина pdf файла, 1mm = 3.8px
      const pdfWidthInPx = 210 * 3.8
      // 290mm - высота pdf файла, 1mm = 3.8px
      const pdfHeightInPx = 290 * 3.8

      // насколько текущая ширина больше оптимальной
      // ширины pdf документа
      const widthRatio = pdfWrapperRef.current.clientWidth / pdfWidthInPx

      pdfWrapperRef.current.style.height = `${widthRatio * pdfHeightInPx}px`

      const imageUrl = await domtoimage.toJpeg(pdfWrapperRef.current)

      const doc = new jsPDF()

      doc.addImage(imageUrl, 'JPEG', 0, 0, 210, 290)
      doc.save(`pool-${poolId}-grid-${gridId}.pdf`)

      setConvertToPdfIsLoading(false)
      pdfWrapperRef.current.style.height = ''
    } catch (err) {
      setConvertToPdfIsLoading(false)
      pdfWrapperRef.current.style.height = ''

      if (typeof err === 'string') {
        setError(err)
        return
      }

      if (err && typeof err === 'object') {
        if ('message' in err && typeof err.message === 'string') {
          setError(err.message)
          return
        }
      }

      setError(rf.unknownError)
    }
  }

  return (
    <div className={styles.wrapper}>
      <button
        onClick={convertToPdf}
        className={classNames(
          'button button-blue-light',
          styles.downloadPdfBtn,
          { disabled: convertToPdfIsLoading },
        )}
      >
        <ConvertToPDF /> <p>Download PDF</p>
      </button>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className={styles.pdfWrapper} ref={pdfWrapperRef}>
        <Logo className={styles.logo} />
        <UpperContainer title={title} />

        <p className={styles.eventStartDate}>
          <span>{dateFormattingEvent(startDate)}</span>
          <span>{getHourAndMinute(startDate)}</span>
        </p>

        <div className={styles.gridNameWrapper}>
          <p>#{gridData.pool_number_grid}</p>
          <p>{gridData.name}</p>
        </div>

        <div ref={gridWrapper} className={styles.gridWrapper}>
          <SquaresGridLazy wrapperRef={gridWrapper} isDisabled isPDF />
        </div>

        <div className={styles.marksAndQrCodeWrapper}>
          <div className={styles.marksList}>
            <p className={styles.markBold}>* Pool member entries are in bold</p>
            <p>** Guest posts are highlighted in light font</p>
          </div>

          <div className={styles.qrCodeWrapper}>
            <div className={styles.scanTextWrapper}>
              <p>Scan the QR code to go to this grid</p>
              <QrCodeArrow />
            </div>

            <div className={styles.qrCode}>
              <div ref={qrCodeRefCallback}></div>
              <p>upool.us</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const UpperContainer = ({ title }: { title: UpperContainerTitle }) => {
  if (typeof title === 'string') {
    return (
      <div className={styles.tournamentTitle}>
        <div>
          <Image alt="tournament logo" src={golfTournamentLogo} width={100} />
        </div>
        <div className={styles.tournamentTitleText}>{title}</div>
      </div>
    )
  }

  return (
    <div className={styles.participantsWrapper}>
      <p className={styles.xTeamName}>{title.x.name}</p>

      {title.x.image && (
        <Image
          src={title.x.image}
          width={100}
          height={100}
          alt={title.x.name}
          unoptimized
        />
      )}

      <p className={styles.vsText}>vs</p>

      {title.y.image && (
        <Image
          src={title.y.image}
          width={100}
          height={100}
          alt={title.y.name}
          unoptimized
        />
      )}

      <p className={styles.yTeamName}>{title.y.name}</p>
    </div>
  )
}
