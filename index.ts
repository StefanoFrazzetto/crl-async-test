import axios from "axios"
import { fromBER } from "asn1js"
import { CertificateRevocationList } from "pkijs"
import sp from "synchronized-promise"

const crlUrl = "http://crl.nhs.uk/int/1d/crlc3.crl"

const asyncFunc = async (crlFileUrl: string): Promise<CertificateRevocationList | null> => {
  console.log("Starting async...")
  let data = null

  try {
    const resp = await axios(crlFileUrl, { method: "GET", responseType: "arraybuffer" })
    const asn1crl = fromBER(resp.data)
    data = new CertificateRevocationList({ schema: asn1crl.result })
  } catch (e) {
    console.error(`Unable to fetch CRL from ${crlFileUrl}: ${e}`)
  }

  console.log("Finished async.")

  return data
}

const withSynchronizedPromise = () => {
  console.log("Starting sync with synchronizedPromise...")
  let result = null

  const synchronisedAsyncFunc = sp(asyncFunc)

  const data = synchronisedAsyncFunc(crlUrl)
  result = data

  console.log("Finished sync.")
  return result
}

const withAsync = () => {
  console.log("Starting sync...")
  let result = null

  asyncFunc(crlUrl).then((data) => {
    result = data
  })

  console.log("Finished sync.")
  return result
}

console.log("Invoking sync function...")
const result = withAsync()
console.log(`Res: ${result}`)
console.log("The end.")
