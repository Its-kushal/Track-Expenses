alter table expenses drop column description;

alter table expenses 
add column type text not null default 'need'
check (type in ('need', 'want', 'saving'));

alter table categories drop column type;