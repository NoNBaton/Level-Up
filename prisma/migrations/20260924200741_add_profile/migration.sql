-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "avatar" TEXT NOT NULL DEFAULT 'cyan',
ADD COLUMN     "bio" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "progress" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Player_level_xp_idx" ON "Player"("level", "xp");
