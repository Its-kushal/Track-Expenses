alter table categories
add column type text not null
default 'need'
check (
  type in ('need', 'want', 'saving')
);