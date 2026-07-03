"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Wallet, Plus, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";
import { walletService } from "@/services/wallet.service";
import { formatDate, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { WalletTransaction } from "@/types";

function WalletSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default function WalletPage() {
  const [page, setPage] = useState(1);
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [amount, setAmount] = useState("");

  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => walletService.getWallet(),
  });

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ["wallet-transactions", page],
    queryFn: () => walletService.getTransactions({ page: String(page), limit: "10" }),
  });

  const { mutate: addFunds, isPending: addingFunds } = useMutation({
    mutationFn: (amt: number) => walletService.addFunds(amt),
    onSuccess: () => {
      toast.success("Funds added successfully");
      setAddMoneyOpen(false);
      setAmount("");
    },
    onError: () => toast.error("Failed to add funds"),
  });

  if (walletLoading) return <WalletSkeleton />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-6">My Wallet</h1>

      <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white border-0 mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-white/80">Available Balance</p>
                <p className="text-3xl font-bold">{formatPrice(walletData?.balance || 0)}</p>
              </div>
            </div>
            <Dialog open={addMoneyOpen} onOpenChange={setAddMoneyOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="bg-white text-green-700 hover:bg-white/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Money
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Money to Wallet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount (₹)</label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={1}
                    />
                  </div>
                  <div className="flex gap-2">
                    {[100, 200, 500, 1000].map((amt) => (
                      <Button
                        key={amt}
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(String(amt))}
                        className={amount === String(amt) ? "border-green-500 bg-green-50 dark:bg-green-900/20" : ""}
                      >
                        ₹{amt}
                      </Button>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      const amt = parseInt(amount);
                      if (isNaN(amt) || amt <= 0) {
                        toast.error("Enter a valid amount");
                        return;
                      }
                      addFunds(amt);
                    }}
                    disabled={addingFunds || !amount}
                  >
                    {addingFunds ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add ₹{amount || "0"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {walletData && walletData.rewardPoints > 0 && (
            <div className="flex items-center gap-2 text-sm text-white/80">
              <span>Reward Points:</span>
              <span className="font-semibold text-white">{walletData.rewardPoints}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold mb-4">Transaction History</h2>

      {transactionsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : !transactionsData || transactionsData.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">No transactions yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">
            Add money to your wallet and your transactions will appear here.
          </p>
          <Button onClick={() => setAddMoneyOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Money
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Type</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Balance</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactionsData.data.map((tx: WalletTransaction) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDate(tx.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${tx.type === "CREDIT" ? "text-green-600" : "text-red-600"}`}>
                        {tx.type === "CREDIT" ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownLeft className="h-3.5 w-3.5" />
                        )}
                        {tx.type === "CREDIT" ? "Credit" : "Debit"}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold text-right ${tx.type === "CREDIT" ? "text-green-600" : "text-red-600"}`}>
                      {tx.type === "CREDIT" ? "+" : "-"}{formatPrice(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground text-right hidden sm:table-cell">
                      {formatPrice(tx.balanceAfter)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                      {tx.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {transactionsData.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="icon"
                disabled={!transactionsData.meta.hasPrevPage}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {transactionsData.meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={!transactionsData.meta.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
