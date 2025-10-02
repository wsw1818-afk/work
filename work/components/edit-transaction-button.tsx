"use client"

import { useState } from "react"
import { EditTransactionDialog } from "./edit-transaction-dialog"

interface Transaction {
  id: string
  date: string
  merchant: string | null
  amount: number
  type: "income" | "expense"
  categoryId: string | null
  accountId: string
  memo: string | null
  category?: { id: string; name: string } | null
  account: { id: string; name: string }
}

interface Category {
  id: string
  name: string
}

interface Account {
  id: string
  name: string
}

interface EditTransactionButtonProps {
  transaction: Transaction
  categories: Category[]
  accounts: Account[]
}

export function EditTransactionButton({
  transaction,
  categories,
  accounts,
}: EditTransactionButtonProps) {
  return (
    <EditTransactionDialog
      transaction={transaction}
      categories={categories}
      accounts={accounts}
    />
  )
}
