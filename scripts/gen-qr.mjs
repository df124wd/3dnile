// 生成二维码 PNG，用于嵌入 PPT/分享。
// 用法：node scripts/gen-qr.mjs <公开URL> [输出路径]
// 例：node scripts/gen-qr.mjs https://3dnile.vercel.app public/qr.png
import { writeFile } from 'node:fs/promises'
import QRCode from 'qrcode'

const url = process.argv[2]
const out = process.argv[3] || 'public/qr.png'

if (!url) {
  console.error('用法: node scripts/gen-qr.mjs <公开URL> [输出路径]')
  console.error('例:   node scripts/gen-qr.mjs https://3dnile.vercel.app public/qr.png')
  process.exit(1)
}

const png = await QRCode.toBuffer(url, {
  width: 1024,
  margin: 2,
  errorCorrectionLevel: 'M',
  color: { dark: '#0b1622', light: '#ffffff' },
})

await writeFile(out, png)
console.log(`✅ 二维码已生成 → ${out}`)
console.log(`   指向：${url}`)
