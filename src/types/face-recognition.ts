import { z } from 'zod';

export const FaceMatchRequestSchema = z.object({
  albumName: z.string().min(1),
  facePath: z.string().min(1),
});

export type FaceMatchRequest = z.infer<typeof FaceMatchRequestSchema>;

export const FaceMatchResultSchema = z.object({
  imagePath: z.string(),
  similarity: z.number(),
  boundingBox: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
});

export type FaceMatchResult = z.infer<typeof FaceMatchResultSchema>;

export const FaceMatchResponseSchema = z.object({
  matches: z.array(FaceMatchResultSchema),
});

export type FaceMatchResponse = z.infer<typeof FaceMatchResponseSchema>;

export const AlbumImagesRequestSchema = z.object({
  albumName: z.string().min(1),
});

export type AlbumImagesRequest = z.infer<typeof AlbumImagesRequestSchema>;

export const AlbumImagesResponseSchema = z.object({
  images: z.array(z.string()),
});

export type AlbumImagesResponse = z.infer<typeof AlbumImagesResponseSchema>;

export const ImagePathRequestSchema = z.object({
  imagePath: z.string().min(1),
});

export type ImagePathRequest = z.infer<typeof ImagePathRequestSchema>;
