-- Local mode reads the same database word pool as online, without room/session tokens.
-- This function returns only a random word and its hint. It must not be used
-- to retrieve secrets for online rooms.
create or replace function public.get_local_round_word(
  categories_input text[] default array['Обычный режим']::text[],
  hint_mode_input text default 'STANDARD'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_word record;
  result_hint text;
  hint_items text[];
  candidate jsonb;
  source_table regclass;
  hint_table regclass;
  hint_key text;
  hint_text text;
  hint_strength int;
  hint_record record;
  query_text text;
begin
  source_table := coalesce(to_regclass('public.words'), to_regclass('public.game_words'));
  if source_table is null then
    raise exception 'Word source not found. Check the table used by start_round.';
  end if;
  -- Read rows as JSON to support both word and game_words column layouts.
  query_text := format('select to_jsonb(w) as value from %s w order by random() limit 200', source_table);
  for selected_word in execute query_text loop
    candidate := selected_word.value;
    if categories_input is null or cardinality(categories_input)=0
       or 'Обычный режим'=any(categories_input)
       or candidate->>'category'=any(categories_input)
       or candidate->>'category_name'=any(categories_input) then
      exit;
    end if;
  end loop;
  if candidate is null then raise exception 'No words available'; end if;
  hint_items := array[]::text[];
  hint_table := coalesce(to_regclass('public.hints'),to_regclass('public.word_hints'),to_regclass('public.game_word_hints'));
  if hint_table is not null then
    for hint_record in execute format('select to_jsonb(h) as value from %s h',hint_table) loop
      if coalesce(hint_record.value->>'word_id',hint_record.value->>'wordId')=candidate->>'id' then
        hint_text := coalesce(hint_record.value->>'hint',hint_record.value->>'text',hint_record.value->>'hint_text');
        if hint_text is not null and length(trim(hint_text))>0 then
          hint_items := array_append(hint_items,hint_text);
        end if;
      end if;
    end loop;
  end if;
  if cardinality(hint_items)=0 then
    if jsonb_typeof(candidate->'hints')='array' then
      select array_agg(coalesce(value->>'text',value->>'hint',trim(both '"' from value::text)))
        into hint_items from jsonb_array_elements(candidate->'hints');
    else
      hint_items := array_remove(array[candidate->>'hint_1',candidate->>'hint_2',candidate->>'hint_3',candidate->>'hint'],null);
    end if;
  end if;
  if cardinality(hint_items)=0 then raise exception 'Hints not found for word %. Inspect start_round schema.',candidate->>'word'; end if;
  if hint_mode_input <> 'NONE' and (hint_mode_input <> 'RANDOM_PRESENCE' or random()>=0.5) then
    if hint_mode_input='RANDOM' then
      result_hint := hint_items[1+floor(random()*cardinality(hint_items))::int];
    else
      result_hint := hint_items[least(2,cardinality(hint_items))];
    end if;
  end if;
  return jsonb_build_object('id',candidate->>'id','word',coalesce(candidate->>'text',candidate->>'word',candidate->>'name'),'category',coalesce(candidate->>'category',candidate->>'category_name','Обычный режим'),'hint',result_hint);
end;
$$;
grant execute on function public.get_local_round_word(text[],text) to anon, authenticated;
