export type ExpenseFormData = {
    title: string;
    amount: number;
    category_id: string;
    payment_mode_id: string;
    description?: string;
    notes?: string;
    expense_date: string;
};

export function validateExpense(data: ExpenseFormData) {
    if (!data.title.trim()) {
        return "Title is required";
    }

    if (!data.amount || data.amount <= 0) {
        return "Amount must be greater than 0";
    }

    if (!data.category_id) {
        return "Category is required";
    }

    if (!data.payment_mode_id) {
        return "Payment mode is required";
    }

    if (!data.expense_date) {
        return "Expense date is required";
    }

    return null;
}
