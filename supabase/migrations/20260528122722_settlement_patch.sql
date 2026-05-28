-- Safely add the payment_mode_id to the settlements table
alter table settlements
add column payment_mode_id uuid references payment_modes(id);