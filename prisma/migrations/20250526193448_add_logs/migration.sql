-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "previous" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "new" DECIMAL(18,8) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
