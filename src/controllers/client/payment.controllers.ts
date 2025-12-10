import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { TransactionStatus } from '~/constants/enum'
import { HttpStatus } from '~/constants/httpStatus'
import User from '~/models/schemas/users.schema'
import { databaseService } from '~/services/database.service'
import systemConfigService from '~/services/system-config.service'
import userService from '~/services/users.service'
import { paymentCod } from '~/utils/payment-momo'

export const paymentCodController = async (req: Request, res: Response) => {
  const user = req.user as User
  const walletInfo = user.wallet as any
  const packageId = req.body.packageId

  const pricingConfig = systemConfigService.getCachedPricingCredit()
  const packages = pricingConfig?.config?.parameters || []
  if (!packageId) {
    return res.status(400).json({ message: 'Thiếu packageId' })
  }
  if (!packages.length) {
    return res.status(400).json({ message: 'Chưa có cấu hình gói credit' })
  }
  const targetPackage = packages.find((p) => p._id?.toString() === packageId)
  if (!targetPackage) {
    return res.status(404).json({ message: 'Không tìm thấy gói credit' })
  }

  const transactionId = new ObjectId()

  const payUrl = await paymentCod({
    wallet_id: walletInfo._id as string,
    transaction_id: transactionId.toString(),
    transaction_amount: targetPackage.price
  })

  if (!payUrl) {
    return res.status(500).json({ message: 'Lỗi khi tạo URL thanh toán' })
  }

  await databaseService.wallets.updateOne(
    { _id: new ObjectId(walletInfo._id) },
    {
      $push: {
        history_transactions: {
          $each: [
            {
              _id: transactionId,
              title: `Mua credit`,
              description: `${targetPackage.price.toLocaleString('vi-VN')}đ ( Giảm giá ${targetPackage.discount.toLocaleString('vi-VN')}đ )`,
              price: targetPackage.price - targetPackage.discount,
              credit: targetPackage.credit,
              status: TransactionStatus.PENDING,
              link_payment: payUrl,
              create_at: new Date(),
              update_at: new Date()
            }
          ]
        }
      }
    }
  )

  return res.status(HttpStatus.CREATED).json({
    status: HttpStatus.CREATED,
    message: 'Tạo URL thanh toán thành công',
    payUrl
  })
}

export const checkPaymentController = async (req: Request, res: Response) => {
  const data = req.query
  console.log(data)
  const walletId = data.orderInfo?.toString().split('-')[1]
  const transactionId = data.orderInfo?.toString().split('-')[2]
  if (data.resultCode === '0') {
    if (walletId && transactionId) {
      const wallet = await databaseService.wallets.findOne({
        _id: new ObjectId(walletId),
        'history_transactions._id': new ObjectId(transactionId)
      })

      if (wallet) {
        const transaction = wallet.history_transactions?.find(
          (t) => t._id?.toString() === transactionId
        )

        if (transaction && transaction.status === TransactionStatus.PENDING) {
          const currentBalance = wallet.balance_credit || 0
          const creditToAdd = transaction.credit || 0
          const newBalance = currentBalance + creditToAdd

          await databaseService.wallets.updateOne(
            {
              _id: new ObjectId(walletId),
              'history_transactions._id': new ObjectId(transactionId)
            },
            {
              $set: {
                'history_transactions.$.status': TransactionStatus.SUCCESS,
                'history_transactions.$.update_at': new Date(),
                balance_credit: newBalance,
                update_at: new Date()
              }
            }
          )
        }
      }
    }
    res.redirect('/users/wallet')
  } else {
    if (walletId && transactionId) {
      await databaseService.wallets.updateOne(
        {
          _id: new ObjectId(walletId),
          'history_transactions._id': new ObjectId(transactionId)
        },
        {
          $set: {
            'history_transactions.$.status': TransactionStatus.FAILED,
            'history_transactions.$.update_at': new Date()
          }
        }
      )
    }
    res.redirect('/users/wallet')
  }
}
