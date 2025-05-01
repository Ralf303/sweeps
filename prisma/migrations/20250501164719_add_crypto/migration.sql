-- CreateTable
CREATE TABLE "Crypto" (
    "id" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DECIMAL(18,8) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderAmount" DECIMAL(18,8),
    "senderCurrency" TEXT,
    "rawData" JSONB,

    CONSTRAINT "Crypto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Crypto" ADD CONSTRAINT "Crypto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
