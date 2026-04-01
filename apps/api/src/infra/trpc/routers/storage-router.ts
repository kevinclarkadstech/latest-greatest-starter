import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { procedure, router } from "../init";

const s3Client = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });

export const storageRouter = router({
  getUploadUrl: procedure
    .input(
      z.object({
        key: z.string().min(1),
        contentType: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const bucket = process.env.AWS_S3_BUCKET;
      if (!bucket) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "S3 bucket not configured",
        });
      }

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: input.key,
        ...(input.contentType ? { ContentType: input.contentType } : {}),
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });

      return { url, key: input.key };
    }),
});
