-- CreateTable
CREATE TABLE "CryptoCurrency" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CryptoCurrency_pkey" PRIMARY KEY ("id")
);
