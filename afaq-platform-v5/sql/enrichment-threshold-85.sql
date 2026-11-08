-- آفاق الرياضيات: اعتماد الإثراء من ٨٥٪ فأكثر لكل عنصر تحصيلي، والعلاج ٥٠٪ فأقل
-- تشغيل آمن ومتكرر: لا يحذف الطلاب ولا درجاتهم ولا نتائج الأنشطة السابقة.
begin;
do $$
declare
 item record;
 definition text;
 seen integer := 0;
begin
 for item in
  select p.oid,p.proname
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.proname in (
     'afaq_apply_grade_signals',
     'afaq_official_grade_signals_trigger',
     'afaq_official_math_after_write',
     'afaq_official_register_signals_trigger')
 loop
  definition:=pg_get_functiondef(item.oid);
  if position('>=70' in definition)>0 then
   execute replace(definition,'>=70','>=85');
  elsif position('>=85' in definition)=0 then
   raise exception 'Missing enrichment threshold in function %',item.proname;
  end if;
  seen:=seen+1;
 end loop;
 if seen<>4 then raise exception 'Expected four grade signal functions, found %',seen; end if;
end $$;

-- استبعاد مؤشرات الإثراء غير المؤهلة من كل القوائم الحية.
-- لا تحذف السجلات: تبقى نتائج الطالب الأصلية وقابلية المراجعة محفوظة.
update public.afaq_learning_signals
set track='standard',active=false,updated_at=now()
where track='enrichment' and percentage<85;
commit;
