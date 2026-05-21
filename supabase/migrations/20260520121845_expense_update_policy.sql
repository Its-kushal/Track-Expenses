create policy "Users can update own expenses"
on expenses
for update
using (auth.uid() = created_by);