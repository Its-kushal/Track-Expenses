create policy "Users can create own expenses"
on expenses
for insert
with check (auth.uid() = created_by);

create policy "Users can view own expenses"
on expenses
for select
using (auth.uid() = created_by);