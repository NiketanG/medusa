import { existsSync, readFileSync } from "fs"
import { NextResponse } from "next/server"
import path from "path"

type DownloadParams = {
  params: Promise<{
    area: string
  }>
}

export async function GET(request: Request, props: DownloadParams) {
  const params = await props.params
  const { area } = params
  const filePath = path.join(process.cwd(), "specs", area, "openapi.full.yaml")

  if (!existsSync(filePath)) {
    return new NextResponse(null, {
      status: 404,
    })
  }

  const fileContent = readFileSync(filePath)

  return new Response(fileContent, {
    headers: {
      "Content-Type": "application/x-yaml",
      "Content-Disposition": `attachment; filename="openapi.yaml"`,
    },
  })
}
