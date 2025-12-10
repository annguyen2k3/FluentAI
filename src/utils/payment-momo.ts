import { Request, Response } from 'express'
import crypto from 'crypto-js'
import axios from 'axios'
import { config } from 'dotenv'
config()

export const paymentCod = async ({
  wallet_id,
  transaction_id,
  transaction_amount
}: {
  wallet_id: string
  transaction_id: string
  transaction_amount: number
}) => {
  var partnerCode = 'MOMO'
  var accessKey = 'F8BBA842ECF85'
  var secretkey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz'
  var requestId = partnerCode + new Date().getTime()
  var orderId = requestId
  var orderInfo = `Mua credit-${wallet_id}-${transaction_id}`
  var redirectUrl = `${process.env.SERVER_URL}/payment/check-payment`
  var ipnUrl = `${process.env.SERVER_URL}/payment/check-payment`
  // var ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
  var amount = transaction_amount.toString()
  var requestType = 'captureWallet'
  var extraData = '' //pass empty value if your merchant does not have stores

  //before sign HMAC SHA256 with format
  //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
  var rawSignature =
    'accessKey=' +
    accessKey +
    '&amount=' +
    amount +
    '&extraData=' +
    extraData +
    '&ipnUrl=' +
    ipnUrl +
    '&orderId=' +
    orderId +
    '&orderInfo=' +
    orderInfo +
    '&partnerCode=' +
    partnerCode +
    '&redirectUrl=' +
    redirectUrl +
    '&requestId=' +
    requestId +
    '&requestType=' +
    requestType
  //puts raw signature

  //signature
  var signature = crypto.HmacSHA256(rawSignature, secretkey).toString()

  //json object send to MoMo endpoint
  const requestBody = {
    partnerCode: partnerCode,
    accessKey: accessKey,
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    extraData: extraData,
    requestType: requestType,
    signature: signature,
    lang: 'vi'
  }

  const momoEndpoint =
    process.env.MOMO_ENDPOINT ||
    'https://test-payment.momo.vn/v2/gateway/api/create'

  const response = await axios.post(momoEndpoint, requestBody, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  return response.data.payUrl
}
