import { unstable_getServerSession } from "next-auth/next"
import type { NextApiRequest, NextApiResponse } from "next"
const chromium = require('chrome-aws-lambda')
import { authOptions } from "./auth/[...nextauth]"

const shot = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await unstable_getServerSession(req, res, authOptions)
  if (session) {
    if (session.user?.email !='io@fosshost.org'){
      res.status(401)
    }
    
   const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    // Create a new page
    const page = await browser.newPage();

  // Set viewport width and height
    await page.setViewport({ width: 1440, height: 770 });

    const { url } = req.query

  // Open URL in current page
  await page.goto(url as string, { waitUntil: 'networkidle0' });

  // Capture screenshot
  const buffer = await page.screenshot();
    res.setHeader("content-type", "image/png")
    res.status(200).write(buffer)
  } else {
    // Not Signed in
    res.status(401)
  }
  res.end()
}
export default shot
