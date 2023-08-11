import {
  FieldValues,
  RegisterOptions,
  useController,
  UseControllerProps,
  Control,
  FieldPath,
  PathValue,
} from 'react-hook-form'

import { Checkbox } from '@/features/ui'
import type { CheckboxProps } from '@/features/ui/Checkbox'

type RHFCheckboxProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  name: UseControllerProps['name']
  required?: RegisterOptions['required']
  defaultValue?: PathValue<FieldValues, FieldPath<FieldValues>>
  children?: CheckboxProps['children']
}

export function RHFCheckbox({
  control,
  name,
  required,
  defaultValue = false,
  children,
}: RHFCheckboxProps) {
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({ control, name, defaultValue, rules: { required } })

  return (
    <Checkbox value={value} onChange={onChange} error={error?.message}>
      {children}
    </Checkbox>
  )
}
