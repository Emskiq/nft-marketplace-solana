// src/ui/ToastProvider.tsx
import React, { FC } from 'react'
import toast, { Toaster } from 'react-hot-toast'

interface ToastProviderProps {
  children?: React.ReactNode
}

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  )
}

export const useTransactionToast = () => {
  return (signature: string) => {
    toast.success(`Transaction successful: ${signature}`)
  }
}
