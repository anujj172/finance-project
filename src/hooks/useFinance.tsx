import React, { createContext, useState, useContext } from 'react';

// Гүйлгээний өгөгдлийн бүтэц (Ангилал буюу category талбарыг нэмэв)
export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string; // Төсөвтэй холбоход заавал шаардлагатай
}

// --- ЗЭЭЛИЙН МОДУЛИЙН БҮТЭЦ ---
export interface LoanSchedule {
  month: number;
  date: string;
  amount: number;
  isPaid: boolean;
}

export interface Loan {
  id: string;
  title: string;
  totalAmount: number;     // Нийт авсан зээл
  interestRate: number;    // Жилийн хүү (%)
  duration: number;        // Хугацаа (сар)
  startDate: string;       // Эхлэх огноо
  description: string;     // Тайлбар
  remainingAmount: number; // Үлдэгдэл зээлийн хэмжээ
  monthlyPayment: number;  // Сар бүр төлөх тогтмол дүн
  schedule: LoanSchedule[];// Төлбөрийн хуваарь
}

// --- ТӨСВИЙН МОДУЛИЙН БҮТЭЦ ---
export interface Budget {
  id: string;
  category: string;        // Зарлагын ангилалтай ижил байна
  allocatedAmount: number; // Хуваарилсан (Төсөвлөсөн) дүн
  limit: number;           // Лимит дүн
}

// Контекстийн төрөл (Type) - Бүх модулийг багтаав
interface FinanceContextType {
  incomes: Transaction[];
  incomeCategories: string[];
  addIncome: (income: Transaction) => void;
  addCategory: (category: string) => void;
  
  expenses: Transaction[];
  expenseCategories: string[];
  addExpense: (expense: Transaction) => void;
  addExpenseCategory: (category: string) => void;

  // Зээлд зориулсан төрлүүд
  loans: Loan[];
  addLoan: (loan: Loan) => void;
  markPaymentAsPaid: (loanId: string, monthIndex: number) => void;

  // Төсөвт зориулсан төрлүүд
  budgets: Budget[];
  addBudget: (budget: Budget) => void;
  deleteBudget: (budgetId: string) => void;
  
  chartColors: string[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const CHART_COLORS = [
  '#9b59b6', // Нил ягаан (Төсвийн үндсэн өнгө)
  '#00A88F', // Үндсэн ногоон өнгө
  '#3498db', // Цэнхэр
  '#f1c40f', // Шар
  '#e67e22', // Улбар шар
  '#e74c3c', // Улаан
  '#1abc9c', // Оюу ногоон
  '#2ecc71', // Цайвар ногоон
  '#34495e', // Гүн хөх
  '#95a5a6'  // Саарал
];

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  // Орлого, Зарлагын стейтүүд
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<string[]>(['Цалин', 'Хувийн бизнес']);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<string[]>(['Хоол хүнс', 'Тээвэр', 'Орон сууц', 'Үзвэр үйлчилгээ']);

  // Зээл болон Төсвийн стейтүүд
  const [loans, setLoans] = useState<Loan[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // --- ОРЛОГЫН ФУНКЦУУД ---
  const addIncome = (income: Transaction) => {
    setIncomes((prev) => [...prev, income]);
  };

  const addCategory = (category: string) => {
    if (!incomeCategories.includes(category)) {
      setIncomeCategories((prev) => [...prev, category]);
    }
  };

  // --- ЗАРЛАГЫН ФУНКЦУУД ---
  const addExpense = (expense: Transaction) => {
    setExpenses((prev) => [...prev, expense]);
  };

  const addExpenseCategory = (category: string) => {
    if (!expenseCategories.includes(category)) {
      setExpenseCategories((prev) => [...prev, category]);
    }
  };

  // --- ЗЭЭЛИЙН ФУНКЦУУД ---
  const addLoan = (loan: Loan) => {
    setLoans((prev) => [...prev, loan]);
  };

  const markPaymentAsPaid = (loanId: string, monthIndex: number) => {
    setLoans((prevLoans) =>
      prevLoans.map((loan) => {
        if (loan.id === loanId) {
          const updatedSchedule = loan.schedule.map((item, idx) => 
            idx === monthIndex ? { ...item, isPaid: true } : item
          );
          const paidAmount = loan.schedule[monthIndex].amount;
          const newRemaining = loan.remainingAmount - paidAmount;

          return {
            ...loan,
            schedule: updatedSchedule,
            remainingAmount: newRemaining > 0 ? newRemaining : 0,
          };
        }
        return loan;
      })
    );
  };

  // --- ТӨСВИЙН ФУНКЦУУД ---
  const addBudget = (budget: Budget) => {
    setBudgets((prev) => {
      // Хэрэв тухайн ангиллаар төсөв аль хэдийн үүссэн байвал хуучныг нь шинэчилнэ
      const exists = prev.find((b) => b.category === budget.category);
      if (exists) {
        return prev.map((b) => (b.category === budget.category ? budget : b));
      }
      return [...prev, budget];
    });
  };

  const deleteBudget = (budgetId: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
  };

  return (
    <FinanceContext.Provider 
      value={{ 
        incomes, 
        incomeCategories, 
        addIncome, 
        addCategory, 
        expenses,
        expenseCategories,
        addExpense,
        addExpenseCategory,
        loans,
        addLoan,
        markPaymentAsPaid,
        budgets,
        addBudget,
        deleteBudget,
        chartColors: CHART_COLORS 
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};