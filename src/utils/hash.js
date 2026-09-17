import { md5, sha1 } from '@noble/hashes/legacy.js'
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js'

// These algorithms are part of the existing server token and Bingo contracts.
export const sha1Hex = value => bytesToHex(sha1(utf8ToBytes(value)))
export const md5Hex = value => bytesToHex(md5(utf8ToBytes(value)))
