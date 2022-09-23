import { unstable_getServerSession } from "next-auth/next"
import type { NextApiRequest, NextApiResponse } from "next"

import { authOptions } from "./auth/[...nextauth]"
import playwright from 'playwright-core'
import  chromium from "chrome-aws-lambda"

const shot = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await unstable_getServerSession(req, res, authOptions)
  if (session) {
    if (session.user?.email !='io@fosshost.org'){
      res.status(401)
    }
    const browser = await playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });
  const { url } = req.query
    let page = await browser.newPage()
    await page.setViewportSize({ width: 1440, height: 770})
    await page.goto(url as string).catch(err =>{console.error(err)})
    const buffer = await page.screenshot({ type:"png",timeout: 8000 })
    res.setHeader("content-type", "image/png")
    res.status(200).write(buffer)
  } else {
    // Not Signed in
    res.status(401)
  }
  res.end()
}
export default shot
