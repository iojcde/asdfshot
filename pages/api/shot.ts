import { unstable_getServerSession } from "next-auth/next"
import type { NextApiRequest, NextApiResponse } from "next"

import { authOptions } from "./auth/[...nextauth]"

import { chromium } from "playwright"

const shot = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await unstable_getServerSession(req, res, authOptions)
  if (session) {
    let browser = await chromium.launch()

    let page = await browser.newPage()
    await page.setViewportSize({ width: 1280, height: 1080 })
    await page.goto("http://nytimes.com")
    const buffer = await page.screenshot({ timeout: 7, type: "png" })
    res.setHeader("content-type", "image/png")
    res.status(200).write(buffer)
  } else {
    // Not Signed in
    res.status(401)
  }
  res.end()
}
export default shot
