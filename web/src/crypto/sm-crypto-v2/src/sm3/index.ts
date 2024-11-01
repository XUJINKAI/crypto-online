import { hmac } from '../sm2/hmac'
import { sm3 as sm2sm3 } from '../sm2/sm3'
import { hexToArray } from '../sm2/utils'
import { bytesToHex } from './utils'

/**
 * 补全16进制字符串
 */
// function leftPad(input, num) {
//   if (input.length >= num) return input

//   return (new Array(num - input.length + 1)).join('0') + input
// }

/**
 * utf8 串转字节数组
 */
export function utf8ToArray(str: string) {
  const arr: number[] = []

  for (let i = 0, len = str.length; i < len; i++) {
    const point = str.codePointAt(i)!

    if (point <= 0x007f) {
      // 单字节，标量值：00000000 00000000 0zzzzzzz
      arr.push(point)
    } else if (point <= 0x07ff) {
      // 双字节，标量值：00000000 00000yyy yyzzzzzz
      arr.push(0xc0 | (point >>> 6)) // 110yyyyy（0xc0-0xdf）
      arr.push(0x80 | (point & 0x3f)) // 10zzzzzz（0x80-0xbf）
    } else if (point <= 0xD7FF || (point >= 0xE000 && point <= 0xFFFF)) {
      // 三字节：标量值：00000000 xxxxyyyy yyzzzzzz
      arr.push(0xe0 | (point >>> 12)) // 1110xxxx（0xe0-0xef）
      arr.push(0x80 | ((point >>> 6) & 0x3f)) // 10yyyyyy（0x80-0xbf）
      arr.push(0x80 | (point & 0x3f)) // 10zzzzzz（0x80-0xbf）
    } else if (point >= 0x010000 && point <= 0x10FFFF) {
      // 四字节：标量值：000wwwxx xxxxyyyy yyzzzzzz
      i++
      arr.push((0xf0 | (point >>> 18) & 0x1c)) // 11110www（0xf0-0xf7）
      arr.push((0x80 | ((point >>> 12) & 0x3f))) // 10xxxxxx（0x80-0xbf）
      arr.push((0x80 | ((point >>> 6) & 0x3f))) // 10yyyyyy（0x80-0xbf）
      arr.push((0x80 | (point & 0x3f))) // 10zzzzzz（0x80-0xbf）
    } else {
      // 五、六字节，暂时不支持
      arr.push(point)
      throw new Error('input is not supported')
    }
  }

  return new Uint8Array(arr)
}

export function sm3(input: string | Uint8Array, options?: {
  key: Uint8Array | string
  mode?: 'hmac' | 'mac'
}) {
  input = typeof input === 'string' ? utf8ToArray(input) : input

  if (options) {
    const mode = options.mode || 'hmac'
    if (mode !== 'hmac') throw new Error('invalid mode')

    let key = options.key
    if (!key) throw new Error('invalid key')

    key = typeof key === 'string' ? hexToArray(key) : key
    return bytesToHex(hmac(sm2sm3, key, input));
  }
  return bytesToHex(sm2sm3(input))
}

export default sm3