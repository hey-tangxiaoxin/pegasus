import { useCallback } from 'react'
import { ethers } from 'ethers'
import { message } from 'antd'
import type { FormInstance } from 'antd/es/form'
import { ERC20_ABI } from '../constants'

interface TransactionValues {
  tokenAddress: string
  amount: string
  toAddress: string
}

interface UseTransactionProps {
  account: string
  signer: ethers.Signer | null
  ethersProvider: ethers.BrowserProvider | null
  form: FormInstance
  onSuccess?: () => void
}

export function useTransaction({
  account,
  signer,
  ethersProvider,
  form,
  onSuccess,
}: UseTransactionProps) {
  const handleSendTransaction = useCallback(async (values: TransactionValues) => {
    if (!account) {
      message.info('Please connect your wallet first!')
      return
    }

    let transactionSigner = signer
    if (!transactionSigner && ethersProvider) {
      try {
        transactionSigner = await ethersProvider.getSigner()
      } catch {
        message.error('Please connect your wallet first!')
        return
      }
    }

    if (!transactionSigner) {
      message.info('Please connect your wallet first!')
      return
    }

    try {
      let tokenContractAddress = values.tokenAddress.trim()
      let recipientAddress = values.toAddress.trim()
      const currentProvider = transactionSigner.provider ?? ethersProvider

      if (currentProvider) {
        const tokenContractCode = await currentProvider.getCode(tokenContractAddress)
        if (!tokenContractCode || tokenContractCode === '0x' || tokenContractCode === '0x0') {
          const recipientCode = await currentProvider.getCode(recipientAddress)
          const isRecipientContract = recipientCode && recipientCode !== '0x' && recipientCode !== '0x0'
          if (isRecipientContract) {
            [tokenContractAddress, recipientAddress] = [recipientAddress, tokenContractAddress]
            form.setFieldsValue({ tokenAddress: tokenContractAddress, toAddress: recipientAddress })
            message.info('Token Address and To Address were swapped; corrected and sending.')
          } else {
            message.error('Token Address must be a contract address.')
            return
          }
        }
      }

      const contractInterface = new ethers.Interface(ERC20_ABI)
      const tokenContract = new ethers.Contract(tokenContractAddress, ERC20_ABI, transactionSigner)

      let tokenDecimals = 18
      try {
        const decimalsResult = await tokenContract.decimals()
        tokenDecimals = typeof decimalsResult === 'bigint' ? Number(decimalsResult) : Number(decimalsResult)
      } catch {
        message.info('Using 18 decimals for amount.')
      }

      const transferAmount = ethers.parseUnits(String(values.amount).trim(), tokenDecimals)
      let transaction: ethers.TransactionResponse

      const getErrorMessage = (error: any) => String(error?.message ?? error?.reason ?? error ?? '')

      try {
        const callData = contractInterface.encodeFunctionData('transfer', [recipientAddress, transferAmount])
        transaction = await transactionSigner.sendTransaction({ to: tokenContractAddress, data: callData })
      } catch (sendError: any) {
        if (/internal accounts cannot include data|cannot include data/i.test(getErrorMessage(sendError))) {
          transaction = await tokenContract.transfer(recipientAddress, transferAmount)
        } else {
          throw sendError
        }
      }

      message.info('Transaction submitted, waiting for confirmation...')
      await transaction.wait()
      message.success('Transaction sent successfully!')
      onSuccess?.()
    } catch (error: any) {
      const errorCode = error?.code ?? error?.error?.code
      const errorReason = error?.reason ?? error?.error?.message ?? error?.message
      let errorMessage = errorReason || 'Unknown error'

      if (errorCode === 4001 || errorCode === 'ACTION_REJECTED') {
        errorMessage = 'Transaction rejected by user'
      } else if (String(errorMessage).toLowerCase().includes('insufficient') || errorCode === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient balance'
      } else if (error?.data) {
        errorMessage = typeof error.data === 'string' ? error.data : (error.data.message || errorMessage)
      }

      message.error(`Transaction failed: ${errorMessage}`)
    }
  }, [account, signer, ethersProvider, form, onSuccess])

  return { handleSendTransaction }
}
