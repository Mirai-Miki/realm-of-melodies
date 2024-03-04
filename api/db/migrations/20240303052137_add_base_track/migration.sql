-- CreateTable
CREATE TABLE "Track" (
    "id" SERIAL NOT NULL,
    "filePath" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);
