"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// Initialize Supabase Client
// Replace these with your actual Supabase URL and Anon Key via your environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export function CreateProductForm() {
    const [name, setName] = useState("");
    const [price, setPrice] = useState<number | "">("");
    const [active, setActive] = useState(true);
    const [groupId, setGroupId] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Handle the image selection and show a local preview
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        let imageUrl = "";

        try {
            // 1. Upload image to Supabase Storage if an image was selected
            if (imageFile) {
                // Create a unique file name to avoid collisions
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

                // Ensure you have RLS policies set up on your bucket if using anonymous uploads
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from("product-images")
                    .upload(fileName, imageFile);

                if (uploadError) {
                    throw new Error(`Image upload failed: ${uploadError.message}`);
                }

                // 2. Get the public URL of the uploaded image
                const { data: publicUrlData } = supabase.storage
                    .from("product-images")
                    .getPublicUrl(fileName);

                imageUrl = publicUrlData.publicUrl;
            } else {
                throw new Error("Please select an image to upload.");
            }

            // 3. Send POST request to backend API
            const productPayload = {
                name,
                price: Number(price),
                active,
                groupId: Number(groupId),
                imageUrl,
            };

            const response = await fetch("${process.env.NEXT_PUBLIC_API_URL}/admin/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(productPayload),
            });

            if (!response.ok) {
                throw new Error(`Failed to create product on backend. Status: ${response.status}`);
            }

            // 4. Success state handling
            setMessage({ type: "success", text: "Product created successfully!" });

            // Reset the form
            setName("");
            setPrice("");
            setActive(true);
            setGroupId("");
            setImageFile(null);
            setImagePreview(null);

        } catch (error: any) {
            console.error("Error creating product:", error);
            setMessage({ type: "error", text: error.message || "An unexpected error occurred." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Create New Product</h2>

            {message && (
                <div className={`p-4 mb-6 text-sm font-medium rounded-md ${message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50'
                        : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50'
                    }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* Name Field */}
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Mocha"
                        required
                    />
                </div>

                {/* Price Field */}
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="price">Price (VND)</Label>
                    <Input
                        id="price"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                        placeholder="e.g. 20000"
                        min="0"
                        required
                    />
                </div>

                {/* Group ID Field */}
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="groupId">Group ID</Label>
                    <Input
                        id="groupId"
                        type="number"
                        value={groupId}
                        onChange={(e) => setGroupId(e.target.value)}
                        placeholder="e.g. 1"
                        required
                    />
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                        id="active"
                        checked={active}
                        onCheckedChange={(checked) => setActive(checked as boolean)}
                    />
                    <Label htmlFor="active" className="cursor-pointer text-sm font-medium">
                        Active Status
                    </Label>
                </div>

                {/* Image Upload Field */}
                <div className="flex flex-col space-y-1.5 pt-2">
                    <Label htmlFor="image">Product Image</Label>
                    <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="cursor-pointer file:text-sm file:font-medium"
                        required // Optional: depending on if the backend image is strictly required
                    />
                </div>

                {/* Image Preview Area */}
                {imagePreview && (
                    <div className="mt-4 border border-gray-200 dark:border-zinc-800 rounded-lg p-2 flex justify-center bg-gray-50 dark:bg-zinc-900/50">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-48 w-auto object-contain rounded-md"
                        />
                    </div>
                )}

                {/* Submit Button */}
                <Button type="submit" disabled={isSubmitting} className="w-full mt-6">
                    {isSubmitting ? "Creating Product..." : "Create Product"}
                </Button>

            </form>
        </div>
    );
}
