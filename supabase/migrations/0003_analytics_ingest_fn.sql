-- Atomic analytics ingest: insert one event and upsert its session
-- (increment counters, track scroll/duration, accumulate bounce state).

create or replace function public.ingest_event(
  p_type text,
  p_path text,
  p_visitor_id text,
  p_session_id text,
  p_meta jsonb,
  p_user_agent text,
  p_referrer text,
  p_country text,
  p_region text,
  p_city text,
  p_device text,
  p_browser text,
  p_os text,
  p_engaged boolean,
  p_is_page_view boolean,
  p_depth int,
  p_duration_ms bigint,
  p_active_ms bigint
) returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into public.events(type, path, visitor_id, session_id, meta, user_agent, referrer)
  values (p_type, p_path, p_visitor_id, p_session_id, coalesce(p_meta, '{}'::jsonb), p_user_agent, p_referrer);

  if p_session_id is null then
    return;
  end if;

  insert into public.sessions as s (
    id, visitor_id, first_seen, last_seen, page_views, events_count, max_scroll,
    entry_path, exit_path, referrer, utm_source, utm_medium, utm_campaign,
    country, region, city, device, browser, os, user_agent,
    duration_ms, active_ms, bounced
  ) values (
    p_session_id, p_visitor_id, now(), now(),
    case when p_is_page_view then 1 else 0 end, 1, coalesce(p_depth, 0),
    p_path, p_path, p_referrer,
    p_meta->>'utm_source', p_meta->>'utm_medium', p_meta->>'utm_campaign',
    p_country, p_region, p_city, p_device, p_browser, p_os, p_user_agent,
    coalesce(p_duration_ms, 0), coalesce(p_active_ms, 0), not p_engaged
  )
  on conflict (id) do update set
    last_seen    = now(),
    page_views   = s.page_views + case when p_is_page_view then 1 else 0 end,
    events_count = s.events_count + 1,
    max_scroll   = greatest(s.max_scroll, coalesce(p_depth, 0)),
    exit_path    = p_path,
    duration_ms  = greatest(s.duration_ms, coalesce(p_duration_ms, 0)),
    active_ms    = greatest(s.active_ms, coalesce(p_active_ms, 0)),
    bounced      = s.bounced and not p_engaged,
    country      = coalesce(s.country, p_country),
    region       = coalesce(s.region, p_region),
    city         = coalesce(s.city, p_city),
    device       = coalesce(s.device, p_device),
    browser      = coalesce(s.browser, p_browser),
    os           = coalesce(s.os, p_os);
end;
$$;
