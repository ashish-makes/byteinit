import { auth } from "@/auth"
import ImageKit from "imagekit"
import { nanoid } from "nanoid"

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!
})

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return new Response("No file provided", { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return new Response("File must be an image", { status: 400 })
    }

    // Validate file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return new Response("File size too large", { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `blog/${session.user.id}/${nanoid()}-${file.name}`

    // Upload to ImageKit
    const result = await imageKit.upload({
      file: buffer,
      fileName: filename,
      useUniqueFileName: false
    })

    return new Response(JSON.stringify({ url: result.url }))
  } catch (error) {
    console.error("Error uploading file:", error) 
    return new Response("Internal Server Error", { status: 500 })
  }
}