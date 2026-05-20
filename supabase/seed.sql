insert into categories (name, icon, color, type)
values
('Food', 'utensils', '#FF6B6B', 'need'),
('Travel', 'plane', '#4D96FF', 'want'),
('Rent', 'home', '#6BCB77', 'need'),
('Groceries', 'shopping-cart', '#FFD93D', 'need'),
('Bills', 'receipt', '#845EC2', 'need'),
('Shopping', 'bag', '#FF9671', 'want'),
('Entertainment', 'film', '#00C9A7', 'want'),
('Health', 'heart-pulse', '#FF5D8F', 'need'),
('Fuel', 'fuel', '#0081CF', 'need'),
('Education', 'book', '#B39CD0', 'saving'),
('Emergency Fund', 'shield', '#00C2A8', 'saving'),
('Investment', 'chart-line', '#2C73D2', 'saving');

insert into payment_modes (name)
values
('Cash'),
('UPI'),
('Debit Card'),
('Credit Card'),
('Bank Transfer'),
('Wallet');