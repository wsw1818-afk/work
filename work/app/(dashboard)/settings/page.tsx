"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, X, Check } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Category {
  id: string
  name: string
  color: string
}

interface Rule {
  id: string
  pattern: string
  field: "merchant" | "memo"
  assignCategoryId: string
  priority: number
  assignCategory: Category
}

interface Budget {
  id: string
  month: string
  categoryId: string
  limitAmount: number
  category: Category
}

export default function SettingsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState({ name: "", color: "#3b82f6" })
  const [editData, setEditData] = useState({ name: "", color: "" })
  const [newRule, setNewRule] = useState({
    pattern: "",
    field: "merchant" as "merchant" | "memo",
    assignCategoryId: "",
  })
  const [editRuleData, setEditRuleData] = useState({
    pattern: "",
    field: "merchant" as "merchant" | "memo",
    assignCategoryId: "",
  })
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [newBudget, setNewBudget] = useState({
    categoryId: "",
    limitAmount: "",
  })
  const [editBudgetData, setEditBudgetData] = useState({
    limitAmount: "",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    loadCategories()
    loadRules()
  }, [])

  useEffect(() => {
    if (selectedMonth) {
      loadBudgets()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth])

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (!response.ok) throw new Error("카테고리 로드 실패")
      const data = await response.json()
      setCategories(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newCategory.name.trim()) {
      setError("카테고리 이름을 입력해주세요.")
      return
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "카테고리 생성 실패")
      }

      setCategories([...categories, data])
      setNewCategory({ name: "", color: "#3b82f6" })
      setError("")
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editData.name.trim()) {
      setError("카테고리 이름을 입력해주세요.")
      return
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "카테고리 수정 실패")
      }

      setCategories(categories.map((c) => (c.id === id ? data : c)))
      setEditingId(null)
      setError("")
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 카테고리를 삭제하시겠습니까?`)) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "카테고리 삭제 실패")
      }

      setCategories(categories.filter((c) => c.id !== id))
      setError("")
    } catch (err: any) {
      setError(err.message)
    }
  }

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setEditData({ name: category.name, color: category.color })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({ name: "", color: "" })
  }

  const loadRules = async () => {
    try {
      const response = await fetch("/api/rules")
      if (!response.ok) throw new Error("규칙 로드 실패")
      const data = await response.json()
      setRules(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleCreateRule = async () => {
    if (!newRule.pattern.trim() || !newRule.assignCategoryId) {
      setError("패턴과 카테고리를 입력해주세요.")
      return
    }

    try {
      const response = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRule),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "규칙 생성 실패")
      }

      setRules([...rules, data])
      setNewRule({ pattern: "", field: "merchant", assignCategoryId: "" })
      setError("")
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUpdateRule = async (id: string) => {
    if (!editRuleData.pattern.trim() || !editRuleData.assignCategoryId) {
      setError("패턴과 카테고리를 입력해주세요.")
      return
    }

    try {
      const response = await fetch(`/api/rules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editRuleData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "규칙 수정 실패")
      }

      setRules(rules.map((r) => (r.id === id ? data : r)))
      setEditingRuleId(null)
      setError("")
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteRule = async (id: string) => {
    if (!confirm("이 규칙을 삭제하시겠습니까?")) {
      return
    }

    try {
      const response = await fetch(`/api/rules/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "규칙 삭제 실패")
      }

      setRules(rules.filter((r) => r.id !== id))
      setError("")
    } catch (err: any) {
      setError(err.message)
    }
  }

  const startEditRule = (rule: Rule) => {
    setEditingRuleId(rule.id)
    setEditRuleData({
      pattern: rule.pattern,
      field: rule.field,
      assignCategoryId: rule.assignCategoryId,
    })
  }

  const cancelEditRule = () => {
    setEditingRuleId(null)
    setEditRuleData({ pattern: "", field: "merchant", assignCategoryId: "" })
  }

  const loadBudgets = async () => {
    try {
      const response = await fetch(`/api/budgets?month=${selectedMonth}`)
      if (!response.ok) throw new Error("예산 로드 실패")
      const data = await response.json()
      setBudgets(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleCreateBudget = async () => {
    if (!newBudget.categoryId || !newBudget.limitAmount) {
      setError("카테고리와 예산 금액을 입력해주세요.")
      return
    }

    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: selectedMonth,
          categoryId: newBudget.categoryId,
          limitAmount: parseInt(newBudget.limitAmount),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "예산 생성 실패")
      }

      setBudgets([...budgets, data])
      setNewBudget({ categoryId: "", limitAmount: "" })
      setError("")
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUpdateBudget = async (id: string) => {
    if (!editBudgetData.limitAmount) {
      setError("예산 금액을 입력해주세요.")
      return
    }

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          limitAmount: parseInt(editBudgetData.limitAmount),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "예산 수정 실패")
      }

      setBudgets(budgets.map((b) => (b.id === id ? data : b)))
      setEditingBudgetId(null)
      setError("")
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteBudget = async (id: string) => {
    if (!confirm("이 예산을 삭제하시겠습니까?")) {
      return
    }

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "예산 삭제 실패")
      }

      setBudgets(budgets.filter((b) => b.id !== id))
      setError("")
    } catch (err: any) {
      setError(err.message)
    }
  }

  const startEditBudget = (budget: Budget) => {
    setEditingBudgetId(budget.id)
    setEditBudgetData({
      limitAmount: budget.limitAmount.toString(),
    })
  }

  const cancelEditBudget = () => {
    setEditingBudgetId(null)
    setEditBudgetData({ limitAmount: "" })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">설정</h1>
        <p className="text-muted-foreground">
          카테고리, 규칙, 예산을 관리하세요
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>카테고리 관리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-muted-foreground">로딩 중...</p>
          ) : (
            <>
              {/* 새 카테고리 추가 */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="새 카테고리 이름"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                  />
                </div>
                <Input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, color: e.target.value })
                  }
                  className="w-20"
                />
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  추가
                </Button>
              </div>

              {/* 카테고리 목록 */}
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-2 rounded-lg border p-3"
                  >
                    {editingId === category.id ? (
                      <>
                        <Input
                          value={editData.name}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                          className="flex-1"
                        />
                        <Input
                          type="color"
                          value={editData.color}
                          onChange={(e) =>
                            setEditData({ ...editData, color: e.target.value })
                          }
                          className="w-20"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdate(category.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div
                          className="h-6 w-6 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="flex-1">{category.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleDelete(category.id, category.name)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>자동 분류 규칙</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 새 규칙 추가 */}
          <div className="grid grid-cols-4 gap-2">
            <Input
              placeholder="패턴 (예: 스타벅스)"
              value={newRule.pattern}
              onChange={(e) =>
                setNewRule({ ...newRule, pattern: e.target.value })
              }
            />
            <Select
              value={newRule.field}
              onValueChange={(value: "merchant" | "memo") =>
                setNewRule({ ...newRule, field: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="merchant">가맹점명</SelectItem>
                <SelectItem value="memo">메모</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={newRule.assignCategoryId}
              onValueChange={(value) =>
                setNewRule({ ...newRule, assignCategoryId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleCreateRule}>
              <Plus className="mr-2 h-4 w-4" />
              추가
            </Button>
          </div>

          {/* 규칙 목록 */}
          <div className="space-y-2">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center gap-2 rounded-lg border p-3"
              >
                {editingRuleId === rule.id ? (
                  <>
                    <Input
                      value={editRuleData.pattern}
                      onChange={(e) =>
                        setEditRuleData({
                          ...editRuleData,
                          pattern: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                    <Select
                      value={editRuleData.field}
                      onValueChange={(value: "merchant" | "memo") =>
                        setEditRuleData({ ...editRuleData, field: value })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="merchant">가맹점명</SelectItem>
                        <SelectItem value="memo">메모</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={editRuleData.assignCategoryId}
                      onValueChange={(value) =>
                        setEditRuleData({
                          ...editRuleData,
                          assignCategoryId: value,
                        })
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateRule(rule.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelEditRule}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">
                      {rule.field === "merchant" ? "가맹점명" : "메모"}에 &quot;
                      {rule.pattern}&quot; 포함
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: rule.assignCategory.color }}
                      />
                      <span>{rule.assignCategory.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditRule(rule)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>월별 예산</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 월 선택 */}
          <div className="flex items-center gap-2">
            <Label>대상 월:</Label>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-48"
            />
          </div>

          {/* 새 예산 추가 */}
          <div className="grid grid-cols-3 gap-2">
            <Select
              value={newBudget.categoryId}
              onValueChange={(value) =>
                setNewBudget({ ...newBudget, categoryId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter(
                    (cat) =>
                      !budgets.some((b) => b.categoryId === cat.id)
                  )
                  .map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="예산 금액 (원)"
              value={newBudget.limitAmount}
              onChange={(e) =>
                setNewBudget({ ...newBudget, limitAmount: e.target.value })
              }
            />
            <Button onClick={handleCreateBudget}>
              <Plus className="mr-2 h-4 w-4" />
              추가
            </Button>
          </div>

          {/* 예산 목록 */}
          <div className="space-y-2">
            {budgets.map((budget) => (
              <div
                key={budget.id}
                className="flex items-center gap-2 rounded-lg border p-3"
              >
                {editingBudgetId === budget.id ? (
                  <>
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: budget.category.color }}
                      />
                      <span>{budget.category.name}</span>
                    </div>
                    <Input
                      type="number"
                      value={editBudgetData.limitAmount}
                      onChange={(e) =>
                        setEditBudgetData({
                          ...editBudgetData,
                          limitAmount: e.target.value,
                        })
                      }
                      className="w-40"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateBudget(budget.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelEditBudget}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: budget.category.color }}
                      />
                      <span>{budget.category.name}</span>
                    </div>
                    <span className="font-medium">
                      {budget.limitAmount.toLocaleString()}원
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditBudget(budget)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteBudget(budget.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
