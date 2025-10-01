"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function CalculatorPage() {
  const [display, setDisplay] = useState("0")
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [shouldReplace, setShouldReplace] = useState(false)

  const handleNumber = (num: string) => {
    if (shouldReplace) {
      setDisplay(num)
      setShouldReplace(false)
    } else {
      setDisplay((prev) => prev === "0" ? num : prev + num)
    }
  }

  const handleDecimal = () => {
    if (shouldReplace) {
      setDisplay("0.")
      setShouldReplace(false)
    } else if (display.indexOf(".") === -1) {
      setDisplay((prev) => prev + ".")
    }
  }

  const handleClear = () => {
    setDisplay("0")
    setPreviousValue(null)
    setOperation(null)
    setShouldReplace(false)
  }

  const handleOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = calculate(currentValue, inputValue, operation)

      setDisplay(String(newValue))
      setPreviousValue(newValue)
    }

    setShouldReplace(true)
    setOperation(nextOperation)
  }

  const calculate = (firstValue: number, secondValue: number, op: string): number => {
    switch (op) {
      case "+":
        return firstValue + secondValue
      case "-":
        return firstValue - secondValue
      case "×":
        return firstValue * secondValue
      case "÷":
        return secondValue !== 0 ? firstValue / secondValue : 0
      default:
        return secondValue
    }
  }

  const handleEquals = () => {
    const inputValue = parseFloat(display)

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation)
      setDisplay(String(newValue))
      setPreviousValue(null)
      setOperation(null)
      setShouldReplace(true)
    }
  }

  const handlePercent = () => {
    const currentValue = parseFloat(display)
    setDisplay(String(currentValue / 100))
  }

  const handleToggleSign = () => {
    const currentValue = parseFloat(display)
    setDisplay(String(currentValue * -1))
  }

  const buttonClass = "h-16 text-lg font-semibold"
  const numberButtonClass = `${buttonClass} bg-secondary hover:bg-secondary/80`
  const operationButtonClass = `${buttonClass} bg-primary hover:bg-primary/90 text-primary-foreground`
  const specialButtonClass = `${buttonClass} bg-muted hover:bg-muted/80`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">계산기</h1>
        <p className="text-muted-foreground">간단한 계산을 수행하세요</p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>계산기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Display */}
          <div className="bg-muted p-4 rounded-lg text-right">
            <div className="text-4xl font-bold break-all min-h-[48px]">
              {display}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {/* Row 1 */}
            <Button onClick={handleClear} className={specialButtonClass}>
              C
            </Button>
            <Button onClick={handleToggleSign} className={specialButtonClass}>
              +/-
            </Button>
            <Button onClick={handlePercent} className={specialButtonClass}>
              %
            </Button>
            <Button onClick={() => handleOperation("÷")} className={operationButtonClass}>
              ÷
            </Button>

            {/* Row 2 */}
            <Button onClick={() => handleNumber("7")} className={numberButtonClass}>
              7
            </Button>
            <Button onClick={() => handleNumber("8")} className={numberButtonClass}>
              8
            </Button>
            <Button onClick={() => handleNumber("9")} className={numberButtonClass}>
              9
            </Button>
            <Button onClick={() => handleOperation("×")} className={operationButtonClass}>
              ×
            </Button>

            {/* Row 3 */}
            <Button onClick={() => handleNumber("4")} className={numberButtonClass}>
              4
            </Button>
            <Button onClick={() => handleNumber("5")} className={numberButtonClass}>
              5
            </Button>
            <Button onClick={() => handleNumber("6")} className={numberButtonClass}>
              6
            </Button>
            <Button onClick={() => handleOperation("-")} className={operationButtonClass}>
              -
            </Button>

            {/* Row 4 */}
            <Button onClick={() => handleNumber("1")} className={numberButtonClass}>
              1
            </Button>
            <Button onClick={() => handleNumber("2")} className={numberButtonClass}>
              2
            </Button>
            <Button onClick={() => handleNumber("3")} className={numberButtonClass}>
              3
            </Button>
            <Button onClick={() => handleOperation("+")} className={operationButtonClass}>
              +
            </Button>

            {/* Row 5 */}
            <Button onClick={() => handleNumber("0")} className={`${numberButtonClass} col-span-2`}>
              0
            </Button>
            <Button onClick={handleDecimal} className={numberButtonClass}>
              .
            </Button>
            <Button onClick={handleEquals} className={operationButtonClass}>
              =
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
