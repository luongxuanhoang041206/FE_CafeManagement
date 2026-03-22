import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = "product-images"

/**
 * Upload an image file to Supabase Storage and return the public URL.
 */
export async function uploadProductImage(file: File): Promise<string> {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file)

    if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`)
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)

    return data.publicUrl
}
