import { useState } from "react";
import { useFinance, CATEGORY_LIST, type Transaction } from "@/context/FinanceContext";
import { Search, SlidersHorizontal, Plus, Pencil, Trash2, ArrowUpDown, Download, FileJson, FileSpreadsheet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import TransactionModal from "./TransactionModal";

const TransactionsTable = () => {
  const { role, filteredTransactions, filters, setFilters, deleteTransaction, exportData } = useFinance();
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTx(null);
    setModalOpen(true);
  };

  const toggleSort = (field: "date" | "amount") => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "desc" ? "asc" : "desc",
    }));
  };

  // Group transactions if groupBy is set
  const groupedTransactions = (() => {
    if (filters.groupBy === "none") return null;
    const groups = new Map<string, Transaction[]>();
    for (const tx of filteredTransactions) {
      let key: string;
      if (filters.groupBy === "category") key = tx.category;
      else if (filters.groupBy === "type") key = tx.type;
      else key = tx.date.substring(0, 7); // month
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(tx);
    }
    return groups;
  })();

  const renderRows = (txs: Transaction[]) =>
    txs.slice(0, 20).map(tx => (
      <tr key={tx.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors animate-fade-in">
        <td className="p-3 text-muted-foreground">{new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
        <td className="p-3 font-medium">{tx.description}</td>
        <td className="p-3">
          <Badge variant="secondary" className="text-xs font-normal">{tx.category}</Badge>
        </td>
        <td className={`p-3 text-right font-semibold ${tx.type === "income" ? "text-income" : "text-expense"}`}>
          {tx.type === "income" ? "+" : "-"}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </td>
        {role === "admin" && (
          <td className="p-3 text-right">
            <div className="flex items-center justify-end gap-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEdit(tx)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteTransaction(tx.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </td>
        )}
      </tr>
    ));

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border/50 animate-fade-in" style={{ animationDelay: "400ms" }}>
      <div className="p-5 border-b border-border/50">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="font-display font-semibold text-sm">Transactions</h3>
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8">
                  <Download className="w-4 h-4 mr-1" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => exportData("csv")}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportData("json")}>
                  <FileJson className="w-4 h-4 mr-2" /> Export JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(v => !v)} className="h-8">
              <SlidersHorizontal className="w-4 h-4 mr-1" /> Filters
            </Button>
            {role === "admin" && (
              <Button size="sm" onClick={handleAdd} className="h-8">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            )}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-9 h-9 bg-secondary/50"
          />
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-3 animate-fade-in">
            <Select value={filters.type} onValueChange={v => setFilters(prev => ({ ...prev, type: v as any }))}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.category} onValueChange={v => setFilters(prev => ({ ...prev, category: v as any }))}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORY_LIST.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.groupBy} onValueChange={v => setFilters(prev => ({ ...prev, groupBy: v as any }))}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Group by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Grouping</SelectItem>
                <SelectItem value="category">By Category</SelectItem>
                <SelectItem value="type">By Type</SelectItem>
                <SelectItem value="month">By Month</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="From"
              value={filters.dateFrom}
              onChange={e => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-36 h-8 text-xs"
            />
            <Input
              type="date"
              placeholder="To"
              value={filters.dateTo}
              onChange={e => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-36 h-8 text-xs"
            />
            <Input
              type="number"
              placeholder="Min $"
              value={filters.amountMin}
              onChange={e => setFilters(prev => ({ ...prev, amountMin: e.target.value }))}
              className="w-24 h-8 text-xs"
            />
            <Input
              type="number"
              placeholder="Max $"
              value={filters.amountMax}
              onChange={e => setFilters(prev => ({ ...prev, amountMax: e.target.value }))}
              className="w-24 h-8 text-xs"
            />
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground border-b border-border/50">
              <th className="text-left p-3 font-medium cursor-pointer select-none" onClick={() => toggleSort("date")}>
                <span className="flex items-center gap-1">Date <ArrowUpDown className="w-3 h-3" /></span>
              </th>
              <th className="text-left p-3 font-medium">Description</th>
              <th className="text-left p-3 font-medium">Category</th>
              <th className="text-right p-3 font-medium cursor-pointer select-none" onClick={() => toggleSort("amount")}>
                <span className="flex items-center justify-end gap-1">Amount <ArrowUpDown className="w-3 h-3" /></span>
              </th>
              {role === "admin" && <th className="text-right p-3 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={role === "admin" ? 5 : 4} className="p-8 text-center text-muted-foreground">
                  No transactions found
                </td>
              </tr>
            ) : groupedTransactions ? (
              Array.from(groupedTransactions.entries()).map(([group, txs]) => (
                <React.Fragment key={group}>
                  <tr>
                    <td colSpan={role === "admin" ? 5 : 4} className="p-2 px-3 bg-secondary/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {group} ({txs.length})
                    </td>
                  </tr>
                  {renderRows(txs)}
                </React.Fragment>
              ))
            ) : (
              renderRows(filteredTransactions)
            )}
          </tbody>
        </table>
      </div>

      <TransactionModal open={modalOpen} onClose={() => { setModalOpen(false); setEditingTx(null); }} transaction={editingTx} />
    </div>
  );
};

// Need React import for Fragment
import React from "react";

export default TransactionsTable;
