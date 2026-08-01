create or replace function public.increment_video_views(p_video_id uuid) returns int language sql as $$
update public.seller_videos
set views_count = views_count + 1,
  updated_at = now()
where id = p_video_id
returning views_count;
$$;
create or replace function public.adjust_video_likes(p_video_id uuid, p_delta int) returns int language sql as $$
update public.seller_videos
set likes_count = greatest(0, likes_count + p_delta),
  updated_at = now()
where id = p_video_id
returning likes_count;
$$;