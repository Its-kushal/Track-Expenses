create policy "Users can delete own expenses"
on expenses
for delete
using (auth.uid() = created_by);