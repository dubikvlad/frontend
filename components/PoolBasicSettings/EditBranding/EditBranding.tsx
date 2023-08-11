import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { api } from '@/api'
import { DragAndDrop } from '@/assets/icons'
import { ColorPicker } from '@/features/ui'
import { usePool } from '@/helpers'

import styles from './EditBranding.module.scss'

export function EditBranding() {
  const [color, setColor] = useState<string>('')
  const [pictureURL, setPictureURL] = useState('')

  const {
    query: { poolId },
  } = useRouter()
  const { poolData, poolMutate } = usePool(Number(poolId))

  async function sendData({
    file,
    brandBgColor,
  }: {
    file?: Blob
    brandBgColor?: string
  }) {
    const formData = new FormData()

    const currentImg = file ?? ''

    const currentColor = brandBgColor
      ? brandBgColor
      : poolData?.display_settings.brand_bg_color
      ? poolData.display_settings.brand_bg_color
      : ''

    formData.append('brand_bg_color', currentColor)
    currentImg && formData.append('brand_image_name', currentImg)
    formData.append('brand_color', '#212529')

    await api.pools.setBrandPool(Number(poolId), formData)

    poolMutate()
  }

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    maxFiles: 1,
    accept: {
      'image/png': [],
      'image/jpg': [],
      'image/jpeg': [],
    },
    onDrop: (acceptedFiles) => {
      sendData({ file: acceptedFiles[0] })
    },
  })

  function changeColor(color: string) {
    setColor(color)
    sendData({ brandBgColor: color })
  }

  useEffect(() => {
    if (poolData?.display_settings.brand_bg_color) {
      setColor(poolData.display_settings.brand_bg_color)
    }

    poolData?.display_settings.brand_image_name
      ? setPictureURL(poolData.display_settings.brand_image_name)
      : setPictureURL('')
  }, [poolData])

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>customize</p>
      <div className={styles.pictures}>
        <div {...getRootProps({ className: styles.dropzone })}>
          <input {...getInputProps()} />
          {pictureURL ? (
            <Image
              width={400}
              height={75}
              alt="label"
              src={pictureURL}
              style={{ objectFit: 'contain' }}
            />
          ) : (
            <DragAndDrop />
          )}
          {isDragAccept && <p>All files will be accepted</p>}
          {isDragReject && <p>Some files will be rejected</p>}
          {!isDragActive && <p>Upload or drag and drop your logo here</p>}
        </div>
      </div>
      {color && (
        <ColorPicker
          value={color}
          onChange={changeColor}
          pickerTitle="Main Color"
          isVisibleBorder
        />
      )}
    </div>
  )
}
