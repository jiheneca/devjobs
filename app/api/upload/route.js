import { v2 as cloudinary } from "cloudinary"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})
// milekher rit les fichiers Les fichiers sont uploadés sur Cloudinary, un service cloud de stockage de médias (images, vidéos, PDFs...).
// serveur mteei ne stocke pas les fichiers localement, mais les envoie directement à Cloudinary. 

export async function POST(request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

  let uploadOptions = { folder: "devjobs" }
  if (file.type === "application/pdf") {
    uploadOptions.resource_type = "raw"
  } else {
    uploadOptions.transformation = [{ width: 400, height: 400, crop: "fill" }]
  }

  const result = await cloudinary.uploader.upload(base64, uploadOptions)

  return NextResponse.json({ url: result.secure_url }, { status: 200 })
}